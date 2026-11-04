import * as THREE from 'three';

export interface Component {
  geometry: THREE.BufferGeometry;
  box: THREE.Box3;
  center: THREE.Vector3;
  vertexCount: number;
}

function readItem(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, index: number, out: number[]): void {
  const size = attr.itemSize;
  const anyAttr = attr as unknown as {
    isInterleavedBufferAttribute?: boolean;
    data?: THREE.InterleavedBuffer;
    offset?: number;
    array: ArrayLike<number>;
  };
  if (anyAttr.isInterleavedBufferAttribute && anyAttr.data) {
    const base = anyAttr.offset! + index * anyAttr.data.stride;
    for (let k = 0; k < size; k++) out[k] = anyAttr.data.array[base + k];
  } else {
    for (let k = 0; k < size; k++) out[k] = anyAttr.array[index * size + k];
  }
}

/**
 * Split an indexed BufferGeometry into its connected components (vertex
 * adjacency via shared indices). Meshes exported as "joined" Blender objects
 * keep their panel seams as disconnected vertex groups.
 *
 * Components are returned in the geometry's own attribute space; the caller
 * transforms them afterwards.
 */
export function splitByConnectedComponents(geometry: THREE.BufferGeometry): Component[] {
  const index = geometry.getIndex();
  const pos = geometry.getAttribute('position');
  const vertexCount = pos.count;

  const parent = new Int32Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) parent[i] = i;
  const find = (a: number): number => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]];
      a = parent[a];
    }
    return a;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  const idx = index ? index.array : null;
  const triangleCount = idx ? idx.length / 3 : vertexCount / 3;
  for (let t = 0; t < triangleCount; t++) {
    const a = idx ? idx[t * 3] : t * 3;
    const b = idx ? idx[t * 3 + 1] : t * 3 + 1;
    const c = idx ? idx[t * 3 + 2] : t * 3 + 2;
    union(a, b);
    union(b, c);
  }

  const compOf = new Map<number, number>();
  const compVertices: number[][] = [];
  for (let i = 0; i < vertexCount; i++) {
    const root = find(i);
    let id = compOf.get(root);
    if (id === undefined) {
      id = compVertices.length;
      compOf.set(root, id);
      compVertices.push([]);
    }
    compVertices[id].push(i);
  }

  const compTriangles: number[][] = compVertices.map(() => []);
  for (let t = 0; t < triangleCount; t++) {
    const a = idx ? idx[t * 3] : t * 3;
    compTriangles[compOf.get(find(a))!].push(t);
  }

  const attributes = Object.entries(geometry.attributes) as [
    string,
    THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  ][];

  return compVertices.map((verts, i) => {
    const remap = new Map<number, number>();
    verts.forEach((v, n) => remap.set(v, n));

    const newGeometry = new THREE.BufferGeometry();
    for (const [name, attr] of attributes) {
      const itemSize = attr.itemSize;
      const anyAttr = attr as unknown as {
        isInterleavedBufferAttribute?: boolean;
        data?: THREE.InterleavedBuffer;
        array: ArrayLike<number>;
      };
      // Materialize a tightly packed plain BufferAttribute of the same storage
      // type (keeps normalized int8/uint8 normals valid).
      const srcArray = anyAttr.isInterleavedBufferAttribute && anyAttr.data
        ? anyAttr.data.array
        : anyAttr.array;
      const Ctor = (srcArray as unknown as { constructor: new (length: number) => unknown })
        .constructor;
      const arr = new Ctor(verts.length * itemSize) as unknown as number[];
      const tmp: number[] = new Array(itemSize);
      for (let n = 0; n < verts.length; n++) {
        readItem(attr, verts[n], tmp);
        for (let k = 0; k < itemSize; k++) arr[n * itemSize + k] = tmp[k];
      }
      newGeometry.setAttribute(
        name,
        new THREE.BufferAttribute(arr as unknown as THREE.TypedArray, itemSize, attr.normalized),
      );
    }

    const newIndex = new Uint32Array(compTriangles[i].length * 3);
    compTriangles[i].forEach((t, n) => {
      for (let k = 0; k < 3; k++) {
        const v = idx ? idx[t * 3 + k] : t * 3 + k;
        newIndex[n * 3 + k] = remap.get(v)!;
      }
    });
    newGeometry.setIndex(new THREE.BufferAttribute(newIndex, 1));

    const box = new THREE.Box3().setFromBufferAttribute(
      newGeometry.getAttribute('position') as THREE.BufferAttribute,
    );
    const center = box.getCenter(new THREE.Vector3());

    return { geometry: newGeometry, box, center, vertexCount: verts.length };
  });
}
