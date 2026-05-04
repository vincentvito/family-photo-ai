"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";
import { THEMES } from "@/lib/themes";
import type { Theme } from "@/lib/themes";

const FEATURED_IDS = [
  "card-diwali",
  "golden-hour-beach",
  "card-dia-de-muertos",
  "cherry-blossom",
  "card-lunar-new-year",
  "card-eid",
  "coastal-grandmother",
  "y2k-disposable",
  "card-hanukkah",
];

const featured = FEATURED_IDS.map((id) => THEMES.find((t) => t.id === id)!).filter(Boolean);
const rest = THEMES.filter((t) => !FEATURED_IDS.includes(t.id));

const aspectClass: Record<string, string> = {
  "3:2": "aspect-[3/2]",
  "4:5": "aspect-[4/5]",
  "1:1": "aspect-square",
  "16:9": "aspect-[16/9]",
  "2:3": "aspect-[2/3]",
};

const categoryChip: Record<Theme["category"], { chip: string; dot: string }> = {
  photoreal: { chip: "chip-sage", dot: "dot-sage" },
  stylized: { chip: "chip-plum", dot: "dot-plum" },
  card: { chip: "chip-butter", dot: "dot-butter" },
};

const categoryLabel: Record<Theme["category"], string> = {
  photoreal: "Photographic",
  stylized: "Stylized",
  card: "For a card",
};

function ThemeTile({ theme }: { theme: Theme }) {
  const aspect = aspectClass[theme.aspectRatio] ?? "aspect-[4/5]";
  const chip = categoryChip[theme.category];

  return (
    <motion.figure
      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)]"
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
    >
      <div className="warm-noise relative overflow-hidden">
        <div
          className={`${aspect} w-full bg-[color:var(--color-line)] bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]`}
          style={{ backgroundImage: `url(${theme.coverImage})` }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[color:rgba(31,26,36,0.62)] via-transparent to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="serif text-[1.4rem] leading-tight tracking-[-0.02em] text-white drop-shadow-sm">
            {theme.name}
          </h3>
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
        <span className={`chip ${chip.chip}`}>
          <span className={`dot ${chip.dot}`} />
          {categoryLabel[theme.category]}
        </span>
      </figcaption>
    </motion.figure>
  );
}

export default function Gallery() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="gallery"
      className="relative px-6 py-20 sm:px-8 sm:py-28"
      style={{
        background: "linear-gradient(180deg, rgba(235,242,236,0.4) 0%, rgba(251,248,243,1) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="chip chip-sage">
                <span className="dot dot-sage" />
                The gallery
              </span>
              <h2 className="serif mt-4 max-w-3xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
                {THEMES.length} curated vibes,
                <br />
                from <em className="serif-italic text-[color:var(--color-sage-deep)]">
                  cabin
                </em> to <em className="serif-italic text-[color:var(--color-coral)]">cinema</em>.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[color:var(--color-ink-muted)]">
              Every vibe in the studio, previewed here. Click any to try it on your family — or
              describe your own from scratch.
            </p>
          </div>
        </Reveal>

        <div className="masonry-3 mt-12">
          {featured.map((theme, i) => (
            <Reveal key={theme.id} delay={i * 0.03}>
              <ThemeTile theme={theme} />
            </Reveal>
          ))}

          <AnimatePresence initial={false}>
            {expanded &&
              rest.map((theme, i) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.42, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ThemeTile theme={theme} />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="btn btn-ghost"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <svg
                  className="h-4 w-4"
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
                Show all {THEMES.length} vibes
                <svg
                  className="h-4 w-4"
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
      </div>
    </section>
  );
}
