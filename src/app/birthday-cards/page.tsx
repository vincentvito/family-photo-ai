import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { BIRTHDAY_CARD_PAGES } from "@/data/birthday-card-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

export const metadata: Metadata = {
  title: "Birthday Card Ideas for Kids, Grandma, and Partners | FamilyShoot",
  description:
    "Browse FamilyShoot birthday-card pages for kids birthday cards, birthday cards for Grandma, and partner add-ons for cake decorators, party planners, and photographers.",
  alternates: { canonical: `${SITE_URL}/birthday-cards` },
};

export default function BirthdayCardsHub() {
  return (
    <>
      <Nav
        links={[
          { href: "/vibes", label: "Vibes" },
          { href: "/cards", label: "Cards" },
          { href: "/birthday-cards", label: "Birthday cards" },
          { href: "/styles", label: "Styles" },
        ]}
      />
      <main className="pt-28 pb-16">
        <header className="mx-auto max-w-6xl px-6 text-center">
          <p className="small-caps text-[color:var(--color-coral)]">Birthday card ideas</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Personalized birthday cards from real family moments
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
            Start with family photos, grandkids, pets, party portraits, or cake-smash pictures and
            shape them into a birthday card idea that feels specific to the person receiving it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/studio/roster" className="btn btn-coral btn-lg">
              Create a birthday card
            </Link>
            <Link href="#birthday-card-pages" className="btn btn-ghost btn-lg">
              Browse birthday pages
            </Link>
          </div>
        </header>

        <section id="birthday-card-pages" className="mx-auto mt-14 max-w-6xl px-6">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BIRTHDAY_CARD_PAGES.map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/birthday-cards/${page.slug}`}
                  className="group block h-full overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-white shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--color-sand)]">
                    <Image
                      src={page.image}
                      alt={`${page.name} preview`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-5 py-5">
                    <div className="text-base font-semibold">{page.name}</div>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                      {page.description}
                    </p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-[color:var(--color-coral)]">
                      {page.ctaLabel} -&gt;
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
