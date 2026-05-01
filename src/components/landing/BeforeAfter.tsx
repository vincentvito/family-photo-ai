"use client";

import { useState, useRef, useCallback } from "react";
import Reveal from "@/components/motion/Reveal";

type Pair = { before: string; after: string; label: string };

const pairs: Pair[] = [
  {
    before: "/samples/before-1.jpg",
    after: "/samples/after-1.jpg",
    label: "Kitchen table · Sunday morning",
  },
  {
    before: "/samples/before-2.jpg",
    after: "/samples/after-2.jpg",
    label: "Backyard · Autumn",
  },
  {
    before: "/samples/before-3.jpg",
    after: "/samples/after-3.jpg",
    label: "Holiday card · Christmas",
  },
];

export default function BeforeAfter() {
  const [pairIndex, setPairIndex] = useState(0);
  const [split, setSplit] = useState(52);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const onMove = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(6, Math.min(94, (x / rect.width) * 100));
    setSplit(pct);
  }, []);

  const pair = pairs[pairIndex];

  return (
    <section className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="chip chip-coral">
                <span className="dot dot-coral" />
                The transformation
              </span>
              <h2 className="serif mt-4 max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
                From phone-camera chaos,
                <br />
                to a <em className="serif-italic text-[color:var(--color-coral)]">keeper</em>.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[color:var(--color-ink-muted)]">
              Drag the handle to see the difference. Every shoot starts with the messy stuff already on your camera roll.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div
            ref={frameRef}
            className="warm-noise relative mt-10 aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] border border-[color:var(--color-line)]"
            onMouseMove={(e) => onMove(e.clientX)}
            onTouchMove={(e) => onMove(e.touches[0].clientX)}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${pair.after})` }}
              aria-label="After"
            />
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${pair.before})`,
                clipPath: `inset(0 ${100 - split}% 0 0)`,
              }}
              aria-label="Before"
            />

            {/* Before/after chips */}
            <span className="chip chip-ghost absolute left-4 top-4 bg-[color:rgba(255,255,255,0.92)] backdrop-blur text-[color:var(--color-ink)]">
              Before
            </span>
            <span className="chip chip-coral absolute right-4 top-4">After</span>

            {/* Handle */}
            <div
              className="absolute inset-y-0 flex w-[2px] items-center bg-[color:var(--color-bg-elevated)]"
              style={{ left: `${split}%` }}
              aria-hidden
            >
              <div className="absolute -left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[color:var(--color-coral)] text-white shadow-[var(--shadow-lg)] ring-4 ring-[color:rgba(255,255,255,0.72)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M9 6l-4 6 4 6M15 6l4 6-4 6" />
                </svg>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-[color:var(--color-ink-muted)]">{pair.label}</p>
          <div className="flex items-center gap-2">
            {pairs.map((_, i) => (
              <button
                key={i}
                onClick={() => setPairIndex(i)}
                className={`spring-press h-2 rounded-full transition-all ${
                  i === pairIndex
                    ? "w-10 bg-[color:var(--color-coral)]"
                    : "w-2 bg-[color:var(--color-line-strong)] hover:bg-[color:var(--color-ink-faint)]"
                }`}
                aria-label={`Pair ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
