import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[color:var(--color-bg)] px-5 py-8 sm:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <BrandLogo href="/" showLabelOnMobile />
          <span className="chip chip-butter mt-10">
            <span className="dot dot-butter" />
            404
          </span>
          <h1 className="serif mt-5 max-w-xl text-5xl leading-[0.98] tracking-[-0.025em] sm:text-6xl">
            This frame never developed.
          </h1>
          <p className="mt-5 max-w-md text-[color:var(--color-ink-muted)]">
            The page may have moved, expired, or been mistyped. Your studio and album are still
            right where you left them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/studio" className="btn btn-coral">
              Open studio
              <ArrowIcon />
            </Link>
            <Link href="/" className="btn btn-ghost">
              Go home
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-4 top-10 h-24 w-24 rotate-[-9deg] rounded-sm border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] shadow-[var(--shadow-sm)]" />
          <div className="absolute -right-3 bottom-12 h-28 w-20 rotate-[8deg] rounded-sm border border-[color:var(--color-sage-soft)] bg-[color:var(--color-bg-tinted-sage)] shadow-[var(--shadow-sm)]" />
          <figure className="polaroid polaroid-lg relative rotate-[1.5deg]">
            <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--color-bg-tinted-butter)]">
              <Image
                src="/illustrations/share-expired.svg"
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="serif mt-4 text-center text-2xl tracking-[-0.02em] text-[color:var(--color-ink)]">
              Missing, not lost.
            </figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
}

function ArrowIcon() {
  return (
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
  );
}
