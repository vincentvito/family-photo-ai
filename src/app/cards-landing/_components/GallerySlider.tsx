'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HolidayCard } from './HolidayCard';
import { OCCASIONS } from './occasions';

export function GallerySlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const pages = maxScroll <= 1 ? 1 : Math.ceil(el.scrollWidth / el.clientWidth);
    const page =
      maxScroll <= 1 ? 0 : Math.round((el.scrollLeft / maxScroll) * (pages - 1));
    setPageCount(pages);
    setActivePage(page);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateState();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateState, { passive: true });
    window.addEventListener('resize', updateState);
    return () => {
      el.removeEventListener('scroll', updateState);
      window.removeEventListener('resize', updateState);
    };
  }, [updateState]);

  const scrollToPage = useCallback((page: number) => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0 || pageCount <= 1) return;
    const clamped = Math.max(0, Math.min(pageCount - 1, page));
    el.scrollTo({ left: (maxScroll * clamped) / (pageCount - 1), behavior: 'smooth' });
  }, [pageCount]);

  const onPrev = () => scrollToPage(activePage - 1);
  const onNext = () => scrollToPage(activePage + 1);

  const showControls = pageCount > 1;

  return (
    <section style={{ background: 'var(--bg)', padding: '80px 0 96px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: '76rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 44,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: '44rem' }}>
            <div className="small-caps" style={{ color: 'var(--ink-muted)', marginBottom: 14 }}>From the gallery</div>
            <h2 className="h-section">
              Real families, <em className="serif-italic" style={{ color: 'var(--sage-deep)' }}>actual</em> mantelpieces.
            </h2>
          </div>
          {showControls && (
            <div style={{ display: 'flex', gap: 10 }}>
              <SliderButton direction="prev" disabled={!canPrev} onClick={onPrev} />
              <SliderButton direction="next" disabled={!canNext} onClick={onNext} />
            </div>
          )}
        </div>

        <div
          ref={trackRef}
          className="gallery-track"
          role="region"
          aria-label="Gallery of holiday cards"
        >
          {OCCASIONS.map((o, i) => (
            <div
              key={o.id}
              data-slide
              className="gallery-slide"
              style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)` }}
            >
              <HolidayCard occ={o} size="md" />
              <div
                style={{
                  textAlign: 'center',
                  marginTop: 14,
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 14,
                  color: 'var(--ink-muted)',
                }}
              >
                {o.label}
              </div>
            </div>
          ))}
        </div>

        {showControls && (
          <div
            role="tablist"
            aria-label="Gallery pages"
            style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}
          >
            {Array.from({ length: pageCount }).map((_, i) => {
              const active = i === activePage;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Go to page ${i + 1}`}
                  onClick={() => scrollToPage(i)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                    width: active ? 26 : 8,
                    height: 8,
                    borderRadius: 9999,
                    background: active ? 'var(--coral)' : 'var(--line-strong)',
                    transition: 'width 250ms var(--ease-soft), background 250ms var(--ease-soft)',
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function SliderButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous card' : 'Next card'}
      className="spring-press"
      style={{
        all: 'unset',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: 44,
        height: 44,
        borderRadius: 9999,
        background: 'var(--surface)',
        border: '1px solid var(--line-strong)',
        boxShadow: 'var(--shadow-sm)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink)',
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 200ms, background 200ms',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {direction === 'prev' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}
