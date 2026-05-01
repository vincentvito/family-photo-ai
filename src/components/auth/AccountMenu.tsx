"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AccountMenu({ email }: { email: string }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const initial = email.trim().charAt(0).toUpperCase() || "F";

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="spring-press flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-line-strong)] bg-[color:var(--color-coral)] text-sm font-bold text-white shadow-[var(--shadow-sm)] transition-transform hover:shadow-[var(--shadow-md)]"
        aria-label="Open account menu"
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.55rem)] w-64 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-2 shadow-[var(--shadow-lg)]">
          <div className="px-3 py-3">
            <p className="small-caps text-[color:var(--color-ink-muted)]">Signed in</p>
            <p className="mt-1 truncate text-sm font-medium text-[color:var(--color-ink)]">
              {email}
            </p>
          </div>

          <div className="h-px bg-[color:var(--color-line)]" />

          <Link
            href="/studio/album"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-bg-tinted-sage)]"
          >
            Album
          </Link>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-bg-tinted-sage)]"
          >
            Home
          </Link>

          <button
            type="button"
            disabled={pending}
            onClick={() => {
              start(async () => {
                await authClient.signOut();
                setOpen(false);
                router.push("/");
                router.refresh();
              });
            }}
            className="mt-2 w-full rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-coral)] px-3 py-2.5 text-left text-sm font-semibold text-[color:var(--color-coral-deep)] transition-colors hover:bg-[color:var(--color-coral-soft)] disabled:opacity-60"
          >
            {pending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
