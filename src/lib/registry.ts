import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { splitByConnectedComponents, type Component } from './geometry';
import {
  MATERIAL_ALIASES,
  PART_ALIASES,
  PART_REGIONS,
  HINGES,
  JUNK_EXTENT_LIMIT,
  WHEEL_MATERIAL_RE,
  WHEEL_REGIONS,
  type MaterialKind,
  type Region,
  type WheelId,
} from '../config/parts.config';
import type { PartId } from '../state/store';

export interface PartGroup {
  id: PartId;
  /** Pivot group — rotate this around `HINGES[id].axis` to open/close. */
  group: THREE.Group;
  componentCount: number;
}

export interface WheelAssembly {
  id: WheelId;
  /** Outer group — set rotation.y for steering. */
  steerGroup: THREE.Group;
  /** Inner group — set its quaternion to spin the wheel about `axle`. */
  spinGroup: THREE.Group;
  /** Spin axis in the steer group's local space. */
  axle: THREE.Vector3;
  componentCount: number;
}

export interface Registry {
  parts: Record<PartId, PartGroup | null>;
  wheels: Record<WheelId, WheelAssembly | null>;
  materials: Record<MaterialKind, THREE.Material[]>;
  capability: Record<PartId, boolean>;
  meshCount: number;
  hiddenJunk: string[];
}

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchPart(norm: string): PartId | null {
  for (const [partId, patterns] of Object.entries(PART_ALIASES) as [PartId, RegExp[]][]) {
    for (const re of patterns) {
      if (re.test(norm)) return partId;
    }
  }
  return null;
}

function regionContains(region: Region, center: THREE.Vector3): boolean {
  return (
    center.x >= region.min[0] &&
    center.x <= region.max[0] &&
    center.y >= region.min[1] &&
    center.y <= region.max[1] &&
    center.z >= region.min[2] &&
    center.z <= region.max[2]
  );
}

function classifyCenter(center: THREE.Vector3): PartId | null {
  for (const [partId, region] of Object.entries(PART_REGIONS) as [PartId, Region][]) {
    if (regionContains(region, center)) return partId;
  }
  return null;
}

function classifyWheel(center: THREE.Vector3): WheelId | null {
  for (const [id, region] of Object.entries(WHEEL_REGIONS) as [WheelId, Region][]) {
    if (regionContains(region, center)) return id;
  }
  return null;
}

export function classifyMaterial(material: THREE.Material): MaterialKind {
  const norm = normalizeName(material.name || '');
  if (norm) {
    for (const [kind, patterns] of Object.entries(MATERIAL_ALIASES) as [MaterialKind, RegExp[]][]) {
      for (const re of patterns) {
        if (re.test(norm)) return kind;
      }
    }
  }
  const mat = material as THREE.MeshPhysicalMaterial;
  if (mat.transmission !== undefined && mat.transmission > 0.3) return 'glass';
  if (mat.emissive && mat.emissiveIntensity > 0.5 && mat.emissive.getHex() !== 0) return 'emissive';
  if (mat.metalness !== undefined && mat.metalness > 0.85 && mat.roughness < 0.35) return 'chrome';
  if (mat.roughness !== undefined && mat.roughness > 0.75 && mat.metalness < 0.3) return 'rubber';
  return 'unknown';
}

function isJunk(component: Component): boolean {
  const size = component.box.getSize(new THREE.Vector3());
  const maxExtent = Math.max(size.x, size.y, size.z);
  // Stray Blender export leftovers (huge flat shadows, degenerate slivers).
  if (maxExtent > JUNK_EXTENT_LIMIT) return true;
  // Flat ground/shadow-catcher planes are not part of the car.
  if (size.y < 0.05 && Math.max(size.x, size.z) > 3) return true;
  return false;
}

interface Batch {
  key: string;
  /** PartId, WheelId, or 'static'. */
  slot: string;
  material: THREE.Material;
  geometries: THREE.BufferGeometry[];
  componentCount: number;
}

function attributeSignature(geometry: THREE.BufferGeometry): string {
  return Object.keys(geometry.attributes)
    .sort()
    .map((k) => `${k}:${geometry.getAttribute(k).itemSize}`)
    .join(',');
}

/**
 * Restructure the loaded GLB into static body meshes + one pivoted group per
 * articulable part. Mesh names in the asset are generic (`Object_N`), so
 * semantic identity comes from (a) name aliases when present, (b) connected
 * components whose spatial region matches `PART_REGIONS`.
 *
 * Components sharing (part, material, attribute layout) are merged so the
 * rebuilt car has a small, stable draw-call count.
 */
export function ingestModel(source: THREE.Object3D): { group: THREE.Group; registry: Registry } {
  source.updateMatrixWorld(true);

  const output = new THREE.Group();
  output.name = 'car';

  const parts: Record<PartId, PartGroup | null> = {
    doorLeft: null,
    doorRight: null,
    hood: null,
    engineCover: null,
  };
  const wheels: Record<WheelId, WheelAssembly | null> = {
    frontLeft: null,
    frontRight: null,
    rearLeft: null,
    rearRight: null,
  };
  const materials: Record<MaterialKind, THREE.Material[]> = {
    paint: [],
    glass: [],
    chrome: [],
    rubber: [],
    emissive: [],
    trim: [],
    unknown: [],
  };
  const seenMaterials = new Set<THREE.Material>();
  const hiddenJunk: string[] = [];
  let meshCount = 0;

  const innerGroups: Record<PartId, THREE.Group> = {
    doorLeft: new THREE.Group(),
    doorRight: new THREE.Group(),
    hood: new THREE.Group(),
    engineCover: new THREE.Group(),
  };
  const wheelInner: Record<WheelId, THREE.Group> = {
    frontLeft: new THREE.Group(),
    frontRight: new THREE.Group(),
    rearLeft: new THREE.Group(),
    rearRight: new THREE.Group(),
  };
  const componentCounts: Record<string, number> = {};
  const targets = new Map<string, THREE.Group>([['static', output]]);
  for (const id of Object.keys(innerGroups) as PartId[]) targets.set(id, innerGroups[id]);
  for (const id of Object.keys(wheelInner) as WheelId[]) targets.set(id, wheelInner[id]);

  const batches = new Map<string, Batch>();

  source.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshCount++;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const material = mats[0];
    for (const m of mats) {
      if (!seenMaterials.has(m)) {
        seenMaterials.add(m);
        materials[classifyMaterial(m)].push(m);
      }
    }

    // Transform from mesh-local space into the car root's local space.
    const toRoot = new THREE.Matrix4()
      .copy(source.matrixWorld)
      .invert()
      .multiply(mesh.matrixWorld);

    const namePart = matchPart(normalizeName(mesh.name || obj.parent?.name || ''));

    let components: Component[];
    const geometry = mesh.geometry;
    if (geometry.getIndex() && geometry.getAttribute('position').count > 200) {
      components = splitByConnectedComponents(geometry);
    } else {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!.clone().applyMatrix4(toRoot);
      components = [
        {
          geometry: geometry.clone(),
          box,
          center: box.getCenter(new THREE.Vector3()),
          vertexCount: geometry.getAttribute('position').count,
        },
      ];
    }

    for (const comp of components) {
      comp.geometry.applyMatrix4(toRoot);
      // Bounds must be measured after the transform — classification and junk
      // filtering both work in car-local space.
      comp.geometry.computeBoundingBox();
      comp.box.copy(comp.geometry.boundingBox!);
      comp.box.getCenter(comp.center);

      if (isJunk(comp)) {
        hiddenJunk.push(`${mesh.name}:${comp.vertexCount}v`);
        continue;
      }

      // Wheels are identified by material name (rim/tire) first — geometry
      // alone can't tell a wheel from the fender above it.
      const isWheelMesh = WHEEL_MATERIAL_RE.test(normalizeName(material.name || ''));
      const wheelId = isWheelMesh ? classifyWheel(comp.center) : null;
      const partId = namePart ?? (wheelId ? null : classifyCenter(comp.center));
      const slot = wheelId ?? partId ?? 'static';
      const key = `${slot}|${material.uuid}|${attributeSignature(comp.geometry)}`;
      let batch = batches.get(key);
      if (!batch) {
        batch = {
          key,
          slot,
          material,
          geometries: [],
          componentCount: 0,
        };
        batches.set(key, batch);
      }
      batch.geometries.push(comp.geometry);
      batch.componentCount++;
      if (slot !== 'static') componentCounts[slot] = (componentCounts[slot] ?? 0) + 1;
    }
  });

  for (const batch of batches.values()) {
    let merged: THREE.BufferGeometry | null = null;
    try {
      merged = batch.geometries.length === 1 ? batch.geometries[0] : mergeGeometries(batch.geometries, false);
    } catch {
      merged = null;
    }
    const nameSuffix = batch.slot === 'static' ? '' : `_${batch.slot}`;
    const parent = targets.get(batch.slot) ?? output;
    const meshes: THREE.Mesh[] = [];
    if (!merged) {
      // Fallback: keep components as separate meshes if they cannot merge.
      for (const g of batch.geometries) meshes.push(new THREE.Mesh(g, batch.material));
    } else {
      meshes.push(new THREE.Mesh(merged, batch.material));
    }
    for (const rebuilt of meshes) {
      rebuilt.name = `body${nameSuffix}`;
      rebuilt.castShadow = true;
      rebuilt.receiveShadow = true;
      parent.add(rebuilt);
    }
  }

  // Wrap each part's meshes in a pivot group so rotating it hinges the part.
  for (const id of Object.keys(parts) as PartId[]) {
    if (!componentCounts[id]) continue;
    const pivot = new THREE.Vector3(...HINGES[id].pivot);
    const group = new THREE.Group();
    group.name = `pivot_${id}`;
    group.position.copy(pivot);
    innerGroups[id].position.copy(pivot.clone().negate());
    group.add(innerGroups[id]);
    output.add(group);
    parts[id] = { id, group, componentCount: componentCounts[id] };
  }

  // Wheels: steer group at the hub → spin group (quaternion per frame) → meshes.
  for (const id of Object.keys(wheels) as WheelId[]) {
    if (!componentCounts[id]) continue;
    const center = new THREE.Vector3();
    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    for (const child of wheelInner[id].children) {
      child.updateMatrixWorld(true);
      child.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry.computeBoundingBox();
        tmp.copy(m.geometry.boundingBox!).applyMatrix4(m.matrixWorld);
        box.union(tmp);
      });
    }
    box.getCenter(center);
    const size = box.getSize(new THREE.Vector3());
    // The wheel's shortest extent is its spin axis.
    const axle =
      size.x <= size.y && size.x <= size.z
        ? new THREE.Vector3(1, 0, 0)
        : size.y <= size.z
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(0, 0, 1);

    const steerGroup = new THREE.Group();
    steerGroup.name = `steer_${id}`;
    steerGroup.position.copy(center);
    const spinGroup = new THREE.Group();
    spinGroup.name = `spin_${id}`;
    wheelInner[id].position.copy(center.clone().negate());
    spinGroup.add(wheelInner[id]);
    steerGroup.add(spinGroup);
    output.add(steerGroup);
    wheels[id] = { id, steerGroup, spinGroup, axle, componentCount: componentCounts[id] };
  }

  const capability = {
    doorLeft: parts.doorLeft !== null,
    doorRight: parts.doorRight !== null,
    hood: parts.hood !== null,
    engineCover: parts.engineCover !== null,
  };

  // Open panels reveal their undersides — render those as painted surface
  // instead of culled backfaces.
  for (const kind of ['paint', 'trim', 'unknown'] as MaterialKind[]) {
    for (const m of materials[kind]) m.side = THREE.DoubleSide;
  }

  return {
    group: output,
    registry: { parts, wheels, materials, capability, meshCount, hiddenJunk },
  };
}

export function registryReport(reg: Registry): string {
  const lines: string[] = ['— GLB ingest report —'];
  lines.push(`source meshes processed: ${reg.meshCount}`);
  lines.push(`junk components hidden: ${reg.hiddenJunk.length}`);
  for (const j of reg.hiddenJunk) lines.push(`  hidden ${j}`);
  lines.push('articulated parts:');
  for (const [id, part] of Object.entries(reg.parts)) {
    lines.push(
      part
        ? `  ${id}: ${part.componentCount} components → pivot "${part.group.name}"`
        : `  ${id}: NOT FOUND — feature will be hidden`,
    );
  }
  lines.push('wheels:');
  for (const [id, wheel] of Object.entries(reg.wheels)) {
    lines.push(
      wheel
        ? `  ${id}: ${wheel.componentCount} components axle=${wheel.axle.toArray()}`
        : `  ${id}: NOT FOUND — feature will be hidden`,
    );
  }
  const counts = Object.entries(reg.materials)
    .map(([k, v]) => `${k}=${v.length}`)
    .join(', ');
  lines.push(`materials: ${counts}`);
  return lines.join('\n');
}
