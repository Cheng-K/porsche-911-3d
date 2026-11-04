import { useStore, type HdriId } from '../state/store';

const OPTIONS: { id: HdriId; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'warm', label: 'Warm' },
  { id: 'night', label: 'Night' },
];

export function EnvSwitch() {
  const hdriId = useStore((s) => s.hdriId);
  const setHdriId = useStore((s) => s.setHdriId);

  return (
    <div style={styles.row}>
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          onClick={() => setHdriId(o.id)}
          style={{
            ...styles.button,
            background: hdriId === o.id ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.12)',
            color: hdriId === o.id ? '#14161a' : '#e8eaed',
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
