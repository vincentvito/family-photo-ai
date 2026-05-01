"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Step = "email" | "code";

export default function OtpSignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const normalizedEmail = email.trim().toLowerCase();

  const sendCode = () => {
    setError(null);
    setMessage(null);

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Enter a real email so we know where to send the code.");
      return;
    }

    start(async () => {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: normalizedEmail,
        type: "sign-in",
      });

      if (result.error) {
        setError(result.error.message ?? "Could not send the code.");
        return;
      }

      setStep("code");
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
        name: name.trim() || normalizedEmail.split("@")[0] || "Family Photoshoot Guest",
      });

      if (result.error) {
        setError(result.error.message ?? "That code did not work.");
        return;
      }

      router.push("/studio/roster");
      router.refresh();
    });
  };

  return (
    <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-lg)] sm:p-8">
      <div>
        <span className="chip chip-coral">
          <span className="dot dot-coral" />
          Private studio access
        </span>
        <h1 className="serif mt-5 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
          Start your <em className="serif-italic text-[color:var(--color-coral)]">family shoot</em>.
        </h1>
        <p className="mt-4 text-[color:var(--color-ink-muted)]">
          No password to remember. We&apos;ll send one quiet little code and keep your family photos
          tied to your account.
        </p>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (step === "email") sendCode();
          else verifyCode();
        }}
      >
        <div>
          <label className="small-caps text-[color:var(--color-ink-muted)]" htmlFor="auth-email">
            Email
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
          <>
            <div>
              <label className="small-caps text-[color:var(--color-ink-muted)]" htmlFor="auth-name">
                Name
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={name}
                disabled={pending}
                onChange={(event) => setName(event.target.value)}
                placeholder="So we know what to call you"
                className="mt-2 w-full rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg)] px-4 py-3 outline-none transition-all focus:border-[color:var(--color-sage)] focus:shadow-[var(--shadow-ring-sage)] disabled:opacity-65"
              />
            </div>

            <div>
              <label className="small-caps text-[color:var(--color-ink-muted)]" htmlFor="auth-code">
                Code
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
          </>
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
              ? "Sending code..."
              : "Checking code..."
            : step === "email"
              ? "Email me a code"
              : "Enter the studio"}
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
            disabled={pending}
            onClick={() => {
              setStep("email");
              setOtp("");
              setMessage(null);
              setError(null);
            }}
            className="w-full text-center text-sm font-medium text-[color:var(--color-ink-muted)] transition-colors hover:text-[color:var(--color-ink)]"
          >
            Use a different email
          </button>
        )}
      </form>
    </div>
  );
}
