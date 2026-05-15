"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Person, Photo } from "@/../db/schema";
import RosterGrid from "@/components/studio/RosterGrid";
import AddPersonDialog from "@/components/studio/AddPersonDialog";
import BulkAddPeopleDialog from "@/components/studio/BulkAddPeopleDialog";

type RosterEntry = { person: Person; photos: Photo[] };

export default function RosterPageClient({
  initialRoster,
  checkoutStatus,
}: {
  initialRoster: RosterEntry[];
  checkoutStatus?: string;
}) {
  const [roster, setRoster] = useState<RosterEntry[]>(initialRoster);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const showCheckoutSuccess = checkoutStatus === "success" || checkoutStatus === "pro-success";

  const loadRoster = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/roster/people", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || `Roster failed (${res.status})`);
      }
      setRoster(body.roster ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Roster failed.");
    }
  }, []);

  const peopleWithPhotos = useMemo(
    () => roster.filter((entry) => entry.photos.length > 0).length,
    [roster],
  );
  const canContinue = roster.length > 0 && peopleWithPhotos === roster.length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      {showCheckoutSuccess && <CheckoutSuccessBanner pro={checkoutStatus === "pro-success"} />}

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="chip chip-coral">
            <span className="dot dot-coral" />
            Step 01 · Roster
          </span>
          <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
            Who&apos;s in the{" "}
            <em className="serif-italic text-[color:var(--color-coral)]">shoot</em>?
          </h1>
          <p className="mt-4 max-w-xl text-[color:var(--color-ink-muted)]">
            Add each person (and pet) who should appear. Clear, well-lit photos with at least the
            shoulders visible give the AI better face and body proportions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <BulkAddPeopleDialog onChanged={loadRoster} onNotice={setNotice} />
          <AddPersonDialog onChanged={loadRoster} onNotice={setNotice} />
        </div>
      </div>

      <div className="mt-8">
        {notice && (
          <div className="mb-4 flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)] px-4 py-3 text-sm text-[color:var(--color-ink-muted)] shadow-[var(--shadow-sm)]">
            <p>{notice}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-coral-deep)] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {error ? (
          <div className="panel-coral px-8 py-12 text-center">
            <p className="text-sm font-semibold text-[color:var(--color-coral-deep)]">{error}</p>
            <button onClick={loadRoster} className="btn btn-coral btn-sm mt-4">
              Try again
            </button>
          </div>
        ) : roster.length === 0 ? (
          <EmptyState />
        ) : (
          <RosterGrid roster={roster} onChanged={loadRoster} />
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-6 py-6 text-center shadow-[var(--shadow-sm)]">
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          {roster.length === 0
            ? "Add at least one person to continue."
            : `${roster.length} ${roster.length === 1 ? "person" : "people"} · ${peopleWithPhotos}/${roster.length} reference photos`}
        </p>
        <Link
          href="/studio/output"
          aria-disabled={!canContinue}
          className={`btn btn-lg ${canContinue ? "btn-coral" : "btn-ghost"}`}
          style={canContinue ? undefined : { opacity: 0.5, pointerEvents: "none" }}
        >
          Start photoshoot
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
        </Link>
      </div>
    </main>
  );
}

function CheckoutSuccessBanner({ pro }: { pro: boolean }) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-sage)] bg-[color:var(--color-bg-tinted-sage)] px-6 py-5 shadow-[var(--shadow-md)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            className={`success-confetti absolute ${
              index % 4 === 0
                ? "h-2 w-2 rounded-full"
                : index % 4 === 1
                  ? "h-1.5 w-3 rounded-[2px]"
                  : "h-3 w-1.5 rounded-[2px]"
            } ${
              index % 3 === 0
                ? "bg-[color:var(--color-coral)]"
                : index % 3 === 1
                  ? "bg-[color:var(--color-sage)]"
                  : "bg-[color:var(--color-butter)]"
            }`}
            style={
              {
                left: `${4 + ((index * 13) % 92)}%`,
                animationDelay: `${index * 0.045}s`,
                "--confetti-drift": `${(index % 2 === 0 ? 1 : -1) * (18 + (index % 5) * 7)}px`,
                "--confetti-spin": `${180 + index * 37}deg`,
                "--confetti-duration": `${1200 + (index % 6) * 130}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="small-caps text-[color:var(--color-sage-deep)]">
            {pro ? "Pro is active" : "Shoots added"}
          </p>
          <p className="serif mt-1 text-2xl leading-tight tracking-[-0.02em] text-[color:var(--color-ink)]">
            {pro ? "Your monthly shoots are ready." : "Your new shoots are ready."}
          </p>
          <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
            Add or review your roster, then start the next photoshoot.
          </p>
        </div>
        <Link href="/studio/output" className="btn btn-sage shrink-0">
          Continue
        </Link>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="panel-coral flex flex-col items-center justify-center px-8 py-14 text-center sm:py-16">
      <div className="relative h-40 w-48">
        <Image src="/illustrations/empty-roster.svg" alt="" fill className="object-contain" />
      </div>
      <p className="serif mt-6 text-3xl tracking-[-0.02em]">No one on the roster yet.</p>
      <p className="mt-3 max-w-md text-[color:var(--color-ink-muted)]">
        Start with yourself - add one person and choose a reference photo now, or add the photo
        later.
      </p>
    </div>
  );
}
