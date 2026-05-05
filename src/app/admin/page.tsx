import { Suspense } from "react";
import {
  getCreditGrantStats,
  getCustomVibeSamples,
  getDefaultModel,
  getPackageSalesStats,
  getPlatformStats,
  getRecentGenerations,
  getRecentSignups,
  getThemeRanking,
} from "@/lib/admin-queries";
import DefaultModelPicker from "./DefaultModelPicker";
import CreditGrantForm from "./CreditGrantForm";

export const dynamic = "force-dynamic";

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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="serif text-3xl tracking-[-0.025em]">Overview</h1>
        <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
          Platform-wide stats and runtime controls.
        </p>

        <Suspense fallback={<StatsSkeleton />}>
          <StatsCards />
        </Suspense>
      </section>

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

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="serif text-xl tracking-[-0.02em]">Recent signups</h2>
          <Suspense fallback={<ListSkeleton />}>
            <SignupsList />
          </Suspense>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="serif text-xl tracking-[-0.02em]">Recent shoots</h2>
          <Suspense fallback={<ListSkeleton />}>
            <ShootsList />
          </Suspense>
        </div>
      </section>
    </div>
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
      sub: "available shoots purchased",
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

async function SignupsList() {
  const signups = await getRecentSignups(10);
  return (
    <ul className="mt-4 divide-y divide-[color:var(--color-line)]">
      {signups.length === 0 && (
        <li className="py-3 text-sm text-[color:var(--color-ink-muted)]">No signups yet.</li>
      )}
      {signups.map((u) => (
        <li key={u.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{u.email}</div>
            <div className="text-xs text-[color:var(--color-ink-muted)]">
              {u.name || "—"}
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
    return (
      <p className="mt-4 text-sm text-[color:var(--color-ink-muted)]">No shoots yet.</p>
    );
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
                {row.category === "custom" && (
                  <span className="ml-2 chip chip-coral">custom</span>
                )}
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
              <div
                className="h-full bg-[color:var(--color-ink)]/70"
                style={{ width: `${pct}%` }}
              />
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
