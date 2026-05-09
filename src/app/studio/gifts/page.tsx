import { redirect } from "next/navigation";
import GiftCheckoutForm from "@/components/billing/GiftCheckoutForm";
import GiftCodeCopyButton from "@/components/billing/GiftCodeCopyButton";
import GiftRedeemForm from "@/components/billing/GiftRedeemForm";
import { getCurrentSession } from "@/lib/auth-helpers";
import { formatGiftCode } from "@/lib/gift-code";
import { getGiftCodesForBuyer } from "@/lib/gift-queries";

export const dynamic = "force-dynamic";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(
  /\/$/,
  "",
);

export default async function GiftsPage({
  searchParams,
}: {
  searchParams?: Promise<{ gift?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/studio/gifts");

  const params = await searchParams;
  const gifts = await getGiftCodesForBuyer(session.user.id);

  return (
    <main className="px-6 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <span className="chip chip-coral">
            <span className="dot dot-coral" />
            Gift credits
          </span>
          <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] text-[color:var(--color-ink)] sm:text-6xl">
            Gifts and redeem codes
          </h1>
          <p className="mt-4 text-[color:var(--color-ink-muted)]">
            Redeem a code you received, or buy photo-shoot credits for someone else.
          </p>
        </div>

        {params?.gift === "success" && (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-[color:var(--color-sage)] bg-[color:var(--color-bg-tinted-sage)] px-5 py-4 text-sm font-medium text-[color:var(--color-sage-deep)]">
            Gift payment received. Your new code will appear here as soon as Stripe confirms the
            checkout.
          </div>
        )}

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-7 shadow-[var(--shadow-sm)]">
            <p className="small-caps text-[color:var(--color-ink-muted)]">Redeem</p>
            <h2 className="serif mt-3 text-3xl tracking-[-0.02em]">Use a gift code</h2>
            <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
              Paste the code from a gift link, text, email, or card.
            </p>
            <GiftRedeemForm />
          </section>

          <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-coral)] p-7 shadow-[var(--shadow-sm)]">
            <p className="small-caps text-[color:var(--color-ink-muted)]">Buy</p>
            <h2 className="serif mt-3 text-3xl tracking-[-0.02em]">
              Buy gift credits for someone else
            </h2>
            <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
              After payment, the code stays available here so you can copy it anytime.
            </p>
            <GiftCheckoutForm />
          </section>
        </div>

        <section className="mt-5 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-7 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="small-caps text-[color:var(--color-ink-muted)]">Purchased</p>
              <h2 className="serif mt-3 text-3xl tracking-[-0.02em]">Gift codes you bought</h2>
            </div>
            <span className="rounded-full bg-[color:var(--color-bg-tinted-sage)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--color-sage-deep)]">
              {gifts.length} total
            </span>
          </div>

          {gifts.length === 0 ? (
            <p className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-line)] bg-white/50 px-4 py-5 text-sm text-[color:var(--color-ink-muted)]">
              No gift codes yet. Buy one above and it will stay here.
            </p>
          ) : (
            <div className="mt-5 divide-y divide-[color:var(--color-line)] overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-white/60">
              {gifts.map((gift) => {
                const formattedCode = formatGiftCode(gift.code);
                const redeemPath = `/redeem/${formattedCode}`;
                const redeemUrl = APP_URL ? `${APP_URL}${redeemPath}` : redeemPath;
                return (
                  <div key={gift.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <code className="rounded-[var(--radius-md)] bg-[color:var(--color-ink)] px-3 py-1.5 text-sm font-bold tracking-[0.12em] text-white">
                          {formattedCode}
                        </code>
                        <span className={giftStatusClassName(gift.status)}>
                          {gift.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[color:var(--color-ink)]">
                        {gift.credits} {gift.credits === 1 ? "shoot" : "shoots"}
                        {gift.recipientEmail ? ` for ${gift.recipientEmail}` : ""}
                      </p>
                      {gift.message && (
                        <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
                          &quot;{gift.message}&quot;
                        </p>
                      )}
                      <p className="mt-2 text-xs font-medium text-[color:var(--color-ink-muted)]">
                        Purchased {formatDate(gift.createdAt)}
                        {gift.redeemedAt ? ` - Redeemed ${formatDate(gift.redeemedAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                      <GiftCodeCopyButton value={formattedCode} label="Copy code" />
                      <GiftCodeCopyButton value={redeemUrl} label="Copy link" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    value,
  );
}

function giftStatusClassName(status: string) {
  const base = "rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]";
  if (status === "available") {
    return `${base} bg-[color:var(--color-bg-tinted-sage)] text-[color:var(--color-sage-deep)]`;
  }
  if (status === "redeemed") {
    return `${base} bg-[color:var(--color-bg-tinted-coral)] text-[color:var(--color-coral-deep)]`;
  }
  return `${base} bg-white text-[color:var(--color-ink-muted)]`;
}
