"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

export type GalleryCreation = {
  image: string;
  title: string;
  description: string;
  likes: number;
  themeId: string;
  sourceLabel: "Community pick" | "Trending" | "New vibe";
};

function getVibeHref(themeId: string | null, isLoggedIn: boolean) {
  if (!themeId) return "/studio/roster";
  if (isLoggedIn) return `/studio/theme?theme=${encodeURIComponent(themeId)}`;
  return "/studio/roster";
}

export default function GalleryExperience({ creations }: { creations: GalleryCreation[] }) {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const { data } = authClient.useSession();
  const selectedCreation = useMemo(
    () => creations.find((creation) => creation.title === selectedTitle) ?? null,
    [creations, selectedTitle],
  );
  const ctaHref = getVibeHref(selectedCreation?.themeId ?? null, Boolean(data?.user));

  useEffect(() => {
    if (!selectedCreation) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedTitle(null);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCreation]);

  return (
    <>
      <section className="mx-auto mt-12 grid max-w-6xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
        {creations.map((creation, index) => (
          <article
            key={creation.title}
            className="group overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
          >
            <button
              type="button"
              onClick={() => setSelectedTitle(creation.title)}
              className="block w-full text-left"
              aria-label={`Open ${creation.title} creation`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--color-bg-tinted-sage)]">
                <Image
                  src={creation.image}
                  alt={`${creation.title} family portrait`}
                  fill
                  priority={index < 3}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[color:rgba(31,26,36,0.78)] via-[color:rgba(31,26,36,0.22)] to-transparent"
                  aria-hidden
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-sm font-bold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] backdrop-blur">
                  ❤️ {creation.likes.toLocaleString("en-US")}
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-[color:var(--color-ink)]/78 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[var(--shadow-sm)] backdrop-blur">
                  {creation.sourceLabel}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h2 className="serif text-3xl leading-none tracking-[-0.02em] text-white drop-shadow-sm">
                    {creation.title}
                  </h2>
                </div>
              </div>
            </button>
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                {creation.description}
              </p>
            </div>
          </article>
        ))}
      </section>

      {selectedCreation && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[color:rgba(31,26,36,0.72)] px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-creation-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTitle(null);
          }}
        >
          <div className="grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-lg)] md:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
            <div className="relative min-h-[360px] bg-[color:var(--color-bg-tinted-sage)] md:min-h-[620px]">
              <Image
                src={selectedCreation.image}
                alt={`${selectedCreation.title} family portrait`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-sm font-bold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] backdrop-blur">
                ❤️ {selectedCreation.likes.toLocaleString("en-US")}
              </div>
            </div>
            <div className="flex flex-col p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="chip chip-coral">{selectedCreation.sourceLabel}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTitle(null)}
                  className="rounded-full border border-[color:var(--color-line)] px-3 py-1 text-sm font-bold text-[color:var(--color-ink-muted)] transition-colors hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)]"
                  aria-label="Close creation preview"
                >
                  Close
                </button>
              </div>
              <h2
                id="gallery-creation-title"
                className="serif mt-6 text-5xl leading-[1.02] tracking-[-0.03em]"
              >
                {selectedCreation.title}
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[color:var(--color-ink-muted)]">
                {selectedCreation.description}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Use this vibe as a starting point, then upload your own family photos and adjust the
                people, pets, and style inside the studio.
              </p>
              <div className="mt-auto pt-8">
                <Link href={ctaHref} className="btn btn-coral btn-lg w-full justify-center">
                  Use this Vibe
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
