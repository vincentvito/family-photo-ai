"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PricingPackId } from "@/lib/pricing-packs";
import { getCheckoutDestination } from "@/lib/checkout-client";

export default function CheckoutButton({
  packId,
  planId,
  unlockGenerationId,
  gift = false,
  children,
  className,
  pendingLabel = "Opening checkout...",
  onError,
  disabled = false,
  autoStart = false,
  onPendingChange,
}: {
  packId?: PricingPackId;
  planId?: string;
  unlockGenerationId?: string;
  gift?: boolean;
  children: React.ReactNode;
  className: string;
  pendingLabel?: string;
  onError?: (message: string) => void;
  disabled?: boolean;
  autoStart?: boolean;
  onPendingChange?: (pending: boolean) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const autoStarted = useRef(false);

  const startCheckout = useCallback(async () => {
    if (disabled || inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    onPendingChange?.(true);
    setError(null);
    onError?.("");

    const finish = () => {
      inFlight.current = false;
      setPending(false);
      onPendingChange?.(false);
    };

    try {
      const url = await getCheckoutDestination(
        { packId, planId, unlockGenerationId, gift },
        window.location.pathname,
      );
      window.location.assign(url);
      window.setTimeout(finish, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Checkout could not start. Please try again.";
      setError(message);
      onError?.(message);
      finish();
    }
  }, [disabled, gift, onError, onPendingChange, packId, planId, unlockGenerationId]);

  useEffect(() => {
    if (!autoStart || disabled || autoStarted.current) return;
    autoStarted.current = true;
    void startCheckout();
  }, [autoStart, disabled, startCheckout]);

  return (
    <>
      <button
        type="button"
        onClick={startCheckout}
        disabled={pending || disabled}
        aria-busy={pending}
        className={className}
      >
        {pending ? pendingLabel : children}
      </button>
      {error && !onError && (
        <p role="alert" className="mt-3 text-sm text-[color:var(--color-coral-deep)]">
          {error}
        </p>
      )}
    </>
  );
}
