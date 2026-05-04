"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Reveal from "@/components/motion/Reveal";
import { THEMES } from "@/lib/themes";

const OCCASION_IDS = [
  "card-christmas",
  "card-diwali",
  "card-hanukkah",
  "card-easter",
  "card-lunar-new-year",
  "card-eid",
  "card-dia-de-muertos",
  "card-new-years",
  "card-mothers-day",
];

const occasions = OCCASION_IDS.map((id) => THEMES.find((theme) => theme.id === id)!).filter(
  Boolean,
);

export default function OccasionCards() {
  return (
    <section id="cards" className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="chip chip-butter">
                <span className="dot dot-butter" />
                Holiday and occasion cards
              </span>
              <h2 className="serif mt-4 max-w-3xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
                Turn a portrait into something{" "}
                <em className="serif-italic text-[color:var(--color-coral)]">sendable</em>.
              </h2>
            </div>
            <div className="max-w-sm">
              <p className="text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Christmas, Easter, Hanukkah, Diwali, Lunar New Year, Eid and family milestones,
                made as warm cards for the people who should see them first.
              </p>
              <Link href="/sign-in" className="btn btn-coral mt-5">
                Make a card
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
      </div>
    </section>
  );
}
