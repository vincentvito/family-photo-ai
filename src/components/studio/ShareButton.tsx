"use client";

import { useCallback, useState, useTransition } from "react";

type ShareButtonProps = {
  imageId: string;
  className?: string;
  iconOnly?: boolean;
};

type ShareResponse = {
  shareUrl?: string;
  error?: string;
};

export default function ShareButton({
  imageId,
  className = "btn btn-sm btn-ghost",
  iconOnly = false,
}: ShareButtonProps) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyShareUrl = useCallback(async (shareUrl: string) => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }, []);

  const share = useCallback(() => {
    start(async () => {
      setError(null);
      setCopied(false);

      try {
        const res = await fetch(`/api/images/${imageId}/share`, { method: "POST" });
        const body = (await res.json().catch(() => ({}))) as ShareResponse;
        if (!res.ok || !body.shareUrl) {
          throw new Error(body.error ?? "Could not create share link.");
        }

        if (navigator.share) {
          try {
            await navigator.share({
              title: "Made with FamilyShoot",
              text: "I made this portrait with FamilyShoot.",
              url: body.shareUrl,
            });
            return;
          } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return;
            await copyShareUrl(body.shareUrl);
            return;
          }
        }

        await copyShareUrl(body.shareUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not share this image.");
      }
    });
  }, [copyShareUrl, imageId]);

  const label = copied ? "Copied" : pending ? "Sharing" : "Share";

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          share();
        }}
        disabled={pending}
        className={className}
        aria-label={iconOnly ? label : undefined}
        title={error ?? undefined}
      >
        <ShareIcon className={iconOnly ? "h-4 w-4" : "h-3.5 w-3.5"} />
        {!iconOnly && label}
      </button>
      {error && !iconOnly && (
        <span className="pointer-events-none absolute bottom-[calc(100%+0.45rem)] left-1/2 z-30 w-52 -translate-x-1/2 rounded-[var(--radius-md)] bg-[color:var(--color-ink)] px-3 py-2 text-center text-xs font-medium text-white shadow-[var(--shadow-md)]">
          {error}
        </span>
      )}
    </span>
  );
}

function ShareIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
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
