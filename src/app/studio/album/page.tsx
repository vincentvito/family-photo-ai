import Link from "next/link";
import Image from "next/image";
import { getAlbum } from "@/actions/album";
import AlbumGrid from "@/components/studio/AlbumGrid";

export const dynamic = "force-dynamic";

export default async function AlbumPage() {
  const { items } = await getAlbum();

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
            Everything you&apos;ve kept. Download the whole album, or export any frame as a print-ready file.
          </p>
        </div>

        {items.length > 0 && (
          <a href="/api/export/album" className="btn btn-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download album (.zip)
          </a>
        )}
      </div>

      <div className="mt-12">
        {items.length === 0 ? <EmptyAlbum /> : <AlbumGrid items={items} />}
      </div>
    </main>
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
        Favorite a portrait from a shoot and it&apos;ll land here, ready to print, share, or slip into a card.
      </p>
      <Link href="/studio/roster" className="btn btn-coral mt-7">
        Begin a shoot
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
