import Link from "next/link";
import { getCurrentSession } from "@/lib/auth-helpers";
import { claimGuestStudio } from "@/lib/guest-owner";
import {
  getCreditBalance,
  getCurrentSubscription,
  isActiveSubscriptionStatus,
} from "@/lib/billing-queries";
import AccountMenu from "@/components/auth/AccountMenu";
import BrandLogo from "@/components/brand/BrandLogo";
import CreditBalanceBadge from "@/components/billing/CreditBalanceBadge";
import StudioStepper from "@/components/studio/StudioStepper";
import GuestClaimCookieClearer from "@/components/studio/GuestClaimCookieClearer";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  const claimResult = session ? await claimGuestStudio(session.user.id) : { status: "none" };

  const [balance, subscription] = await Promise.all([
    session ? getCreditBalance(session.user.id) : Promise.resolve(0),
    session ? getCurrentSubscription(session.user.id) : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:gap-6 sm:px-8">
          <BrandLogo href="/" showLabelOnMobile className="shrink-0 pr-4 md:pr-6 lg:pr-8" />
          <StudioStepper />
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <CreditBalanceBadge
                  balance={balance}
                  isProSubscriber={isActiveSubscriptionStatus(subscription?.status)}
                  currentPeriodEnd={subscription?.currentPeriodEnd?.toISOString() ?? null}
                />
                <AccountSlot session={session} />
              </>
            ) : (
              <Link href="/sign-in?next=/studio/roster" className="btn btn-coral btn-sm">
                Sign in
              </Link>
            )}
          </div>
        </div>
        <div className="border-t border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/55">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-end gap-2 px-6 py-2 sm:px-8">
            <Link href="/studio/roster" className="btn btn-ghost btn-sm">
              Roster
            </Link>
            <Link href="/studio/album" className="btn btn-ghost btn-sm">
              Album
            </Link>
            {session && (
              <Link href="/studio/gifts" className="btn btn-ghost btn-sm">
                Gift credits
              </Link>
            )}
          </div>
        </div>
      </header>
      {claimResult.status === "claimed" && <GuestClaimCookieClearer />}
      <div>{children}</div>
    </div>
  );
}

function isSessionAdmin(session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>) {
  const role = (session.user as { role?: string | null }).role ?? "";
  return role
    .split(",")
    .map((r) => r.trim().toLowerCase())
    .includes("admin");
}

function AccountSlot({
  session,
}: {
  session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;
}) {
  const admin = isSessionAdmin(session);
  return <AccountMenu email={session.user.email} isAdmin={admin} />;
}
