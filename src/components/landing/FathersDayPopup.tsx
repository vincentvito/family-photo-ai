"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STORAGE_KEY = "familyshoot:fathers-day-popup-dismissed-at";
const SHOW_DELAY_MS = 6000;
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const EXCLUDED_PATH_PREFIXES = ["/studio", "/sign-in", "/admin", "/privacy", "/terms"];

function recentlyDismissed() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return false;

    const dismissedAt = Number(value);
    if (!Number.isFinite(dismissedAt)) return false;

    return Date.now() - dismissedAt < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function shouldShowForPath(pathname: string | null) {
  if (!pathname) return false;
  if (pathname === "/fathers-day") return false;

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function FathersDayPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldShowForPath(pathname) || recentlyDismissed()) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!open) return null;

  const close = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Ignore storage failures and still close the popup.
    }
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm sm:bottom-6 sm:right-6" role="presentation">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="fathers-day-popup-title"
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:rgba(31,26,36,0.12)] bg-[color:var(--color-bg)] p-5 shadow-[0_24px_70px_rgba(31,26,36,0.24)]"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-2 py-1 text-xs font-bold text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)]"
          aria-label="Close Father’s Day offer"
        >
          ✕
        </button>

        <span className="chip chip-butter pr-9">
          <span className="dot dot-butter" />
          Father&apos;s Day gift idea
        </span>
        <h2
          id="fathers-day-popup-title"
          className="serif mt-4 max-w-sm text-2xl leading-tight tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-3xl"
        >
          Dad is usually behind the camera. Put him in the portrait.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[color:var(--color-ink-muted)]">
          Create a personalized Father&apos;s Day family portrait or card from the photos you already
          have.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href="/fathers-day" onClick={close} className="btn btn-coral btn-sm spring-press">
            See Father&apos;s Day portraits
          </Link>
          <Link
            href="/studio/roster"
            onClick={close}
            className="text-sm font-bold text-[color:var(--color-coral-deep)] underline-offset-4 hover:underline"
          >
            Start now
          </Link>
        </div>
      </div>
    </div>
  );
}
