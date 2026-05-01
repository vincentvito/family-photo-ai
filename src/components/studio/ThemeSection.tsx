"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Theme } from "@/lib/themes";
import ThemeCard from "./ThemeCard";

export default function ThemeSection({
  label,
  sublabel,
  chipColor,
  themes,
  pending,
  activeId,
  onPick,
  initialCount = 6,
}: {
  label: string;
  sublabel: string;
  chipColor: "sage" | "plum" | "butter";
  themes: Theme[];
  pending: boolean;
  activeId: string | null;
  onPick: (theme: Theme) => void;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const head = themes.slice(0, initialCount);
  const tail = themes.slice(initialCount);
  const hasMore = tail.length > 0;

  return (
    <section className="mt-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className={`chip chip-${chipColor}`}>
            <span className={`dot dot-${chipColor}`} />
            {label}
          </span>
          <p className="serif mt-3 text-2xl tracking-[-0.02em] text-[color:var(--color-ink)]">
            {sublabel}
          </p>
        </div>
        <p className="text-xs text-[color:var(--color-ink-muted)]">
          {!hasMore || expanded
            ? `${themes.length} ${themes.length === 1 ? "vibe" : "vibes"}`
            : `${initialCount} of ${themes.length}`}
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {head.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            disabled={pending}
            loading={activeId === theme.id && pending}
            onPick={() => onPick(theme)}
          />
        ))}
        <AnimatePresence initial={false}>
          {expanded &&
            tail.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.025,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <ThemeCard
                  theme={theme}
                  disabled={pending}
                  loading={activeId === theme.id && pending}
                  onPick={() => onPick(theme)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-8 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setExpanded((isExpanded) => !isExpanded)}
            className="btn btn-ghost btn-sm"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M18 15l-6-6-6 6" />
                </svg>
                Show fewer
              </>
            ) : (
              <>
                Show all {themes.length}
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
