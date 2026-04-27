"use client";

import { motion } from "framer-motion";
import type { Theme } from "@/lib/themes";

export default function ThemeCard({
  theme,
  disabled,
  loading,
  onPick,
}: {
  theme: Theme;
  disabled: boolean;
  loading: boolean;
  onPick: () => void;
}) {
  return (
    <motion.button
      onClick={onPick}
      disabled={disabled}
      className="group relative flex h-full flex-col text-left transition-opacity disabled:opacity-60 focus:outline-none"
      whileHover={disabled ? undefined : { y: -5, transition: { type: "spring", stiffness: 320, damping: 22 } }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-line)] shadow-[var(--shadow-md)] group-hover:shadow-[var(--shadow-lg)] transition-shadow">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.05]"
          style={{ backgroundImage: `url(${theme.coverImage})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[color:rgba(31,26,36,0.72)] via-[color:rgba(31,26,36,0.15)] to-transparent"
          aria-hidden
        />
        {/* Hover ring of coral soft light */}
        <div
          className="absolute inset-0 rounded-[var(--radius-lg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 0 2px rgba(242,107,74,0.55)" }}
          aria-hidden
        />

        {/* Name overlay on bottom */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="serif text-[1.65rem] leading-tight tracking-[-0.02em] text-white drop-shadow-sm">{theme.name}</h3>
        </div>

        {/* Hover CTA chip */}
        <div className="absolute right-3 top-3 opacity-0 translate-y-[-4px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="chip chip-coral shadow-[var(--shadow-md)]">
            Try this vibe
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-lg)] bg-[color:rgba(31,26,36,0.55)] backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-[var(--shadow-md)]">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[color:var(--color-coral)]" />
              <span className="small-caps text-[color:var(--color-ink)]">Setting up…</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 px-1">
        <p className="text-sm text-[color:var(--color-ink-muted)] leading-relaxed">
          {theme.blurb}
        </p>
      </div>
    </motion.button>
  );
}
