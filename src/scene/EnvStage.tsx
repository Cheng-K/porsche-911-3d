import { Environment, Lightformer } from '@react-three/drei';
import { useStore, type HdriId } from '../state/store';

/** Local CC0 HDRIs (Poly Haven). 'studio' is the procedural rig below. */
const HDRI_FILES: Record<Exclude<HdriId, 'studio'>, string> = {
  warm: `${import.meta.env.BASE_URL}hdri/warm.hdr`,
  night: `${import.meta.env.BASE_URL}hdri/night.hdr`,
};

function StudioRig() {
  return (
    <>
      {/* Big overhead softbox — the key light that sells clearcoat paint. */}
      <Lightformer
        form="rect"
        intensity={4.5}
        position={[0, 6, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[12, 12, 1]}
        color="#ffffff"
      />
      <Lightformer
        form="rect"
        intensity={2.2}
        position={[-6, 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[8, 3, 1]}
        color="#e8ecf2"
      />
      <Lightformer
        form="rect"
        intensity={2.2}
        position={[6, 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[8, 3, 1]}
        color="#e8ecf2"
      />
      <Lightformer
        form="rect"
        intensity={1.1}
        position={[0, 3, -7]}
        rotation={[0, 0, 0]}
        scale={[10, 4, 1]}
        color="#ffe6c7"
      />
      <Lightformer
        form="rect"
        intensity={0.8}
        position={[0, 1, 7]}
        rotation={[0, Math.PI, 0]}
        scale={[10, 3, 1]}
        color="#dfe8f5"
      />
    </>
  );
}

/**
 * Environment stage. 'studio' is a procedural Lightformer rig (tuned for car
 * paint); 'warm'/'night' swap in local HDRIs for time-of-day changes.
 */
export function EnvStage() {
  const hdriId = useStore((s) => s.hdriId);

  if (hdriId === 'studio') {
    return (
      <Environment resolution={512}>
        <StudioRig />
      </Environment>
    );
  }
  return <Environment files={HDRI_FILES[hdriId]} background={false} />;
}
