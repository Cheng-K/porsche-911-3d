import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Scene } from '../scene/Scene';
import { Overlay } from '../ui/Overlay';
import { useStore } from '../state/store';

export function App() {
  const tier = useStore((s) => s.tier);
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        dpr={[1, tier === 'high' ? 1.75 : 1]}
        camera={{ position: [4.2, 1.6, 5.4], fov: 40, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Overlay />
    </div>
  );
}
