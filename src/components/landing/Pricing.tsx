"use client";

import Reveal from "@/components/motion/Reveal";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "next-intl";
import LocalizedLink from "@/components/i18n/LocalizedLink";
import { PRO_PLAN, type PricingPackId } from "@/lib/pricing-packs";

const tierConfig = [
  {
    packId: "single_keepsake",
    highlight: false,
  },
  {
    packId: "three_pack",
    highlight: true,
  },
  {
    packId: "eight_pack",
    highlight: false,
  },
] satisfies {
  packId: PricingPackId;
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
  const t = useTranslations("Pricing");
  const [error, setError] = useState<string | null>(null);
  const tierMessages = t.raw("tiers") as {
    name: string;
    price: string;
    sub: string;
    features: string[];
  }[];
  const tiers = tierConfig.map((tier, index) => ({ ...tier, ...tierMessages[index] }));
  const proFeatures = t.raw("proFeatures") as string[];

  return (
    <section id="pricing" className="px-6 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <span className="chip chip-butter">
              <span className="dot dot-butter" />
              {t("chip")}
            </span>
            <h2 className="serif mx-auto mt-4 max-w-2xl text-4xl leading-[1.05] tracking-[-0.025em] sm:text-6xl">
              {t("titleBefore")}{" "}
              <em className="serif-italic text-[color:var(--color-coral)]">{t("titleEmphasis")}</em>{" "}
              {t("titleAfter")}
            </h2>
            {unlockGenerationId && (
              <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-butter)] bg-[color:var(--color-bg-tinted-butter)] px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
                <span>{t("unlockPrompt")}</span>
                <LocalizedLink
                  href={`/studio/generate/${encodeURIComponent(unlockGenerationId)}`}
                  className="font-semibold text-[color:var(--color-coral-deep)]"
                >
                  {t("backToPreview")}
                </LocalizedLink>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.04}>
          <div className="mx-auto mt-8 max-w-3xl rounded-[var(--radius-xl)] border border-[color:var(--color-butter)] bg-[color:var(--color-bg-tinted-butter)] p-5 text-center shadow-[var(--shadow-md)] sm:p-6">
            <p className="small-caps text-[color:var(--color-coral-deep)]">{t("previewEyebrow")}</p>
            <h3 className="serif mt-2 text-3xl leading-tight sm:text-4xl">{t("previewTitle")}</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--color-ink-muted)] sm:text-base">
              {t("previewBody")}
            </p>
            <p className="mt-4 text-sm font-semibold text-[color:var(--color-coral-deep)]">
              {t("previewNote")}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr_1fr_1.18fr] items-stretch">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.06}>
              <motion.div
                className={`relative flex h-full flex-col rounded-[var(--radius-xl)] p-8 ${
                  tier.highlight
                    ? "bg-[color:var(--color-ink)] text-[color:var(--color-bg)] shadow-[var(--shadow-xl)]"
                    : "bg-[color:var(--color-bg-elevated)] border border-[color:var(--color-line)] shadow-[var(--shadow-md)]"
                }`}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 chip chip-coral shadow-[var(--shadow-md)]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                      <path d="M12 2 l2.4 6.6 L21 11 l-6.6 2.4 L12 20 l-2.4 -6.6 L3 11 l6.6 -2.4 z" />
                    </svg>
                    {t("mostPopular")}
                  </span>
                )}
                <p
                  className={`small-caps ${tier.highlight ? "text-[color:rgba(251,248,243,0.65)]" : "text-[color:var(--color-ink-muted)]"}`}
                >
                  {tier.name}
                </p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="serif text-6xl tracking-[-0.035em]">{tier.price}</span>
                </div>
                <p
                  className={`mt-2 text-sm ${tier.highlight ? "text-[color:rgba(251,248,243,0.75)]" : "text-[color:var(--color-ink-muted)]"}`}
                >
                  {tier.sub} {t("firstSetNote")}
                </p>

                <ul className="mt-8 flex-1 space-y-3 text-[0.95rem]">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          tier.highlight
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
                    packId={tier.packId}
                    unlockGenerationId={unlockGenerationId}
                    onError={(message) => setError(message || null)}
                    className={`btn w-full ${
                      tier.highlight
                        ? "border border-[color:rgba(251,248,243,0.75)] bg-transparent text-[color:var(--color-bg)] hover:bg-[color:rgba(251,248,243,0.08)]"
                        : "btn-ghost"
                    }`}
                  >
                    {unlockGenerationId ? t("buyCredits") : t("startHere")}
                  </CheckoutButton>
                  <CheckoutButton
                    packId={tier.packId}
                    gift
                    onError={(message) => setError(message || null)}
                    className="btn btn-coral w-full"
                    pendingLabel={t("openingGiftCheckout")}
                  >
                    {t("buyAsGift")}
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
                {t("proBadge")}
              </span>
              <p className="small-caps text-[color:var(--color-ink-muted)]">{PRO_PLAN.name}</p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="serif text-6xl tracking-[-0.035em]">{PRO_PLAN.price}</span>
                <span className="text-sm font-semibold text-[color:var(--color-ink-muted)]">
                  {t("perMonth")}
                </span>
              </div>
              <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">{t("proSub")}</p>

              <ul className="mt-8 flex-1 space-y-3 text-[0.95rem]">
                {proFeatures.map((f) => (
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
                  pendingLabel={t("openingSubscription")}
                >
                  {t("subscribeMonthly")}
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
