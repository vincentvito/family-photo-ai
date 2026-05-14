import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { VIBES, type Vibe } from "@/data/vibes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

const featuredSlugs = [
  "royal-family-portrait",
  "disney-world-family-photos",
  "national-park-family-photos",
  "hawaii-family-photos",
  "cape-cod-family-photos",
  "ghibli-family-photos",
  "pixar-family-photos",
  "golden-hour-beach-family-photos",
  "christmas-morning-family-photos",
];

const featured = featuredSlugs
  .map((slug) => VIBES.find((vibe) => vibe.slug === slug))
  .filter((vibe): vibe is Vibe => Boolean(vibe));

const rest = VIBES.filter((vibe) => !featuredSlugs.includes(vibe.slug));
const galleryVibes = [...featured, ...rest];

export const metadata: Metadata = {
  title: "See What Others Created | FamilyShoot Gallery",
  description:
    "Browse FamilyShoot gallery examples across popular AI family portrait vibes, from royal portraits and national parks to beach, holiday, illustrated, and cinematic family photos.",
  alternates: { canonical: `${SITE_URL}/gallery` },
};

export default function GalleryPage() {
  return (
    <>
      <Nav
        links={[
          { href: "/gallery", label: "Gallery" },
          { href: "/vibes", label: "Vibes" },
          { href: "/cards", label: "Cards" },
          { href: "/styles", label: "Styles" },
        ]}
      />
      <main className="bg-[color:var(--color-bg)] pb-20 pt-28">
        <header className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <span className="chip chip-coral">
              <span className="dot dot-coral" />
              Customer gallery
            </span>
            <h1 className="serif mt-5 text-5xl leading-[1.02] tracking-[-0.03em] sm:text-7xl">
              See what others created.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
              A gallery of family portrait vibes people use for framed prints, holiday cards,
              grandparents, birthdays, and the group photo they never quite got.
            </p>
          </div>
        </header>

        <section className="mx-auto mt-12 grid max-w-6xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryVibes.map((vibe, index) => (
            <Link
              key={vibe.slug}
              href={`/${vibe.slug}`}
              className={`group overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] ${
                index === 0 ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${index === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}`}
              >
                <Image
                  src={vibe.image}
                  alt={`${vibe.name} family portrait example`}
                  fill
                  priority={index < 3}
                  sizes={
                    index === 0
                      ? "(max-width: 1024px) 100vw, 66vw"
                      : "(max-width: 768px) 100vw, 33vw"
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[color:rgba(31,26,36,0.7)] to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h2 className="serif text-3xl leading-none tracking-[-0.02em] text-white drop-shadow-sm">
                    {vibe.name}
                  </h2>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                  {vibe.shortDescription}
                </p>
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
