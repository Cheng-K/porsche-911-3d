import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { easing } from 'maath';
import { getRegistry } from './Car';
import { HINGES } from '../../config/parts.config';
import { useStore, PART_IDS, type PartId } from '../../state/store';

/**
 * Animates every articulable part toward its open/closed target with damped
 * rotation — interruptible mid-flight for free (a second click just changes
 * the target).
 */
export function PartAnimator() {
  const parts = useStore((s) => s.parts);
  const targets = useRef<Record<PartId, number>>({
    doorLeft: 0,
    doorRight: 0,
    hood: 0,
    engineCover: 0,
  });

  for (const id of PART_IDS) {
    targets.current[id] = parts[id].open ? HINGES[id].openAngle : 0;
  }

  useFrame((_, dt) => {
    const registry = getRegistry();
    if (!registry) return;
    for (const id of PART_IDS) {
      const part = registry.parts[id];
      if (!part) continue;
      easing.damp(part.group.rotation, HINGES[id].axis, targets.current[id], 0.28, dt);
    }
  });

  return null;
}

/**
 * Applies the selected paint color to every paint material found at ingest.
 * Materials are shared across body and panels, so one write repaints all.
 */
export function PaintApplier() {
  const paint = useStore((s) => s.paint);

  useEffect(() => {
    const registry = getRegistry();
    if (!registry) return;
    for (const m of registry.materials.paint) {
      const mat = m as THREE.MeshPhysicalMaterial;
      mat.color.set(paint.color);
      mat.metalness = paint.metalness;
      mat.roughness = paint.roughness;
      mat.needsUpdate = true;
    }
  }, [paint]);

  return null;
}
