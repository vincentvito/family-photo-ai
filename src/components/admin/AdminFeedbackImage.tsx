"use client";

import { useState } from "react";

export default function AdminFeedbackImage({ imageId, alt }: { imageId: string; alt: string }) {
  const [available, setAvailable] = useState(true);

  if (!available) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[color:var(--color-bg)] px-4 text-center text-[color:var(--color-ink-muted)]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m3 16 5-5 4 4 2-2 7 7" />
          <path d="m4 3 16 18" />
        </svg>
        <span className="text-xs font-semibold">Image no longer available</span>
      </div>
    );
  }

  return (
    // This authenticated endpoint returns a small crop for the private admin view.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/images/${imageId}?variant=admin-thumbnail`}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setAvailable(false)}
      className="h-full w-full object-cover"
    />
  );
}
