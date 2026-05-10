"use client";

import Link from "next/link";
import { useState } from "react";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { PRO_PLAN, PRICING_PACKS, type PricingPackId } from "@/lib/pricing-packs";

const packFeatures: Record<PricingPackId, string> = {
  single_keepsake: "4 high-res photos or cards",
  three_pack: "24 high-res photos",
  eight_pack: "60 high-res photos or cards",
};

export default function CreditPackChooser({
  title = "Pick a pack before the next shoot.",
  description = "Each shoot creates 4 downloadable starting images.",
  compact = false,
  isProSubscriber = false,
  currentPeriodEnd = null,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
  isProSubscriber?: boolean;
  currentPeriodEnd?: string | null;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div>
        <span className="chip chip-coral !bg-white/70">
          <span className="dot dot-coral" />
          Add shoots
        </span>
        <p
          className={`serif mt-3 leading-tight tracking-[-0.02em] text-[color:var(--color-ink)] ${
            compact ? "text-2xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {title}
        </p>
        <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">{description}</p>
      </div>

      <div className={`mt-5 grid gap-2 ${compact ? "sm:grid-cols-2" : "md:grid-cols-4"}`}>
        {Object.values(PRICING_PACKS).map((pack) => (
          <CheckoutButton
            key={pack.id}
            packId={pack.id}
            onError={(message) => setError(message || null)}
            className="spring-press flex min-h-28 flex-col justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-elevated)] p-4 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-coral)] hover:shadow-[var(--shadow-md)] disabled:opacity-70"
            pendingLabel="Opening..."
          >
            <span>
              <span className="small-caps block text-[color:var(--color-ink-muted)]">
                {pack.name}
              </span>
              <span className="mt-1 block text-sm text-[color:var(--color-ink-muted)]">
                {packFeatures[pack.id]}
              </span>
            </span>
            <span className="mt-4 flex items-end justify-between gap-3">
              <span className="serif text-3xl leading-none tracking-[-0.03em]">{pack.price}</span>
              <span className="text-xs font-semibold text-[color:var(--color-coral-deep)]">
                Buy
              </span>
            </span>
          </CheckoutButton>
        ))}
        {isProSubscriber ? (
          <div className="flex min-h-28 flex-col justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-sage)] bg-[color:var(--color-bg-tinted-sage)] p-4 text-left shadow-[var(--shadow-sm)] opacity-90">
            <ProPlanCardContent
              action="Subscribed"
              detail={currentPeriodEnd ? `Renews ${formatDate(currentPeriodEnd)}` : "Active plan"}
            />
          </div>
        ) : (
          <CheckoutButton
            planId={PRO_PLAN.id}
            onError={(message) => setError(message || null)}
            className="spring-press flex min-h-28 flex-col justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-sage)] bg-[color:var(--color-bg-tinted-sage)] p-4 text-left shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] disabled:opacity-70"
            pendingLabel="Opening..."
          >
            <ProPlanCardContent action="Subscribe" detail="Monthly photo credits" />
          </CheckoutButton>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-white/55 px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
        <span>Have a gift code, or buying credits for someone else?</span>
        <Link href="/studio/gifts" className="font-semibold text-[color:var(--color-coral-deep)]">
          Open Gift credits
        </Link>
      </div>

      {error && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-white/70 px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
          {error}
        </p>
      )}
    </div>
  );
}

function ProPlanCardContent({ action, detail }: { action: string; detail: string }) {
  return (
    <>
      <span>
        <span className="small-caps block text-[color:var(--color-sage-deep)]">
          {PRO_PLAN.name}
        </span>
        <span className="mt-1 block text-sm text-[color:var(--color-ink-muted)]">{detail}</span>
      </span>
      <span className="mt-4 flex items-end justify-between gap-3">
        <span className="serif text-3xl leading-none tracking-[-0.03em]">
          {PRO_PLAN.price}
          <span className="ml-1 text-sm font-semibold text-[color:var(--color-ink-muted)]">
            /mo
          </span>
        </span>
        <span className="text-xs font-semibold text-[color:var(--color-sage-deep)]">{action}</span>
      </span>
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
