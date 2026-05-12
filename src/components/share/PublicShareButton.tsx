"use client";

import { useCallback, useState, useTransition } from "react";

export default function PublicShareButton() {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyUrl = useCallback(async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }, []);

  const share = useCallback(() => {
    start(async () => {
      setCopied(false);
      setError(null);

      const url = window.location.href;
      try {
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Made with FamilyShoot",
              text: "A portrait made with FamilyShoot.",
              url,
            });
            return;
          } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return;
            await copyUrl(url);
            return;
          }
        }

        await copyUrl(url);
      } catch {
        setError("Could not share this link.");
      }
    });
  }, [copyUrl]);

  return (
    <span className="relative inline-flex">
      <button type="button" onClick={share} disabled={pending} className="btn btn-ghost">
        <ShareIcon />
        {copied ? "Copied" : pending ? "Sharing" : "Share"}
      </button>
      {error && (
        <span className="pointer-events-none absolute bottom-[calc(100%+0.45rem)] left-1/2 z-30 w-48 -translate-x-1/2 rounded-[var(--radius-md)] bg-[color:var(--color-ink)] px-3 py-2 text-center text-xs font-medium text-white shadow-[var(--shadow-md)]">
          {error}
        </span>
      )}
    </span>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.5 15.4 6.5" />
      <path d="M8.6 13.5 15.4 17.5" />
    </svg>
  );
}
