/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { UserPlus } from 'lucide-react';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD, HudControlPanel } from './components/UI/HUD';
import { AudioSync } from './components/System/AudioSync';
import { useStore } from './store';
import { GameStatus } from './types';

// Dynamic Camera Controller
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();
  
  useFrame((state, delta) => {
    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2; // Threshold for "mobile-like" narrowness or square-ish displays

    // Calculate expansion factors
    // Mobile requires backing up significantly more because vertical FOV is fixed in Three.js,
    // meaning horizontal view shrinks as aspect ratio drops.
    // We use more aggressive multipliers for mobile to keep outer lanes in frame.
    const heightFactor = isMobile ? 2.0 : 0.5;
    const distFactor = isMobile ? 4.5 : 1.0;

    // Base (3 lanes): y=5.5, z=8
    // Calculate target based on how many extra lanes we have relative to the start
    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = 5.5 + (extraLanes * heightFactor);
    const targetZ = 8.0 + (extraLanes * distFactor);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 2.0);
    
    // Look further down the track to see the end of lanes
    // Adjust look target slightly based on height to maintain angle
    camera.lookAt(0, 0, -30); 
  });
  
  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            {/* Attach a userData to identify player group for LevelManager collision logic */}
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        <Effects />
    </>
  );
}

interface RunnerAppProps {
  immersive?: boolean;
  onStartLiveCall?: () => void;
}

function App({ immersive = false, onStartLiveCall }: RunnerAppProps) {
  const gameWrapperRef = React.useRef<HTMLDivElement>(null);
  const status = useStore((state) => state.status);
  const showLiveCallShortcut = immersive && onStartLiveCall && status !== GameStatus.PLAYING;
  const showControlPanel = status === GameStatus.PLAYING;

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && useStore.getState().status === GameStatus.PLAYING) {
        useStore.getState().pauseGame();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div
      ref={gameWrapperRef}
      id="tlife-runner-game-surface"
      className={`relative mx-auto flex w-full flex-col overflow-hidden bg-black select-none shadow-[0_30px_90px_rgba(0,0,0,0.4)] ${
        immersive
          ? 'max-h-[100dvh] min-h-[min(100dvh,36rem)] rounded-none border-0 md:aspect-[16/9] md:max-h-[calc(100vh-8.5rem)] md:rounded-[2.1rem] md:border md:border-white/8'
          : 'min-h-[72vh] rounded-[1.85rem] border border-white/10 md:aspect-[16/9]'
      }`}
      style={{ touchAction: 'none' }}
    >
      {showLiveCallShortcut ? (
        <div className="pointer-events-none absolute right-3 top-3 z-[140] hidden sm:block sm:right-4 sm:top-4">
          <button
            type="button"
            onClick={onStartLiveCall}
            className="focus-ring pointer-events-auto inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/12 bg-black/65 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_36px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:bg-black/80 sm:min-h-[44px] sm:px-4 sm:text-[11px]"
          >
            <UserPlus className="h-3.5 w-3.5 shrink-0 text-[#ff8cc6]" />
            <span>New Live Call</span>
          </button>
        </div>
      ) : null}

      <AudioSync />
      <div className="relative w-full flex-1 min-h-[24rem] overflow-hidden bg-black">
        <HUD />
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: false, stencil: false, depth: true, powerPreference: 'high-performance' }}
          className="h-full w-full"
          style={{ touchAction: 'none' }}
          camera={{ position: [0, 5.5, 8], fov: 60 }}
        >
          <CameraController />
          <Suspense fallback={null}>
              <Scene />
          </Suspense>
        </Canvas>
      </div>

      {showControlPanel ? <HudControlPanel /> : null}
    </div>
  );
}

export default App;
