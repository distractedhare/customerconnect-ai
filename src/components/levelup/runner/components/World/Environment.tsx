/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH } from '../../types';
import { getWorldTheme, type WorldTheme } from '../../content';

// ─── shared hook: resolves current WorldTheme from game level ────────────────
const useWorldTheme = (): WorldTheme => {
  const level = useStore((state) => state.level);
  return useMemo(() => getWorldTheme(level), [level]);
};

// ─── StarField ───────────────────────────────────────────────────────────────
const StarField: React.FC = () => {
  const speed = useStore((state) => state.speed);
  const status = useStore((state) => state.status);
  const count = 3000;
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 400;
      let y = (Math.random() - 0.5) * 200 + 50;
      let z = -550 + Math.random() * 650;
      if (Math.abs(x) < 15 && y > -5 && y < 20) {
        if (x < 0) x -= 15;
        else x += 15;
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (status !== 'PLAYING' && status !== 'SHOP') return;
    const arr = meshRef.current.geometry.attributes.position.array as Float32Array;
    const activeSpeed = speed > 0 ? speed : 2;
    for (let i = 0; i < count; i++) {
      let z = arr[i * 3 + 2];
      z += activeSpeed * delta * 2.0;
      if (z > 100) {
        z = -550 - Math.random() * 50;
        let x = (Math.random() - 0.5) * 400;
        let y = (Math.random() - 0.5) * 200 + 50;
        if (Math.abs(x) < 15 && y > -5 && y < 20) {
          if (x < 0) x -= 15;
          else x += 15;
        }
        arr[i * 3] = x;
        arr[i * 3 + 1] = y;
      }
      arr[i * 3 + 2] = z;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#ffffff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};

// ─── LaneFloor ───────────────────────────────────────────────────────────────
const LaneFloor: React.FC<{ theme: WorldTheme }> = ({ theme }) => {
  const laneCount = useStore((state) => state.laneCount);
  const status = useStore((state) => state.status);
  const speed = useStore((state) => state.speed);
  const dashMatRef = useRef<THREE.ShaderMaterial>(null);

  const separators = useMemo(() => {
    const lines: number[] = [];
    const startX = -(laneCount * LANE_WIDTH) / 2;
    for (let i = 0; i <= laneCount; i++) lines.push(startX + i * LANE_WIDTH);
    return lines;
  }, [laneCount]);

  const dashUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0 },
      uColor: { value: new THREE.Color(theme.laneLineColor) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // update lane color when theme changes
  useEffect(() => {
    dashUniforms.uColor.value.set(theme.laneLineColor);
  }, [theme.laneLineColor, dashUniforms]);

  useFrame((_, delta) => {
    if (status !== 'PLAYING' && status !== 'SHOP') return;
    if (dashMatRef.current) {
      const activeSpeed = speed > 0 ? speed : 5;
      dashMatRef.current.uniforms.uTime.value += delta * activeSpeed;
      dashMatRef.current.uniforms.uSpeed.value = activeSpeed;
    }
  });

  return (
    <group position={[0, 0.02, 0]}>
      <mesh position={[0, -0.02, -20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[laneCount * LANE_WIDTH, 200]} />
        <MeshReflectorMaterial
          blur={[200, 100]}
          resolution={256}
          mixBlur={8}
          mixStrength={0.6}
          roughness={0.6}
          depthScale={0.4}
          minDepthThreshold={0.85}
          maxDepthThreshold={1}
          color={theme.floorReflectorColor}
          metalness={0.4}
          mirror={0.5}
        />
      </mesh>

      {separators.map((x, i) => (
        <mesh key={`sep-${i}`} position={[x, 0, -20]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, 200]} />
          <shaderMaterial
            ref={i === 0 ? dashMatRef : undefined}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            uniforms={dashUniforms}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              varying vec2 vUv;
              uniform float uTime;
              uniform float uSpeed;
              uniform vec3 uColor;
              void main() {
                float dashes = step(0.5, fract((vUv.y * 12.0) - uTime * 0.3));
                float fade = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
                float alpha = dashes * fade * (0.55 + min(uSpeed, 12.0) * 0.04);
                gl_FragColor = vec4(uColor, alpha);
              }
            `}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── RetroSun ────────────────────────────────────────────────────────────────
const RetroSun: React.FC<{ theme: WorldTheme }> = ({ theme }) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const sunGroupRef = useRef<THREE.Group>(null);
  const { status } = useStore();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorTop: { value: new THREE.Color(theme.sunTop) },
      uColorBottom: { value: new THREE.Color(theme.sunBottom) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    uniforms.uColorTop.value.set(theme.sunTop);
    uniforms.uColorBottom.value.set(theme.sunBottom);
  }, [theme.sunTop, theme.sunBottom, uniforms]);

  useFrame((state) => {
    if (status !== 'PLAYING' && status !== 'SHOP') return;
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (sunGroupRef.current) {
      sunGroupRef.current.position.y = 30 + Math.sin(state.clock.elapsedTime * 0.2) * 1.0;
      sunGroupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={sunGroupRef} position={[0, 30, -180]}>
      <mesh>
        <sphereGeometry args={[35, 32, 32]} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          transparent
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColorTop;
            uniform vec3 uColorBottom;
            void main() {
              vec3 color = mix(uColorBottom, uColorTop, vUv.y);
              float stripes = sin((vUv.y * 40.0) - uTime);
              float stripeMask = smoothstep(0.2, 0.3, stripes);
              float scanlineFade = smoothstep(0.7, 0.3, vUv.y);
              vec3 finalColor = mix(color, color * 0.1, (1.0 - stripeMask) * scanlineFade);
              gl_FragColor = vec4(finalColor, 1.0);
            }
          `}
        />
      </mesh>
    </group>
  );
};

// ─── MagentaHorizon (now ThemedHorizon) ──────────────────────────────────────
const ThemedHorizon: React.FC<{ theme: WorldTheme }> = ({ theme }) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const status = useStore((state) => state.status);
  const speed = useStore((state) => state.speed);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: 0 },
      uColorBase: { value: new THREE.Color(theme.horizonPulseBase) },
      uColorPeak: { value: new THREE.Color(theme.horizonPulsePeak) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    uniforms.uColorBase.value.set(theme.horizonPulseBase);
    uniforms.uColorPeak.value.set(theme.horizonPulsePeak);
  }, [theme.horizonPulseBase, theme.horizonPulsePeak, uniforms]);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    if (status === 'PLAYING' || status === 'SHOP') {
      matRef.current.uniforms.uTime.value += delta;
    }
    const target = speed > 0 ? speed : 4;
    const cur = matRef.current.uniforms.uSpeed.value;
    matRef.current.uniforms.uSpeed.value = cur + (target - cur) * Math.min(1, delta * 4);
  });

  return (
    <mesh position={[0, 4, -195]}>
      <planeGeometry args={[400, 6]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform float uSpeed;
          uniform vec3 uColorBase;
          uniform vec3 uColorPeak;
          void main() {
            float band = smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
            float taper = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
            float pulseRate = 1.0 + (uSpeed * 0.18);
            float pulse = 0.7 + 0.3 * sin(uTime * pulseRate);
            vec3 col = mix(uColorBase, uColorPeak, pulse * 0.55);
            float alpha = band * taper * pulse;
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  );
};

// ─── SkyDome ─────────────────────────────────────────────────────────────────
const SkyDome: React.FC<{ theme: WorldTheme }> = ({ theme }) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uZenith: { value: new THREE.Color(theme.skyZenith) },
      uMid: { value: new THREE.Color(theme.skyMid) },
      uHorizon: { value: new THREE.Color(theme.skyHorizon) },
      uFloor: { value: new THREE.Color(theme.skyFloor) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uZenith.value.set(theme.skyZenith);
    matRef.current.uniforms.uMid.value.set(theme.skyMid);
    matRef.current.uniforms.uHorizon.value.set(theme.skyHorizon);
    matRef.current.uniforms.uFloor.value.set(theme.skyFloor);
  }, [theme.skyZenith, theme.skyMid, theme.skyHorizon, theme.skyFloor]);

  return (
    <mesh>
      <sphereGeometry args={[300, 32, 16]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vWorldPosition;
          uniform vec3 uZenith;
          uniform vec3 uMid;
          uniform vec3 uHorizon;
          uniform vec3 uFloor;
          void main() {
            float h = normalize(vWorldPosition).y;
            vec3 col;
            if (h > 0.0) {
              float band = smoothstep(0.0, 0.05, h);
              float midMix = smoothstep(0.05, 0.45, h);
              float zenithMix = smoothstep(0.45, 1.0, h);
              col = mix(uHorizon, uMid, midMix);
              col = mix(col, uZenith, zenithMix);
              col = mix(col, uHorizon, (1.0 - band) * 0.55);
            } else {
              col = mix(uFloor, uHorizon, smoothstep(-0.15, 0.0, h));
            }
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
};

// ─── MovingGrid ───────────────────────────────────────────────────────────────
const MovingGrid: React.FC<{ theme: WorldTheme }> = ({ theme }) => {
  const speed = useStore((state) => state.speed);
  const status = useStore((state) => state.status);
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    if (matRef.current) matRef.current.color.set(theme.gridColor);
  }, [theme.gridColor]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (status !== 'PLAYING' && status !== 'SHOP') return;
    const activeSpeed = speed > 0 ? speed : 5;
    offsetRef.current += activeSpeed * delta;
    const cellSize = 10;
    meshRef.current.position.z = -100 + (offsetRef.current % cellSize);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -100]}>
      <planeGeometry args={[300, 400, 30, 40]} />
      <meshBasicMaterial ref={matRef} color={theme.gridColor} wireframe transparent opacity={0.2} />
    </mesh>
  );
};

// ─── SynthwaveCity ────────────────────────────────────────────────────────────
const SynthwaveCity: React.FC<{ theme: WorldTheme }> = ({ theme }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const wireframeRef = useRef<THREE.InstancedMesh>(null);
  const fillMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const wireMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const speed = useStore((state) => state.speed);
  const status = useStore((state) => state.status);
  const count = 80;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const wireframeDummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (fillMatRef.current) fillMatRef.current.color.set(theme.buildingFill);
    if (wireMatRef.current) wireMatRef.current.color.set(theme.buildingWireframe);
  }, [theme.buildingFill, theme.buildingWireframe]);

  const buildingData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const isLeft = i % 2 === 0;
      const xOffset = isLeft ? -15 - Math.random() * 40 : 15 + Math.random() * 40;
      const height = 10 + Math.random() * 60;
      const width = 4 + Math.random() * 8;
      const depth = 4 + Math.random() * 8;
      const z = -250 + Math.random() * 350;
      data.push({ x: xOffset, y: height / 2, z, width, height, depth });
    }
    return data;
  }, [count]);

  useEffect(() => {
    if (!meshRef.current || !wireframeRef.current) return;
    buildingData.forEach((b, i) => {
      dummy.position.set(b.x, b.y - 2, b.z);
      dummy.scale.set(b.width, b.height, b.depth);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      wireframeDummy.position.set(b.x, b.y - 2, b.z);
      wireframeDummy.scale.set(b.width * 1.01, b.height * 1.01, b.depth * 1.01);
      wireframeDummy.updateMatrix();
      wireframeRef.current!.setMatrixAt(i, wireframeDummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    wireframeRef.current.instanceMatrix.needsUpdate = true;
  }, [buildingData, dummy, wireframeDummy]);

  useFrame((_, delta) => {
    if (!meshRef.current || !wireframeRef.current) return;
    if (status !== 'PLAYING' && status !== 'SHOP') return;
    const activeSpeed = speed > 0 ? speed : 5;
    buildingData.forEach((b, i) => {
      b.z += activeSpeed * delta;
      if (b.z > 50) {
        b.z = -250 - Math.random() * 50;
        b.height = 10 + Math.random() * 60;
        b.y = b.height / 2;
      }
      dummy.position.set(b.x, b.y - 2, b.z);
      dummy.scale.set(b.width, b.height, b.depth);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      wireframeDummy.position.set(b.x, b.y - 2, b.z);
      wireframeDummy.scale.set(b.width * 1.05, b.height * 1.05, b.depth * 1.05);
      wireframeDummy.updateMatrix();
      wireframeRef.current!.setMatrixAt(i, wireframeDummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    wireframeRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial ref={fillMatRef} color={theme.buildingFill} roughness={0.8} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={wireframeRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial ref={wireMatRef} color={theme.buildingWireframe} wireframe transparent opacity={0.15} />
      </instancedMesh>
    </group>
  );
};

// ─── SceneLighting — handles fog + lights reactively ─────────────────────────
const SceneLighting: React.FC<{ theme: WorldTheme }> = ({ theme }) => {
  const { scene } = useThree();
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const pointRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.set(theme.fogColor);
      scene.fog.near = theme.fogNear;
      scene.fog.far = theme.fogFar;
    }
    if (ambientRef.current) ambientRef.current.color.set(theme.ambientColor);
    if (dirRef.current) dirRef.current.color.set(theme.directionalColor);
    if (pointRef.current) pointRef.current.color.set(theme.pointColor);
  }, [theme, scene]);

  return (
    <>
      <fog attach="fog" args={[theme.fogColor, theme.fogNear, theme.fogFar]} />
      <ambientLight ref={ambientRef} intensity={0.4} color={theme.ambientColor} />
      <directionalLight ref={dirRef} position={[0, 20, -10]} intensity={1.5} color={theme.directionalColor} />
      <pointLight ref={pointRef} position={[0, 25, -150]} intensity={4} color={theme.pointColor} distance={300} decay={2} />
    </>
  );
};

// ─── Environment (root) ───────────────────────────────────────────────────────
export const Environment: React.FC = () => {
  const theme = useWorldTheme();

  return (
    <>
      <SceneLighting theme={theme} />
      <SkyDome theme={theme} />
      <StarField />
      <ThemedHorizon theme={theme} />
      <SynthwaveCity theme={theme} />
      <MovingGrid theme={theme} />
      <LaneFloor theme={theme} />
      <RetroSun theme={theme} />
    </>
  );
};
