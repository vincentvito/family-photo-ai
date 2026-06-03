"use client";

import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";

export default function ImpersonationBanner() {
  const { data } = authClient.useSession();
  const [pending, start] = useTransition();

  // `impersonatedBy` is set by Better Auth's admin plugin only while an admin
  // is impersonating another user. Hidden for all normal sessions.
  const impersonatedBy = (data?.session as { impersonatedBy?: string | null } | undefined)
    ?.impersonatedBy;
  if (!impersonatedBy) return null;

  function stop() {
    start(async () => {
      await authClient.admin.stopImpersonating();
      // Full navigation so server components pick up the restored admin session.
      window.location.href = "/admin?tab=users";
    });
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 bg-[color:var(--color-coral-deep)] px-4 py-2 text-sm font-medium text-white shadow-md">
      <span className="truncate">
        Impersonating <strong>{data?.user?.email}</strong>
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={stop}
        className="shrink-0 rounded-[var(--radius-md)] bg-white/20 px-3 py-1 font-semibold transition-colors hover:bg-white/30 disabled:opacity-60"
      >
        {pending ? "Stopping..." : "Stop impersonating"}
      </button>
    </div>
  );
}
