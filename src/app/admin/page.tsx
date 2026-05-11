import { Suspense } from "react";
import Link from "next/link";
import {
  getCreditGrantStats,
  getCustomVibeSamples,
  getDefaultModel,
  getGiftCodeSalesStats,
  getPackageSalesStats,
  getPlatformStats,
  getPreviewFunnelStats,
  getRecentGenerations,
  getThemeRanking,
  getUsersPage,
} from "@/lib/admin-queries";
import DefaultModelPicker from "./DefaultModelPicker";
import CreditGrantForm from "./CreditGrantForm";

export const dynamic = "force-dynamic";

const ADMIN_TABS = [
  { id: "overview", label: "Overview", description: "Health and runtime controls." },
  { id: "previews", label: "Previews", description: "Free-preview funnel." },
  { id: "billing", label: "Billing", description: "Credits, sales, and grants." },
  { id: "content", label: "Content", description: "Themes and recent photoshoots." },
  { id: "users", label: "Users", description: "Recent signups." },
] as const;

type AdminTab = (typeof ADMIN_TABS)[number]["id"];

const MONEY_WHOLE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const MONEY_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatRelative(date: Date) {
  const ms = Date.now() - new Date(date).getTime();
  const min = Math.round(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

function formatMoney(cents: number) {
  return (cents % 100 === 0 ? MONEY_WHOLE : MONEY_CENTS).format(cents / 100);
}

function resolveTab(value: string | undefined): AdminTab {
  return ADMIN_TABS.some((tab) => tab.id === value) ? (value as AdminTab) : "overview";
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; page?: string }>;
}) {
  const params = await searchParams;
  const activeTab = resolveTab(params?.tab);
  const activeMeta = ADMIN_TABS.find((tab) => tab.id === activeTab) ?? ADMIN_TABS[0];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="serif text-3xl tracking-[-0.025em]">Overview</h1>
        <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">{activeMeta.description}</p>
        <AdminTabs activeTab={activeTab} />
      </section>

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "previews" && <PreviewsTab />}
      {activeTab === "billing" && <BillingTab />}
      {activeTab === "content" && <ContentTab />}
      {activeTab === "users" && <UsersTab pageParam={params?.page} />}
    </div>
  );
}

function AdminTabs({ activeTab }: { activeTab: AdminTab }) {
  return (
    <nav
      aria-label="Admin sections"
      className="mt-6 flex gap-2 overflow-x-auto rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-1"
    >
      {ADMIN_TABS.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={tab.id === "overview" ? "/admin" : `/admin?tab=${tab.id}`}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "shrink-0 rounded-[var(--radius-md)] bg-[color:var(--color-ink)] px-3.5 py-2 text-sm font-semibold text-[color:var(--color-bg)]"
                : "shrink-0 rounded-[var(--radius-md)] px-3.5 py-2 text-sm font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:bg-[color:var(--color-line)]/60 hover:text-[color:var(--color-ink)]"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-10">
      <section>
        <Suspense fallback={<StatsSkeleton />}>
          <StatsCards />
        </Suspense>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="serif text-xl tracking-[-0.02em]">Default model</h2>
        <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
          What everyone runs on unless an admin overrides per-shoot.
        </p>
        <div className="mt-5">
          <Suspense fallback={<div className="h-9 w-48 rounded bg-[color:var(--color-line)]/50" />}>
            <DefaultModelSection />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

function PreviewsTab() {
  return (
    <div className="space-y-10">
      <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="serif text-xl tracking-[-0.02em]">Preview funnel</h2>
            <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
              Watermarked previews and people generating before they buy.
            </p>
          </div>
          <span className="chip chip-coral">
            <span className="dot dot-coral" />
            Free preview
          </span>
        </div>
        <Suspense fallback={<PreviewFunnelSkeleton />}>
          <PreviewFunnelSection />
        </Suspense>
      </section>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-10">
      <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="serif text-xl tracking-[-0.02em]">Package sales</h2>
            <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
              Completed Stripe checkouts, grouped by pack.
            </p>
          </div>
          <span className="chip chip-sage">
            <span className="dot dot-sage" />
            Live billing
          </span>
        </div>
        <Suspense fallback={<PackageSalesSkeleton />}>
          <PackageSalesSection />
        </Suspense>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="serif text-xl tracking-[-0.02em]">Gift code sales</h2>
            <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
              Purchased gift codes, grouped by pack.
            </p>
          </div>
          <span className="chip chip-coral">
            <span className="dot dot-coral" />
            Gift purchases
          </span>
        </div>
        <Suspense fallback={<GiftSalesSkeleton />}>
          <GiftSalesSection />
        </Suspense>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="serif text-xl tracking-[-0.02em]">Complimentary credits</h2>
          <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
            Add test or support credits to an existing account by email.
          </p>
          <div className="mt-5">
            <CreditGrantForm />
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="serif text-xl tracking-[-0.02em]">Recent credit grants</h2>
          <Suspense fallback={<ListSkeleton />}>
            <CreditGrantsList />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

function ContentTab() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="serif text-xl tracking-[-0.02em]">Vibe ranking</h2>
              <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
                Most-picked themes across all shoots.
              </p>
            </div>
          </div>
          <Suspense fallback={<ListSkeleton />}>
            <ThemeRankingList />
          </Suspense>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
          <div>
            <h2 className="serif text-xl tracking-[-0.02em]">Custom vibes</h2>
            <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
              What people describe when no preset fits.
            </p>
          </div>
          <Suspense fallback={<ListSkeleton />}>
            <CustomVibesList />
          </Suspense>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="serif text-xl tracking-[-0.02em]">Recent shoots</h2>
        <Suspense fallback={<ListSkeleton />}>
          <ShootsList />
        </Suspense>
      </section>
    </div>
  );
}

function UsersTab({ pageParam }: { pageParam?: string }) {
  const page = Math.max(1, Number(pageParam ?? 1) || 1);
  return (
    <section className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
      <h2 className="serif text-xl tracking-[-0.02em]">Users</h2>
      <Suspense fallback={<ListSkeleton />}>
        <UsersList page={page} />
      </Suspense>
    </section>
  );
}

async function PackageSalesSection() {
  const sales = await getPackageSalesStats();
  const totals = [
    {
      label: "Estimated revenue",
      value: formatMoney(sales.totals.estimatedRevenueCents),
      sub: "before Stripe fees",
    },
    {
      label: "Packages sold",
      value: sales.totals.packagesSold.toLocaleString(),
      sub:
        sales.totals.refundedPackages > 0
          ? `${sales.totals.refundedPackages} refunded`
          : "no refunds",
    },
    {
      label: "Credits sold",
      value: sales.totals.creditsSold.toLocaleString(),
      sub: "available photos purchased",
    },
  ];

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {totals.map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-4"
          >
            <div className="small-caps text-[color:var(--color-ink-muted)]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
              {item.value}
            </div>
            <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)] text-xs text-[color:var(--color-ink-muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Pack</th>
              <th className="px-4 py-3 text-right font-semibold">Sold</th>
              <th className="px-4 py-3 text-right font-semibold">Credits</th>
              <th className="px-4 py-3 text-right font-semibold">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-line)]">
            {sales.packs.map((pack) => (
              <tr key={pack.packId}>
                <td className="px-4 py-3">
                  <div className="font-medium">{pack.name}</div>
                  <div className="text-xs text-[color:var(--color-ink-muted)]">{pack.packId}</div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {pack.packagesSold.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {pack.creditsSold.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatMoney(pack.estimatedRevenueCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function GiftSalesSection() {
  const gifts = await getGiftCodeSalesStats();
  const totals = [
    {
      label: "Gift revenue",
      value: formatMoney(gifts.totals.estimatedRevenueCents),
      sub: "before Stripe fees",
    },
    {
      label: "Gift codes sold",
      value: gifts.totals.giftCodesSold.toLocaleString(),
      sub: gifts.totals.refunded > 0 ? `${gifts.totals.refunded} refunded` : "excluding refunds",
    },
    {
      label: "Redeemed",
      value: gifts.totals.redeemed.toLocaleString(),
      sub: `${gifts.totals.creditsGifted.toLocaleString()} credits gifted`,
    },
  ];

  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        {totals.map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-4"
          >
            <div className="small-caps text-[color:var(--color-ink-muted)]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
              {item.value}
            </div>
            <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)] text-xs text-[color:var(--color-ink-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Pack</th>
                <th className="px-4 py-3 text-right font-semibold">Sold</th>
                <th className="px-4 py-3 text-right font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-line)]">
              {gifts.packs.map((pack) => (
                <tr key={pack.packId}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{pack.name}</div>
                    <div className="text-xs text-[color:var(--color-ink-muted)]">
                      {pack.creditsGifted.toLocaleString()} credits
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {pack.giftCodesSold.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatMoney(pack.estimatedRevenueCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]">
          <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-4 py-3">
            <h3 className="text-sm font-semibold">Recent gift codes</h3>
          </div>
          <ul className="divide-y divide-[color:var(--color-line)]">
            {gifts.recent.length === 0 && (
              <li className="px-4 py-4 text-sm text-[color:var(--color-ink-muted)]">
                No gift codes purchased yet.
              </li>
            )}
            {gifts.recent.map((gift) => (
              <li key={gift.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <code className="truncate text-xs font-semibold tracking-[0.08em]">
                    {gift.code}
                  </code>
                  <span className="shrink-0 text-xs text-[color:var(--color-ink-faint)]">
                    {formatRelative(gift.createdAt)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[color:var(--color-ink-muted)]">
                  {gift.packName} · {formatMoney(gift.estimatedRevenueCents)} · {gift.status}
                </div>
                <div className="mt-1 truncate text-xs text-[color:var(--color-ink-faint)]">
                  Buyer {gift.buyerEmail ?? "unknown"}
                  {gift.recipientEmail ? ` · For ${gift.recipientEmail}` : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

async function PreviewFunnelSection() {
  const stats = await getPreviewFunnelStats();
  const totalPreviewGenerations = stats.previews.generations + stats.convertedPreviews.generations;
  const unlockRate =
    totalPreviewGenerations === 0
      ? 0
      : Math.round((stats.convertedPreviews.generations / totalPreviewGenerations) * 100);
  const cards = [
    {
      label: "Watermarked images",
      value: stats.previews.images,
      sub: `${stats.previews.generations.toLocaleString()} unpaid previews`,
    },
    {
      label: "Previewing users",
      value: stats.previews.users,
      sub: `${stats.previews.usersWithoutPurchase.toLocaleString()} have not bought`,
    },
    {
      label: "Last 7 days",
      value: stats.previews.last7Days,
      sub: `${stats.previews.usersWithoutPurchaseLast7Days.toLocaleString()} no-purchase users`,
    },
    {
      label: "Unlocked previews",
      value: stats.convertedPreviews.generations,
      sub: `${stats.convertedPreviews.users.toLocaleString()} users, ${unlockRate}% preview unlock rate`,
    },
  ];

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-4"
          >
            <div className="small-caps text-[color:var(--color-ink-muted)]">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
              {item.value.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">{item.sub}</p>
          </div>
        ))}
        <p className="text-xs leading-relaxed text-[color:var(--color-ink-muted)] sm:col-span-2">
          These counts use the persisted free-preview flag, so old test rows without credit usage
          are not treated as watermarked previews.
        </p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]">
        <div className="border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-4 py-3">
          <h3 className="text-sm font-semibold">Recent unpaid previews</h3>
        </div>
        <ul className="divide-y divide-[color:var(--color-line)]">
          {stats.recentPreviews.length === 0 && (
            <li className="px-4 py-4 text-sm text-[color:var(--color-ink-muted)]">
              No unpaid previews yet.
            </li>
          )}
          {stats.recentPreviews.map((preview) => (
            <li key={preview.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {preview.email ?? "Unknown user"}
                </div>
                <div className="text-xs text-[color:var(--color-ink-muted)]">
                  {preview.themeId}
                  {" · "}
                  {preview.imageCount} {preview.imageCount === 1 ? "image" : "images"}
                  {" · "}
                  <span
                    className={
                      preview.status === "done"
                        ? "text-[color:var(--color-sage-deep)]"
                        : preview.status === "error"
                          ? "text-[color:var(--color-coral-deep)]"
                          : ""
                    }
                  >
                    {preview.status}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-xs text-[color:var(--color-ink-faint)]">
                {formatRelative(preview.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

async function StatsCards() {
  const stats = await getPlatformStats();
  const cards = [
    {
      label: "Signups today",
      value: stats.users.today,
      sub: `${stats.users.last7Days} in the last 7 days`,
    },
    { label: "Total users", value: stats.users.total, sub: null },
    {
      label: "Shoots today",
      value: stats.generations.today,
      sub: `${stats.generations.last7Days} in the last 7 days`,
    },
    {
      label: "Total shoots",
      value: stats.generations.total,
      sub: stats.generations.error > 0 ? `${stats.generations.error} errored` : "all healthy",
    },
    {
      label: "In progress",
      value: stats.generations.pending,
      sub: stats.generations.pending > 0 ? "currently polling" : "queue clear",
    },
    { label: "Images generated", value: stats.images.total, sub: null },
  ];

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)]"
        >
          <div className="small-caps text-[color:var(--color-ink-muted)]">{c.label}</div>
          <div className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
            {c.value.toLocaleString()}
          </div>
          {c.sub && <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">{c.sub}</p>}
        </div>
      ))}
    </div>
  );
}

async function DefaultModelSection() {
  const defaultModel = await getDefaultModel();
  return <DefaultModelPicker initial={defaultModel} />;
}

async function CreditGrantsList() {
  const grants = await getCreditGrantStats(8);
  return (
    <div className="mt-4">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-4">
        <div className="small-caps text-[color:var(--color-ink-muted)]">Total granted</div>
        <div className="mt-2 text-2xl font-semibold tabular-nums">
          {grants.totalGranted.toLocaleString()} credits
        </div>
      </div>
      <ul className="mt-4 divide-y divide-[color:var(--color-line)]">
        {grants.recent.length === 0 && (
          <li className="py-3 text-sm text-[color:var(--color-ink-muted)]">
            No complimentary credits yet.
          </li>
        )}
        {grants.recent.map((grant) => (
          <li key={grant.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{grant.email ?? "Unknown user"}</div>
              <div className="text-xs text-[color:var(--color-ink-muted)]">
                +{grant.credits} {grant.credits === 1 ? "credit" : "credits"}
                {grant.reason ? ` · ${grant.reason}` : ""}
              </div>
            </div>
            <span className="text-xs text-[color:var(--color-ink-faint)]">
              {formatRelative(grant.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function UsersList({ page }: { page: number }) {
  const result = await getUsersPage(page, 20);
  const previousPage = Math.max(1, result.page - 1);
  const nextPage = Math.min(result.totalPages, result.page + 1);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg)] px-4 py-3 text-sm">
        <span className="text-[color:var(--color-ink-muted)]">
          {result.total.toLocaleString()} total users
        </span>
        <span className="font-medium tabular-nums">
          Page {result.page.toLocaleString()} of {result.totalPages.toLocaleString()}
        </span>
      </div>

      <ul className="mt-4 divide-y divide-[color:var(--color-line)]">
        {result.users.length === 0 && (
          <li className="py-3 text-sm text-[color:var(--color-ink-muted)]">No users yet.</li>
        )}
        {result.users.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{u.email}</div>
              <div className="text-xs text-[color:var(--color-ink-muted)]">
                {u.name || "-"}
                {u.role?.toLowerCase() === "admin" && (
                  <span className="ml-2 chip chip-coral">admin</span>
                )}
              </div>
            </div>
            <span className="text-xs text-[color:var(--color-ink-faint)]">
              {formatRelative(u.createdAt)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {result.page > 1 ? (
          <Link href={`/admin?tab=users&page=${previousPage}`} className="btn btn-ghost btn-sm">
            Previous
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="btn btn-ghost btn-sm pointer-events-none opacity-45"
          >
            Previous
          </span>
        )}
        {result.page < result.totalPages ? (
          <Link href={`/admin?tab=users&page=${nextPage}`} className="btn btn-ghost btn-sm">
            Next
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="btn btn-ghost btn-sm pointer-events-none opacity-45"
          >
            Next
          </span>
        )}
      </div>
    </div>
  );
}
async function ShootsList() {
  const generations = await getRecentGenerations(10);
  return (
    <ul className="mt-4 divide-y divide-[color:var(--color-line)]">
      {generations.length === 0 && (
        <li className="py-3 text-sm text-[color:var(--color-ink-muted)]">No shoots yet.</li>
      )}
      {generations.map((g) => (
        <li key={g.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{g.themeId}</div>
            <div className="text-xs text-[color:var(--color-ink-muted)]">
              {g.model || "—"}
              {" · "}
              <span
                className={
                  g.status === "done"
                    ? "text-[color:var(--color-sage-deep)]"
                    : g.status === "error"
                      ? "text-[color:var(--color-coral-deep)]"
                      : ""
                }
              >
                {g.status}
              </span>
              {g.errorMessage && (
                <span className="text-[color:var(--color-coral-deep)]">
                  {" · "}
                  {g.errorMessage.slice(0, 60)}
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-[color:var(--color-ink-faint)]">
            {formatRelative(g.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}

async function ThemeRankingList() {
  const ranking = await getThemeRanking(20);
  if (ranking.length === 0) {
    return <p className="mt-4 text-sm text-[color:var(--color-ink-muted)]">No shoots yet.</p>;
  }
  const max = ranking[0].count || 1;
  return (
    <ul className="mt-4 space-y-2">
      {ranking.map((row, idx) => {
        const pct = Math.max(4, Math.round((row.count / max) * 100));
        return (
          <li key={row.themeId} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <div className="min-w-0 truncate">
                <span className="text-[color:var(--color-ink-faint)] tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>{" "}
                <span className="font-medium">{row.name}</span>
                {row.category === "custom" && <span className="ml-2 chip chip-coral">custom</span>}
                {row.category === "card" && <span className="ml-2 chip chip-sage">card</span>}
                {row.category === "stylized" && (
                  <span className="ml-2 chip chip-sage">stylized</span>
                )}
              </div>
              <div className="flex shrink-0 items-baseline gap-3 tabular-nums">
                <span className="font-semibold">{row.count.toLocaleString()}</span>
                {row.lastUsedAt && (
                  <span className="text-xs text-[color:var(--color-ink-faint)]">
                    {formatRelative(row.lastUsedAt)}
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--color-line)]/50">
              <div className="h-full bg-[color:var(--color-ink)]/70" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

async function CustomVibesList() {
  const samples = await getCustomVibeSamples(25);
  if (samples.length === 0) {
    return (
      <p className="mt-4 text-sm text-[color:var(--color-ink-muted)]">
        No custom vibes submitted yet.
      </p>
    );
  }
  return (
    <ul className="mt-4 max-h-[28rem] divide-y divide-[color:var(--color-line)] overflow-y-auto pr-1">
      {samples.map((s) => (
        <li key={s.id} className="py-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{s.description}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--color-ink-faint)]">
            <span>{formatRelative(s.createdAt)}</span>
            <span>·</span>
            <span
              className={
                s.status === "done"
                  ? "text-[color:var(--color-sage-deep)]"
                  : s.status === "error"
                    ? "text-[color:var(--color-coral-deep)]"
                    : ""
              }
            >
              {s.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatsSkeleton() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/40"
        />
      ))}
    </div>
  );
}

function PackageSalesSkeleton() {
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-[var(--radius-lg)] bg-[color:var(--color-line)]/40"
          />
        ))}
      </div>
      <div className="h-56 rounded-[var(--radius-lg)] bg-[color:var(--color-line)]/40" />
    </div>
  );
}

function GiftSalesSkeleton() {
  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-[var(--radius-lg)] bg-[color:var(--color-line)]/40"
          />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-56 rounded-[var(--radius-lg)] bg-[color:var(--color-line)]/40" />
        <div className="h-56 rounded-[var(--radius-lg)] bg-[color:var(--color-line)]/40" />
      </div>
    </div>
  );
}

function PreviewFunnelSkeleton() {
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-[var(--radius-lg)] bg-[color:var(--color-line)]/40"
          />
        ))}
      </div>
      <div className="h-64 rounded-[var(--radius-lg)] bg-[color:var(--color-line)]/40" />
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="mt-4 divide-y divide-[color:var(--color-line)]">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="py-3">
          <div className="h-4 w-2/3 rounded bg-[color:var(--color-line)]/60" />
          <div className="mt-2 h-3 w-1/3 rounded bg-[color:var(--color-line)]/40" />
        </li>
      ))}
    </ul>
  );
}
