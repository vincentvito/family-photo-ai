"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CreditBalanceBadge({ balance }: { balance: number }) {
  const pathname = usePathname();
  const [currentBalance, setCurrentBalance] = useState(balance);

  useEffect(() => {
    let cancelled = false;

    async function refreshBalance() {
      const res = await fetch("/api/credits/balance", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json().catch(() => null)) as { balance?: number } | null;
      if (!cancelled && typeof data?.balance === "number") {
        setCurrentBalance(data.balance);
      }
    }

    refreshBalance();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3 py-2 text-sm shadow-[var(--shadow-sm)]"
      aria-label={`${currentBalance} photo credits remaining`}
    >
      <span
        className={`inline-flex h-2.5 w-2.5 rounded-full ${
          currentBalance > 0 ? "bg-[color:var(--color-sage)]" : "bg-[color:var(--color-coral)]"
        }`}
        aria-hidden
      />
      <span className="small-caps hidden text-[color:var(--color-ink-muted)] sm:inline">
        Credits
      </span>
      <span className="serif text-lg leading-none text-[color:var(--color-ink)]">
        {currentBalance}
      </span>
    </div>
  );
}
