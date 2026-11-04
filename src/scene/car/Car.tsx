import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useStore, PART_IDS, type PartId } from '../../state/store';
import { ingestModel, registryReport, type Registry } from '../../lib/registry';

export const MODEL_URL = '/models/911.glb';

/** Latest ingest result — read by later milestones (paint, lights, calibration). */
let activeRegistry: Registry | null = null;
export function getRegistry() {
  return activeRegistry;
}

class ModelErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: unknown) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
  render() {
    if (this.state.error) {
      console.error('Model failed to load:', this.state.error);
      return (
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[2, 1.5, 4]} />
          <meshStandardMaterial color="#3a3f47" wireframe />
        </mesh>
      );
    }
    return this.props.children;
  }
}

function partIdFromObject(obj: THREE.Object3D | null): PartId | null {
  let cur = obj;
  while (cur) {
    if (cur.name.startsWith('pivot_')) {
      const id = cur.name.slice('pivot_'.length) as PartId;
      return (PART_IDS as string[]).includes(id) ? id : null;
    }
    cur = cur.parent;
  }
  return null;
}

function CarModel() {
  const { scene } = useGLTF(MODEL_URL);
  const setCapability = useStore((s) => s.setCapability);
  const togglePart = useStore((s) => s.togglePart);
  const press = useRef<{ x: number; y: number } | null>(null);

  const { group, registry } = useMemo(() => ingestModel(scene), [scene]);

  useEffect(() => {
    activeRegistry = registry;
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__car = { group, registry };
    }
    console.log(registryReport(registry));
    setCapability(registry.capability);
  }, [registry, group, setCapability]);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    press.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    const start = press.current;
    press.current = null;
    if (!start) return;
    // Ignore orbit drags — only a real click (little movement) toggles.
    const moved = Math.hypot(e.nativeEvent.clientX - start.x, e.nativeEvent.clientY - start.y);
    if (moved > 6) return;
    const id = partIdFromObject(e.object);
    if (id) togglePart(id);
  };

  return (
    <primitive
      object={group}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    />
  );
}

export function Car() {
  return (
    <ModelErrorBoundary>
      <CarModel />
    </ModelErrorBoundary>
  );
}

useGLTF.preload(MODEL_URL);
