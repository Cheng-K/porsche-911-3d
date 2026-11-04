import { useStore } from '../state/store';

export function WheelControls() {
  const steer = useStore((s) => s.steer);
  const setSteer = useStore((s) => s.setSteer);
  const spin = useStore((s) => s.spin);
  const toggleSpin = useStore((s) => s.toggleSpin);

  return (
    <div style={styles.col}>
      <div style={styles.row}>
        <span style={styles.label}>Steer</span>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.02}
          value={steer}
          onChange={(e) => setSteer(parseFloat(e.target.value))}
          style={styles.slider}
        />
      </div>
      <button onClick={toggleSpin} style={{ ...styles.button, ...stateStyle(spin) }}>
        Roll wheels
      </button>
    </div>
  );
}

function stateStyle(on: boolean): React.CSSProperties {
  return {
    background: on ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.12)',
    color: on ? '#14161a' : '#e8eaed',
  };
}

const styles: Record<string, React.CSSProperties> = {
  col: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 11, opacity: 0.7, width: 34 },
  slider: { flex: 1, accentColor: '#e8eaed' },
  button: {
    border: 'none',
    borderRadius: 6,
    padding: '7px 12px',
    fontSize: 12,
    letterSpacing: '0.03em',
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
  },
};
