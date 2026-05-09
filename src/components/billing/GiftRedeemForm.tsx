"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatGiftCode } from "@/lib/gift-code";

export default function GiftRedeemForm({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(formatGiftCode(initialCode));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/gifts/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.status === 401) {
      window.location.assign(`/sign-in?next=${encodeURIComponent(`/redeem/${code}`)}`);
      return;
    }

    const data = (await res.json().catch(() => null)) as
      | { credits?: number; error?: string }
      | null;

    if (!res.ok) {
      setError(data?.error ?? "Gift code could not be redeemed.");
      setPending(false);
      return;
    }

    setMessage(
      `Redeemed ${data?.credits ?? 0} ${data?.credits === 1 ? "shoot" : "shoots"} into your account.`,
    );
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-3">
      <label className="block">
        <span className="small-caps text-[color:var(--color-ink-muted)]">Gift code</span>
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(formatGiftCode(event.target.value))}
          placeholder="FS-G7KQ-92XA-MP4D"
          autoComplete="off"
          className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-white px-3 py-2 text-sm font-semibold tracking-[0.08em] outline-none focus:border-[color:var(--color-sage)]"
        />
      </label>
      <button type="submit" disabled={pending || !code.trim()} className="btn btn-sage">
        {pending ? "Redeeming..." : "Redeem credits"}
      </button>
      {message && (
        <p className="rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-sage)] px-4 py-3 text-sm text-[color:var(--color-sage-deep)]">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-coral)] px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
          {error}
        </p>
      )}
    </form>
  );
}
