"use client";

import { motion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";
import { OCCASION_PAGES } from "@/data/occasion-pages";
import { THEMES } from "@/lib/themes";
import Link from "next/link";

const OCCASION_IDS = [
  "card-christmas",
  "card-diwali",
  "card-nowruz",
  "card-hanukkah",
  "card-easter",
  "card-lunar-new-year",
  "card-eid",
  "card-dia-de-muertos",
  "card-new-years",
  "card-birthday",
  "card-anniversary",
  "card-mothers-day",
];

const occasions = OCCASION_IDS.map((id) => THEMES.find((theme) => theme.id === id)!).filter(
  Boolean,
);

const FEATURED_OCCASION_SLUGS = [
  "fathers-day",
  "mothers-day",
  "womens-day",
  "grandparents-day",
  "anniversary-gift",
  "family-reunion",
];

const featuredOccasionPages = FEATURED_OCCASION_SLUGS.map(
  (slug) => OCCASION_PAGES.find((page) => page.slug === slug)!,
).filter(Boolean);

export default function OccasionCards() {
  return (
    <section id="cards" className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="chip chip-butter">
                <span className="dot dot-butter" />
                AI family holiday card generator
              </span>
              <h2 className="serif mt-4 max-w-3xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
                Make a card from the photos you{" "}
                <em className="serif-italic text-[color:var(--color-coral)]">already have</em>.
              </h2>
            </div>
            <div className="max-w-sm">
              <p className="text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Create a family holiday card, Christmas card photo, or greeting card from the photos
                you already have. No studio date, matching outfits, or perfect group shot required.
              </p>
              <Link href="/studio/roster" className="btn btn-coral mt-5">
                Make a free card preview
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
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map((theme, index) => (
            <Reveal key={theme.id} delay={index * 0.035}>
              <motion.article
                className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-line)] shadow-[var(--shadow-md)]"
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url(${theme.coverImage})` }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[color:rgba(31,26,36,0.72)] via-[color:rgba(31,26,36,0.08)] to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="serif text-3xl leading-tight tracking-[-0.02em] text-white drop-shadow-sm">
                    {theme.name.replace("Holiday Card — ", "")}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/82">
                    {theme.blurb}
                  </p>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="mt-12 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-white/80 p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="small-caps text-[color:var(--color-coral)]">Occasion pages</p>
                <h3 className="serif mt-3 text-3xl leading-tight tracking-[-0.02em] sm:text-4xl">
                  Create portraits for every family occasion
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                  Turn family photos into personalized portraits for birthdays, holidays, reunions,
                  anniversaries, and gifts. Each page has its own preview-first CTA.
                </p>
              </div>
              <Link href="/occasions" className="btn btn-coral shrink-0">
                Browse all occasions
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featuredOccasionPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}`}
                  className="rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-cream)] px-4 py-4 transition-colors hover:border-[color:var(--color-coral)] hover:bg-white"
                >
                  <span className="font-semibold">{page.name}</span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                    {page.shortDescription}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
