"use client";

import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function ImpersonateButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function impersonate() {
    setError(null);
    start(async () => {
      const { error } = await authClient.admin.impersonateUser({ userId });
      if (error) {
        setError(error.message || "Could not start impersonation.");
        setConfirmOpen(false);
        return;
      }
      // Full navigation so server components pick up the swapped session cookie.
      window.location.href = "/studio/roster";
    });
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            setConfirmOpen(true);
          }}
          className="btn btn-ghost btn-sm"
        >
          {pending ? "Starting..." : "Impersonate"}
        </button>
        {error && (
          <span className="max-w-48 text-right text-xs text-[color:var(--color-coral-deep)]">
            {error}
          </span>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Impersonate ${email}?`}
        description="You will be signed in as this user and see the app exactly as they do. Use the banner at the top to stop and return to your admin account."
        confirmLabel="Impersonate"
        cancelLabel="Cancel"
        tone="coral"
        pending={pending}
        onConfirm={impersonate}
        onCancel={() => {
          if (!pending) setConfirmOpen(false);
        }}
      />
    </>
  );
}
