import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { Hero } from "@/app/cards-landing/_components/Hero";
import { CardPicker } from "@/app/cards-landing/_components/CardPicker";
import { GallerySlider } from "@/app/cards-landing/_components/GallerySlider";
import { InContext } from "@/app/cards-landing/_components/InContext";
import { CTABand } from "@/app/cards-landing/_components/CTABand";
import { CARDS } from "@/data/cards";
import "@/app/cards-landing/landing-cards.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

export const metadata: Metadata = {
  title: "AI Family Photo Cards: Christmas, Hanukkah, Diwali, and Every Occasion | FamilyShoot",
  description:
    "Family photo cards for every holiday and milestone, generated from selfies in minutes. Christmas, Hanukkah, Diwali, Eid, Lunar New Year, Easter, Halloween, Thanksgiving, save the date, and more.",
  alternates: { canonical: `${SITE_URL}/cards` },
};

export default function CardsHub() {
  return (
    <>
      <Nav
        links={[
          { href: "/vibes", label: "Vibes" },
          { href: "/cards", label: "Cards" },
          { href: "/styles", label: "Styles" },
        ]}
      />
      <div className="fs-card-landing">
        <Hero />
        <CardPicker />
        <GallerySlider />
        <InContext />

        <section className="mx-auto max-w-6xl px-6 py-20">
          <header className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Every family card occasion
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
              Pick the holiday or milestone. Each card uses the same five-selfie flow and ships
              printed or digital.
            </p>
          </header>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}`}
                  className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={c.image}
                      alt={`${c.name} family card`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-5 py-4">
                    <div className="text-base font-semibold">{c.name}</div>
                    <div className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
                      {c.shortDescription}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <CTABand />
      </div>
      <Footer />
    </>
  );
}
