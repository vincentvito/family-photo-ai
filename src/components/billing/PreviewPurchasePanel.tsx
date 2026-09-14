"use client";

import { useId, useState } from "react";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { PRICING_PACKS } from "@/lib/pricing-packs";

const upgrades = [PRICING_PACKS.three_pack, PRICING_PACKS.eight_pack];

export default function PreviewPurchasePanel({
  generationId,
  completed,
  imageCount,
  checkingPayment,
  checkoutReturned,
  unlocking,
  error,
  onError,
  onUnlock,
}: {
  generationId: string;
  completed: boolean;
  imageCount: number;
  checkingPayment: boolean;
  checkoutReturned: boolean;
  unlocking: boolean;
  error: string | null;
  onError: (message: string) => void;
  onUnlock: () => void;
}) {
  const [showPacks, setShowPacks] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const packsId = useId();
  const ready = completed && imageCount > 0;
  const selection = imageCount === 1 ? "this portrait" : `these ${imageCount} portraits`;
  const busy = checkoutPending || unlocking || checkingPayment;
  const canBuy = ready && !busy && !checkoutReturned;

  return (
    <section
      aria-label="Keep your portraits"
      className="mb-8 overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-coral-soft)] bg-[linear-gradient(120deg,var(--color-bg-elevated),var(--color-bg-tinted-coral))] shadow-[var(--shadow-md)]"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0">
          <span className="small-caps text-[color:var(--color-coral-deep)]">Your free preview</span>
          <h2 className="serif mt-2 text-3xl leading-tight tracking-[-0.025em] sm:text-4xl">
            {checkingPayment
              ? "Making them yours…"
              : checkoutReturned
                ? "Let’s finish your unlock."
                : ready
                  ? "Love them? Make them yours."
                  : "See them first. Keep what you love."}
          </h2>
          <p
            className="mt-2 max-w-lg text-sm leading-relaxed text-[color:var(--color-ink-muted)]"
            aria-live="polite"
          >
            {checkingPayment
              ? "We’re confirming your payment. Your portraits will unlock here automatically."
              : checkoutReturned
                ? "If your payment went through, use your credits below to unlock this set."
                : ready
                  ? imageCount < 4
                    ? `Only ${imageCount} of 4 portraits could be completed. You can keep ${imageCount === 1 ? "this portrait" : "these portraits"} without watermarks, with high-resolution downloads and print-ready files. The pack price is unchanged, or you can use 1 existing credit.`
                    : "Keep all four portraits without watermarks, with high-resolution downloads and print-ready files."
                  : "Your watermarked portraits will appear below. Once the set is ready, you can unlock all four."}
          </p>
        </div>

        {!checkoutReturned && (
          <div className="flex shrink-0 flex-col items-center gap-2.5 lg:min-w-[260px]">
            <CheckoutButton
              packId="single_keepsake"
              unlockGenerationId={generationId}
              disabled={!canBuy}
              onPendingChange={setCheckoutPending}
              onError={onError}
              className="btn btn-coral btn-lg w-full !px-5 !text-base"
            >
              {ready
                ? `Keep ${selection} — ${PRICING_PACKS.single_keepsake.price}`
                : "Your portraits are developing…"}
            </CheckoutButton>
            <span className="text-xs text-[color:var(--color-ink-muted)]">
              One-time payment · No subscription
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-[color:var(--color-coral-soft)] bg-white/40 px-5 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          {!checkoutReturned && (
            <button
              type="button"
              aria-expanded={showPacks}
              aria-controls={packsId}
              disabled={busy}
              onClick={() => setShowPacks((shown) => !shown)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-coral-deep)] disabled:opacity-50"
            >
              {showPacks ? "Fewer options" : "Want more portraits?"}
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                className={`h-3.5 w-3.5 transition-transform ${showPacks ? "rotate-180" : ""}`}
              >
                <path
                  d="m4 6 4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            disabled={!ready || busy}
            onClick={onUnlock}
            className="text-sm font-semibold text-[color:var(--color-ink-muted)] underline decoration-[color:var(--color-line-strong)] underline-offset-4 transition-colors hover:text-[color:var(--color-coral-deep)] disabled:opacity-50"
          >
            {checkingPayment
              ? "Confirming payment…"
              : unlocking
                ? "Unlocking…"
                : "Already have credits? Unlock this set"}
          </button>
        </div>

        <div id={packsId} hidden={!showPacks || checkoutReturned}>
          <p className="mt-5 text-sm text-[color:var(--color-ink-muted)]">
            Each pack unlocks this set. Save the remaining shoots for your next family moment.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {upgrades.map((pack) => (
              <CheckoutButton
                key={pack.id}
                packId={pack.id}
                unlockGenerationId={generationId}
                disabled={!canBuy}
                onPendingChange={setCheckoutPending}
                onError={onError}
                className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-4 py-3.5 text-left transition-colors hover:border-[color:var(--color-coral)] disabled:cursor-wait disabled:opacity-50"
              >
                <span>
                  <span className="block font-semibold">{pack.name}</span>
                  <span className="mt-1 block text-xs text-[color:var(--color-ink-muted)]">
                    This set + {pack.credits - 1} more shoots
                  </span>
                </span>
                <span className="serif shrink-0 text-2xl">{pack.price}</span>
              </CheckoutButton>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-[color:var(--color-coral-deep)]">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
