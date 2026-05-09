"use client";

import { useState } from "react";
import { PRICING_PACKS, type PricingPackId } from "@/lib/pricing-packs";

export default function GiftCheckoutForm() {
  const [packId, setPackId] = useState<PricingPackId>("three_pack");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedPack = PRICING_PACKS[packId];

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packId,
        gift: {
          recipientEmail,
          recipientName,
          message,
        },
      }),
    });

    if (res.status === 401) {
      window.location.assign(`/sign-in?next=${encodeURIComponent("/studio/account")}`);
      return;
    }

    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!res.ok || !data?.url) {
      setError(data?.error ?? "Gift checkout could not start.");
      setPending(false);
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        {Object.values(PRICING_PACKS).map((pack) => (
          <label
            key={pack.id}
            className={`cursor-pointer rounded-[var(--radius-lg)] border p-4 transition-colors ${
              packId === pack.id
                ? "border-[color:var(--color-coral)] bg-[color:var(--color-bg-tinted-coral)]"
                : "border-[color:var(--color-line)] bg-white/60 hover:border-[color:var(--color-coral-soft)]"
            }`}
          >
            <input
              type="radio"
              name="gift-pack"
              value={pack.id}
              checked={packId === pack.id}
              onChange={() => setPackId(pack.id)}
              className="sr-only"
            />
            <span className="small-caps block text-[color:var(--color-ink-muted)]">
              {pack.name}
            </span>
            <span className="mt-2 block text-2xl font-semibold text-[color:var(--color-ink)]">
              {pack.price}
            </span>
            <span className="mt-1 block text-sm text-[color:var(--color-ink-muted)]">
              {pack.credits} {pack.credits === 1 ? "shoot" : "shoots"}
            </span>
          </label>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="small-caps text-[color:var(--color-ink-muted)]">Recipient email</span>
          <input
            type="email"
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
            maxLength={120}
            placeholder="mom@example.com"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--color-coral)]"
          />
        </label>
        <label className="block">
          <span className="small-caps text-[color:var(--color-ink-muted)]">Recipient name</span>
          <input
            type="text"
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
            maxLength={80}
            placeholder="Mom"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--color-coral)]"
          />
        </label>
      </div>

      <label className="block">
        <span className="small-caps text-[color:var(--color-ink-muted)]">Message</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={400}
          rows={3}
          placeholder="A little photo gift for you."
          className="mt-2 w-full resize-none rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[color:var(--color-coral)]"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-coral">
          {pending ? "Opening checkout..." : `Buy ${selectedPack.name} as gift`}
        </button>
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          You will be able to copy the code after payment.
        </p>
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] bg-white/70 px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
          {error}
        </p>
      )}
    </form>
  );
}
