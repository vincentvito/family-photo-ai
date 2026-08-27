"use client";

import { useState, useTransition } from "react";

export type ImageRating = "up" | "down" | null;

export default function ImageRatingControl({
  imageId,
  initialRating,
  variant = "overlay",
}: {
  imageId: string;
  initialRating: ImageRating;
  variant?: "overlay" | "inline";
}) {
  const [rating, setRating] = useState<ImageRating>(initialRating);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const choose = (choice: Exclude<ImageRating, null>) => {
    const next = rating === choice ? null : choice;
    const previous = rating;
    setRating(next);
    setFailed(false);
    startTransition(async () => {
      try {
        const response = await fetch("/api/images/rating", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ imageId, rating: next }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = (await response.json()) as { rating: ImageRating };
        setRating(body.rating);
      } catch {
        setRating(previous);
        setFailed(true);
      }
    });
  };

  return (
    <div
      className={
        variant === "overlay"
          ? "absolute right-3 top-3 z-20 flex overflow-hidden rounded-full border border-black/5 bg-white/92 p-1 shadow-[var(--shadow-md)] backdrop-blur-sm"
          : "flex items-center gap-1 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-1"
      }
      aria-label="Rate this image"
    >
      <RatingButton
        direction="up"
        active={rating === "up"}
        pending={pending}
        onClick={() => choose("up")}
      />
      <span className="h-6 w-px self-center bg-[color:var(--color-line)]" aria-hidden />
      <RatingButton
        direction="down"
        active={rating === "down"}
        pending={pending}
        onClick={() => choose("down")}
      />
      <span className="sr-only" role="status">
        {failed ? "Your rating was not saved. Try again." : pending ? "Saving rating" : ""}
      </span>
    </div>
  );
}

function RatingButton({
  direction,
  active,
  pending,
  onClick,
}: {
  direction: "up" | "down";
  active: boolean;
  pending: boolean;
  onClick: () => void;
}) {
  const positive = direction === "up";
  const label = positive
    ? active
      ? "Remove thumbs up"
      : "I like this image"
    : active
      ? "Remove thumbs down"
      : "I dislike this image";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={label}
      aria-pressed={active}
      title={positive ? "Like" : "Dislike"}
      className={`flex h-9 w-9 touch-manipulation items-center justify-center rounded-full transition-[color,background-color,transform] duration-150 active:scale-90 disabled:opacity-65 ${
        active
          ? positive
            ? "bg-[color:var(--color-sage)] text-white"
            : "bg-[color:var(--color-coral-deep)] text-white"
          : "text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-line)]/70 hover:text-[color:var(--color-ink)]"
      }`}
    >
      <ThumbIcon direction={direction} filled={active} />
    </button>
  );
}

function ThumbIcon({ direction, filled }: { direction: "up" | "down"; filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={direction === "down" ? "rotate-180" : undefined}
    >
      <path d="M7 10v11H3V10h4Z" />
      <path d="M7 19h10.4a2 2 0 0 0 1.95-1.55l1.15-5A2 2 0 0 0 18.55 10H14l.8-4.1A2.43 2.43 0 0 0 10.4 4.1L7 10" />
    </svg>
  );
}
