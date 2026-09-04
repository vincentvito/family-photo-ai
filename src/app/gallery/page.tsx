import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { THEMES } from "@/lib/themes";
import GalleryCta from "./GalleryCta";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";
const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

type ThemeCreationInput = {
  themeId: string;
  title?: string;
  description?: string;
  likes: number;
  sourceLabel: GalleryCreation["sourceLabel"];
};

type GalleryCreation = {
  slug: string;
  image: string;
  title: string;
  description: string;
  likes: number;
  themeId: string;
  sourceLabel: "Community pick" | "Trending" | "New vibe";
};

const communityCreations: GalleryCreation[] = [
  {
    slug: "kitchen-laughs",
    image: "/gallery/community/community-kitchen-laughs.webp",
    title: "Kitchen laughs",
    description: "A warm at-home portrait with the kind of smiles you never get from a timer shot.",
    likes: 184,
    themeId: "kinfolk-kitchen",
    sourceLabel: "Community pick",
  },
  {
    slug: "three-generations",
    image: "/gallery/community/community-generations-sofa.webp",
    title: "Three generations",
    description: "Grandparents, parents, and the newest tiny family member in one cozy frame.",
    likes: 267,
    themeId: "sunday-sofa",
    sourceLabel: "Community pick",
  },
  {
    slug: "beach-walk",
    image: "/gallery/community/community-beach-walk.webp",
    title: "Beach walk",
    description: "Soft evening light, sandy feet, and the family dog refusing to miss the moment.",
    likes: 143,
    themeId: "golden-hour-beach",
    sourceLabel: "Community pick",
  },
  {
    slug: "snow-day",
    image: "/gallery/community/community-snow-day.webp",
    title: "Snow day",
    description: "A playful winter portrait that feels more like a memory than a posed session.",
    likes: 319,
    themeId: "christmas-morning",
    sourceLabel: "Community pick",
  },
  {
    slug: "new-baby-at-home",
    image: "/gallery/community/community-apartment-baby.webp",
    title: "New baby at home",
    description: "Small-apartment warmth, sleepy baby energy, and a golden retriever cameo.",
    likes: 226,
    themeId: "kinfolk-kitchen",
    sourceLabel: "Community pick",
  },
  {
    slug: "backyard-dinner",
    image: "/gallery/community/community-backyard-dinner.webp",
    title: "Backyard dinner",
    description: "An extended-family table under string lights, made for the group chat.",
    likes: 401,
    themeId: "backyard-picnic",
    sourceLabel: "Community pick",
  },
];

const trendingCreations: ThemeCreationInput[] = [
  {
    themeId: "pop-icon-stage-portrait",
    title: "Stage lights",
    likes: 532,
    sourceLabel: "Trending",
  },
  {
    themeId: "galactic-family-adventure",
    title: "Galactic weekend",
    likes: 489,
    sourceLabel: "Trending",
  },
  {
    themeId: "stacked-love",
    title: "Stacked studio hug",
    likes: 458,
    sourceLabel: "Trending",
  },
  {
    themeId: "golden-hour-beach",
    title: "Golden hour cousins",
    likes: 376,
    sourceLabel: "Trending",
  },
  {
    themeId: "christmas-morning",
    title: "Holiday pajama chaos",
    likes: 344,
    sourceLabel: "Trending",
  },
  {
    themeId: "runway-editor-in-chief-family-editorial",
    title: "Runway family edit",
    likes: 297,
    sourceLabel: "Trending",
  },
];

const newVibeCreations: ThemeCreationInput[] = [
  {
    themeId: "noughties-family-throwback",
    title: "Mall-photo throwback",
    likes: 219,
    sourceLabel: "New vibe",
  },
  {
    themeId: "dockside-family-weekend",
    title: "Dockside weekend",
    likes: 188,
    sourceLabel: "New vibe",
  },
  {
    themeId: "backyard-sports-day-portrait",
    title: "Backyard sports day",
    likes: 241,
    sourceLabel: "New vibe",
  },
  {
    themeId: "slow-travel-summer-picnic",
    title: "Slow picnic afternoon",
    likes: 172,
    sourceLabel: "New vibe",
  },
  {
    themeId: "sunset-festival-family-glow",
    title: "Festival glow",
    likes: 263,
    sourceLabel: "New vibe",
  },
  {
    themeId: "summer-color-pop-studio",
    title: "Color pop studio",
    likes: 205,
    sourceLabel: "New vibe",
  },
  {
    themeId: "private-jet-family",
    title: "Private jet arrival",
    likes: 154,
    sourceLabel: "New vibe",
  },
];

function themeCreation(input: ThemeCreationInput): GalleryCreation {
  const theme = THEME_BY_ID.get(input.themeId);

  return {
    slug: input.themeId,
    image: theme?.coverImage ?? "/samples/hero.jpg",
    title: input.title ?? theme?.name ?? "Family creation",
    description:
      input.description ??
      theme?.blurb ??
      "A FamilyShoot vibe customers can use as a starting point.",
    likes: input.likes,
    themeId: input.themeId,
    sourceLabel: input.sourceLabel,
  };
}

const customerCreations = [
  ...communityCreations,
  ...trendingCreations.map(themeCreation),
  ...newVibeCreations.map(themeCreation),
];

export const metadata: Metadata = {
  title: "See What Others Created | FamilyShoot Gallery",
  description:
    "Browse realistic FamilyShoot-style family portrait examples, trending vibes, and new vibe ideas made for framed prints, holiday cards, grandparents, birthdays, and everyday family moments.",
  alternates: { canonical: `${SITE_URL}/gallery` },
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: Promise<{ creation?: string }>;
}) {
  const params = await searchParams;
  const selectedCreation =
    customerCreations.find((creation) => creation.slug === params?.creation) ?? null;

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
              Realistic family moments, trending picks, and new vibe shots with different homes,
              seasons, people, and stories.
            </p>
          </div>
        </header>

        <section className="mx-auto mt-12 grid max-w-6xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {customerCreations.map((creation, index) => (
            <article
              key={creation.slug}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
            >
              <Link
                href={`/gallery?creation=${encodeURIComponent(creation.slug)}`}
                className="block w-full text-left"
                aria-label={`Open ${creation.title} creation`}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--color-bg-tinted-sage)]">
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
                    {creation.likes.toLocaleString("en-US")} likes
                  </div>
                  <div className="absolute right-4 top-4 rounded-full bg-[color:var(--color-ink)]/78 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[var(--shadow-sm)] backdrop-blur">
                    {creation.sourceLabel}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h2 className="serif text-3xl leading-none tracking-[-0.02em] text-white drop-shadow-sm">
                      {creation.title}
                    </h2>
                  </div>
                </div>
              </Link>
              <div className="px-5 py-4">
                <p className="text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                  {creation.description}
                </p>
              </div>
            </article>
          ))}
        </section>

        {selectedCreation && (
          <div
            className="fixed inset-0 z-[80] overflow-y-auto bg-[color:rgba(31,26,36,0.72)] px-4 py-6 backdrop-blur-sm md:flex md:items-center md:justify-center md:py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-creation-title"
          >
            <Link
              href="/gallery"
              aria-label="Close creation preview"
              className="fixed inset-0 cursor-default"
            />
            <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[var(--radius-xl)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-lg)] md:max-h-[92vh] md:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
              <div className="relative min-h-[300px] bg-[color:var(--color-bg-tinted-sage)] sm:min-h-[420px] md:min-h-[620px]">
                <Image
                  src={selectedCreation.image}
                  alt={`${selectedCreation.title} family portrait`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-sm font-bold text-[color:var(--color-ink)] shadow-[var(--shadow-sm)] backdrop-blur">
                  {selectedCreation.likes.toLocaleString("en-US")} likes
                </div>
              </div>
              <div className="flex flex-col p-6 md:max-h-[92vh] md:overflow-y-auto md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="chip chip-coral">{selectedCreation.sourceLabel}</span>
                  <Link
                    href="/gallery"
                    className="rounded-full border border-[color:var(--color-line)] px-3 py-1 text-sm font-bold text-[color:var(--color-ink-muted)] transition-colors hover:bg-[color:var(--color-bg-tinted-coral)] hover:text-[color:var(--color-coral-deep)]"
                    aria-label="Close creation preview"
                  >
                    Close
                  </Link>
                </div>
                <h2
                  id="gallery-creation-title"
                  className="serif mt-6 text-4xl leading-[1.04] tracking-[-0.03em] sm:text-5xl"
                >
                  {selectedCreation.title}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[color:var(--color-ink-muted)]">
                  {selectedCreation.description}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                  Use this vibe as a starting point, then upload your own family photos and adjust
                  the people, pets, and style inside the studio.
                </p>
                <div className="mt-auto pt-8">
                  <GalleryCta
                    themeId={selectedCreation.themeId}
                    themeCategory={
                      THEME_BY_ID.get(selectedCreation.themeId)?.category ?? "photoreal"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
