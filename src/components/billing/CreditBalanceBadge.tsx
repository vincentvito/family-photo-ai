"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CreditBalanceBadge({
  balance,
  isProSubscriber = false,
  currentPeriodEnd = null,
}: {
  balance: number;
  isProSubscriber?: boolean;
  currentPeriodEnd?: string | null;
}) {
  const pathname = usePathname();
  const [currentBalance, setCurrentBalance] = useState(balance);
  const [proActive, setProActive] = useState(isProSubscriber);
  const [renewalDate, setRenewalDate] = useState(currentPeriodEnd);

  useEffect(() => {
    let cancelled = false;

    async function refreshBalance() {
      const res = await fetch("/api/credits/balance", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json().catch(() => null)) as {
        balance?: number;
        subscription?: { active?: boolean; currentPeriodEnd?: string | null };
      } | null;
      if (!cancelled && typeof data?.balance === "number") {
        setCurrentBalance(data.balance);
        setProActive(Boolean(data.subscription?.active));
        setRenewalDate(data.subscription?.currentPeriodEnd ?? null);
      }
    }

    refreshBalance();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3 py-2 text-sm shadow-[var(--shadow-sm)]"
        aria-label={`${currentBalance} ${currentBalance === 1 ? "shoot" : "shoots"} remaining`}
      >
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full ${
            currentBalance > 0 ? "bg-[color:var(--color-sage)]" : "bg-[color:var(--color-coral)]"
          }`}
          aria-hidden
        />
        <span className="small-caps hidden text-[color:var(--color-ink-muted)] sm:inline">
          Shoots
        </span>
        <span className="serif text-lg leading-none text-[color:var(--color-ink)]">
          {currentBalance}
        </span>
      </div>
      {proActive && (
        <span className="rounded-full border border-[color:var(--color-sage)] bg-[color:var(--color-bg-tinted-sage)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[color:var(--color-sage-deep)]">
          {currentBalance === 0 && renewalDate ? `Renews ${formatShortDate(renewalDate)}` : "Pro"}
        </span>
      )}
    </div>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
