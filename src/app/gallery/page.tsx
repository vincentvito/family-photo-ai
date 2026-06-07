import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

const customerCreations = [
  {
    image: "/gallery/community/community-kitchen-laughs.webp",
    title: "Kitchen laughs",
    description: "A warm at-home portrait with the kind of smiles you never get from a timer shot.",
    likes: 184,
  },
  {
    image: "/gallery/community/community-generations-sofa.webp",
    title: "Three generations",
    description: "Grandparents, parents, and the newest tiny family member in one cozy frame.",
    likes: 267,
  },
  {
    image: "/gallery/community/community-beach-walk.webp",
    title: "Beach walk",
    description: "Soft evening light, sandy feet, and the family dog refusing to miss the moment.",
    likes: 143,
  },
  {
    image: "/gallery/community/community-snow-day.webp",
    title: "Snow day",
    description: "A playful winter portrait that feels more like a memory than a posed session.",
    likes: 319,
  },
  {
    image: "/gallery/community/community-apartment-baby.webp",
    title: "New baby at home",
    description: "Small-apartment warmth, sleepy baby energy, and a golden retriever cameo.",
    likes: 226,
  },
  {
    image: "/gallery/community/community-backyard-dinner.webp",
    title: "Backyard dinner",
    description: "An extended-family table under string lights, made for the group chat.",
    likes: 401,
  },
];

export const metadata: Metadata = {
  title: "See What Others Created | FamilyShoot Gallery",
  description:
    "Browse realistic FamilyShoot-style family portrait examples made for framed prints, holiday cards, grandparents, birthdays, and everyday family moments.",
  alternates: { canonical: `${SITE_URL}/gallery` },
};

export default function GalleryPage() {
  return (
    <>
      <Nav
        links={[
          { href: "/gallery", label: "Gallery" },
          { href: "/trending", label: "Trending 🔥" },
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
              Community gallery
            </span>
            <h1 className="serif mt-5 text-5xl leading-[1.02] tracking-[-0.03em] sm:text-7xl">
              See what others created.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
              Realistic family moments with different homes, seasons, people, and stories, not
              another repeat of the landing page vibe cards.
            </p>
          </div>
        </header>

        <section className="mx-auto mt-12 grid max-w-6xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {customerCreations.map((creation, index) => (
            <article
              key={creation.title}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={creation.image}
                  alt={`${creation.title} family portrait`}
                  fill
                  priority={index < 3}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[color:rgba(31,26,36,0.78)] via-[color:rgba(31,26,36,0.22)] to-transparent"
                  aria-hidden
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-sm font-bold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] backdrop-blur">
                  ❤️ {creation.likes.toLocaleString("en-US")}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h2 className="serif text-3xl leading-none tracking-[-0.02em] text-white drop-shadow-sm">
                    {creation.title}
                  </h2>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                  {creation.description}
                </p>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
