import { useStore, type QualityTier } from '../state/store';

const OPTIONS: { id: QualityTier; label: string }[] = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Med' },
  { id: 'low', label: 'Low' },
];

export function QualitySwitch() {
  const tier = useStore((s) => s.tier);
  const setTier = useStore((s) => s.setTier);

  return (
    <div style={styles.row}>
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          onClick={() => setTier(o.id)}
          style={{
            ...styles.button,
            background: tier === o.id ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.12)',
            color: tier === o.id ? '#14161a' : '#e8eaed',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', gap: 8 },
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
