import Link from "next/link";
import Image from "next/image";
import { listRoster } from "@/actions/roster";
import RosterGrid from "@/components/studio/RosterGrid";
import AddPersonDialog from "@/components/studio/AddPersonDialog";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const roster = await listRoster();
  const totalPhotos = roster.reduce((n, r) => n + r.photos.length, 0);
  const canContinue = roster.length > 0 && totalPhotos > 0;

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
            Add each person (and pet) who should appear. A few clear photos of each face —
            close-ups, different angles, good light — help us lock their likeness across every
            portrait.
          </p>
        </div>
        <AddPersonDialog />
      </div>

      <div className="mt-12">
        {roster.length === 0 ? <EmptyState /> : <RosterGrid roster={roster} />}
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-6 py-5 shadow-[var(--shadow-sm)]">
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          {roster.length === 0
            ? "Add at least one person to continue."
            : `${roster.length} ${roster.length === 1 ? "person" : "people"} · ${totalPhotos} ${totalPhotos === 1 ? "photo" : "photos"}`}
        </p>
        <Link
          href="/studio/theme"
          aria-disabled={!canContinue}
          className={`btn ${canContinue ? "btn-coral" : "btn-ghost"}`}
          style={canContinue ? undefined : { opacity: 0.5, pointerEvents: "none" }}
        >
          Choose a vibe
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
        Start with yourself — add one person, then add their reference photos. You&apos;ll add the
        rest of the family after.
      </p>
    </div>
  );
}
