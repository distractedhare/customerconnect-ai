/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Center, Text as DreiText } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';

// Drei's <Text> uses troika under the hood, which suspends on a Promise that
// `preloadFont` is supposed to resolve. With no `font` prop, troika falls back
// to its FontResolver, which fetches Unicode range data from
// https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver — a CDN dependency
// that hangs forever on restricted enterprise networks (or any offline /
// blocked-CDN scenario). Pointing every Text at a local Poppins TTF bypasses
// the CDN, lets every Text share the suspend cache (one preload, not N), and
// quiets the "WorkerModule response with empty or unknown messageId" warnings
// caused by hazards mounting/unmounting before troika finishes.
//
// The granular <Suspense fallback={null}> stays as belt-and-suspenders so any
// remaining font-load hiccup silently drops a single label instead of taking
// down the entire 3D scene.
const RUNNER_TEXT_FONT = '/fonts/poppins-700.ttf';
const Text = (props: React.ComponentProps<typeof DreiText>) => (
  <Suspense fallback={null}>
    <DreiText font={RUNNER_TEXT_FONT} {...props} />
  </Suspense>
);
import { useStore } from '../../store';
import {
  GameStatus,
  type GameObject,
  LANE_WIDTH,
  ObjectType,
  REMOVE_DISTANCE,
  SPAWN_DISTANCE,
  TLIFE_COLORS,
  type PowerUpType,
} from '../../types';
import { LEVEL_PALETTES, T_LIFE_WORD } from '../../content';
import { audio } from '../System/Audio';

const OBSTACLE_HEIGHT = 1.6;
const BARRIER_HEIGHT = 0.8;
const TOWER_HEIGHT = 4.0;
const MISSILE_SPEED = 30;
const BASE_LETTER_INTERVAL = 140;
const OBSTACLE_GEO = new THREE.BoxGeometry(0.9, OBSTACLE_HEIGHT, 0.9);
const BARRIER_GEO = new THREE.BoxGeometry(1.9, BARRIER_HEIGHT, 0.45);
const TOWER_GEO = new THREE.BoxGeometry(0.65, TOWER_HEIGHT, 0.65);
const GEM_GEO = new THREE.IcosahedronGeometry(0.32, 0);
const TRIVIA_GEO = new THREE.TorusGeometry(0.42, 0.1, 10, 24);
const MAGNET_GEO = new THREE.TorusGeometry(0.3, 0.1, 10, 18);
const SHIELD_GEO = new THREE.SphereGeometry(0.35, 16, 16);
const BATTERY_GEO = new THREE.BoxGeometry(0.34, 0.5, 0.22);
const POWERUP_CORE_GEO = new THREE.OctahedronGeometry(0.3, 0);
const SCANNER_GEO = new THREE.TorusGeometry(0.34, 0.04, 12, 32);
const SHOP_FRAME_GEO = new THREE.BoxGeometry(1, 7, 1);
const SHOP_BACK_GEO = new THREE.BoxGeometry(1, 5, 1.2);
const SHOP_OUTLINE_GEO = new THREE.BoxGeometry(1, 7.2, 0.8);
const SHOP_FLOOR_GEO = new THREE.PlaneGeometry(1, 4);
const ALIEN_BODY_GEO = new THREE.CylinderGeometry(0.6, 0.3, 0.3, 8);
const ALIEN_DOME_GEO = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
const MISSILE_CORE_GEO = new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8);
const MISSILE_RING_GEO = new THREE.TorusGeometry(0.15, 0.02, 16, 32);
const HAZARD_RING_GEO = new THREE.TorusGeometry(1.0, 0.04, 12, 48);
const COLLECT_AURA_GEO = new THREE.SphereGeometry(1.0, 12, 12);
const SHADOW_DEFAULT_GEO = new THREE.CircleGeometry(0.8, 24);
const SHADOW_SMALL_GEO = new THREE.CircleGeometry(0.55, 20);
const SHADOW_MISSILE_GEO = new THREE.PlaneGeometry(0.15, 3);

const PARTICLE_COUNT = 600;

const HAZARD_TYPES = new Set<ObjectType>([
  ObjectType.OBSTACLE,
  ObjectType.BARRIER,
  ObjectType.TOWER,
  ObjectType.ALIEN,
  ObjectType.MISSILE,
]);

const PICKUP_TYPES = new Set<ObjectType>([
  ObjectType.GEM,
  ObjectType.LETTER,
  ObjectType.TRIVIA,
  ObjectType.POWERUP_MAGNET,
  ObjectType.POWERUP_SHIELD,
  ObjectType.POWERUP_BATTERY,
  ObjectType.POWERUP_OVERCLOCK,
  ObjectType.POWERUP_MULTIPLIER,
  ObjectType.POWERUP_SCANNER,
]);

const getLetterInterval = (level: number) => BASE_LETTER_INTERVAL * Math.pow(1.45, Math.max(0, level - 1));
const getRandomLane = (laneCount: number) => {
  const max = Math.floor(laneCount / 2);
  return Math.floor(Math.random() * (max * 2 + 1)) - max;
};

const makeBurst = (position: [number, number, number], color: string, count = 32) => {
  window.dispatchEvent(new CustomEvent('particle-burst', { detail: { position, color, count } }));
};

const hazardLabelPool = ['BILL SHOCK', 'DATA CAP', 'HIDDEN FEES', 'DROP CALL', 'PORTING FRICTION', 'FINE PRINT', 'SCAM FLOOD'];

const getPickupSpec = (type: PowerUpType) => {
  switch (type) {
    case 'MAGNET':
      return { objectType: ObjectType.POWERUP_MAGNET, color: '#FFD84D', label: 'MAGNET' };
    case 'SHIELD':
      return { objectType: ObjectType.POWERUP_SHIELD, color: '#FFFFFF', label: 'SAFEGUARD' };
    case 'BATTERY':
      return { objectType: ObjectType.POWERUP_BATTERY, color: '#41FF8F', label: 'BATTERY' };
    case 'OVERCLOCK':
      return { objectType: ObjectType.POWERUP_OVERCLOCK, color: '#00E6E6', label: 'OVERCLOCK' };
    case 'MULTIPLIER':
      return { objectType: ObjectType.POWERUP_MULTIPLIER, color: '#FF8CC6', label: 'X2' };
    case 'SCANNER':
      return { objectType: ObjectType.POWERUP_SCANNER, color: '#6E7BFF', label: 'SCANNER' };
  }
};

const createPickup = (type: PowerUpType, lane: number, z: number): GameObject => {
  const spec = getPickupSpec(type);
  return {
    id: uuidv4(),
    type: spec.objectType,
    position: [lane * LANE_WIDTH, 1.2, z],
    active: true,
    color: spec.color,
    label: spec.label,
    points: 75,
  };
};

const createHazard = (lane: number, z: number, level: number, type?: ObjectType): GameObject => {
  const palette = LEVEL_PALETTES[level] || LEVEL_PALETTES[1];
  const objectType = type || [ObjectType.OBSTACLE, ObjectType.BARRIER, ObjectType.TOWER, ObjectType.ALIEN][Math.floor(Math.random() * 4)];
  const color = palette[Math.floor(Math.random() * palette.length)];
  let y = OBSTACLE_HEIGHT / 2;
  if (objectType === ObjectType.BARRIER) y = BARRIER_HEIGHT / 2;
  if (objectType === ObjectType.TOWER) y = TOWER_HEIGHT / 2;
  if (objectType === ObjectType.ALIEN) y = 1.0;

  return {
    id: uuidv4(),
    type: objectType,
    position: [lane * LANE_WIDTH, y, z],
    active: true,
    color,
    label: objectType === ObjectType.ALIEN ? 'BIG CARRIER' : hazardLabelPool[Math.floor(Math.random() * hazardLabelPool.length)],
  };
};

const spawnGemLine = (objects: GameObject[], lane: number, z: number, count = 4, spacing = 6) => {
  for (let i = 0; i < count; i += 1) {
    objects.push({
      id: uuidv4(),
      type: ObjectType.GEM,
      position: [lane * LANE_WIDTH, 1.15, z - i * spacing],
      active: true,
      color: '#00E5FF',
      points: 60,
      label: i === 0 ? 'LEAD' : undefined,
    });
  }
};

const spawnPickupCluster = (objects: GameObject[], laneCount: number, z: number) => {
  const pickupTypes: PowerUpType[] = ['MAGNET', 'SHIELD', 'BATTERY', 'OVERCLOCK', 'MULTIPLIER', 'SCANNER'];
  const maxLane = Math.floor(laneCount / 2);
  const lanes = [-1, 0, 1].map((offset) => Math.max(-maxLane, Math.min(maxLane, offset)));
  const chosen = pickupTypes.sort(() => 0.5 - Math.random()).slice(0, 3);
  chosen.forEach((type, index) => objects.push(createPickup(type, lanes[index], z - index * 4)));
};

const spawnGatePattern = (objects: GameObject[], laneCount: number, z: number, level: number) => {
  const maxLane = Math.floor(laneCount / 2);
  const safeLane = getRandomLane(laneCount);
  for (let lane = -maxLane; lane <= maxLane; lane += 1) {
    if (lane === safeLane) continue;
    objects.push(createHazard(lane, z, level, Math.random() > 0.6 ? ObjectType.BARRIER : ObjectType.OBSTACLE));
  }
  spawnGemLine(objects, safeLane, z - 2, 3, 5);
};

const spawnStaggerPattern = (objects: GameObject[], laneCount: number, z: number, level: number) => {
  const lanes = Array.from({ length: Math.min(4, laneCount) }, () => getRandomLane(laneCount));
  lanes.forEach((lane, index) => objects.push(createHazard(lane, z - index * 6, level)));
};

const spawnTriviaGate = (objects: GameObject[], laneCount: number, z: number) => {
  const centerLane = getRandomLane(laneCount);
  objects.push({
    id: uuidv4(),
    type: ObjectType.TRIVIA,
    position: [centerLane * LANE_WIDTH, 1.2, z],
    active: true,
    color: '#E20074',
    label: 'QUIZ',
  });
  spawnGemLine(objects, centerLane, z - 6, 2, 5);
};

const spawnBossPattern = (objects: GameObject[], laneCount: number, z: number, level: number, bossId: string) => {
  const maxLane = Math.floor(laneCount / 2);

  if (bossId === 'atlas_backbone') {
    const safeLane = getRandomLane(laneCount);
    for (let lane = -maxLane; lane <= maxLane; lane += 1) {
      if (lane === safeLane) continue;
      objects.push(createHazard(lane, z, level, lane % 2 === 0 ? ObjectType.TOWER : ObjectType.BARRIER));
    }
    spawnGemLine(objects, safeLane, z - 3, 4, 5);
    return;
  }

  if (bossId === 'redline_commander') {
    const missileLanes = Array.from({ length: Math.min(3, laneCount) }, () => getRandomLane(laneCount));
    missileLanes.forEach((lane, index) => {
      objects.push({
        id: uuidv4(),
        type: ObjectType.MISSILE,
        position: [lane * LANE_WIDTH, 1.0, z - index * 5],
        active: true,
        color: '#ff5533',
        label: index === 0 ? 'REDLINE' : undefined,
      });
    });
    objects.push(createHazard(getRandomLane(laneCount), z - 8, level, ObjectType.BARRIER));
    return;
  }

  if (bossId === 'patchwork_hydra') {
    spawnGatePattern(objects, laneCount, z, level);
    const baitLane = getRandomLane(laneCount);
    objects.push(createPickup('MULTIPLIER', baitLane, z - 4));
    objects.push(createHazard(baitLane, z - 7, level, ObjectType.OBSTACLE));
    return;
  }

  if (bossId === 'throttle_maw') {
    spawnStaggerPattern(objects, laneCount, z, level);
    objects.push(createHazard(getRandomLane(laneCount), z - 10, level, ObjectType.ALIEN));
    if (Math.random() > 0.4) objects.push(createPickup('OVERCLOCK', getRandomLane(laneCount), z - 14));
    return;
  }

  if (bossId === 'dead_zone_titan') {
    const safeLane = getRandomLane(laneCount);
    for (let lane = -maxLane; lane <= maxLane; lane += 1) {
      if (lane === safeLane) {
        objects.push({
          id: uuidv4(),
          type: ObjectType.MISSILE,
          position: [lane * LANE_WIDTH, 1.0, z - 5],
          active: true,
          color: '#ff3300',
          label: 'JAM',
        });
        continue;
      }
      objects.push(createHazard(lane, z, level, lane % 2 === 0 ? ObjectType.BARRIER : ObjectType.OBSTACLE));
    }
    objects.push({
      id: uuidv4(),
      type: ObjectType.TRIVIA,
      position: [safeLane * LANE_WIDTH, 1.2, z - 11],
      active: true,
      color: '#E20074',
      label: 'BOSS',
    });
    return;
  }

  spawnGatePattern(objects, laneCount, z, level);
};

const spawnLetter = (objects: GameObject[], laneCount: number, z: number, collectedLetters: number[]) => {
  const availableIndices = T_LIFE_WORD.map((_, index) => index).filter((index) => !collectedLetters.includes(index));
  if (availableIndices.length === 0) return false;
  const targetIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  const lane = getRandomLane(laneCount);
  objects.push({
    id: uuidv4(),
    type: ObjectType.LETTER,
    position: [lane * LANE_WIDTH, 1.05, z],
    active: true,
    color: TLIFE_COLORS[targetIndex],
    value: T_LIFE_WORD[targetIndex],
    targetIndex,
  });
  spawnGemLine(objects, lane, z - 5, 2, 5);
  return true;
};

const ParticleSystem: React.FC = () => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(
    () =>
      new Array(PARTICLE_COUNT).fill(0).map(() => ({
        life: 0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        color: new THREE.Color(),
      })),
    []
  );

  useEffect(() => {
    const handleExplosion = (event: CustomEvent) => {
      const { position, color, count } = event.detail;
      let spawned = 0;
      const burstAmount = count || 36;
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const particle = particles[i];
        if (particle.life > 0) continue;
        particle.life = 1 + Math.random() * 0.5;
        particle.pos.set(position[0], position[1], position[2]);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 2 + Math.random() * 9;
        particle.vel.set(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi)).multiplyScalar(speed);
        particle.rot.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        particle.rotVel.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(4);
        particle.color.set(color);
        spawned += 1;
        if (spawned >= burstAmount) break;
      }
    };

    window.addEventListener('particle-burst', handleExplosion as any);
    return () => window.removeEventListener('particle-burst', handleExplosion as any);
  }, [particles]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    particles.forEach((particle, index) => {
      if (particle.life <= 0) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.current!.setMatrixAt(index, dummy.matrix);
        return;
      }
      particle.life -= delta * 1.4;
      particle.pos.addScaledVector(particle.vel, delta);
      particle.vel.y -= delta * 4;
      particle.vel.multiplyScalar(0.98);
      particle.rot.x += particle.rotVel.x * delta;
      particle.rot.y += particle.rotVel.y * delta;
      const scale = Math.max(0, particle.life * 0.25);
      dummy.position.copy(particle.pos);
      dummy.rotation.set(particle.rot.x, particle.rot.y, particle.rot.z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(index, dummy.matrix);
      mesh.current!.setColorAt(index, particle.color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_COUNT]}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
    </instancedMesh>
  );
};

export const LevelManager: React.FC = () => {
  const status = useStore((state) => state.status);
  const speed = useStore((state) => state.speed);
  const collectGem = useStore((state) => state.collectGem);
  const collectLetter = useStore((state) => state.collectLetter);
  const collectedLetters = useStore((state) => state.collectedLetters);
  const laneCount = useStore((state) => state.laneCount);
  const setDistance = useStore((state) => state.setDistance);
  const openShop = useStore((state) => state.openShop);
  const triggerTrivia = useStore((state) => state.triggerTrivia);
  const isMagnetActive = useStore((state) => state.isMagnetActive);
  const isScannerActive = useStore((state) => state.isScannerActive);
  const isSidekickCoreActive = useStore((state) => state.isSidekickCoreActive);
  const currentBossId = useStore((state) => state.currentBossId);
  const collectPowerUp = useStore((state) => state.collectPowerUp);
  const isDashing = useStore((state) => state.isDashing);
  const triggerShake = useStore((state) => state.triggerShake);
  const level = useStore((state) => state.level);
  const recordHazardDestroyed = useStore((state) => state.recordHazardDestroyed);
  const tickGameplay = useStore((state) => state.tickGameplay);

  const objectsRef = useRef<GameObject[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const prevStatus = useRef(status);
  const prevLevel = useRef(level);
  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const distanceTraveled = useRef(0);
  const nextLetterDistance = useRef(BASE_LETTER_INTERVAL);

  useEffect(() => {
    const isRestart = status === GameStatus.PLAYING && (prevStatus.current === GameStatus.GAME_OVER || prevStatus.current === GameStatus.VICTORY || prevStatus.current === GameStatus.MENU);
    const isLevelUp = level !== prevLevel.current && status === GameStatus.PLAYING;

    if (isRestart || status === GameStatus.MENU) {
      objectsRef.current = [];
      setRenderTrigger((value) => value + 1);
      distanceTraveled.current = 0;
      nextLetterDistance.current = getLetterInterval(1);
    } else if (isLevelUp && level > 1) {
      objectsRef.current = objectsRef.current.filter((object) => object.position[2] > -80);
      objectsRef.current.push({
        id: uuidv4(),
        type: ObjectType.SHOP_PORTAL,
        position: [0, 0, -100],
        active: true,
      });
      nextLetterDistance.current = distanceTraveled.current - SPAWN_DISTANCE + getLetterInterval(level);
      setRenderTrigger((value) => value + 1);
    } else if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
      setDistance(Math.floor(distanceTraveled.current));
    }

    prevStatus.current = status;
    prevLevel.current = level;
  }, [status, level, setDistance]);

  useEffect(() => {
    const handleCharacterAbility = (event: any) => {
      const detail = event.detail || {};
      const playerZ = detail.position?.[2] ?? 0;
      const playerX = detail.x ?? 0;
      const characterId = detail.characterId as string;
      let changes = false;
      let destroyed = 0;

      objectsRef.current = objectsRef.current.map((object) => {
        if (!object.active) return object;
        const inFront = object.position[2] < playerZ && object.position[2] > playerZ - 38;
        const sameLane = Math.abs(object.position[0] - playerX) < 1.1;
        const closeLane = Math.abs(object.position[0] - playerX) < 2.6;

        if (characterId === 'apple' && HAZARD_TYPES.has(object.type) && sameLane && inFront && destroyed === 0) {
          destroyed += 1;
          changes = true;
          makeBurst(object.position, '#9DD9FF', 28);
          return { ...object, active: false };
        }

        if (characterId === 'samsung' && object.type === ObjectType.MISSILE && inFront) {
          destroyed += 1;
          changes = true;
          makeBurst(object.position, '#9B5CFF', 24);
          return { ...object, active: false };
        }

        if (characterId === 'tcl' && HAZARD_TYPES.has(object.type) && inFront) {
          destroyed += 1;
          changes = true;
          makeBurst(object.position, '#FF4639', 36);
          return { ...object, active: false };
        }

        if (characterId === 'motorola' && HAZARD_TYPES.has(object.type) && sameLane && inFront) {
          destroyed += 1;
          changes = true;
          makeBurst(object.position, '#2DE6E6', 28);
          return { ...object, active: false };
        }

        if (characterId === 'pixel') {
          if (object.type === ObjectType.MISSILE && inFront) {
            destroyed += 1;
            changes = true;
            makeBurst(object.position, '#7B6CFF', 24);
            return { ...object, active: false };
          }
          if (PICKUP_TYPES.has(object.type) && closeLane && inFront) {
            object.position[0] = playerX;
            object.position[2] = Math.min(object.position[2], playerZ - 2);
            changes = true;
          }
        }

        if (characterId === 'sidekick_core') {
          if (object.type === ObjectType.MISSILE && inFront) {
            destroyed += 1;
            changes = true;
            makeBurst(object.position, '#E20074', 24);
            return { ...object, active: false };
          }
          if (HAZARD_TYPES.has(object.type) && closeLane && inFront) {
            destroyed += 1;
            changes = true;
            makeBurst(object.position, '#FF8CC6', 26);
            return { ...object, active: false };
          }
        }

        return object;
      });

      if (destroyed > 0) {
        for (let index = 0; index < destroyed; index += 1) recordHazardDestroyed(90);
        audio.playLetterCollect();
      }
      if (changes) setRenderTrigger((value) => value + 1);
    };

    const handleSidekickCoreBurst = (event: any) => {
      const detail = event.detail || {};
      const playerZ = detail.position?.[2] ?? 0;
      let destroyed = 0;
      let changes = false;
      const clearedLanes = new Set<number>();

      objectsRef.current = objectsRef.current.map((object) => {
        if (!object.active) return object;
        const inFront = object.position[2] < playerZ && object.position[2] > playerZ - 45;
        const lane = Math.round(object.position[0] / LANE_WIDTH);

        if (object.type === ObjectType.MISSILE && inFront) {
          destroyed += 1;
          changes = true;
          makeBurst(object.position, '#E20074', 28);
          return { ...object, active: false };
        }

        if (HAZARD_TYPES.has(object.type) && inFront && !clearedLanes.has(lane)) {
          clearedLanes.add(lane);
          destroyed += 1;
          changes = true;
          makeBurst(object.position, '#FFFFFF', 30);
          return { ...object, active: false };
        }

        if (PICKUP_TYPES.has(object.type) && inFront) {
          object.position[2] = Math.min(object.position[2], playerZ - 2);
          changes = true;
        }

        return object;
      });

      if (destroyed > 0) {
        for (let index = 0; index < destroyed; index += 1) recordHazardDestroyed(120);
        audio.playLetterCollect();
      }
      if (changes) setRenderTrigger((value) => value + 1);
    };

    window.addEventListener('runner-character-ability', handleCharacterAbility as any);
    window.addEventListener('runner-sidekick-core-burst', handleSidekickCoreBurst as any);
    return () => {
      window.removeEventListener('runner-character-ability', handleCharacterAbility as any);
      window.removeEventListener('runner-sidekick-core-burst', handleSidekickCoreBurst as any);
    };
  }, [recordHazardDestroyed]);

  useFrame((state) => {
    if (!playerObjRef.current) {
      const group = state.scene.getObjectByName('PlayerGroup');
      if (group && group.children.length > 0) playerObjRef.current = group.children[0];
    }
  });

  useFrame((_, delta) => {
    if (status !== GameStatus.PLAYING) return;

    const safeDelta = Math.min(delta, 0.05);
    tickGameplay(safeDelta);

    const dist = speed * safeDelta;
    distanceTraveled.current += dist;

    const playerPos = new THREE.Vector3(0, 0, 0);
    if (playerObjRef.current) playerObjRef.current.getWorldPosition(playerPos);

    let hasChanges = false;
    const keptObjects: GameObject[] = [];
    const newSpawns: GameObject[] = [];

    for (const object of objectsRef.current) {
      let moveAmount = dist;
      if (object.type === ObjectType.MISSILE) moveAmount += MISSILE_SPEED * safeDelta;
      const previousZ = object.position[2];
      object.position[2] += moveAmount;

      if (object.type === ObjectType.ALIEN && object.active && !object.hasFired && object.position[2] > -88) {
        object.hasFired = true;
        newSpawns.push({
          id: uuidv4(),
          type: ObjectType.MISSILE,
          position: [object.position[0], 1.0, object.position[2] + 2],
          active: true,
          color: '#FF5500',
          label: 'RATE HIKE',
        });
        makeBurst(object.position, '#FF00FF', 18);
        hasChanges = true;
      }

      let keep = true;
      if (object.active) {
        const zThreshold = 2.0;
        const inZZone = previousZ < playerPos.z + zThreshold && object.position[2] > playerPos.z - zThreshold;

        if (object.type === ObjectType.SHOP_PORTAL) {
          if (Math.abs(object.position[2] - playerPos.z) < 2) {
            openShop();
            object.active = false;
            keep = false;
            hasChanges = true;
          }
        } else {
          const attractionRadius =
            currentBossId === 'dead_zone_titan' && !isSidekickCoreActive
              ? isScannerActive
                ? 9
                : isMagnetActive
                  ? 6
                  : 0
              : isSidekickCoreActive
                ? 18
                : isScannerActive
                  ? 14
                  : isMagnetActive
                    ? 10
                    : 0;
          if (attractionRadius > 0 && PICKUP_TYPES.has(object.type)) {
            const distanceToPlayer = new THREE.Vector3(...object.position).distanceTo(playerPos);
            if (distanceToPlayer < attractionRadius) {
              const direction = new THREE.Vector3().subVectors(playerPos, new THREE.Vector3(...object.position)).normalize();
              object.position[0] += direction.x * speed * safeDelta * 2.6;
              object.position[1] += direction.y * speed * safeDelta * 2.2;
              object.position[2] += direction.z * speed * safeDelta * 2.6;
              hasChanges = true;
            }
          }

          if (inZZone) {
            const dx = Math.abs(object.position[0] - playerPos.x);
            if (dx < 1.0) {
              if (HAZARD_TYPES.has(object.type)) {
                const playerBottom = playerPos.y;
                const playerTop = playerPos.y + 1.85;
                let objectBottom = object.position[1] - 0.5;
                let objectTop = object.position[1] + 0.5;

                if (object.type === ObjectType.OBSTACLE) {
                  objectBottom = 0;
                  objectTop = OBSTACLE_HEIGHT;
                } else if (object.type === ObjectType.BARRIER) {
                  objectBottom = 0;
                  objectTop = BARRIER_HEIGHT;
                } else if (object.type === ObjectType.TOWER) {
                  objectBottom = 0;
                  objectTop = TOWER_HEIGHT;
                } else if (object.type === ObjectType.MISSILE) {
                  objectBottom = 0.5;
                  objectTop = 1.5;
                }

                const isHit = playerBottom < objectTop && playerTop > objectBottom;
                if (isHit) {
                  if (isDashing) {
                    object.active = false;
                    keep = false;
                    hasChanges = true;
                    triggerShake(0.2);
                    recordHazardDestroyed(object.type === ObjectType.TOWER ? 110 : 80);
                    makeBurst(object.position, '#00FFFF', 34);
                    continue;
                  }

                  const damage = object.type === ObjectType.MISSILE ? 50 : object.type === ObjectType.TOWER ? 40 : object.type === ObjectType.ALIEN ? 30 : 20;
                  window.dispatchEvent(new CustomEvent('player-hit', { detail: { damage } }));
                  object.active = false;
                  keep = false;
                  hasChanges = true;
                  if (object.type === ObjectType.MISSILE) makeBurst(object.position, '#FF4400', 28);
                }
              } else {
                const dPos = new THREE.Vector3(...object.position).distanceTo(playerPos);
                if (dPos < 1.8) {
                  if (object.type === ObjectType.GEM) {
                    collectGem(object.points || 50);
                    audio.playGemCollect();
                  } else if (object.type === ObjectType.LETTER && object.targetIndex !== undefined) {
                    collectLetter(object.targetIndex);
                    audio.playLetterCollect();
                  } else if (object.type === ObjectType.TRIVIA) {
                    triggerTrivia();
                    audio.playGemCollect();
                  } else if (object.type === ObjectType.POWERUP_MAGNET) {
                    collectPowerUp('MAGNET');
                    audio.playGemCollect();
                  } else if (object.type === ObjectType.POWERUP_SHIELD) {
                    collectPowerUp('SHIELD');
                    audio.playGemCollect();
                  } else if (object.type === ObjectType.POWERUP_BATTERY) {
                    collectPowerUp('BATTERY');
                    audio.playGemCollect();
                  } else if (object.type === ObjectType.POWERUP_OVERCLOCK) {
                    collectPowerUp('OVERCLOCK');
                    audio.playGemCollect();
                  } else if (object.type === ObjectType.POWERUP_MULTIPLIER) {
                    collectPowerUp('MULTIPLIER');
                    audio.playGemCollect();
                  } else if (object.type === ObjectType.POWERUP_SCANNER) {
                    collectPowerUp('SCANNER');
                    audio.playGemCollect();
                  }

                  makeBurst(object.position, object.color || '#FFFFFF', 22);
                  object.active = false;
                  keep = false;
                  hasChanges = true;
                }
              }
            }
          }
        }
      }

      if (object.position[2] > REMOVE_DISTANCE) {
        keep = false;
        hasChanges = true;
      }

      if (keep) keptObjects.push(object);
    }

    if (newSpawns.length > 0) keptObjects.push(...newSpawns);

    let furthestZ = -20;
    if (keptObjects.length > 0) furthestZ = Math.min(...keptObjects.filter((obj) => obj.type !== ObjectType.MISSILE).map((obj) => obj.position[2]));

    if (furthestZ > -SPAWN_DISTANCE) {
      const minGap = 12 + speed * 0.35;
      const spawnZ = Math.min(furthestZ - minGap, -SPAWN_DISTANCE);
      const isLetterDue = distanceTraveled.current >= nextLetterDistance.current;

      if (isLetterDue) {
        if (spawnLetter(keptObjects, laneCount, spawnZ, collectedLetters)) {
          nextLetterDistance.current += getLetterInterval(level);
          hasChanges = true;
        }
      } else {
        const roll = Math.random();
        if (currentBossId && roll < 0.24) {
          spawnBossPattern(keptObjects, laneCount, spawnZ, level, currentBossId);
        } else if (roll < 0.08) {
          spawnTriviaGate(keptObjects, laneCount, spawnZ);
        } else if (roll < 0.22) {
          spawnPickupCluster(keptObjects, laneCount, spawnZ);
        } else if (roll < 0.36) {
          spawnGemLine(keptObjects, getRandomLane(laneCount), spawnZ, 5, 5);
        } else if (roll < 0.6) {
          spawnGatePattern(keptObjects, laneCount, spawnZ, level);
        } else if (roll < 0.82) {
          spawnStaggerPattern(keptObjects, laneCount, spawnZ, level);
        } else {
          const count = Math.min(1 + Math.floor(Math.random() * 3), laneCount);
          const lanes = Array.from({ length: laneCount }, (_, index) => index - Math.floor(laneCount / 2)).sort(() => 0.5 - Math.random()).slice(0, count);
          lanes.forEach((lane, index) => keptObjects.push(createHazard(lane, spawnZ - index * 3, level)));
          if (Math.random() > 0.55) keptObjects.push(createPickup(['MAGNET', 'BATTERY', 'SCANNER'][Math.floor(Math.random() * 3)] as PowerUpType, getRandomLane(laneCount), spawnZ - 8));
        }
        hasChanges = true;
      }
    }

    if (hasChanges) {
      objectsRef.current = keptObjects;
      setRenderTrigger((value) => value + 1);
    }
  });

  return (
    <group>
      <ParticleSystem />
      {objectsRef.current.map((object) => (object.active ? <GameEntity key={object.id} data={object} laneCount={laneCount} /> : null))}
    </group>
  );
};

const GameEntity: React.FC<{ data: GameObject; laneCount: number }> = React.memo(({ data, laneCount }) => {
  const groupRef = useRef<THREE.Group>(null);
  const visualRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  const isHazard = HAZARD_TYPES.has(data.type);
  const isCollectible = PICKUP_TYPES.has(data.type);

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.position.set(data.position[0], 0, data.position[2]);
    if (!visualRef.current) return;

    const baseHeight = data.position[1];
    if (data.type === ObjectType.SHOP_PORTAL) {
      visualRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.02);
    } else if (data.type === ObjectType.MISSILE) {
      visualRef.current.rotation.z += delta * 18;
      visualRef.current.position.y = baseHeight;
    } else if (data.type === ObjectType.TRIVIA) {
      visualRef.current.rotation.y += delta * 4;
      visualRef.current.position.y = baseHeight + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    } else if (data.type === ObjectType.ALIEN) {
      visualRef.current.position.y = baseHeight + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      visualRef.current.rotation.y += delta;
    } else if (isCollectible) {
      visualRef.current.rotation.y += delta * 3;
      const bob = Math.sin(state.clock.elapsedTime * 4 + data.position[0]) * 0.1;
      visualRef.current.position.y = baseHeight + bob;
      if (shadowRef.current) shadowRef.current.scale.setScalar(1 - bob * 0.3);
    } else {
      visualRef.current.position.y = baseHeight;
    }
  });

  const shadowGeo = useMemo(() => {
    if (data.type === ObjectType.MISSILE) return SHADOW_MISSILE_GEO;
    if (isCollectible) return SHADOW_SMALL_GEO;
    return SHADOW_DEFAULT_GEO;
  }, [data.type, isCollectible]);

  return (
    <group ref={groupRef} position={[data.position[0], 0, data.position[2]]}>
      {data.type !== ObjectType.SHOP_PORTAL && (
        <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} geometry={shadowGeo}>
          <meshBasicMaterial color="#000000" transparent opacity={0.28} />
        </mesh>
      )}

      <group ref={visualRef} position={[0, data.position[1], 0]}>
        {isHazard && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -data.position[1] + 0.05, 0]} geometry={HAZARD_RING_GEO}>
            <meshBasicMaterial color="#FF3300" transparent opacity={0.26 + Math.sin(Date.now() * 0.006) * 0.12} />
          </mesh>
        )}

        {data.label && data.type !== ObjectType.SHOP_PORTAL && (
          <Text
            position={[0, 2.45, 0]}
            fontSize={isHazard ? 0.34 : 0.26}
            color={isHazard ? '#FFFFFF' : data.color || '#FFFFFF'}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor={isHazard ? '#FF0033' : '#000000'}
          >
            {data.label}
          </Text>
        )}

        {isCollectible && (
          <mesh scale={[1.18, 1.18, 1.18]} geometry={COLLECT_AURA_GEO}>
            <meshBasicMaterial color={data.color || '#FFFFFF'} transparent opacity={0.06} />
          </mesh>
        )}

        {data.type === ObjectType.SHOP_PORTAL && (
          <group>
            <mesh position={[0, 3, 0]} geometry={SHOP_FRAME_GEO} scale={[laneCount * LANE_WIDTH + 2, 1, 1]}>
              <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0, 2, 0]} geometry={SHOP_BACK_GEO} scale={[laneCount * LANE_WIDTH, 1, 1]}>
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[0, 3, 0]} geometry={SHOP_OUTLINE_GEO} scale={[laneCount * LANE_WIDTH + 2.2, 1, 1]}>
              <meshBasicMaterial color="#00E5FF" wireframe transparent opacity={0.25} />
            </mesh>
            <Center position={[0, 5, 0.6]}>
              <Text
                fontSize={1.05}
                color="#E20074"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#120008"
              >
                UPGRADE BAY
              </Text>
            </Center>
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={SHOP_FLOOR_GEO} scale={[laneCount * LANE_WIDTH, 1, 1]}>
              <meshBasicMaterial color="#00E5FF" transparent opacity={0.24} />
            </mesh>
          </group>
        )}

        {data.type === ObjectType.OBSTACLE && (
          <mesh geometry={OBSTACLE_GEO}>
            <meshStandardMaterial color="#330011" roughness={0.35} metalness={0.75} emissive={data.color} emissiveIntensity={0.15} />
          </mesh>
        )}

        {data.type === ObjectType.BARRIER && (
          <mesh geometry={BARRIER_GEO}>
            <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={0.45} metalness={0.65} roughness={0.2} />
          </mesh>
        )}

        {data.type === ObjectType.TOWER && (
          <mesh geometry={TOWER_GEO}>
            <meshStandardMaterial color={data.color} metalness={0.85} roughness={0.22} emissive={data.color} emissiveIntensity={0.12} />
          </mesh>
        )}

        {data.type === ObjectType.GEM && (
          <mesh geometry={GEM_GEO}>
            <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={1.8} metalness={0.75} roughness={0.18} />
          </mesh>
        )}

        {data.type === ObjectType.TRIVIA && (
          <group>
            <mesh geometry={TRIVIA_GEO}>
              <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={1.8} />
            </mesh>
            <Center>
              <Text
                fontSize={0.7}
                color="#FFFFFF"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.04}
                outlineColor="#4d0031"
              >
                ?
              </Text>
            </Center>
          </group>
        )}

        {data.type === ObjectType.LETTER && (
          <group scale={[1.5, 1.5, 1.5]}>
            <Center>
              <Text
                fontSize={0.95}
                color={data.color || '#FFFFFF'}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.08}
                outlineColor="#120008"
              >
                {data.value}
              </Text>
            </Center>
          </group>
        )}

        {data.type === ObjectType.POWERUP_MAGNET && (
          <mesh geometry={MAGNET_GEO} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#FFD84D" emissive="#FFD84D" emissiveIntensity={1.9} />
          </mesh>
        )}

        {data.type === ObjectType.POWERUP_SHIELD && (
          <group>
            <mesh geometry={SHIELD_GEO}>
              <meshStandardMaterial color="#FFFFFF" emissive="#E2F7FF" emissiveIntensity={1.5} transparent opacity={0.65} />
            </mesh>
            <mesh geometry={SCANNER_GEO} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color="#00D9FF" />
            </mesh>
          </group>
        )}

        {data.type === ObjectType.POWERUP_BATTERY && (
          <group>
            <mesh geometry={BATTERY_GEO}>
              <meshStandardMaterial color="#41FF8F" emissive="#41FF8F" emissiveIntensity={1.5} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.16]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        )}

        {data.type === ObjectType.POWERUP_OVERCLOCK && (
          <mesh geometry={POWERUP_CORE_GEO}>
            <meshStandardMaterial color="#00E6E6" emissive="#00E6E6" emissiveIntensity={1.6} metalness={0.7} roughness={0.15} />
          </mesh>
        )}

        {data.type === ObjectType.POWERUP_MULTIPLIER && (
          <group>
            <mesh geometry={POWERUP_CORE_GEO}>
              <meshStandardMaterial color="#FF8CC6" emissive="#FF8CC6" emissiveIntensity={1.6} />
            </mesh>
            <Text position={[0, 0, 0.28]} fontSize={0.18} color="#FFFFFF" anchorX="center" anchorY="middle">x2</Text>
          </group>
        )}

        {data.type === ObjectType.POWERUP_SCANNER && (
          <group>
            <mesh geometry={SCANNER_GEO} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color="#6E7BFF" />
            </mesh>
            <mesh geometry={POWERUP_CORE_GEO}>
              <meshStandardMaterial color="#B8C2FF" emissive="#6E7BFF" emissiveIntensity={1.2} />
            </mesh>
          </group>
        )}

        {data.type === ObjectType.ALIEN && (
          <group>
            <mesh geometry={ALIEN_BODY_GEO}>
              <meshStandardMaterial color="#4400CC" metalness={0.82} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0.2, 0]} geometry={ALIEN_DOME_GEO}>
              <meshStandardMaterial color="#00FF99" emissive="#00FF99" emissiveIntensity={0.5} transparent opacity={0.82} />
            </mesh>
          </group>
        )}

        {data.type === ObjectType.MISSILE && (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={MISSILE_CORE_GEO}>
              <meshStandardMaterial color="#FF3300" emissive="#FF3300" emissiveIntensity={4} />
            </mesh>
            <mesh position={[0, 1, 0]} geometry={MISSILE_RING_GEO}><meshBasicMaterial color="#FFD84D" /></mesh>
            <mesh position={[0, 0, 0]} geometry={MISSILE_RING_GEO}><meshBasicMaterial color="#FFD84D" /></mesh>
            <mesh position={[0, -1, 0]} geometry={MISSILE_RING_GEO}><meshBasicMaterial color="#FFD84D" /></mesh>
          </group>
        )}
      </group>
    </group>
  );
});
