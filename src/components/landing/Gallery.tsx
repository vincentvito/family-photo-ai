"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";
import { THEMES } from "@/lib/themes";
import type { Theme } from "@/lib/themes";

type FeaturedItem = { id: string; badge?: string; note?: string };
type TrendingVibe = { id: string; name: string };

const FALLBACK_POPULAR_ITEMS: FeaturedItem[] = [
  { id: "pixar-family", badge: "Trending now" },
  { id: "card-mothers-day", badge: "Popular card" },
  { id: "stacked-love" },
  { id: "leibovitz-studio", badge: "Family of 5", note: "4 people + 1 pet" },
  { id: "card-lunar-new-year" },
  { id: "card-eid" },
  { id: "card-diwali" },
  { id: "golden-hour-beach" },
  { id: "cherry-blossom" },
  { id: "coastal-grandmother" },
  { id: "y2k-disposable" },
  { id: "card-hanukkah" },
];

const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

function buildFeaturedItems(trendingVibes: TrendingVibe[]): FeaturedItem[] {
  const trendingItems: FeaturedItem[] = trendingVibes
    .map<FeaturedItem>((vibe, index) => ({ id: vibe.id, badge: index === 0 ? "Most popular" : "Trending" }))
    .filter((item) => THEME_BY_ID.has(item.id));

  const deduped = [...trendingItems, ...FALLBACK_POPULAR_ITEMS].filter(
    (item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index,
  );

  return deduped.slice(0, 12);
}

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

function ThemeTile({ theme, badge, note }: { theme: Theme; badge?: string; note?: string }) {
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
        {badge && <span className="chip chip-coral absolute left-4 top-4">{badge}</span>}
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
        {note && (
          <span className="hidden text-right text-xs font-semibold text-[color:var(--color-ink-muted)] sm:inline">
            {note}
          </span>
        )}
      </figcaption>
    </motion.figure>
  );
}

export default function Gallery({ trendingVibes = [] }: { trendingVibes?: TrendingVibe[] }) {
  const [expanded, setExpanded] = useState(false);
  const featuredItems = buildFeaturedItems(trendingVibes);
  const featured = featuredItems.flatMap((item) => {
    const theme = THEME_BY_ID.get(item.id);
    return theme ? [{ theme, badge: item.badge, note: item.note }] : [];
  });
  const featuredIds = new Set(featuredItems.map((item) => item.id));
  const rest = THEMES.filter((theme) => !featuredIds.has(theme.id));

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
                Family photoshoot ideas
              </span>
              <h2 className="serif mt-4 max-w-3xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
                Choose from 100+ curated styles,
                <br />
                or create your own.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-[color:var(--color-ink-muted)]">
              Browse family photo ideas for holidays, cards, studio portraits, beach sessions,
              storybook art, and everything between. Click any to try it on your family.
            </p>
          </div>
        </Reveal>

        <div className="masonry-3 mt-12">
          {featured.map((item, i) => (
            <Reveal key={item.theme.id} delay={i * 0.03}>
              <ThemeTile theme={item.theme} badge={item.badge} note={item.note} />
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
