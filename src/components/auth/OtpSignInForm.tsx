"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";

type Step = "email" | "code";

export default function OtpSignInForm({ nextPath = "/studio/roster" }: { nextPath?: string }) {
  const router = useRouter();
  const t = useTranslations("OtpSignIn");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pending, start] = useTransition();

  const normalizedEmail = email.trim().toLowerCase();
  const cooldownActive = resendCooldown > 0;
  const resendLabel = cooldownActive
    ? t("resendCodeIn", {
        time: `${Math.floor(resendCooldown / 60)}:${String(resendCooldown % 60).padStart(2, "0")}`,
      })
    : t("resendCode");

  useEffect(() => {
    if (!cooldownActive) return;

    const interval = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [cooldownActive]);

  const signInWithGoogle = () => {
    setError(null);
    setMessage(null);

    start(async () => {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: nextPath,
        errorCallbackURL: "/sign-in",
      });

      if (result.error) {
        setError(result.error.message ?? t("googleError"));
      }
    });
  };

  const sendCode = () => {
    setError(null);
    setMessage(null);

    if (step === "code" && resendCooldown > 0) return;

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError(t("invalidEmail"));
      return;
    }

    start(async () => {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "sign-in",
      });

      if (result.error) {
        setError(result.error.message ?? t("sendError"));
        return;
      }

      setStep("code");
      setOtp("");
      setResendCooldown(60);
      setMessage(
        step === "code"
          ? t("sentFreshCode", { email: normalizedEmail })
          : t("sentCode", { email: normalizedEmail }),
      );
    });
  };

  const verifyCode = () => {
    setError(null);
    setMessage(null);

    if (otp.trim().length < 6) {
      setError(t("shortCode"));
      return;
    }

    start(async () => {
      const result = await authClient.signIn.emailOtp({
        email: normalizedEmail,
        otp: otp.trim(),
      });

      if (result.error) {
        setError(result.error.message ?? t("badCode"));
        return;
      }

      router.push(nextPath);
      router.refresh();
    });
  };

  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
      <div>
        <span className="chip chip-coral">
          <span className="dot dot-coral" />
          {t("chip")}
        </span>
        <h1 className="serif mt-5 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
          {t("titleBefore")}{" "}
          <em className="serif-italic text-[color:var(--color-coral)]">{t("titleEmphasis")}</em>.
        </h1>
        <p className="mt-4 text-[color:var(--color-ink-muted)]">
          {t("body")}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          disabled={pending}
          onClick={signInWithGoogle}
          className="spring-press flex w-full items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-white px-4 py-3.5 font-semibold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-ink-muted)] hover:shadow-[var(--shadow-md)] focus:outline-none focus:shadow-[var(--shadow-ring-coral)] disabled:cursor-wait disabled:opacity-65"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06 0.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
            />
          </svg>
          {pending ? t("openingGoogle") : t("continueGoogle")}
        </button>

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-faint)]">
          <span className="h-px flex-1 bg-[color:var(--color-line)]" />
          {t("orEmail")}
          <span className="h-px flex-1 bg-[color:var(--color-line)]" />
        </div>
      </div>

      <form
        className="mt-5 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (step === "email") sendCode();
          else verifyCode();
        }}
      >
        <div>
          <label className="small-caps text-[color:var(--color-ink-muted)]" htmlFor="auth-email">
            {t("email")}
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            disabled={pending || step === "code"}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-65"
          />
        </div>

        {step === "code" && (
          <div>
            <label className="small-caps text-[color:var(--color-ink-muted)]" htmlFor="auth-code">
              {t("code")}
            </label>
            <input
              id="auth-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              disabled={pending}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="serif mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 text-center text-3xl tracking-[0.32em] outline-none transition-all focus:border-[color:var(--color-coral)] focus:shadow-[var(--shadow-ring-coral)] disabled:opacity-65"
            />
          </div>
        )}

        {message && (
          <p className="rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-sage)] px-4 py-3 text-sm text-[color:var(--color-sage-deep)]">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-coral)] px-4 py-3 text-sm text-[color:var(--color-coral-deep)]">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn btn-coral btn-lg w-full">
          {pending
            ? step === "email"
              ? t("sendingCode")
              : t("checkingCode")
            : step === "email"
              ? t("sendCode")
              : t("enterStudio")}
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>

        {step === "code" && (
          <button
            type="button"
            disabled={pending || resendCooldown > 0}
            onClick={sendCode}
            className="w-full rounded-[var(--radius-md)] border border-[color:var(--color-line)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--color-ink-muted)] transition-colors hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? t("sendingCode") : resendLabel}
          </button>
        )}

        {step === "code" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setStep("email");
              setOtp("");
              setResendCooldown(0);
              setMessage(null);
              setError(null);
            }}
            className="w-full text-center text-sm font-medium text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)]"
          >
            {t("differentEmail")}
          </button>
        )}
      </form>
    </div>
  );
}
