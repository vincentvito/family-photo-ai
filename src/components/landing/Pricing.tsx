"use client";

import Reveal from "@/components/motion/Reveal";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { motion } from "framer-motion";
import { useState } from "react";
import { PRO_PLAN, type PricingPackId } from "@/lib/pricing-packs";

const tiers = [
  {
    packId: "single_keepsake",
    name: "Single keepsake",
    price: "$5",
    sub: "One photo or card shoot.",
    features: [
      "1 shoot",
      "4 downloadable starting images",
      "2 total regenerations per shoot",
      "Print-ready download",
    ],
    highlight: false,
  },
  {
    packId: "three_pack",
    name: "Three-pack",
    price: "$12",
    sub: "Best for a small set.",
    features: [
      "3 shoots",
      "4 downloadable starting images per shoot",
      "Mix portraits and occasion cards",
      "4 total regenerations per shoot",
      "Digital album + print-ready files",
    ],
    highlight: true,
  },
  {
    packId: "eight_pack",
    name: "Eight-pack",
    price: "$25",
    sub: "For holidays and family sets.",
    features: [
      "8 shoots",
      "4 downloadable starting images per shoot",
      "Great for gifts, seasons and siblings",
      "6 total regenerations per shoot",
      "Album export for the full set",
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

export default function Pricing() {
  const [error, setError] = useState<string | null>(null);

  return (
    <section id="pricing" className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <span className="chip chip-butter">
              <span className="dot dot-butter" />
              Simple photo packs
            </span>
            <h2 className="serif mx-auto mt-4 max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
              Pay for what <em className="serif-italic text-[color:var(--color-coral)]">fits</em>{" "}
              your family.
            </h2>
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
                    Most loved
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
                  {t.sub}
                </p>

                <ul className="mt-8 space-y-3 text-[0.95rem]">
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

                <div className="mt-10">
                  <CheckoutButton
                    packId={t.packId}
                    onError={(message) => setError(message || null)}
                    className={`btn w-full ${t.highlight ? "btn-coral" : "btn-ghost"}`}
                  >
                    Start here
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
                For photographers, creators, and families making portraits regularly.
              </p>

              <ul className="mt-8 space-y-3 text-[0.95rem]">
                {[
                  "25 shoots monthly",
                  "4 downloadable starting images per shoot",
                  "8 total regenerations per shoot",
                  "Commercial usage rights",
                  "90-day image storage",
                  "Saved family and client profiles",
                  "Premium Pro card style presets",
                  "Print-ready downloads",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-sage)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <CheckoutButton
                  planId={PRO_PLAN.id}
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
