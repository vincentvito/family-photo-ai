import type { Occasion } from './occasions';

type Size = 'lg' | 'md' | 'sm';

export function HolidayCard({ occ, size = 'lg' }: { occ: Occasion; size?: Size }) {
  const w = size === 'lg' ? 320 : size === 'md' ? 230 : 180;
  const h = w * 1.4;
  const greetingSize = size === 'lg' ? '1.6rem' : size === 'md' ? '1.15rem' : '0.95rem';
  const subSize = size === 'lg' ? 11 : 9;
  return (
    <div
      className="paper-card"
      style={{ width: w, height: h, padding: 14, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          flex: 1,
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 0 0 1px rgba(31,26,36,0.08)',
        }}
      >
        <img
          src={occ.img}
          alt=""
          className="card-frame-img"
          style={{ height: '100%' }}
          loading="lazy"
          decoding="async"
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(31,26,36,0) 50%, rgba(31,26,36,0.5) 100%)',
          }}
        />
      </div>
      <div style={{ paddingTop: 14, paddingBottom: 4, textAlign: 'center' }}>
        <div className="greeting-serif" style={{ fontSize: greetingSize, color: occ.accent }}>
          {occ.greeting}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: subSize,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'var(--ink-muted)',
            marginTop: 6,
          }}
        >
          {occ.sub}
        </div>
      </div>
    </div>
  );
}
