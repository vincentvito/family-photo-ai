import { HolidayCard } from './HolidayCard';
import { OCCASIONS, type Occasion } from './occasions';

function ContextTile({
  occ,
  label,
  rotate = 0,
  bg = '#e8d6c5',
  tall = false,
}: {
  occ: Occasion;
  label: string;
  rotate?: number;
  bg?: string;
  tall?: boolean;
}) {
  return (
    <div>
      <div
        className="warm-noise"
        style={{
          position: 'relative',
          height: tall ? 380 : 320,
          background: bg,
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--line-strong)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ transform: `rotate(${rotate}deg)` }}>
          <HolidayCard occ={occ} size="md" />
        </div>
      </div>
      <div className="small-caps" style={{ marginTop: 14, color: 'var(--ink-muted)', textAlign: 'center' }}>
        {label}
      </div>
    </div>
  );
}

export function InContext() {
  return (
    <section style={{ background: 'var(--coral-soft)', padding: '80px 0 96px' }}>
      <div style={{ maxWidth: '76rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '44rem', marginBottom: 56 }}>
          <div className="small-caps" style={{ color: 'var(--coral-deep)', marginBottom: 14 }}>Print-ready</div>
          <h2 className="h-section">
            Paper in hand. <em className="serif-italic" style={{ color: 'var(--coral)' }}>Stamps</em> in the mailbox.
          </h2>
          <p className="body-lg" style={{ marginTop: 18, maxWidth: '34rem' }}>
            Every card downloads as a print-ready file sized for standard photo cards. Send to your favorite printer, or
            order a fridge magnet from your phone.
          </p>
        </div>
        <div
          className="context-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 24, alignItems: 'flex-end' }}
        >
          <ContextTile occ={OCCASIONS[0]} label="On the mantel" rotate={-3} bg="#e8d6c5" />
          <ContextTile occ={OCCASIONS[2]} label="In an envelope" rotate={2} bg="#e0c79a" tall />
          <ContextTile occ={OCCASIONS[1]} label="On the fridge" rotate={-1.5} bg="#d6cab1" />
        </div>
      </div>
    </section>
  );
}
