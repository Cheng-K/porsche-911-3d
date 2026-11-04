import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useStore } from '../../state/store';

/**
 * Subtle bloom so lit headlamps read as light sources. Threshold is high so
 * only the emissive lenses glow — the paint must stay crisp. High tier only.
 */
export function Post() {
  const tier = useStore((s) => s.tier);
  if (tier !== 'high') return null;
  return (
    <EffectComposer>
      <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.55} />
    </EffectComposer>
  );
}
