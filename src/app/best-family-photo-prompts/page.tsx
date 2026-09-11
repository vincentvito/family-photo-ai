import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import PromptExampleCard from "@/components/landing/PromptExampleCard";
import {
  ALL_FAMILY_PHOTO_PROMPTS,
  FAMILYSHOOT_PROMPTS,
  NEW_PROMPTS,
} from "@/data/family-photo-prompts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

export const metadata: Metadata = {
  title: { absolute: "Best Family Photo Prompts: 22 Examples | FamilyShoot" },
  description:
    "Try 22 AI family photo prompts with example images. Copy superhero, Ghibli, Minecraft and creative scene prompts, or create the look with your own photos.",
  keywords: [
    "best family photo prompts",
    "AI family photo prompts",
    "family portrait prompts",
    "AI family portrait ideas",
    "family photoshoot prompts",
    "creative family photo ideas",
  ],
  alternates: { canonical: `${SITE_URL}/best-family-photo-prompts` },
  openGraph: {
    title: "Best Family Photo Prompts: 22 Examples | FamilyShoot",
    description:
      "Browse 22 prompts with example images, including superhero, Ghibli and Minecraft family portraits. Copy a prompt or try the look with your photos.",
    url: `${SITE_URL}/best-family-photo-prompts`,
    type: "article",
    images: [
      {
        url: "/samples/best-family-photo-prompts/white-cyclorama-exaggerated-faces.webp",
        width: 1200,
        height: 900,
        alt: "White cyclorama family photo prompt example",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Family Photo Prompts: 22 Examples | FamilyShoot",
    description:
      "Copy family photo prompt ideas with example images for AI portraits, cards, and creative family keepsakes.",
    images: ["/samples/best-family-photo-prompts/white-cyclorama-exaggerated-faces.webp"],
  },
};

const PROMPT_GUIDE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Best prompts to create a family photo",
  description:
    "Copy-ready AI family photo prompt examples with finished-image inspiration from FamilyShoot.",
  url: `${SITE_URL}/best-family-photo-prompts`,
  numberOfItems: ALL_FAMILY_PHOTO_PROMPTS.length,
  itemListElement: ALL_FAMILY_PHOTO_PROMPTS.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.title,
    url: `${SITE_URL}/best-family-photo-prompts#${item.id}`,
    image: `${SITE_URL}${item.image}`,
  })),
};

export default function BestFamilyPhotoPromptsPage() {
  return (
    <>
      <Nav
        links={[
          { href: "/vibes", label: "Vibes" },
          { href: "/styles", label: "Styles" },
          { href: "/gallery", label: "Gallery" },
          { href: "/studio/roster", label: "Start a shoot" },
        ]}
      />
      <main className="bg-[color:var(--color-bg)] pb-20 pt-28">
        <header className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <span className="chip chip-coral">
              <span className="dot dot-coral" />
              Prompt guide
            </span>
            <h1 className="serif mt-5 text-5xl leading-[1.02] tracking-[-0.03em] sm:text-7xl">
              Best prompts to create a family photo.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
              Browse 22 AI family photo prompts with example images, from superhero rooftop
              portraits to Ghibli countryside scenes and Minecraft builds. Copy a prompt, or choose
              “Create this look” to try it with your own family photos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio/roster" className="btn btn-coral btn-lg spring-press">
                Create your family photo
              </Link>
              <a href="#new-prompts" className="btn btn-ghost btn-lg spring-press">
                Jump to new prompts
              </a>
            </div>
            <nav
              aria-label="Popular family photo prompts"
              className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-[color:var(--color-coral)]"
            >
              <a href="#prompt-21" className="underline">
                Superhero prompts
              </a>
              <a href="#prompt-1" className="underline">
                Ghibli prompts
              </a>
              <a href="#prompt-22" className="underline">
                Minecraft prompts
              </a>
            </nav>
          </div>
          <ol
            aria-label="How to use these family photo prompts"
            className="mt-10 grid gap-5 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 md:grid-cols-3"
          >
            <li>
              <h2 className="font-semibold">1. Pick a scene</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Choose an example below. “Copy prompt” saves the text; “Create this look” opens a
                custom shoot with it filled in.
              </p>
            </li>
            <li>
              <h2 className="font-semibold">2. Add clear reference photos</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Use a well-lit photo for each person or pet. Separate photos work. Keep faces
                unobstructed and select everyone you want in the portrait.
              </p>
            </li>
            <li>
              <h2 className="font-semibold">3. Adjust and preview</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Edit the setting, clothes, or framing, then generate. Check faces in your first free
                watermarked preview before unlocking high-resolution files.
              </p>
            </li>
          </ol>
        </header>

        <section className="mx-auto mt-16 max-w-6xl px-6">
          <div className="mb-7 max-w-3xl">
            <p className="small-caps text-[color:var(--color-coral)]">12 styles to try</p>
            <h2 className="serif mt-2 text-4xl tracking-[-0.03em] sm:text-5xl">
              Family photo prompts with example images
            </h2>
            <p className="mt-4 text-[color:var(--color-ink-muted)]">
              Start with a superhero, Ghibli, or Minecraft scene, then explore more portrait styles.
              These recipes are paired with existing gallery examples of each look. Your result will
              vary with the reference photos and details you choose.
            </p>
          </div>

          <ol className="grid gap-6 lg:grid-cols-2">
            {FAMILYSHOOT_PROMPTS.map((item, index) => (
              <li key={item.id}>
                <PromptExampleCard
                  example={item}
                  number={index + 1}
                  styleHref={item.href}
                  styleLabel={`Explore ${item.vibe}`}
                />
              </li>
            ))}
          </ol>
        </section>

        <section id="new-prompts" className="mx-auto mt-20 max-w-6xl px-6">
          <div className="mb-7 max-w-3xl">
            <p className="small-caps text-[color:var(--color-coral)]">10 creative scenes</p>
            <h2 className="serif mt-2 text-4xl tracking-[-0.03em] sm:text-5xl">
              More creative family photo prompt ideas
            </h2>
            <p className="mt-4 text-[color:var(--color-ink-muted)]">
              Try exaggerated studio faces, private jets, soccer lineups, zero gravity, fridge
              magnets, and more. Each prompt opens directly in a custom shoot, where you can change
              the scene to suit the people and pets in your photos.
            </p>
          </div>

          <ol className="grid gap-6 lg:grid-cols-2">
            {NEW_PROMPTS.map((item, index) => (
              <li key={item.id}>
                <PromptExampleCard
                  example={item}
                  number={index + 1}
                  styleHref={item.href}
                  styleLabel="Explore this style"
                />
              </li>
            ))}
          </ol>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(PROMPT_GUIDE_JSONLD).replace(/</g, "\\u003c"),
        }}
      />
      <Footer />
    </>
  );
}
