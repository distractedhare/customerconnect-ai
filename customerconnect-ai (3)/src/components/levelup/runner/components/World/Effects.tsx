/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useMemo } from 'react';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStore } from '../../store';
import * as THREE from 'three';

export const Effects: React.FC = () => {
  const shakeIntensity = useStore(state => state.shakeIntensity);
  
  const chromAbbOffset = useMemo(() => {
    return new THREE.Vector2(shakeIntensity * 0.05, shakeIntensity * 0.05);
  }, [shakeIntensity]);

  return (
    <EffectComposer enableNormalPass={false} multisampling={4}>
      {/* Bloom: lowered threshold + bumped intensity so the magenta horizon
          and the additive dash strips actually carry the scene. */}
      <Bloom
        luminanceThreshold={0.6}
        mipmapBlur
        intensity={1.4 + (shakeIntensity * 2.0)}
        radius={0.7}
        levels={8}
      />
      
      {shakeIntensity > 0 && (
          <Glitch 
              delay={new THREE.Vector2(0, 0)} 
              duration={new THREE.Vector2(0.2, 0.4)} 
              strength={new THREE.Vector2(shakeIntensity * 0.5, shakeIntensity)}
              active={true}
              ratio={0.8}
          />
      )}

      <ChromaticAberration 
          offset={chromAbbOffset} 
          blendFunction={BlendFunction.NORMAL} 
          radialModulation={false} 
          modulationOffset={0} 
      />

      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.1} darkness={0.5 + (shakeIntensity * 0.3)} />
    </EffectComposer>
  );
};
