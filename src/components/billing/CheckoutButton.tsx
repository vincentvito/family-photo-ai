"use client";

import { useState } from "react";
import type { PricingPackId } from "@/lib/pricing-packs";

export default function CheckoutButton({
  packId,
  planId,
  gift = false,
  children,
  className,
  pendingLabel = "Opening checkout...",
  onError,
}: {
  packId?: PricingPackId;
  planId?: string;
  gift?: boolean;
  children: React.ReactNode;
  className: string;
  pendingLabel?: string;
  onError?: (message: string) => void;
}) {
  const [pending, setPending] = useState(false);

  async function startCheckout() {
    setPending(true);
    onError?.("");

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(planId ? { planId } : { packId, ...(gift ? { gift: {} } : {}) }),
    });

    if (res.status === 401) {
      setPending(false);
      window.location.assign(`/sign-in?next=${encodeURIComponent("/#pricing")}`);
      return;
    }

    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!res.ok || !data?.url) {
      onError?.(data?.error ?? "Checkout could not start.");
      setPending(false);
      return;
    }

    window.location.assign(data.url);
    window.setTimeout(() => setPending(false), 1000);
  }

  return (
    <button type="button" onClick={startCheckout} disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
