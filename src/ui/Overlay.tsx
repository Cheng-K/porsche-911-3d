import { useProgress } from '@react-three/drei';
import { PaintPicker } from './PaintPicker';
import { PartControls } from './PartControls';
import { LightsToggle } from './LightsToggle';
import { WheelControls } from './WheelControls';
import { EnvSwitch } from './EnvSwitch';
import { QualitySwitch } from './QualitySwitch';

export function Overlay() {
  const { active, progress } = useProgress();

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <h1 style={styles.title}>Porsche 911</h1>
        <p style={styles.subtitle}>Interactive 3D viewer</p>
      </header>

      {active && (
        <div style={styles.loader}>
          <div style={{ ...styles.bar, width: `${progress}%` }} />
          <span style={styles.loaderText}>Loading model… {Math.round(progress)}%</span>
        </div>
      )}

      <aside style={styles.panel}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Paint</h2>
          <PaintPicker />
        </section>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Panels</h2>
          <PartControls />
        </section>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Lights</h2>
          <LightsToggle />
        </section>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Wheels</h2>
          <WheelControls />
        </section>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Environment</h2>
          <EnvSwitch />
        </section>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Quality</h2>
          <QualitySwitch />
        </section>
      </aside>

      <footer style={styles.footer}>
        Drag to orbit · Scroll to zoom · Click a panel to open it
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#e8eaed',
  },
  header: { padding: '20px 24px' },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  subtitle: { margin: '4px 0 0', fontSize: 12, opacity: 0.65, letterSpacing: '0.08em' },
  loader: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 220,
  },
  bar: {
    height: 3,
    background: '#e8eaed',
    borderRadius: 2,
    transition: 'width 0.2s ease',
  },
  loaderText: { display: 'block', marginTop: 10, fontSize: 11, textAlign: 'center', opacity: 0.7 },
  panel: {
    pointerEvents: 'auto',
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    padding: '16px 18px',
    borderRadius: 12,
    background: 'rgba(18, 20, 24, 0.72)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  section: { display: 'flex', flexDirection: 'column', gap: 10 },
  sectionTitle: {
    margin: 0,
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    opacity: 0.55,
  },
  footer: { padding: '16px 24px', fontSize: 11, opacity: 0.55, letterSpacing: '0.06em' },
};
