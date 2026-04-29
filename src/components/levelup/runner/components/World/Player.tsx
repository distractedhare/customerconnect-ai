/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store';
import { GameStatus, LANE_WIDTH, type CharacterId } from '../../types';
import { getCharacterDefinition } from '../../content';
import { audio } from '../System/Audio';

const GRAVITY = 50;
const JUMP_FORCE = 16;

const TORSO_GEO = new THREE.BoxGeometry(0.48, 0.72, 0.34);
const CHEST_PANEL_GEO = new THREE.BoxGeometry(0.3, 0.22, 0.08);
const HEAD_GEO = new THREE.BoxGeometry(0.34, 0.32, 0.3);
const ARM_GEO = new THREE.BoxGeometry(0.14, 0.64, 0.14);
const LEG_GEO = new THREE.BoxGeometry(0.17, 0.76, 0.17);
const JOINT_GEO = new THREE.SphereGeometry(0.08, 16, 16);
const HIPS_GEO = new THREE.BoxGeometry(0.36, 0.16, 0.24);
const SHADOW_GEO = new THREE.CircleGeometry(0.55, 32);
const WING_GEO = new THREE.BoxGeometry(0.08, 0.78, 0.3);
const CAMERA_CLUSTER_GEO = new THREE.BoxGeometry(0.24, 0.24, 0.14);
const LENS_GEO = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 16);
const FLIP_PANEL_GEO = new THREE.BoxGeometry(0.34, 0.42, 0.05);
const HALO_GEO = new THREE.TorusGeometry(0.45, 0.03, 12, 48);
const DRONE_GEO = new THREE.SphereGeometry(0.1, 16, 16);
const SHOULDER_PLATE_GEO = new THREE.BoxGeometry(0.26, 0.12, 0.2);
const DISPLAY_FRAME_GEO = new THREE.BoxGeometry(0.42, 0.3, 0.05);
const EQUALIZER_BAR_GEO = new THREE.BoxGeometry(0.045, 0.16, 0.035);
const HINGE_GEO = new THREE.CylinderGeometry(0.035, 0.035, 0.46, 12);
const SCANNER_VISOR_GEO = new THREE.BoxGeometry(0.32, 0.1, 0.045);
const ANTENNA_GEO = new THREE.CylinderGeometry(0.018, 0.018, 0.34, 10);

type SilhouetteProfile = {
  torsoScale: [number, number, number];
  chestScale: [number, number, number];
  headScale: [number, number, number];
  shoulderX: number;
  armScale: [number, number, number];
  legScale: [number, number, number];
  hipScale: [number, number, number];
};

const CHARACTER_SILHOUETTES: Record<CharacterId, SilhouetteProfile> = {
  apple: {
    torsoScale: [0.84, 1.06, 0.88],
    chestScale: [0.86, 0.84, 0.9],
    headScale: [0.92, 0.92, 0.92],
    shoulderX: 0.31,
    armScale: [0.82, 1.02, 0.82],
    legScale: [0.84, 1.06, 0.84],
    hipScale: [0.82, 0.9, 0.88],
  },
  samsung: {
    torsoScale: [1.16, 1.02, 1.04],
    chestScale: [1.2, 1.04, 1],
    headScale: [1.02, 0.98, 1.02],
    shoulderX: 0.41,
    armScale: [1.08, 1.06, 1.08],
    legScale: [1.02, 1.02, 1.02],
    hipScale: [1.12, 1, 1],
  },
  tcl: {
    torsoScale: [1.26, 1.18, 1.12],
    chestScale: [1.42, 1.34, 1],
    headScale: [1.08, 0.94, 1.05],
    shoulderX: 0.43,
    armScale: [1.22, 1.12, 1.22],
    legScale: [1.16, 1.04, 1.16],
    hipScale: [1.24, 1.08, 1.08],
  },
  motorola: {
    torsoScale: [0.94, 1, 0.92],
    chestScale: [1.05, 1.22, 0.9],
    headScale: [0.96, 0.96, 0.96],
    shoulderX: 0.34,
    armScale: [0.9, 1.06, 0.9],
    legScale: [0.86, 1.16, 0.86],
    hipScale: [0.9, 0.92, 0.94],
  },
  pixel: {
    torsoScale: [0.92, 1.02, 0.95],
    chestScale: [0.95, 0.9, 0.92],
    headScale: [0.98, 1, 1],
    shoulderX: 0.34,
    armScale: [0.9, 1, 0.9],
    legScale: [0.92, 1.04, 0.92],
    hipScale: [0.9, 0.95, 0.95],
  },
  sidekick_core: {
    torsoScale: [1, 1, 1],
    chestScale: [1, 1, 1],
    headScale: [1, 1, 1],
    shoulderX: 0.34,
    armScale: [1, 1, 1],
    legScale: [1, 1, 1],
    hipScale: [1, 1, 1],
  },
};

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);
  const chestPanelRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const droneOrbitLeftRef = useRef<THREE.Group>(null);
  const droneOrbitRightRef = useRef<THREE.Group>(null);
  const trailAnchorRef = useRef<THREE.Mesh>(null);
  const groundPulseRef = useRef<THREE.Mesh>(null);
  const groundPulseMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const status = useStore((state) => state.status);
  const laneCount = useStore((state) => state.laneCount);
  const takeDamage = useStore((state) => state.takeDamage);
  const hasDoubleJump = useStore((state) => state.hasDoubleJump);
  const activateImmortality = useStore((state) => state.activateImmortality);
  const isImmortalityActive = useStore((state) => state.isImmortalityActive);
  const isIFraming = useStore((state) => state.isIFraming);
  const togglePause = useStore((state) => state.togglePause);
  const isDashing = useStore((state) => state.isDashing);
  const triggerShake = useStore((state) => state.triggerShake);
  const selectedCharacterId = useStore((state) => state.selectedRunnerId ?? state.selectedCharacterId);
  const activateCharacterAbility = useStore((state) => state.activateCharacterAbility);
  const activateSidekickCore = useStore((state) => state.activateSidekickCore);
  const isCharacterAbilityActive = useStore((state) => state.isCharacterAbilityActive);
  const isSidekickCoreActive = useStore((state) => state.isSidekickCoreActive);

  const [lane, setLane] = React.useState(0);
  const targetX = useRef(0);
  const isJumping = useRef(false);
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0);
  const spinRotation = useRef(0);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isInvincible = useRef(false);
  const lastDamageTime = useRef(0);

  const character = getCharacterDefinition(selectedCharacterId);
  const silhouette = CHARACTER_SILHOUETTES[selectedCharacterId];

  const materials = useMemo(() => {
    const armorColor = isImmortalityActive ? '#FFFFFF' : character.armor;
    const accentColor = isSidekickCoreActive ? '#FFFFFF' : character.accent;
    return {
      armor: new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.18, metalness: 0.78 }),
      secondary: new THREE.MeshStandardMaterial({ color: character.secondary, roughness: 0.26, metalness: 0.6 }),
      joint: new THREE.MeshStandardMaterial({ color: '#121212', roughness: 0.7, metalness: 0.4 }),
      visor: new THREE.MeshBasicMaterial({ color: accentColor }),
      accent: new THREE.MeshBasicMaterial({ color: accentColor, toneMapped: false }),
      glow: new THREE.MeshBasicMaterial({ color: isCharacterAbilityActive ? '#FFFFFF' : accentColor, toneMapped: false }),
      shadow: new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.28 }),
      flash: new THREE.MeshBasicMaterial({ color: '#FFFFFF' }),
    };
  }, [character, isCharacterAbilityActive, isImmortalityActive, isSidekickCoreActive]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      isJumping.current = false;
      velocityY.current = 0;
      jumpsPerformed.current = 0;
      spinRotation.current = 0;
      setLane(0);
      if (groupRef.current) groupRef.current.position.set(0, 0, 0);
      if (bodyRef.current) bodyRef.current.rotation.set(0, 0, 0);
    }
  }, [status, selectedCharacterId]);

  useEffect(() => {
    const maxLane = Math.floor(laneCount / 2);
    if (Math.abs(lane) > maxLane) setLane(clampLane(lane, maxLane));
  }, [laneCount, lane]);

  const maxLaneForCount = () => Math.floor(useStore.getState().laneCount / 2);
  const clampLane = (value: number, maxLane: number) => Math.max(-maxLane, Math.min(maxLane, value));

  const moveLane = (delta: number) => setLane((current) => clampLane(current + delta, maxLaneForCount()));

  const triggerJump = () => {
    const maxJumps = hasDoubleJump ? 2 : 1;
    if (!isJumping.current) {
      audio.playJump(false);
      isJumping.current = true;
      jumpsPerformed.current = 1;
      velocityY.current = JUMP_FORCE;
      return;
    }

    if (jumpsPerformed.current < maxJumps) {
      audio.playJump(true);
      jumpsPerformed.current += 1;
      velocityY.current = JUMP_FORCE;
      spinRotation.current = 0;
    }
  };

  const triggerDashInput = () => {
    useStore.getState().triggerDash();
    if (useStore.getState().hasImmortality && !useStore.getState().isImmortalityActive) {
      useStore.getState().activateImmortality();
    }
  };

  const triggerCharacterAbilityInput = () => {
    const activated = activateCharacterAbility();
    if (!activated) return;
    audio.playLetterCollect();
    window.dispatchEvent(
      new CustomEvent('runner-character-ability', {
        detail: {
          characterId: selectedCharacterId,
          lane,
          x: targetX.current,
          position: groupRef.current ? groupRef.current.position.toArray() : [0, 0, 0],
        },
      })
    );
  };

  const triggerSidekickCoreInput = () => {
    const activated = activateSidekickCore();
    if (!activated) return;
    audio.playLetterCollect();
    window.dispatchEvent(
      new CustomEvent('runner-sidekick-core-burst', {
        detail: {
          lane,
          x: targetX.current,
          position: groupRef.current ? groupRef.current.position.toArray() : [0, 0, 0],
        },
      })
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const browserScrollKeys = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'spacebar'];
      if (browserScrollKeys.includes(event.key.toLowerCase())) {
        event.preventDefault();
      }

      if (status !== GameStatus.PLAYING && status !== GameStatus.PAUSED) return;

      const key = event.key.toLowerCase();
      if (key === 'p' || key === 'escape') {
        togglePause();
        return;
      }

      if (status !== GameStatus.PLAYING) return;

      if (key === 'arrowleft' || key === 'a') moveLane(-1);
      else if (key === 'arrowright' || key === 'd') moveLane(1);
      else if (key === 'arrowup' || key === 'w' || key === ' ') triggerJump();
      else if (key === 'arrowdown' || key === 's' || key === 'shift') triggerDashInput();
      else if (key === 'e' || key === 'f' || key === 'enter') triggerCharacterAbilityInput();
      else if (key === 'q' || key === 'r') triggerSidekickCoreInput();
      else if (key === 'x') activateImmortality();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, togglePause, hasDoubleJump, activateImmortality, lane, selectedCharacterId]);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (status !== GameStatus.PLAYING) return;
      event.preventDefault();
      const touch = event.changedTouches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (status !== GameStatus.PLAYING) return;
      event.preventDefault();
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartX.current;
      const dy = touch.clientY - touchStartY.current;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const threshold = 32;

      if (absX < threshold && absY < threshold) return;

      if (absX > absY) {
        moveLane(dx > 0 ? 1 : -1);
      } else if (dy < 0) {
        triggerJump();
      } else {
        triggerDashInput();
      }
    };

    const touchTarget = document.getElementById('tlife-runner-game-surface') ?? window;
    touchTarget.addEventListener('touchstart', handleTouchStart, { passive: false });
    touchTarget.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      touchTarget.removeEventListener('touchstart', handleTouchStart);
      touchTarget.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status]);

  useEffect(() => {
    const hLeft = () => moveLane(-1);
    const hRight = () => moveLane(1);
    const hJump = () => triggerJump();
    const hDash = () => triggerDashInput();
    const hAbility = () => triggerCharacterAbilityInput();
    const hSidekickCore = () => triggerSidekickCoreInput();

    window.addEventListener('hud-left', hLeft);
    window.addEventListener('hud-right', hRight);
    window.addEventListener('hud-jump', hJump);
    window.addEventListener('hud-dash', hDash);
    window.addEventListener('hud-ability', hAbility);
    window.addEventListener('hud-sidekick-core', hSidekickCore);

    return () => {
      window.removeEventListener('hud-left', hLeft);
      window.removeEventListener('hud-right', hRight);
      window.removeEventListener('hud-jump', hJump);
      window.removeEventListener('hud-dash', hDash);
      window.removeEventListener('hud-ability', hAbility);
      window.removeEventListener('hud-sidekick-core', hSidekickCore);
    };
  }, [lane, selectedCharacterId]);

  useFrame((state, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    if (status !== GameStatus.PLAYING && status !== GameStatus.SHOP) return;

    targetX.current = lane * LANE_WIDTH;
    const lerpSpeed = isDashing ? 22 : 12;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX.current, delta * lerpSpeed);

    if (isJumping.current) {
      groupRef.current.position.y += velocityY.current * delta;
      velocityY.current -= GRAVITY * delta;
      if (groupRef.current.position.y <= 0) {
        groupRef.current.position.y = 0;
        isJumping.current = false;
        velocityY.current = 0;
        jumpsPerformed.current = 0;
        bodyRef.current.rotation.x = 0;
      }
      if (jumpsPerformed.current === 2) {
        spinRotation.current -= delta * 15;
        bodyRef.current.rotation.x = spinRotation.current;
      }
    }

    const moveDiff = targetX.current - groupRef.current.position.x;
    groupRef.current.rotation.z = -moveDiff * (isDashing ? 0.55 : 0.25);
    groupRef.current.rotation.x = isDashing ? 0.28 : isJumping.current ? 0.08 : 0;

    const time = state.clock.elapsedTime * 14;
    const cycle = Math.sin(time);
    const cycleOpp = Math.sin(time + Math.PI);

    if (!isJumping.current) {
      if (leftArmRef.current) leftArmRef.current.rotation.x = cycle * 0.8 - (isDashing ? 0.8 : 0);
      if (rightArmRef.current) rightArmRef.current.rotation.x = cycleOpp * 0.8 - (isDashing ? 0.8 : 0);
      if (leftLegRef.current) leftLegRef.current.rotation.x = cycleOpp * 1.05;
      if (rightLegRef.current) rightLegRef.current.rotation.x = cycle * 1.05;
      bodyRef.current.position.y = isDashing ? 0.92 : 1.05 + Math.abs(cycle) * 0.08;
      bodyRef.current.rotation.y = Math.sin(time * 0.5) * 0.04;

      // Ground pulse: when a footfall hits (cycle near a peak), the disc
      // briefly scales up and fades. Drives off the same cycle as the legs
      // so it lands exactly on contact.
      if (groundPulseRef.current && groundPulseMatRef.current) {
        const footfall = Math.max(0, Math.abs(cycle));
        const pulse = footfall * footfall;
        groundPulseRef.current.scale.setScalar(0.6 + pulse * 1.2);
        groundPulseMatRef.current.opacity = 0.18 + pulse * 0.42;
      }
    } else {
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.2, delta * 8);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.2, delta * 8);
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.5, delta * 8);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.5, delta * 8);
    }

    if (headRef.current) headRef.current.rotation.x = -Math.sin(time * 1.5) * 0.08;

    if (leftWingRef.current && rightWingRef.current) {
      const wingOpen = selectedCharacterId === 'samsung' ? (isCharacterAbilityActive ? 1.25 : 0.55) : selectedCharacterId === 'motorola' ? (isDashing ? 0.85 : 0.45) : 0.25;
      leftWingRef.current.rotation.z = THREE.MathUtils.lerp(leftWingRef.current.rotation.z, 0.3 + wingOpen, delta * 5);
      rightWingRef.current.rotation.z = THREE.MathUtils.lerp(rightWingRef.current.rotation.z, -(0.3 + wingOpen), delta * 5);
    }

    if (chestPanelRef.current) {
      if (selectedCharacterId === 'motorola') {
        chestPanelRef.current.rotation.x = THREE.MathUtils.lerp(chestPanelRef.current.rotation.x, isCharacterAbilityActive || isDashing ? -1.1 : -0.2, delta * 6);
      } else if (selectedCharacterId === 'tcl') {
        chestPanelRef.current.scale.y = 1 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.1;
      } else {
        chestPanelRef.current.rotation.x = 0;
        chestPanelRef.current.scale.y = 1;
      }
    }

    if (haloRef.current) haloRef.current.rotation.z += delta * (selectedCharacterId === 'sidekick_core' ? 1.8 : 0.6);
    if (droneOrbitLeftRef.current) droneOrbitLeftRef.current.rotation.y += delta * 1.8;
    if (droneOrbitRightRef.current) droneOrbitRightRef.current.rotation.y -= delta * 1.8;

    if (shadowRef.current) {
      const height = groupRef.current.position.y;
      const scale = Math.max(0.25, 1 - height * 0.18);
      shadowRef.current.scale.setScalar(scale);
      (shadowRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0.08, 0.28 - height * 0.07);
    }

    if (groupRef.current) {
      const shouldFlicker = isInvincible.current || isImmortalityActive || isIFraming;
      if (shouldFlicker && !isImmortalityActive) {
        groupRef.current.visible = Math.floor(Date.now() / 60) % 2 === 0;
      } else {
        groupRef.current.visible = true;
      }
      if (isInvincible.current && Date.now() - lastDamageTime.current > 2000) {
        isInvincible.current = false;
        groupRef.current.visible = true;
      }
    }

    bodyRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if ((isInvincible.current || isIFraming) && child.material !== materials.shadow) {
        child.userData.originalMaterial = child.userData.originalMaterial || child.material;
        child.material = materials.flash;
      } else if (child.userData.originalMaterial && !(isInvincible.current || isIFraming)) {
        child.material = child.userData.originalMaterial;
        delete child.userData.originalMaterial;
      }
    });
  });

  useEffect(() => {
    const checkHit = (event: any) => {
      if (isInvincible.current || isImmortalityActive || isIFraming) return;
      audio.playDamage();
      triggerShake(1.3);
      takeDamage(event?.detail?.damage || 25);
      isInvincible.current = true;
      lastDamageTime.current = Date.now();
    };
    window.addEventListener('player-hit', checkHit);
    return () => window.removeEventListener('player-hit', checkHit);
  }, [takeDamage, isImmortalityActive, isIFraming, triggerShake]);

  const trailColor = isImmortalityActive ? '#FFFFFF' : character.accent;
  const trailLength = isDashing ? 12 : 6;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Ground pulse — fades in on each footfall, contributes to bloom. */}
      <mesh
        ref={groundPulseRef}
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={2}
      >
        <ringGeometry args={[0.45, 1.1, 32]} />
        <meshBasicMaterial
          ref={groundPulseMatRef}
          color={trailColor}
          transparent
          depthWrite={false}
          toneMapped={false}
          opacity={0.2}
        />
      </mesh>

      {/* Speed trail — follows an invisible anchor at torso height. */}
      <Trail
        width={0.55}
        length={trailLength}
        color={trailColor}
        attenuation={(t: number) => t * t}
        decay={4}
      >
        <mesh ref={trailAnchorRef} position={[0, 1.1, 0.1]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Trail>

      <group ref={bodyRef} position={[0, 1.05, 0]}>
        <mesh geometry={TORSO_GEO} material={materials.armor} scale={silhouette.torsoScale} castShadow />
        <mesh
          position={[0, 0.04, 0.19]}
          geometry={CHEST_PANEL_GEO}
          material={selectedCharacterId === 'tcl' ? materials.glow : materials.secondary}
          scale={silhouette.chestScale}
        />

        <group ref={headRef} position={[0, 0.58, 0]} scale={silhouette.headScale}>
          <mesh geometry={HEAD_GEO} material={materials.armor} castShadow />
          <mesh position={[0, 0, 0.16]}>
            <boxGeometry args={[selectedCharacterId === 'pixel' ? 0.26 : 0.18, 0.08, 0.04]} />
            <primitive object={selectedCharacterId === 'pixel' ? materials.accent : materials.visor} />
          </mesh>
        </group>

        <group position={[silhouette.shoulderX, 0.24, 0]}>
          <group ref={rightArmRef}>
            <mesh position={[0, -0.28, 0]} geometry={ARM_GEO} material={materials.armor} scale={silhouette.armScale} castShadow />
            <mesh position={[0, -0.62, 0]} geometry={JOINT_GEO} material={materials.accent} />
          </group>
        </group>
        <group position={[-silhouette.shoulderX, 0.24, 0]}>
          <group ref={leftArmRef}>
            <mesh position={[0, -0.28, 0]} geometry={ARM_GEO} material={materials.armor} scale={silhouette.armScale} castShadow />
            <mesh position={[0, -0.62, 0]} geometry={JOINT_GEO} material={materials.accent} />
          </group>
        </group>

        <mesh position={[0, -0.2, 0]} geometry={HIPS_GEO} material={materials.joint} scale={silhouette.hipScale} />

        <group position={[0.14, -0.26, 0]}>
          <group ref={rightLegRef}>
            <mesh position={[0, -0.38, 0]} geometry={LEG_GEO} material={materials.armor} scale={silhouette.legScale} castShadow />
          </group>
        </group>
        <group position={[-0.14, -0.26, 0]}>
          <group ref={leftLegRef}>
            <mesh position={[0, -0.38, 0]} geometry={LEG_GEO} material={materials.armor} scale={silhouette.legScale} castShadow />
          </group>
        </group>

        {(selectedCharacterId === 'samsung' || selectedCharacterId === 'motorola') && (
          <>
            <group ref={leftWingRef} position={[-0.32, 0.36, -0.16]}>
              <mesh
                geometry={WING_GEO}
                material={materials.accent}
                scale={selectedCharacterId === 'samsung' ? [1.45, 1.28, 1.18] : [0.92, 0.94, 0.85]}
              />
            </group>
            <group ref={rightWingRef} position={[0.32, 0.36, -0.16]}>
              <mesh
                geometry={WING_GEO}
                material={materials.accent}
                scale={selectedCharacterId === 'samsung' ? [1.45, 1.28, 1.18] : [0.92, 0.94, 0.85]}
              />
            </group>
          </>
        )}

        {selectedCharacterId === 'apple' && (
          <group position={[-0.38, 0.35, 0.02]}>
            <mesh geometry={CAMERA_CLUSTER_GEO} material={materials.secondary} scale={[1.08, 1.08, 1]} />
            {[
              [-0.06, 0.05, 0.08],
              [0.06, 0.05, 0.08],
              [0, -0.06, 0.08],
            ].map((pos, index) => (
              <mesh key={index} position={pos as any} rotation={[Math.PI / 2, 0, 0]} geometry={LENS_GEO} material={materials.accent} />
            ))}
          </group>
        )}
        {selectedCharacterId === 'apple' && (
          <mesh position={[0, 0.07, 0.245]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.18, 0.018, 12, 48]} />
            <primitive object={materials.accent} />
          </mesh>
        )}

        {selectedCharacterId === 'samsung' && (
          <>
            <mesh position={[-0.37, 0.32, 0.02]} geometry={SHOULDER_PLATE_GEO} material={materials.secondary} />
            <mesh position={[0.37, 0.32, 0.02]} geometry={SHOULDER_PLATE_GEO} material={materials.secondary} />
            <mesh position={[0, 0.06, 0.24]} geometry={DISPLAY_FRAME_GEO} material={materials.accent} scale={[0.92, 0.62, 0.9]} />
          </>
        )}

        {selectedCharacterId === 'tcl' && (
          <>
            <group ref={chestPanelRef} position={[0, 0.05, 0.21]}>
              <mesh>
                <boxGeometry args={[0.42, 0.3, 0.06]} />
                <primitive object={materials.glow} />
              </mesh>
              {[-0.12, -0.04, 0.04, 0.12].map((x, index) => (
                <mesh
                  key={x}
                  position={[x, -0.02, 0.05]}
                  geometry={EQUALIZER_BAR_GEO}
                  material={materials.accent}
                  scale={[1, 0.65 + index * 0.22, 1]}
                />
              ))}
            </group>
            <mesh position={[-0.42, 0.22, 0.02]} geometry={SHOULDER_PLATE_GEO} material={materials.accent} scale={[0.92, 1.4, 1]} />
            <mesh position={[0.42, 0.22, 0.02]} geometry={SHOULDER_PLATE_GEO} material={materials.accent} scale={[0.92, 1.4, 1]} />
          </>
        )}

        {selectedCharacterId === 'motorola' && (
          <group ref={chestPanelRef} position={[0, 0.02, 0.23]}>
            <mesh geometry={FLIP_PANEL_GEO} material={materials.secondary} />
            <mesh position={[0, 0.02, 0.035]} rotation={[0, 0, Math.PI / 2]} geometry={HINGE_GEO} material={materials.accent} />
            <mesh position={[0, -0.23, 0.02]} geometry={FLIP_PANEL_GEO} material={materials.accent} scale={[0.74, 0.48, 0.72]} />
          </group>
        )}

        {selectedCharacterId === 'pixel' && (
          <>
            <mesh position={[0, 0.59, 0.18]} geometry={SCANNER_VISOR_GEO} material={materials.accent} />
            <mesh position={[-0.2, 0.82, -0.02]} rotation={[0.18, 0, -0.32]} geometry={ANTENNA_GEO} material={materials.secondary} />
            <mesh position={[0.2, 0.82, -0.02]} rotation={[0.18, 0, 0.32]} geometry={ANTENNA_GEO} material={materials.secondary} />
            <group ref={droneOrbitLeftRef} position={[-0.36, 0.54, 0]}>
              <group position={[0.22, 0.04, 0.12]}>
                <mesh geometry={DRONE_GEO} material={materials.secondary} scale={[1.18, 1.18, 1.18]} />
                <mesh position={[0, 0, 0.09]} geometry={JOINT_GEO} material={materials.accent} />
              </group>
            </group>
            <group ref={droneOrbitRightRef} position={[0.36, 0.54, 0]}>
              <group position={[-0.22, -0.02, -0.12]}>
                <mesh geometry={DRONE_GEO} material={materials.secondary} scale={[1.18, 1.18, 1.18]} />
                <mesh position={[0, 0, 0.09]} geometry={JOINT_GEO} material={materials.accent} />
              </group>
            </group>
          </>
        )}

        {(selectedCharacterId === 'sidekick_core' || isSidekickCoreActive) && (
          <>
            <mesh ref={haloRef} position={[0, 0.58, -0.08]} geometry={HALO_GEO} material={materials.accent} />
            <mesh position={[0, 0.1, -0.14]}>
              <sphereGeometry args={[0.14, 18, 18]} />
              <primitive object={materials.glow} />
            </mesh>
          </>
        )}
      </group>

      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={SHADOW_GEO} material={materials.shadow} />
    </group>
  );
};
