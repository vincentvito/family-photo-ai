"use client";

import Reveal from "@/components/motion/Reveal";
import { motion } from "framer-motion";
import LaunchGateLink from "./LaunchGateLink";

const tiers = [
  {
    name: "Single keepsake",
    price: "$5",
    sub: "One photo or card.",
    features: [
      "One finished photo or card",
      "Four starting variations",
      "Refine your favorite",
      "Print-ready download",
    ],
    highlight: false,
  },
  {
    name: "Three-pack",
    price: "$12",
    sub: "Best for a small set.",
    features: [
      "Three finished photos or cards",
      "Mix portraits and occasion cards",
      "Refine each favorite",
      "Digital album + print-ready files",
    ],
    highlight: true,
  },
  {
    name: "Eight-pack",
    price: "$25",
    sub: "For holidays and family sets.",
    features: [
      "Eight finished photos or cards",
      "Great for gifts, seasons and siblings",
      "Refine each favorite",
      "Album export for the full set",
    ],
    highlight: false,
  },
];

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

export default function Pricing({ gated = false }: { gated?: boolean }) {
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
              Pay for what <em className="serif-italic text-[color:var(--color-coral)]">fits</em> your
              family.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3 items-stretch">
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
                  <LaunchGateLink
                    href="/sign-in"
                    gated={gated}
                    className={`btn w-full ${t.highlight ? "btn-coral" : "btn-ghost"}`}
                  >
                    Start here
                  </LaunchGateLink>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
