import { ctaHref } from './occasions';
import { THEMES } from '@/lib/themes';

export function CTABand() {
  return (
    <section style={{ background: 'var(--bg)', padding: '96px 0' }}>
      <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <h2 className="h-section">
          Your selfies are <em className="serif-italic" style={{ color: 'var(--coral)' }}>already enough</em>.
        </h2>
        <p className="body-lg" style={{ margin: '20px auto 32px', maxWidth: '32rem' }}>
          Upload what you have. Pick a holiday. We&apos;ll handle the cards.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href={ctaHref()} className="btn btn-coral btn-lg spring-press">Make a card</a>
          <a href="https://familyshoot.com/#gallery" className="btn btn-ghost btn-lg spring-press">Browse all {THEMES.length} vibes</a>
        </div>
      </div>
    </section>
  );
}
