"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ConfirmDialog = dynamic(() => import("@/components/ui/ConfirmDialog"), {
  ssr: false,
});

export default function CreditGrantForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState(3);
  const [reason, setReason] = useState("Complimentary credits");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function requestConfirmation() {
    setMessage(null);
    setError(null);
    if (!email.trim() || credits === 0) return;
    setConfirmOpen(true);
  }

  function grantCredits() {
    setConfirmOpen(false);
    setMessage(null);
    setError(null);
    start(async () => {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          credits,
          reason: reason.trim() || undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || `Could not grant credits (${res.status}).`);
        return;
      }
      setMessage(
        `${credits > 0 ? "Added" : "Removed"} ${Math.abs(credits)} ${
          Math.abs(credits) === 1 ? "credit" : "credits"
        } ${credits > 0 ? "to" : "from"} ${email}.`,
      );
      setEmail("");
      router.refresh();
    });
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        requestConfirmation();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <div>
          <label className="small-caps text-[color:var(--color-ink-muted)]" htmlFor="grant-email">
            User email
          </label>
          <input
            id="grant-email"
            type="email"
            value={email}
            disabled={pending}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="customer@example.com"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-65"
          />
        </div>
        <div>
          <label className="small-caps text-[color:var(--color-ink-muted)]" htmlFor="grant-credits">
            Credits
          </label>
          <input
            id="grant-credits"
            type="number"
            min={-100}
            max={100}
            value={credits}
            disabled={pending}
            onChange={(event) => setCredits(Number(event.target.value))}
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-65"
          />
        </div>
      </div>

      <div>
        <label className="small-caps text-[color:var(--color-ink-muted)]" htmlFor="grant-reason">
          Note
        </label>
        <input
          id="grant-reason"
          type="text"
          value={reason}
          disabled={pending}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Why these credits were adjusted"
          className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 outline-none transition-all focus:border-[color:var(--color-sage)] focus:shadow-[var(--shadow-ring-sage)] disabled:opacity-65"
        />
      </div>

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

      <button
        type="submit"
        disabled={pending || !email.trim() || credits === 0}
        className="btn btn-coral w-full"
      >
        {pending ? "Saving adjustment..." : "Save credit adjustment"}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title={
          credits > 0
            ? `Add ${credits} ${credits === 1 ? "credit" : "credits"} to ${email.trim() || "this user"}?`
            : `Remove ${Math.abs(credits)} ${Math.abs(credits) === 1 ? "credit" : "credits"} from ${email.trim() || "this user"}?`
        }
        description={reason.trim() ? `Note: ${reason.trim()}` : undefined}
        confirmLabel={credits > 0 ? "Grant credits" : "Remove credits"}
        tone={credits > 0 ? "coral" : "danger"}
        pending={pending}
        onConfirm={grantCredits}
        onCancel={() => setConfirmOpen(false)}
      />
    </form>
  );
}
