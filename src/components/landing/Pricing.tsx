"use client";

import Reveal from "@/components/motion/Reveal";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { PRO_PLAN, type PricingPackId } from "@/lib/pricing-packs";

const tiers = [
  {
    packId: "single_keepsake",
    name: "Family Snap",
    price: "$5",
    sub: "A quick set for one moment.",
    features: ["4 high-res photos or cards", "Print-ready files"],
    highlight: false,
  },
  {
    packId: "three_pack",
    name: "Family Album",
    price: "$12",
    sub: "Best for portraits and cards.",
    features: [
      "24 high-res professional photos",
      "Portraits and occasion cards",
      "Downloadable, print-ready files",
    ],
    highlight: true,
  },
  {
    packId: "eight_pack",
    name: "Family Collection",
    price: "$25",
    sub: "For holidays and family sets.",
    features: [
      "60 high-res professional photos or cards",
      "Portraits and occasion cards",
      "Downloadable, print-ready files",
    ],
    highlight: false,
  },
] satisfies {
  packId: PricingPackId;
  name: string;
  price: string;
  sub: string;
  features: string[];
  highlight: boolean;
}[];

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.14" />
      <path
        d="M6 10.5 L9 13 L14 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Pricing({ unlockGenerationId }: { unlockGenerationId?: string }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <section id="pricing" className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <span className="chip chip-butter">
              <span className="dot dot-butter" />
              Free preview, paid keepsakes
            </span>
            <h2 className="serif mx-auto mt-4 max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
              Pay for what <em className="serif-italic text-[color:var(--color-coral)]">fits</em>{" "}
              your family.
            </h2>
            {unlockGenerationId && (
              <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-butter)] bg-[color:var(--color-bg-tinted-butter)] px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
                <span>Choose any pack below to unlock your preview.</span>
                <Link
                  href={`/studio/generate/${encodeURIComponent(unlockGenerationId)}`}
                  className="font-semibold text-[color:var(--color-coral-deep)]"
                >
                  Back to preview
                </Link>
              </div>
            )}
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr_1fr_1.18fr] items-stretch">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <motion.div
                className={`relative flex h-full flex-col rounded-[var(--radius-xl)] p-8 ${
                  t.highlight
                    ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)] shadow-[var(--shadow-xl)]"
                    : "bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-line)] shadow-[var(--shadow-md)]"
                }`}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 chip chip-coral shadow-[var(--shadow-md)]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                      <path d="M12 2 l2.4 6.6 L21 11 l-6.6 2.4 L12 20 l-2.4 -6.6 L3 11 l6.6 -2.4 z" />
                    </svg>
                    Most Popular
                  </span>
                )}
                <p
                  className={`small-caps ${t.highlight ? "text-[color:rgba(251,248,243,0.65)]" : "text-[color:var(--color-ink-muted)]"}`}
                >
                  {t.name}
                </p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="serif text-6xl tracking-[-0.035em]">{t.price}</span>
                </div>
                <p
                  className={`mt-2 text-sm ${t.highlight ? "text-[color:rgba(251,248,243,0.75)]" : "text-[color:var(--color-ink-muted)]"}`}
                >
                  {t.sub} Your first photo set can start as a watermarked preview.
                </p>

                <ul className="mt-8 flex-1 space-y-3 text-[0.95rem]">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          t.highlight
                            ? "text-[color:var(--color-coral)]"
                            : "text-[color:var(--color-coral)]"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto grid gap-2 pt-10">
                  <CheckoutButton
                    packId={t.packId}
                    unlockGenerationId={unlockGenerationId}
                    onError={(message) => setError(message || null)}
                    className={`btn w-full ${
                      t.highlight
                        ? "border border-[color:rgba(251,248,243,0.75)] bg-transparent text-[color:var(--color-bg)] hover:bg-[color:rgba(251,248,243,0.08)]"
                        : "btn-ghost"
                    }`}
                  >
                    {unlockGenerationId ? "Buy credits" : "Start here"}
                  </CheckoutButton>
                  <CheckoutButton
                    packId={t.packId}
                    gift
                    onError={(message) => setError(message || null)}
                    className="btn btn-coral w-full"
                    pendingLabel="Opening gift checkout..."
                  >
                    Buy as gift
                  </CheckoutButton>
                </div>
              </motion.div>
            </Reveal>
          ))}
          <Reveal delay={tiers.length * 0.06}>
            <motion.div
              className="relative flex h-full flex-col rounded-[var(--radius-xl)] border border-[color:var(--color-sage)] bg-[color:var(--color-bg-tinted-sage)] p-8 shadow-[var(--shadow-lg)]"
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 chip chip-sage shadow-[var(--shadow-md)]">
                Pro
              </span>
              <p className="small-caps text-[color:var(--color-ink-muted)]">{PRO_PLAN.name}</p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="serif text-6xl tracking-[-0.035em]">{PRO_PLAN.price}</span>
                <span className="text-sm font-semibold text-[color:var(--color-ink-muted)]">
                  /month
                </span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
                Built for creators, photographers, and repeat family-card work.
              </p>

              <ul className="mt-8 flex-1 space-y-3 text-[0.95rem]">
                {[
                  "100 high-res professional photos or cards each month",
                  "Portraits, cards, invitations, and seasonal moments",
                  "Downloadable, print-ready files",
                  "Priority access to new styles and templates",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-sage)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <CheckoutButton
                  planId={PRO_PLAN.id}
                  unlockGenerationId={unlockGenerationId}
                  onError={(message) => setError(message || null)}
                  className="btn btn-sage w-full"
                  pendingLabel="Opening subscription..."
                >
                  Subscribe monthly
                </CheckoutButton>
              </div>
            </motion.div>
          </Reveal>
        </div>
        {error && (
          <p className="mx-auto mt-5 max-w-xl text-center text-sm text-[color:var(--color-coral-deep)]">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
