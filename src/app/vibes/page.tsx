import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { VIBES } from "@/data/vibes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

export const metadata: Metadata = {
  title: "AI Family Portrait Vibes: Ghibli, Pixar, Wes Anderson and More | FamilyShoot",
  description:
    "Every family-portrait vibe FamilyShoot can render from your selfies. Studio Ghibli, Pixar, Wes Anderson, Slim Aarons, watercolor storybook, and more. About two minutes per portrait.",
  alternates: { canonical: `${SITE_URL}/vibes` },
};

export default function VibesHub() {
  return (
    <>
      <Nav
        links={[
          { href: "/vibes", label: "Vibes" },
          { href: "/trending", label: "Trending 🔥" },
          { href: "/cards", label: "Cards" },
          { href: "/styles", label: "Styles" },
        ]}
      />
      <main className="pt-28 pb-16">
        <header className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            AI family portrait vibes
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
            Pick the look you want. FamilyShoot renders your whole family in any of these worlds
            from the selfies you already have. Ready in about two minutes, ready to print.
          </p>
        </header>
        <ul className="mx-auto mt-12 grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {VIBES.map((v) => (
            <li key={v.slug}>
              <Link
                href={`/${v.slug}`}
                className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={v.image}
                    alt={`${v.name} family portrait`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-5 py-4">
                  <div className="text-base font-semibold">{v.name}</div>
                  <div className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
                    {v.shortDescription}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
