import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BrandLogo from "@/components/brand/BrandLogo";
import CheckoutButton from "@/components/billing/CheckoutButton";
import { getCurrentSession } from "@/lib/auth-helpers";
import { checkoutResumePath, parseCheckoutIntent } from "@/lib/checkout-intent";
import { localizePath } from "@/lib/i18n/locales";
import { getRequestLocale } from "@/lib/i18n/server";
import { getPricingPack, PRO_PLAN } from "@/lib/pricing-packs";

export const metadata: Metadata = {
  title: "Your checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getRequestLocale();
  const intent = parseCheckoutIntent(await searchParams);
  if (!intent) redirect(localizePath("/#pricing", locale));

  const session = await getCurrentSession();
  if (!session) {
    const next = localizePath(checkoutResumePath(intent), locale);
    redirect(localizePath(`/sign-in?next=${encodeURIComponent(next)}`, locale));
  }

  const product = intent.planId ? PRO_PLAN : getPricingPack(intent.packId!)!;
  const backPath = intent.unlockGenerationId
    ? `/studio/generate/${encodeURIComponent(intent.unlockGenerationId)}`
    : "/#pricing";

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-8 sm:py-14">
      <BrandLogo href={localizePath("/", locale)} />
      <section className="mt-10 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
        <span className="chip chip-sage">Your selection is saved</span>
        <h1 className="serif mt-4 text-4xl leading-tight tracking-[-0.025em]">Almost yours.</h1>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
          {intent.unlockGenerationId
            ? "Your portraits are waiting. After payment, we’ll take you straight back to your unlocked photoshoot."
            : "We’re opening your secure checkout. You’ll review your order before paying."}
        </p>
        <div className="my-6 flex items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-[color:var(--color-bg)] p-4">
          <div>
            <p className="font-semibold">
              {product.name}
              {intent.gift ? " · Gift" : ""}
            </p>
            <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">
              {intent.planId ? "Monthly subscription" : "One-time payment"}
            </p>
          </div>
          <p className="serif text-3xl">
            {product.price}
            {intent.planId ? "/mo" : ""}
          </p>
        </div>
        <CheckoutButton {...intent} autoStart className="btn btn-coral w-full">
          Continue to secure checkout
        </CheckoutButton>
        <Link
          href={localizePath(backPath, locale)}
          className="mt-5 block text-center text-sm font-semibold text-[color:var(--color-ink-muted)] underline underline-offset-4"
        >
          {intent.unlockGenerationId ? "Back to my portraits" : "Back to pricing"}
        </Link>
      </section>
    </main>
  );
}
