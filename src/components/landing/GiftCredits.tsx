"use client";

import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Choose a pack",
    body: "Pick one, three, or eight photo shoots and select Buy as gift.",
  },
  {
    title: "Copy the link",
    body: "After checkout, the gift code and redeem link stay in your Gifts page.",
  },
  {
    title: "They redeem it",
    body: "Your loved one signs in, opens the link, and adds the shoots to their account.",
  },
];

export default function GiftCredits() {
  return (
    <section className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <Reveal>
          <div>
            <span className="chip chip-coral">
              <span className="dot dot-coral" />
              Gift credits
            </span>
            <h2 className="serif mt-4 max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
              Send a photo shoot to someone you love.
            </h2>
            <p className="mt-5 max-w-xl text-[color:var(--color-ink-muted)]">
              Buy credits for a parent, partner, grandparent, or friend. We create a private gift
              code and share link for you, so you can send it yourself by text, email, or card.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#pricing" className="btn btn-coral">
                Buy a gift
              </Link>
              <Link href="/studio/gifts" className="btn btn-ghost">
                Redeem a code
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <motion.div
            className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-coral)] p-6 shadow-[var(--shadow-lg)] sm:p-8"
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 24 } }}
          >
            <div className="absolute right-6 top-6 rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--color-coral-deep)]">
              Shareable link
            </div>

            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-md)]">
              <p className="small-caps text-[color:var(--color-ink-muted)]">FamilyShoot gift</p>
              <div className="mt-5 flex items-end justify-between gap-5">
                <div>
                  <p className="serif text-5xl leading-none tracking-[-0.035em]">3</p>
                  <p className="mt-2 text-sm font-semibold text-[color:var(--color-ink)]">
                    photo shoots
                  </p>
                </div>
                <code className="rounded-[var(--radius-md)] bg-[color:var(--color-ink)] px-3 py-2 text-xs font-bold tracking-[0.12em] text-white">
                  FS-GIFT-READY
                </code>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                A little portrait gift for the people who are impossible to shop for.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="grid grid-cols-[auto_1fr] gap-3 rounded-[var(--radius-lg)] bg-white/55 p-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-coral)] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[color:var(--color-ink)]">
                      {step.title}
                    </span>
                    <span className="mt-1 block text-sm text-[color:var(--color-ink-muted)]">
                      {step.body}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
