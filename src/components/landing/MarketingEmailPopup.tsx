"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { stripLocalePrefix } from "@/lib/i18n/locales";

type Step = "email" | "code";

const STORAGE_KEY = "familyshoot:default-email-popup-dismissed-at";
const SHOW_DELAY_MS = 6000;
const DISMISS_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const EXCLUDED_PATH_PREFIXES = ["/studio", "/sign-in", "/admin", "/privacy", "/terms", "/share"];
const NEXT_PATH = "/studio/roster";

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
  const strippedPathname = stripLocalePrefix(pathname);

  return !EXCLUDED_PATH_PREFIXES.some((prefix) => strippedPathname.startsWith(prefix));
}

export default function MarketingEmailPopup() {
  const pathname = usePathname();
  const router = useRouter();
  const [visiblePathname, setVisiblePathname] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const normalizedEmail = email.trim().toLowerCase();

  useEffect(() => {
    if (!shouldShowForPath(pathname) || recentlyDismissed()) return;

    const timer = window.setTimeout(() => {
      setVisiblePathname(pathname);
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!pathname || visiblePathname !== pathname) return null;

  const close = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // Ignore storage failures and still close the popup.
    }
    setVisiblePathname(null);
  };

  const sendCode = () => {
    setError(null);
    setMessage(null);

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Enter a valid email to claim your free generation.");
      return;
    }

    start(async () => {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "sign-in",
      });

      if (result.error) {
        setError(result.error.message ?? "Could not send the sign-in code. Try again.");
        return;
      }

      setStep("code");
      setOtp("");
      setMessage(`We sent a 6-digit code to ${normalizedEmail}.`);
    });
  };

  const verifyCode = () => {
    setError(null);
    setMessage(null);

    if (otp.trim().length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    start(async () => {
      const result = await authClient.signIn.emailOtp({
        email: normalizedEmail,
        otp: otp.trim(),
      });

      if (result.error) {
        setError(result.error.message ?? "That code did not work. Please try again.");
        return;
      }

      await fetch("/api/account/marketing-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: marketingOptIn, source: "default_email_popup" }),
      }).catch((err) => {
        console.error("Failed to save popup marketing consent", err);
      });

      close();
      router.push(NEXT_PATH);
      router.refresh();
    });
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm sm:bottom-6 sm:right-6"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="email-popup-title"
        className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[color:rgba(31,26,36,0.12)] bg-[color:var(--color-bg)] p-5 shadow-[0_24px_70px_rgba(31,26,36,0.24)]"
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-2 py-1 text-xs font-bold text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)]"
          aria-label="Close free generation offer"
        >
          ✕
        </button>

        <span className="chip chip-coral pr-9">
          <span className="dot dot-coral" />
          First generation free
        </span>
        <h2
          id="email-popup-title"
          className="serif mt-4 max-w-sm text-2xl leading-tight tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-3xl"
        >
          Get your first FamilyShoot generation free.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[color:var(--color-ink-muted)]">
          Enter your email, grab the sign-in code, and start creating a family portrait from the
          photos you already have.
        </p>

        <form
          className="mt-5 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (step === "email") sendCode();
            else verifyCode();
          }}
        >
          <input
            type="email"
            autoComplete="email"
            value={email}
            disabled={pending || step === "code"}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 text-sm outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-65"
            aria-label="Email address"
          />

          {step === "code" && (
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              disabled={pending}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="serif w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 text-center text-2xl tracking-[0.28em] outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-65"
              aria-label="Email sign-in code"
            />
          )}

          <label className="flex gap-2 rounded-[var(--radius-md)] bg-[color:var(--color-bg-elevated)] px-3 py-2 text-xs leading-5 text-[color:var(--color-ink-muted)]">
            <input
              type="checkbox"
              checked={marketingOptIn}
              disabled={pending}
              onChange={(event) => setMarketingOptIn(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[color:var(--color-line-strong)] accent-[color:var(--color-coral)]"
            />
            <span>Send me new styles, offers, and family photo tips. Unsubscribe any time.</span>
          </label>

          {message && (
            <p className="rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-sage)] px-3 py-2 text-xs text-[color:var(--color-sage-deep)]">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-coral)] px-3 py-2 text-xs text-[color:var(--color-coral-deep)]">
              {error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn btn-coral btn-sm w-full">
            {pending
              ? step === "email"
                ? "Sending code..."
                : "Checking code..."
              : step === "email"
                ? "Claim my free generation"
                : "Start creating"}
          </button>
        </form>
      </div>
    </div>
  );
}
