import { redirect } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import GiftRedeemForm from "@/components/billing/GiftRedeemForm";
import { getCurrentSession } from "@/lib/auth-helpers";
import { formatGiftCode, normalizeGiftCode } from "@/lib/gift-code";
import { getGiftCodePreview } from "@/lib/gift-queries";

export const dynamic = "force-dynamic";

export default async function RedeemGiftPage({ params }: { params: Promise<{ code: string }> }) {
  const [session, { code }] = await Promise.all([getCurrentSession(), params]);
  const normalizedCode = normalizeGiftCode(code);

  if (!session) {
    redirect(`/sign-in?next=${encodeURIComponent(`/redeem/${formatGiftCode(normalizedCode)}`)}`);
  }

  const gift = await getGiftCodePreview(normalizedCode);

  return (
    <main className="min-h-screen px-6 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <BrandLogo href="/" />
        <section className="mt-10 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-7 shadow-[var(--shadow-md)]">
          <span className="chip chip-sage">
            <span className="dot dot-sage" />
            Gift credits
          </span>
          <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] text-[color:var(--color-ink)] sm:text-5xl">
            Redeem your FamilyShoot gift
          </h1>

          {gift ? (
            <div className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-white/60 p-4">
              <p className="small-caps text-[color:var(--color-ink-muted)]">Gift preview</p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--color-ink)]">
                {gift.credits} {gift.credits === 1 ? "photo shoot" : "photo shoots"}
                {gift.recipientName ? ` for ${gift.recipientName}` : ""}
              </p>
              {gift.message && (
                <p className="mt-2 text-sm text-[color:var(--color-ink-muted)]">
                  &quot;{gift.message}&quot;
                </p>
              )}
              {gift.status !== "available" && (
                <p className="mt-3 text-sm font-semibold text-[color:var(--color-coral-deep)]">
                  This gift code is {gift.status}.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-white/60 p-4 text-sm text-[color:var(--color-ink-muted)]">
              We could not preview this code. You can still try redeeming it below.
            </p>
          )}

          <GiftRedeemForm initialCode={normalizedCode} />
        </section>
      </div>
    </main>
  );
}
