import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { OCCASION_PAGES } from "@/data/occasion-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

export const metadata: Metadata = {
  title: "Family Portrait Occasion Pages: Gifts, Holidays, Reunions | FamilyShoot",
  description:
    "Browse FamilyShoot occasion pages for Father's Day, Mother's Day, Women's Day, grandparents, reunions, anniversary gifts, Valentine's Day, and military family portraits.",
  alternates: { canonical: `${SITE_URL}/occasions` },
};

export default function OccasionsHub() {
  return (
    <>
      <Nav
        links={[
          { href: "/vibes", label: "Vibes" },
          { href: "/cards", label: "Cards" },
          { href: "/occasions", label: "Occasions" },
          { href: "/styles", label: "Styles" },
        ]}
      />
      <main className="pt-28 pb-16">
        <header className="mx-auto max-w-6xl px-6 text-center">
          <p className="small-caps text-[color:var(--color-coral)]">FamilyShoot occasions</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Family portraits for the moments people actually buy gifts
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
            Pick the occasion, upload separate family photos, and start with a free watermarked
            preview before unlocking the print-ready portrait or card.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/studio/roster" className="btn btn-coral btn-lg">
              Start a free preview
            </Link>
            <Link href="#occasion-pages" className="btn btn-ghost btn-lg">
              Browse occasions
            </Link>
          </div>
        </header>

        <section id="occasion-pages" className="mx-auto mt-14 max-w-6xl px-6">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OCCASION_PAGES.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/${page.slug}`}
                  className="group block h-full overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-white shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--color-sand)]">
                    <Image
                      src={page.image}
                      alt={`${page.name} family portrait preview`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-5 py-5">
                    <div className="text-base font-semibold">{page.name}</div>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                      {page.shortDescription}
                    </p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-[color:var(--color-coral)]">
                      {page.ctaLabel} →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
