import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

/**
 * Single owner of the camera. `makeDefault` so other systems can find the
 * controls via useThree(s => s.controls) if needed.
 */
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    const c = controls.current;
    if (c) {
      c.target.set(0, 0.6, 0);
      c.update();
    }
  }, []);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minDistance={2.5}
      maxDistance={12}
      enablePan={false}
    />
  );
}
