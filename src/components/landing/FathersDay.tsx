"use client";

import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const sourceTiles = ["Dad", "Kids", "Grandma", "Pet"];

export default function FathersDay() {
  return (
    <section className="px-6 py-16 sm:px-8 sm:py-24" aria-labelledby="fathers-day-heading">
      <div className="mx-auto grid max-w-6xl items-center gap-10 rounded-[var(--radius-2xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-lg)] sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
        <Reveal>
          <div>
            <span className="chip chip-butter">
              <span className="dot dot-butter" />
              Father&apos;s Day Portraits
            </span>
            <h2
              id="fathers-day-heading"
              className="serif mt-4 max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl"
            >
              Make Dad the family portrait he never gets to be in.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[color:var(--color-ink-muted)] sm:text-lg">
              Upload separate phone photos of the kids, parents, grandparents, or pets. Get a
              polished Father&apos;s Day portrait or card in about two minutes.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/studio/roster" className="btn btn-coral btn-lg spring-press">
                Create Father&apos;s Day Portrait
              </Link>
              <span className="text-sm font-semibold text-[color:var(--color-ink-muted)]">
                Free watermarked preview first.
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-butter)] p-5 shadow-[var(--shadow-md)]">
            <div className="grid gap-4 sm:grid-cols-[0.82fr_auto_1fr] sm:items-center">
              <div className="grid grid-cols-2 gap-3">
                {sourceTiles.map((label, index) => (
                  <div
                    key={label}
                    className="flex aspect-[4/5] items-end rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(242,219,177,0.34))] p-3 shadow-[var(--shadow-sm)]"
                  >
                    <span className="rounded-full bg-[color:rgba(31,26,36,0.78)] px-3 py-1 text-xs font-semibold text-[color:var(--color-bg)]">
                      {index + 1}. {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-coral)] text-white shadow-[var(--shadow-md)] sm:rotate-0 rotate-90">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className="h-5 w-5"
                >
                  <path d="M5 12h14" strokeLinecap="round" />
                  <path d="m13 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="relative flex aspect-[4/5] items-end overflow-hidden rounded-[var(--radius-xl)] border border-[color:rgba(255,255,255,0.72)] bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.82),transparent_28%),linear-gradient(145deg,rgba(244,160,117,0.3),rgba(89,123,106,0.28)),url('/samples/after-wes-anderson-family.jpg')] bg-cover bg-center p-4 shadow-[var(--shadow-lg)]">
                <div className="rounded-[var(--radius-lg)] bg-[color:rgba(251,248,243,0.9)] p-4 shadow-[var(--shadow-md)] backdrop-blur">
                  <p className="small-caps text-[color:var(--color-coral-deep)]">
                    Father&apos;s Day Card
                  </p>
                  <p className="serif mt-1 text-2xl leading-tight">
                    One polished keepsake portrait.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
