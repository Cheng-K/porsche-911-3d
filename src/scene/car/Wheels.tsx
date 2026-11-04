import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { getRegistry } from './Car';
import { useStore } from '../../state/store';
import { STEER_MAX, SPIN_SPEED, type WheelId } from '../../config/parts.config';

const FRONT: WheelId[] = ['frontLeft', 'frontRight'];
const ALL: WheelId[] = ['frontLeft', 'frontRight', 'rearLeft', 'rearRight'];

/**
 * Steering damps the front wheels toward the steer target; rolling spins all
 * four wheels about their own measured axle (steer group → spin group).
 */
export function Wheels() {
  const steer = useStore((s) => s.steer);
  const spin = useStore((s) => s.spin);
  const angle = useRef(0);
  const target = useRef(0);
  target.current = steer * STEER_MAX;

  useFrame((_, dt) => {
    const registry = getRegistry();
    if (!registry) return;

    for (const id of FRONT) {
      const wheel = registry.wheels[id];
      if (!wheel) continue;
      easing.damp(wheel.steerGroup.rotation, 'y', target.current, 0.18, dt);
    }

    if (spin) angle.current += SPIN_SPEED * dt;
    const q = new THREE.Quaternion();
    for (const id of ALL) {
      const wheel = registry.wheels[id];
      if (!wheel) continue;
      q.setFromAxisAngle(wheel.axle, -angle.current);
      wheel.spinGroup.quaternion.copy(q);
    }
  });

  return null;
}
