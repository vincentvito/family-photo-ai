"use client";

import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";
import { useTranslations } from "next-intl";

type Pair = { before: string; after: string; label: string };

const pairImages = [
  {
    before: "/samples/before-wes-anderson-family.jpg",
    after: "/samples/after-wes-anderson-family.jpg",
  },
  {
    before: "/samples/before-watercolor-family.jpg",
    after: "/samples/after-watercolor-family.jpg",
  },
  {
    before: "/samples/before-pixar-family.jpg",
    after: "/samples/after-pixar-family.jpg",
  },
];

export default function BeforeAfter() {
  const t = useTranslations("Landing.BeforeAfter");
  const pairLabels = t.raw("pairLabels") as string[];
  const pairs: Pair[] = pairImages.map((pair, index) => ({ ...pair, label: pairLabels[index] }));
  const [pairIndex, setPairIndex] = useState(0);
  const [split, setSplit] = useState(52);
  const reduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const onMove = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(6, Math.min(94, (x / rect.width) * 100));
    setSplit(pct);
  }, []);

  const startDrag = useCallback(() => {
    draggingRef.current = true;
  }, []);

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
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
                {t("chip")}
              </span>
              <h2 className="serif mt-4 max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
                {t("titleBefore")}
                <br />
                {t("titleMiddle")}{" "}
                <em className="serif-italic text-[color:var(--color-coral)]">
                  {t("titleEmphasis")}
                </em>{" "}
                {t("titleAfter")}
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[color:var(--color-ink-muted)]">{t("body")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div
            className="mx-auto mt-8 w-full sm:mt-10"
            style={{ width: "min(100%, calc(52vh * 4 / 3), 980px)" }}
          >
            <div
              ref={frameRef}
              className="warm-noise relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] shadow-[var(--shadow-lg)]"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => {
                startDrag();
                e.preventDefault();
                if (e.currentTarget.hasPointerCapture?.(e.pointerId) === false) {
                  e.currentTarget.setPointerCapture(e.pointerId);
                }
                onMove(e.clientX);
              }}
              onPointerMove={(e) => {
                if (!draggingRef.current) return;
                e.preventDefault();
                onMove(e.clientX);
              }}
              onPointerUp={(e) => {
                if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }
                stopDrag();
              }}
              onPointerCancel={stopDrag}
              onTouchStart={(e) => {
                startDrag();
                onMove(e.touches[0].clientX);
              }}
              onTouchMove={(e) => {
                if (!draggingRef.current) return;
                onMove(e.touches[0].clientX);
              }}
              onTouchEnd={stopDrag}
              onKeyDown={(e) => {
                if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                setSplit((value) =>
                  Math.max(6, Math.min(94, value + (e.key === "ArrowRight" ? 4 : -4))),
                );
              }}
              role="slider"
              tabIndex={0}
              aria-label={t("comparisonLabel", { label: pair.label })}
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
                  transition={{
                    duration: reduceMotion ? 0 : 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${pair.after})` }}
                    aria-label={t("after")}
                  />
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${pair.before})`,
                      clipPath: `inset(0 ${100 - split}% 0 0)`,
                    }}
                    aria-label={t("before")}
                  />
                </motion.div>
              </AnimatePresence>

              <span className="chip absolute left-4 top-4 z-20 border border-[color:rgba(255,255,255,0.72)] bg-[color:rgba(31,26,36,0.82)] text-[color:var(--color-bg)] shadow-[var(--shadow-md)] backdrop-blur">
                {t("before")}
              </span>
              <span className="chip chip-coral absolute right-4 top-4 z-20 shadow-[var(--shadow-sm)]">
                {t("after")}
              </span>

              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-[color:rgba(255,255,255,0.7)] bg-[color:rgba(255,255,255,0.82)] p-1 shadow-[var(--shadow-md)] backdrop-blur">
                {pairs.map((pairOption, i) => (
                  <button
                    key={pairOption.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPairIndex(i);
                      setSplit(52);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`spring-press flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                      i === pairIndex
                        ? "bg-[color:var(--color-coral)] text-white shadow-[var(--shadow-sm)]"
                        : "text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)]"
                    }`}
                    aria-label={t("showPair", { label: pairOption.label })}
                    aria-pressed={i === pairIndex}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div
                className="absolute inset-y-0 z-10 flex w-[2px] items-center bg-[color:var(--color-bg-elevated)]"
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

            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-[color:var(--color-ink-muted)]">{pair.label}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
