/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH } from '../../types';

const StarField: React.FC = () => {
  const speed = useStore(state => state.speed);
  const status = useStore(state => state.status);
  const count = 3000;
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 400;
      let y = (Math.random() - 0.5) * 200 + 50; // Keep mostly above horizon

      // Distribute Z randomly along the entire travel path plus buffer
      let z = -550 + Math.random() * 650;

      // Exclude stars from the central play area
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

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (status !== 'PLAYING' && status !== 'SHOP') return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const activeSpeed = speed > 0 ? speed : 2;

    for (let i = 0; i < count; i++) {
        let z = positions[i * 3 + 2];
        z += activeSpeed * delta * 2.0;

        if (z > 100) {
            z = -550 - Math.random() * 50;

            let x = (Math.random() - 0.5) * 400;
            let y = (Math.random() - 0.5) * 200 + 50;

            if (Math.abs(x) < 15 && y > -5 && y < 20) {
                if (x < 0) x -= 15;
                else x += 15;
            }

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
        }
        positions[i * 3 + 2] = z;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

/**
 * Reflective tarmac with animated dash strips streaming toward the player.
 * Replaces the previous flat magenta plane + thin static lane separators.
 */
const LaneFloor: React.FC = () => {
    const laneCount = useStore(state => state.laneCount);
    const status = useStore(state => state.status);
    const speed = useStore(state => state.speed);
    const dashMatRef = useRef<THREE.ShaderMaterial>(null);

    const separators = useMemo(() => {
        const lines: number[] = [];
        const startX = -(laneCount * LANE_WIDTH) / 2;
        for (let i = 0; i <= laneCount; i++) {
            lines.push(startX + (i * LANE_WIDTH));
        }
        return lines;
    }, [laneCount]);

    const dashUniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSpeed: { value: 0 },
    }), []);

    useFrame((state, delta) => {
        if (status !== 'PLAYING' && status !== 'SHOP') return;
        if (dashMatRef.current) {
            const activeSpeed = speed > 0 ? speed : 5;
            dashMatRef.current.uniforms.uTime.value += delta * activeSpeed;
            dashMatRef.current.uniforms.uSpeed.value = activeSpeed;
        }
    });

    return (
        <group position={[0, 0.02, 0]}>
            {/* Reflective tarmac. resolution kept low to hold 60fps on phone. */}
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
                    color="#1a0b2e"
                    metalness={0.4}
                    mirror={0.5}
                />
            </mesh>

            {/* Animated emissive dash strips. UV-scrolling shader, no asset. */}
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

                            void main() {
                                // Dash pattern that scrolls toward the player.
                                float dashes = step(0.5, fract((vUv.y * 12.0) - uTime * 0.3));
                                // Soft falloff toward the horizon so the strips don't pop.
                                float fade = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
                                vec3 color = vec3(0.886, 0.0, 0.455); // T-Magenta in linear-ish.
                                float alpha = dashes * fade * (0.55 + min(uSpeed, 12.0) * 0.04);
                                gl_FragColor = vec4(color, alpha);
                            }
                        `}
                    />
                </mesh>
            ))}
        </group>
    );
};

const RetroSun: React.FC = () => {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const sunGroupRef = useRef<THREE.Group>(null);

    const { status } = useStore();

    useFrame((state) => {
        if (status !== 'PLAYING' && status !== 'SHOP') return;

        if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
        if (sunGroupRef.current) {
            sunGroupRef.current.position.y = 30 + Math.sin(state.clock.elapsedTime * 0.2) * 1.0;
            sunGroupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColorTop: { value: new THREE.Color('#FFFFFF') },
        uColorBottom: { value: new THREE.Color('#E20074') }
    }), []);

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
                            float stripeFreq = 40.0;
                            float stripeSpeed = 1.0;
                            float stripes = sin((vUv.y * stripeFreq) - (uTime * stripeSpeed));
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

/**
 * Volumetric Magenta Pulse horizon — the bold move.
 *
 * A thick emissive band that sits at the horizon behind the city. Its
 * intensity is modulated by a sine wave whose frequency tracks the
 * player's speed. Visualizes T-Mobile's Magenta Pulse design language
 * directly: faster run → faster pulse → louder horizon glow. Hits
 * the bloom pass hard so it carries even when scaled down.
 */
const MagentaHorizon: React.FC = () => {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const status = useStore(state => state.status);
    const speed = useStore(state => state.speed);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSpeed: { value: 0 },
    }), []);

    useFrame((state, delta) => {
        if (!matRef.current) return;
        if (status === 'PLAYING' || status === 'SHOP') {
            matRef.current.uniforms.uTime.value += delta;
        }
        // Damp toward current speed so the horizon eases when status changes.
        const target = speed > 0 ? speed : 4;
        const cur = matRef.current.uniforms.uSpeed.value;
        matRef.current.uniforms.uSpeed.value = cur + (target - cur) * Math.min(1, delta * 4);
    });

    return (
        // Wide and tall band, parked behind the sun and city, slightly above the floor.
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

                    void main() {
                        // Vertical falloff: a soft band centered on vUv.y = 0.5.
                        float band = smoothstep(0.0, 0.45, vUv.y) * smoothstep(1.0, 0.55, vUv.y);

                        // Horizontal taper so the edges fade off rather than ending hard.
                        float taper = smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);

                        // Pulse: sine modulated by speed. Base 0.7 with +/- 0.3 swing.
                        float pulseRate = 1.0 + (uSpeed * 0.18);
                        float pulse = 0.7 + 0.3 * sin(uTime * pulseRate);

                        // Color shifts subtly from deeper magenta at base to neon pink at peak.
                        vec3 base = vec3(0.886, 0.0, 0.455);   // #E20074
                        vec3 peak = vec3(1.0, 0.55, 0.78);     // #FF8CC6
                        vec3 col = mix(base, peak, pulse * 0.55);

                        float alpha = band * taper * pulse;
                        gl_FragColor = vec4(col, alpha);
                    }
                `}
            />
        </mesh>
    );
};

/**
 * Sky dome — vertical gradient that anchors the retro sun and gives
 * the horizon a real glow band. Replaces the solid black background.
 */
const SkyDome: React.FC = () => {
    const uniforms = useMemo(() => ({
        uZenith: { value: new THREE.Color('#02000a') },
        uMid: { value: new THREE.Color('#3a0540') },
        uHorizon: { value: new THREE.Color('#E20074') },
        uFloor: { value: new THREE.Color('#1a0420') },
    }), []);

    return (
        <mesh>
            <sphereGeometry args={[300, 32, 16]} />
            <shaderMaterial
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
                        // h is normalized vertical: -1 at south pole, +1 at zenith.
                        float h = normalize(vWorldPosition).y;

                        vec3 col;
                        if (h > 0.0) {
                            // Above horizon: floor band -> mid -> zenith.
                            float band = smoothstep(0.0, 0.05, h);     // narrow horizon glow
                            float midMix = smoothstep(0.05, 0.45, h);
                            float zenithMix = smoothstep(0.45, 1.0, h);
                            col = mix(uHorizon, uMid, midMix);
                            col = mix(col, uZenith, zenithMix);
                            // Punch the horizon glow.
                            col = mix(col, uHorizon, (1.0 - band) * 0.55);
                        } else {
                            // Below horizon: deep magenta floor.
                            col = mix(uFloor, uHorizon, smoothstep(-0.15, 0.0, h));
                        }
                        gl_FragColor = vec4(col, 1.0);
                    }
                `}
            />
        </mesh>
    );
};

const MovingGrid: React.FC = () => {
    const speed = useStore(state => state.speed);
    const status = useStore(state => state.status);
    const meshRef = useRef<THREE.Mesh>(null);
    const offsetRef = useRef(0);

    useFrame((state, delta) => {
        if (meshRef.current) {
             if (status !== 'PLAYING' && status !== 'SHOP') return;

             const activeSpeed = speed > 0 ? speed : 5;
             offsetRef.current += activeSpeed * delta;

             const cellSize = 10;
             const zPos = -100 + (offsetRef.current % cellSize);
             meshRef.current.position.z = zPos;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -100]}>
            <planeGeometry args={[300, 400, 30, 40]} />
            <meshBasicMaterial
                color="#E20074"
                wireframe
                transparent
                opacity={0.2}
            />
        </mesh>
    );
};

const SynthwaveCity: React.FC = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const wireframeRef = useRef<THREE.InstancedMesh>(null);
    const speed = useStore(state => state.speed);
    const status = useStore(state => state.status);
    const count = 80;

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const wireframeDummy = useMemo(() => new THREE.Object3D(), []);

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

    useFrame((state, delta) => {
        if (!meshRef.current || !wireframeRef.current || (status !== 'PLAYING' && status !== 'SHOP')) return;
        const activeSpeed = speed > 0 ? speed : 5;
        let needsUpdate = false;

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

            needsUpdate = true;
        });

        if (needsUpdate) {
            meshRef.current.instanceMatrix.needsUpdate = true;
            wireframeRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#0b0512" roughness={0.8} metalness={0.2} />
            </instancedMesh>
            <instancedMesh ref={wireframeRef} args={[undefined, undefined, count]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.15} />
            </instancedMesh>
        </group>
    );
};

export const Environment: React.FC = () => {
  return (
    <>
      <fog attach="fog" args={['#1a0420', 40, 130]} />

      <ambientLight intensity={0.4} color="#E20074" />
      <directionalLight position={[0, 20, -10]} intensity={1.5} color="#E20074" />
      <pointLight position={[0, 25, -150]} intensity={4} color="#E20074" distance={300} decay={2} />

      <SkyDome />
      <StarField />
      <MagentaHorizon />
      <SynthwaveCity />
      <MovingGrid />
      <LaneFloor />

      <RetroSun />
    </>
  );
};
