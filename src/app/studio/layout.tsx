import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-helpers";
import {
  getCreditBalance,
  getCurrentSubscription,
  isActiveSubscriptionStatus,
} from "@/lib/billing-queries";
import AccountMenu from "@/components/auth/AccountMenu";
import BrandLogo from "@/components/brand/BrandLogo";
import CreditBalanceBadge from "@/components/billing/CreditBalanceBadge";
import StudioStepper from "@/components/studio/StudioStepper";
import { getMessages, localizePath } from "@/lib/i18n/locales";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale).Studio;
  const session = await getCurrentSession();

  if (!session) {
    redirect(localizePath("/sign-in", locale));
  }

  const [balance, subscription] = await Promise.all([
    getCreditBalance(session.user.id),
    getCurrentSubscription(session.user.id),
  ]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:gap-6 sm:px-8">
          <BrandLogo
            href={localizePath("/", locale)}
            showLabelOnMobile
            className="shrink-0 pr-4 md:pr-6 lg:pr-8"
          />
          <StudioStepper />
          <div className="flex items-center gap-3">
            <CreditBalanceBadge
              balance={balance}
              isProSubscriber={isActiveSubscriptionStatus(subscription?.status)}
              currentPeriodEnd={subscription?.currentPeriodEnd?.toISOString() ?? null}
            />
            <AccountSlot session={session} />
          </div>
        </div>
        <div className="border-t border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/55">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-end gap-2 px-6 py-2 sm:px-8">
            <Link href={localizePath("/studio/roster", locale)} className="btn btn-ghost btn-sm">
              {messages.roster}
            </Link>
            <Link href={localizePath("/studio/album", locale)} className="btn btn-ghost btn-sm">
              {messages.album}
            </Link>
            <Link href={localizePath("/studio/gifts", locale)} className="btn btn-ghost btn-sm">
              {messages.giftCredits}
            </Link>
          </div>
        </div>
      </header>
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
