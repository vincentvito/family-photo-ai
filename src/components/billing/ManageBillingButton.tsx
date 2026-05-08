"use client";

import { useState } from "react";

export default function ManageBillingButton({ className }: { className: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;

    if (!res.ok || !data?.url) {
      setError(data?.error ?? "Billing portal could not open.");
      setPending(false);
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <div>
      <button type="button" onClick={openPortal} disabled={pending} className={className}>
        {pending ? "Opening billing..." : "Manage billing"}
      </button>
      {error && <p className="mt-3 text-sm text-[color:var(--color-coral-deep)]">{error}</p>}
    </div>
  );
}
