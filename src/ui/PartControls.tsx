import { useStore, PART_IDS, type PartId } from '../state/store';

const LABELS: Record<PartId, string> = {
  doorLeft: 'Door L',
  doorRight: 'Door R',
  hood: 'Hood',
  engineCover: 'Engine deck',
};

export function PartControls() {
  const parts = useStore((s) => s.parts);
  const capability = useStore((s) => s.capability);
  const togglePart = useStore((s) => s.togglePart);

  return (
    <div style={styles.row}>
      {PART_IDS.filter((id) => capability[id]).map((id) => (
        <button
          key={id}
          onClick={() => togglePart(id)}
          style={{
            ...styles.button,
            background: parts[id].open ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.12)',
            color: parts[id].open ? '#14161a' : '#e8eaed',
          }}
        >
          {LABELS[id]}
        </button>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' },
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
