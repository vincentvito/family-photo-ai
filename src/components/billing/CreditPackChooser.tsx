"use client";

import { useState } from "react";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { PRICING_PACKS, type PricingPackId } from "@/lib/pricing-packs";

const packFeatures: Record<PricingPackId, string> = {
  single_keepsake: "1 finished photo or card",
  three_pack: "3 finished photos or cards",
  eight_pack: "8 finished photos or cards",
};

export default function CreditPackChooser({
  title = "Pick a pack before the next shoot.",
  description = "One credit starts one shoot with four starting variations.",
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div>
        <span className="chip chip-coral !bg-white/70">
          <span className="dot dot-coral" />
          Add credits
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

      <div className={`mt-5 grid gap-2 ${compact ? "sm:grid-cols-3" : "md:grid-cols-3"}`}>
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
      </div>

      {error && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-white/70 px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
          {error}
        </p>
      )}
    </div>
  );
}
