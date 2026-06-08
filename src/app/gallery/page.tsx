import type { Metadata } from "next";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { THEMES } from "@/lib/themes";
import GalleryExperience, { type GalleryCreation } from "./GalleryExperience";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";
const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

type ThemeCreationInput = {
  themeId: string;
  title?: string;
  description?: string;
  likes: number;
  sourceLabel: GalleryCreation["sourceLabel"];
};

const communityCreations: GalleryCreation[] = [
  {
    image: "/gallery/community/community-kitchen-laughs.webp",
    title: "Kitchen laughs",
    description: "A warm at-home portrait with the kind of smiles you never get from a timer shot.",
    likes: 184,
    themeId: "kinfolk-kitchen",
    sourceLabel: "Community pick",
  },
  {
    image: "/gallery/community/community-generations-sofa.webp",
    title: "Three generations",
    description: "Grandparents, parents, and the newest tiny family member in one cozy frame.",
    likes: 267,
    themeId: "sunday-sofa",
    sourceLabel: "Community pick",
  },
  {
    image: "/gallery/community/community-beach-walk.webp",
    title: "Beach walk",
    description: "Soft evening light, sandy feet, and the family dog refusing to miss the moment.",
    likes: 143,
    themeId: "golden-hour-beach",
    sourceLabel: "Community pick",
  },
  {
    image: "/gallery/community/community-snow-day.webp",
    title: "Snow day",
    description: "A playful winter portrait that feels more like a memory than a posed session.",
    likes: 319,
    themeId: "christmas-morning",
    sourceLabel: "Community pick",
  },
  {
    image: "/gallery/community/community-apartment-baby.webp",
    title: "New baby at home",
    description: "Small-apartment warmth, sleepy baby energy, and a golden retriever cameo.",
    likes: 226,
    themeId: "kinfolk-kitchen",
    sourceLabel: "Community pick",
  },
  {
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
              Realistic family moments, trending picks, and new vibe shots with different homes,
              seasons, people, and stories.
            </p>
          </div>
        </header>

        <GalleryExperience creations={customerCreations} />
      </main>
      <Footer />
    </>
  );
}
