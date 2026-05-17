"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function UserAdminRoleButton({
  userId,
  email,
  isAdmin,
}: {
  userId: string;
  email: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const nextAdmin = !isAdmin;

  function saveRole() {
    setError(null);
    start(async () => {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, admin: nextAdmin }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || `Could not update role (${res.status}).`);
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      router.refresh();
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
          className={isAdmin ? "btn btn-ghost btn-sm" : "btn btn-coral btn-sm"}
        >
          {pending ? "Updating..." : isAdmin ? "Remove admin" : "Make admin"}
        </button>
        {error && (
          <span className="max-w-48 text-right text-xs text-[color:var(--color-coral-deep)]">
            {error}
          </span>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={nextAdmin ? `Make ${email} an admin?` : `Remove admin access for ${email}?`}
        description={
          nextAdmin
            ? "They will be able to access this dashboard and change admin settings."
            : "They will lose access to this dashboard after their role is updated."
        }
        confirmLabel={nextAdmin ? "Make admin" : "Remove admin"}
        cancelLabel="Cancel"
        tone={nextAdmin ? "coral" : "danger"}
        pending={pending}
        onConfirm={saveRole}
        onCancel={() => {
          if (!pending) setConfirmOpen(false);
        }}
      />
    </>
  );
}
