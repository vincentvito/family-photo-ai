import { redirect } from "next/navigation";
import Link from "next/link";
import CheckoutButton from "@/components/billing/CheckoutButton";
import ManageBillingButton from "@/components/billing/ManageBillingButton";
import { getCurrentSession } from "@/lib/auth-helpers";
import {
  getCreditBalance,
  getCreditsUsedInCurrentPeriod,
  getCurrentSubscription,
  isActiveSubscriptionStatus,
} from "@/lib/billing-queries";
import { PRO_PLAN } from "@/lib/pricing-packs";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  const balancePromise = getCreditBalance(session.user.id);
  const subscriptionPromise = getCurrentSubscription(session.user.id);
  const usedThisPeriodPromise = subscriptionPromise.then((subscription) =>
    getCreditsUsedInCurrentPeriod(session.user.id, subscription),
  );
  const [balance, subscription, usedThisPeriod] = await Promise.all([
    balancePromise,
    subscriptionPromise,
    usedThisPeriodPromise,
  ]);
  const active = isActiveSubscriptionStatus(subscription?.status);
  const attention = needsPaymentAttention(subscription?.status);

  return (
    <main className="px-6 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <span className="chip chip-sage">
            <span className="dot dot-sage" />
            Billing
          </span>
          <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] text-[color:var(--color-ink)] sm:text-6xl">
            Account and Pro plan
          </h1>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-7 shadow-[var(--shadow-md)]">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="small-caps text-[color:var(--color-ink-muted)]">{PRO_PLAN.name}</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="serif text-6xl leading-none tracking-[-0.035em]">
                    {PRO_PLAN.price}
                  </span>
                  <span className="text-sm font-semibold text-[color:var(--color-ink-muted)]">
                    /month
                  </span>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${
                  active
                    ? "bg-[color:var(--color-sage-soft)] text-[color:var(--color-sage-deep)]"
                    : "bg-[color:var(--color-bg-tinted-coral)] text-[color:var(--color-coral-deep)]"
                }`}
              >
                {subscriptionStatusLabel(subscription?.status, active)}
              </span>
            </div>

            {attention && (
              <div className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-coral-soft)] bg-white/70 px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
                Payment needs attention. Open Stripe billing to update the payment method or resolve
                the invoice.
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Shoots available" value={String(balance)} />
              <Metric label="Monthly shoots" value={String(PRO_PLAN.credits)} />
              <Metric label="Shoots used" value={active ? String(usedThisPeriod) : "Pending"} />
              <Metric
                label={subscription?.cancelAtPeriodEnd ? "Ends" : "Renews"}
                value={formatDate(subscription?.currentPeriodEnd)}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio/roster" className="btn btn-coral">
                Back to roster
              </Link>
              {active ? (
                <ManageBillingButton className="btn btn-sage" />
              ) : subscription ? (
                <ManageBillingButton className="btn btn-sage" />
              ) : (
                <CheckoutButton
                  planId={PRO_PLAN.id}
                  className="btn btn-sage"
                  pendingLabel="Opening subscription..."
                >
                  Subscribe monthly
                </CheckoutButton>
              )}
              <Link href="/studio/roster" className="btn btn-ghost">
                Buy one-time pack
              </Link>
            </div>
          </section>

          <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-sage)] p-7 shadow-[var(--shadow-sm)]">
            <p className="small-caps text-[color:var(--color-ink-muted)]">Included</p>
            <ul className="mt-5 space-y-3 text-sm text-[color:var(--color-ink)]">
              {[
                "Monthly credits for portraits, cards, invitations, and seasonal moments",
                "Downloadable, print-ready files",
                "Priority access to new styles and templates",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-sage)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-white/55 p-4">
      <p className="small-caps text-[color:var(--color-ink-muted)]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[color:var(--color-ink)]">{value}</p>
    </div>
  );
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    value,
  );
}

function needsPaymentAttention(status: string | null | undefined) {
  return status === "past_due" || status === "unpaid" || status === "incomplete";
}

function subscriptionStatusLabel(status: string | null | undefined, active: boolean) {
  if (active) return "Active";
  if (!status) return "Not subscribed";
  if (needsPaymentAttention(status)) return "Payment due";
  return status.replace(/_/g, " ");
}
