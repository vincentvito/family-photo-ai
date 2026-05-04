import Link from "next/link";
import Image from "next/image";
import { getAlbum, getRecentShoots } from "@/lib/album-queries";
import { STUDIO_RETENTION_DAYS, studioDaysRemaining } from "@/lib/retention";
import AlbumGrid from "@/components/studio/AlbumGrid";

export const dynamic = "force-dynamic";

export default async function AlbumPage() {
  const [{ items }, recentShoots] = await Promise.all([getAlbum(), getRecentShoots()]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip chip-ink">
            <span className="dot dot-coral" />
            Step 05 · Keep
          </span>
          <h1 className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl">
            Your family, <em className="serif-italic text-[color:var(--color-coral)]">framed</em>.
          </h1>
          <p className="mt-4 max-w-xl text-[color:var(--color-ink-muted)]">
            Everything you&apos;ve kept, plus every shoot still available. Your studio stays open
            for {STUDIO_RETENTION_DAYS} days.
          </p>
        </div>

        {items.length > 0 && (
          <a href="/api/export/album" className="btn btn-ink">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download album (.zip)
          </a>
        )}
      </div>

      <div className="mt-12">
        {items.length === 0 ? <EmptyAlbum /> : <AlbumGrid items={items} />}
      </div>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="chip chip-sage">
              <span className="dot dot-sage" />
              Recent shoots
            </span>
            <h2 className="serif mt-3 text-3xl tracking-[-0.02em]">Still in the studio.</h2>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--color-ink-muted)]">
              Open any shoot from the last {STUDIO_RETENTION_DAYS} days to favorite, refine, or
              download before it expires.
            </p>
          </div>
          <Link href="/studio/theme" className="btn btn-ghost btn-sm">
            New shoot
          </Link>
        </div>

        <div className="mt-6">
          {recentShoots.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-6 py-8 text-sm text-[color:var(--color-ink-muted)]">
              No recent shoots yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {recentShoots.map((shoot) => (
                <RecentShootCard key={shoot.generation.id} shoot={shoot} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

type RecentShoot = Awaited<ReturnType<typeof getRecentShoots>>[number];

function RecentShootCard({ shoot }: { shoot: RecentShoot }) {
  const daysLeft = studioDaysRemaining(shoot.generation.createdAt);
  const name = labelFor(shoot.generation.customVibeDescription || shoot.generation.themeId);
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center">
      <div className="relative h-24 w-full overflow-hidden rounded-[var(--radius-md)] bg-[color:var(--color-bg-tinted-sage)] sm:w-32">
        {shoot.previewImageId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/images/${shoot.previewImageId}`}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="developing h-full w-full" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-xl">{name}</h3>
          <span className="chip chip-ghost">{shoot.generation.status}</span>
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
          {shoot.imageCount} {shoot.imageCount === 1 ? "image" : "images"} · {shoot.favoriteCount}{" "}
          kept · {daysLeft === 1 ? "1 day" : `${daysLeft} days`} left
        </p>
      </div>
      <Link href={`/studio/generate/${shoot.generation.id}`} className="btn btn-coral btn-sm">
        Open shoot
      </Link>
    </div>
  );
}

function EmptyAlbum() {
  return (
    <div className="panel-sage flex flex-col items-center justify-center px-8 py-14 text-center sm:py-16">
      <div className="relative h-40 w-48">
        <Image src="/illustrations/empty-album.svg" alt="" fill className="object-contain" />
      </div>
      <p className="serif mt-6 text-3xl tracking-[-0.02em]">Nothing kept yet.</p>
      <p className="mt-3 max-w-md text-[color:var(--color-ink-muted)]">
        Heart portraits from any shoot to build your album. Shoots stay available for{" "}
        {STUDIO_RETENTION_DAYS} days.
      </p>
      <Link href="/studio/roster" className="btn btn-coral mt-7">
        Begin a shoot
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}

function labelFor(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
