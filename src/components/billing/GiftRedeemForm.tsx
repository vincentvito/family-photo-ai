"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Confetti from "@/components/motion/Confetti";
import { formatGiftCode } from "@/lib/gift-code";

export default function GiftRedeemForm({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(formatGiftCode(initialCode));
  const [pending, setPending] = useState(false);
  const [redeemedCredits, setRedeemedCredits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setRedeemedCredits(null);

    try {
      const res = await fetch("/api/gifts/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (res.status === 401) {
        window.location.assign(`/sign-in?next=${encodeURIComponent(`/redeem/${code}`)}`);
        return;
      }

      const data = (await res.json().catch(() => null)) as {
        credits?: number;
        error?: string;
      } | null;

      if (!res.ok) {
        setError(data?.error ?? "Gift code could not be redeemed.");
        setPending(false);
        return;
      }

      setRedeemedCredits(data?.credits ?? 0);
      setPending(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="relative">
      <Confetti count={22} trigger={redeemedCredits != null} />
      <form onSubmit={submit} className="mt-5 space-y-3">
        <label className="block">
          <span className="small-caps text-[color:var(--color-ink-muted)]">Gift code</span>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(formatGiftCode(event.target.value))}
            placeholder="FS-G7KQ-92XA-MP4D"
            autoComplete="off"
            disabled={pending || redeemedCredits != null}
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-white px-3 py-2 text-sm font-semibold tracking-[0.08em] outline-none focus:border-[color:var(--color-sage)] disabled:opacity-70"
          />
        </label>
        <button
          type="submit"
          disabled={pending || !code.trim() || redeemedCredits != null}
          className="btn btn-sage"
        >
          {pending
            ? "Redeeming..."
            : redeemedCredits != null
              ? "Credits redeemed"
              : "Redeem credits"}
        </button>
        {redeemedCredits != null && (
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-sage)] bg-[color:var(--color-bg-tinted-sage)] px-4 py-4 text-sm text-[color:var(--color-sage-deep)]">
            <p className="font-semibold">
              {redeemedCredits} {redeemedCredits === 1 ? "shoot" : "shoots"} added to your account.
            </p>
            <p className="mt-1 text-[color:var(--color-ink-muted)]">
              You are ready to create your photoshoot.
            </p>
            <Link href="/studio/roster" className="btn btn-coral mt-4">
              Take your photoshoot now
            </Link>
            <button
              type="button"
              onClick={() => {
                setCode("");
                setRedeemedCredits(null);
                setError(null);
              }}
              className="ml-0 mt-3 text-sm font-semibold text-[color:var(--color-sage-deep)] underline decoration-[color:var(--color-sage)] underline-offset-4 sm:ml-3 sm:mt-0"
            >
              Redeem another code
            </button>
          </div>
        )}
        {error && (
          <p className="rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-coral)] px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
