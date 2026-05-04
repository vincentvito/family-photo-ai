import { Suspense } from "react";
import {
  getDefaultModel,
  getPlatformStats,
  getRecentGenerations,
  getRecentSignups,
} from "@/lib/admin-queries";
import DefaultModelPicker from "./DefaultModelPicker";

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
      sub:
        stats.generations.error > 0
          ? `${stats.generations.error} errored`
          : "all healthy",
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
          {c.sub && (
            <p className="mt-1 text-xs text-[color:var(--color-ink-muted)]">{c.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}

async function DefaultModelSection() {
  const defaultModel = await getDefaultModel();
  return <DefaultModelPicker initial={defaultModel} />;
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
