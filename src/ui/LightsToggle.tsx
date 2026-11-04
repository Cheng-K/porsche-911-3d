import { useStore } from '../state/store';

export function LightsToggle() {
  const lightsOn = useStore((s) => s.lightsOn);
  const toggleLights = useStore((s) => s.toggleLights);

  return (
    <button
      onClick={toggleLights}
      style={{
        border: 'none',
        borderRadius: 6,
        padding: '7px 12px',
        fontSize: 12,
        letterSpacing: '0.03em',
        cursor: 'pointer',
        background: lightsOn ? 'rgba(255, 224, 160, 0.95)' : 'rgba(255, 255, 255, 0.12)',
        color: lightsOn ? '#14161a' : '#e8eaed',
        transition: 'background 0.15s ease, color 0.15s ease',
      }}
    >
      Headlights
    </button>
  );
}
