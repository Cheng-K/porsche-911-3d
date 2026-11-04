import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../state/store';
import { getRegistry } from './Car';

/** Headlight positions in car-local space (at the lens, pointing forward/down). */
const HEADLIGHTS: [number, number, number][] = [
  [-0.72, 0.82, 2.45],
  [0.72, 0.82, 2.45],
];

/**
 * Headlamps: emissive lamp materials + two real spotlights so the toggle
 * actually lights the scene, not just the lens surfaces.
 */
export function Headlights() {
  const lightsOn = useStore((s) => s.lightsOn);
  const spotL = useRef<THREE.SpotLight>(null);
  const spotR = useRef<THREE.SpotLight>(null);

  useEffect(() => {
    const registry = getRegistry();
    if (!registry) return;
    for (const m of registry.materials.emissive) {
      const mat = m as THREE.MeshStandardMaterial;
      mat.emissive = new THREE.Color(lightsOn ? 0xffe9c4 : 0x000000);
      mat.emissiveIntensity = lightsOn ? 2.8 : 0;
      mat.needsUpdate = true;
    }
  }, [lightsOn]);

  useEffect(() => {
    for (const ref of [spotL, spotR]) {
      const light = ref.current;
      if (!light) continue;
      light.intensity = lightsOn ? 22 : 0;
      light.target.position.set(light.position.x, 0.15, 12);
      light.target.updateMatrixWorld();
    }
  }, [lightsOn]);

  return (
    <>
      {HEADLIGHTS.map(([x, y, z], i) => (
        <spotLight
          key={i}
          ref={i === 0 ? spotL : spotR}
          position={[x, y, z]}
          angle={0.42}
          penumbra={0.45}
          distance={26}
          decay={1.2}
          intensity={0}
          color="#ffe9c4"
          castShadow={false}
        />
      ))}
    </>
  );
}
