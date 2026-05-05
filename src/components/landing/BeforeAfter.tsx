"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";

type Pair = { before: string; after: string; label: string };

const pairs: Pair[] = [
  {
    before: "/samples/before-wes-anderson-family.png",
    after: "/samples/after-wes-anderson-family.png",
    label: "Wes Anderson Symmetry - 4 uploads to one portrait",
  },
  {
    before: "/samples/before-watercolor-family.png",
    after: "/samples/after-watercolor-family.png",
    label: "Watercolor Storybook - 3 uploads to one illustration",
  },
  {
    before: "/samples/before-pixar-family.png",
    after: "/samples/after-pixar-family.png",
    label: "Pixar Family - 4 uploads to one animated portrait",
  },
];

const AUTO_SWEEP_MS = 5200;
const MANUAL_RESUME_MS = 2600;

export default function BeforeAfter() {
  const [pairIndex, setPairIndex] = useState(0);
  const [split, setSplit] = useState(52);
  const [isManual, setIsManual] = useState(false);
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMove = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(6, Math.min(94, (x / rect.width) * 100));
    setSplit(pct);
  }, []);

  const startManual = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setIsManual(true);
  }, []);

  const resumeAuto = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsManual(false), MANUAL_RESUME_MS);
  }, []);

  useEffect(() => {
    if (isManual) return;

    if (reduceMotion) return;

    let frame = 0;
    let lastCycle = -1;
    const startedAt = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startedAt;
      const cycle = Math.floor(elapsed / AUTO_SWEEP_MS);
      const phase = (elapsed % AUTO_SWEEP_MS) / AUTO_SWEEP_MS;
      const eased = 0.5 - Math.cos(phase * Math.PI * 2) / 2;

      if (cycle !== lastCycle) {
        lastCycle = cycle;
        setPairIndex(cycle % pairs.length);
      }

      setSplit(24 + eased * 52);
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [isManual, reduceMotion]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const pair = pairs[pairIndex];

  return (
    <section className="px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
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
              Separate reference uploads become one finished family portrait, keeping the people
              consistent while the vibe changes.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div
            ref={frameRef}
            className="warm-noise relative mx-auto mt-8 aspect-[4/3] w-full max-w-[980px] cursor-ew-resize select-none overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] shadow-[var(--shadow-lg)] sm:mt-10"
            style={{ width: "min(100%, calc(52vh * 4 / 3), 980px)" }}
            onPointerDown={(e) => {
              startManual();
              e.currentTarget.setPointerCapture(e.pointerId);
              onMove(e.clientX);
            }}
            onPointerMove={(e) => {
              if (isManual) onMove(e.clientX);
            }}
            onPointerUp={resumeAuto}
            onPointerCancel={resumeAuto}
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              startManual();
              setSplit((value) =>
                Math.max(6, Math.min(94, value + (e.key === "ArrowRight" ? 4 : -4))),
              );
              resumeAuto();
            }}
            role="slider"
            tabIndex={0}
            aria-label={`${pair.label} before and after comparison`}
            aria-valuemin={6}
            aria-valuemax={94}
            aria-valuenow={Math.round(split)}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={pair.label}
                className="absolute inset-0"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
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
              </motion.div>
            </AnimatePresence>

            <span className="chip chip-ghost absolute left-4 top-4 bg-[color:rgba(255,255,255,0.92)] backdrop-blur text-[color:var(--color-ink)]">
              Before
            </span>
            <span className="chip chip-coral absolute right-4 top-4">After</span>

            <div
              className="absolute inset-y-0 flex w-[2px] items-center bg-[color:var(--color-bg-elevated)]"
              style={{ left: `${split}%` }}
              aria-hidden
            >
              <div className="absolute -left-6 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[color:var(--color-coral)] text-white shadow-[var(--shadow-lg)] ring-4 ring-[color:rgba(255,255,255,0.72)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9 6l-4 6 4 6M15 6l4 6-4 6" />
                </svg>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-[color:var(--color-ink-muted)]">{pair.label}</p>
          <div className="flex items-center gap-2">
            {pairs.map((pairOption, i) => (
              <button
                key={pairOption.label}
                onClick={() => {
                  startManual();
                  setPairIndex(i);
                  resumeAuto();
                }}
                className={`spring-press h-2 rounded-full transition-all ${
                  i === pairIndex
                    ? "w-10 bg-[color:var(--color-coral)]"
                    : "w-2 bg-[color:var(--color-line-strong)] hover:bg-[color:var(--color-ink-faint)]"
                }`}
                aria-label={`Show ${pairOption.label}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
