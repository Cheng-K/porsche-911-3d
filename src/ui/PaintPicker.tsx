import { useStore } from '../state/store';
import { PAINT_COLORS } from '../config/parts.config';

export function PaintPicker() {
  const activeColor = useStore((s) => s.paint.color);
  const setPaint = useStore((s) => s.setPaint);

  return (
    <div style={styles.row}>
      {PAINT_COLORS.map((c) => (
        <button
          key={c.color}
          title={c.name}
          aria-label={c.name}
          onClick={() => setPaint(c.color)}
          style={{
            ...styles.swatch,
            background: c.color,
            outline: activeColor === c.color ? '2px solid #fff' : '1px solid rgba(255,255,255,0.25)',
            outlineOffset: activeColor === c.color ? 2 : 0,
          }}
        />
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
};
