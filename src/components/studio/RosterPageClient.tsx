"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Person, Photo } from "@/../db/schema";
import RosterGrid from "@/components/studio/RosterGrid";
import AddPersonDialog from "@/components/studio/AddPersonDialog";

type RosterEntry = { person: Person; photos: Photo[] };

export default function RosterPageClient({ initialRoster }: { initialRoster: RosterEntry[] }) {
  const [roster, setRoster] = useState<RosterEntry[]>(initialRoster);
  const [error, setError] = useState<string | null>(null);

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
            Add each person (and pet) who should appear. One clear, well-lit face photo for each
            person is enough to lock their likeness across every portrait.
          </p>
        </div>
        <AddPersonDialog onChanged={loadRoster} />
      </div>

      <div className="mt-12">
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

      <div className="mt-16 flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-6 py-6 text-center shadow-[var(--shadow-sm)]">
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

function EmptyState() {
  return (
    <div className="panel-coral flex flex-col items-center justify-center px-8 py-14 text-center sm:py-16">
      <div className="relative h-40 w-48">
        <Image src="/illustrations/empty-roster.svg" alt="" fill className="object-contain" />
      </div>
      <p className="serif mt-6 text-3xl tracking-[-0.02em]">No one on the roster yet.</p>
      <p className="mt-3 max-w-md text-[color:var(--color-ink-muted)]">
        Start with yourself - add one person, then add their reference photo. You&apos;ll add the
        rest of the family after.
      </p>
    </div>
  );
}
