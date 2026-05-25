import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { VIBES } from "@/data/vibes";
import { THEME_VARIATION_PROMPTS } from "@/lib/theme-variations";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

export const metadata: Metadata = {
  title: "Best Prompts to Create a Family Photo | FamilyShoot",
  description:
    "Copy the best family photo prompts for AI portraits, from FamilyShoot vibes to new creative ideas like private jets, soccer team photos, zero gravity, fridge magnets, and western wanted posters.",
  alternates: { canonical: `${SITE_URL}/best-family-photo-prompts` },
};

type PromptExample = {
  title: string;
  vibe: string;
  image: string;
  alt: string;
  prompt: string;
  href?: string;
};

type NewPromptExample = {
  title: string;
  image: string;
  alt: string;
  prompt: string;
};

const FIRST_TEN_VIBE_THEME_IDS: Record<string, string> = {
  "ghibli-family-photos": "ghibli-countryside",
  "spirited-away-family-photos": "spirited-away",
  "pixar-family-photos": "pixar-family",
  "aardman-family-photos": "aardman-claymation",
  "wes-anderson-family-photos": "wes-anderson",
  "slim-aarons-family-photos": "slim-aarons",
  "norman-rockwell-family-photos": "norman-rockwell",
  "annie-leibovitz-family-photos": "leibovitz-studio",
  "stacked-love-family-photos": "stacked-love",
  "pop-icon-stage-family-photos": "pop-icon-stage-portrait",
};

const FAMILYSHOOT_PROMPTS: PromptExample[] = VIBES.slice(0, 10).map((vibe) => {
  const themeId = FIRST_TEN_VIBE_THEME_IDS[vibe.slug];
  const prompt = themeId ? THEME_VARIATION_PROMPTS[themeId]?.[0] : undefined;

  return {
    title: `${vibe.name} family photo prompt`,
    vibe: vibe.name,
    image: vibe.image,
    alt: `${vibe.name} family photo example`,
    href: `/${vibe.slug}`,
    prompt:
      prompt ??
      `Create a FamilyShoot ${vibe.name} family portrait using this vibe: ${vibe.shortDescription}`,
  };
});

const NEW_PROMPTS: NewPromptExample[] = [
  {
    title: "White cyclorama exaggerated faces",
    image: "/samples/best-family-photo-prompts/white-cyclorama-exaggerated-faces.png",
    alt: "Family portrait in a white cyclorama studio with exaggerated facial expressions",
    prompt:
      "Create a white cyclorama studio family photo where every person has a different exaggerated face: one huge surprised grin, one dramatic raised eyebrow, one cartoonishly proud smile, one tiny confused squint, crisp fashion lighting, clean shadows, high-end campaign look.",
  },
  {
    title: "Private jet family",
    image: "/samples/best-family-photo-prompts/private-jet-family.png",
    alt: "Luxury family portrait inside a private jet above the clouds",
    prompt:
      "Create a super rich family portrait inside a private jet, cream leather seats, champagne glasses for adults only, designer luggage, polished wood details, glowing window light above the clouds, confident relaxed poses, luxury editorial photography finish.",
  },
  {
    title: "Soccer team family",
    image: "/samples/best-family-photo-prompts/soccer-team-family.png",
    alt: "Family posed as a professional soccer team on a stadium pitch",
    prompt:
      "Create a soccer match team photo before the game, the family posed like a professional football squad on the pitch, matching jerseys with family names, stadium lights, muddy boots, serious game faces, one kid holding the ball, realistic sports photography.",
  },
  {
    title: "Zero gravity family",
    image: "/samples/best-family-photo-prompts/zero-gravity-family.png",
    alt: "Family floating in zero gravity inside a bright space station",
    prompt:
      "Create a zero-gravity family portrait floating inside a bright space station, hair and clothes gently drifting, toys and snacks suspended around them, Earth visible through a round window, playful astronaut socks, cinematic but believable lighting.",
  },
  {
    title: "Fridge magnet family",
    image: "/samples/best-family-photo-prompts/fridge-magnet-family.png",
    alt: "Family portrait styled as a glossy vacation fridge magnet",
    prompt:
      "Create a fridge magnet-style family photo, tiny glossy souvenir magnet texture, rounded plastic edges, bright vacation colors, cute slightly kitsch lettering, the family squeezed into a cheerful landmark scene, photographed as if stuck on a real refrigerator door.",
  },
  {
    title: "Western wanted family",
    image: "/samples/best-family-photo-prompts/western-wanted-family.png",
    alt: "Sepia western wanted poster family portrait",
    prompt:
      "Create a Wanted Dead or Alive far west family poster, sepia parchment texture, each family member posed like an old western outlaw, cowboy hats and dust coats, dramatic saloon lighting, bold vintage typography, funny serious faces, worn paper edges.",
  },
  {
    title: "Fluffy cloud family",
    image: "/samples/best-family-photo-prompts/fluffy-cloud-family.png",
    alt: "Dreamy family portrait on a fluffy cloud at sunrise",
    prompt:
      "Create a family portrait posing on a fluffy cloud high in the sky during a blue and pink sunrise, soft pastel glow, dreamy pajamas and robes, gentle wind, golden rim light, magical but photoreal faces, peaceful heavenly atmosphere.",
  },
  {
    title: "Cereal box family",
    image: "/samples/best-family-photo-prompts/cereal-box-family.png",
    alt: "Family illustrated as mascots on a colorful cereal box",
    prompt:
      "Create a giant cereal-box family portrait, the family illustrated as the mascots on a colorful breakfast cereal package, oversized spoons, flying cereal rings, bold supermarket packaging design, playful smiles, glossy product-photo lighting.",
  },
  {
    title: "Royal museum family",
    image: "/samples/best-family-photo-prompts/royal-museum-family.png",
    alt: "Family painted as tiny rulers in a royal museum oil portrait",
    prompt:
      "Create a royal museum oil portrait of the family as tiny rulers of an imaginary kingdom, velvet capes, toy crowns, ornate gold frame, dramatic old-master lighting, tiny family crest, majestic poses with slightly humorous seriousness.",
  },
  {
    title: "Snow globe family",
    image: "/samples/best-family-photo-prompts/snow-globe-family.png",
    alt: "Family photo inside a sparkling winter snow globe",
    prompt:
      "Create a family photo inside a snow globe, miniature winter village, sparkling flakes suspended in the glass, cozy scarves, curved glass reflections, warm cottage lights, the base engraved with Our Family, magical holiday keepsake style.",
  },
];

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
              If you are searching for the best family photo prompts, start here. Copy a proven
              FamilyShoot vibe prompt, or use one of the new weird, polished, and memorable ideas
              below.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio/roster" className="btn btn-coral btn-lg spring-press">
                Create your family photo
              </Link>
              <a href="#new-prompts" className="btn btn-ghost btn-lg spring-press">
                Jump to new prompts
              </a>
            </div>
          </div>
        </header>

        <section className="mx-auto mt-16 max-w-6xl px-6">
          <div className="mb-7 max-w-3xl">
            <p className="small-caps text-[color:var(--color-coral)]">10 prompts from our vibes</p>
            <h2 className="serif mt-2 text-4xl tracking-[-0.03em] sm:text-5xl">
              FamilyShoot prompts with example final images
            </h2>
            <p className="mt-4 text-[color:var(--color-ink-muted)]">
              These are prompt recipes based on FamilyShoot styles and vibes. Each one is paired
              with the relative final-image style used in the product.
            </p>
          </div>

          <ol className="grid gap-6 lg:grid-cols-2">
            {FAMILYSHOOT_PROMPTS.map((item, index) => (
              <li
                key={item.title}
                className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)]"
              >
                <div className="relative aspect-[4/3] bg-[color:var(--color-bg-tinted-sage)]">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-[color:var(--color-bg-elevated)]/92 px-3 py-1 font-[var(--font-fraunces)] text-2xl leading-none text-[color:var(--color-coral)] shadow-[var(--shadow-sm)] backdrop-blur">
                    {index + 1}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip chip-sage">{item.vibe}</span>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-sm font-semibold text-[color:var(--color-coral)] hover:underline"
                      >
                        View vibe
                      </Link>
                    ) : null}
                  </div>
                  <h3 className="serif mt-4 text-3xl tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-4 text-sm font-semibold text-[color:var(--color-ink)]">
                    Prompt:
                  </p>
                  <blockquote className="mt-2 rounded-[var(--radius-lg)] bg-[color:var(--color-bg)] p-4 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                    {item.prompt}
                  </blockquote>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="new-prompts" className="mx-auto mt-20 max-w-6xl px-6">
          <div className="mb-7 max-w-3xl">
            <p className="small-caps text-[color:var(--color-coral)]">10 completely new prompts</p>
            <h2 className="serif mt-2 text-4xl tracking-[-0.03em] sm:text-5xl">
              New creative family photo prompt ideas
            </h2>
            <p className="mt-4 text-[color:var(--color-ink-muted)]">
              These go beyond the current catalog: exaggerated studio faces, private jets, soccer
              lineups, zero gravity, fridge magnets, western posters, sky clouds, and more.
            </p>
          </div>

          <ol className="grid gap-6 lg:grid-cols-2">
            {NEW_PROMPTS.map((item, index) => (
              <li
                key={item.title}
                className="overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)]"
              >
                <div className="relative aspect-[4/3] bg-[color:var(--color-bg-tinted-coral)]">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-[color:var(--color-bg-elevated)]/92 px-3 py-1 font-[var(--font-fraunces)] text-2xl leading-none text-[color:var(--color-coral)] shadow-[var(--shadow-sm)] backdrop-blur">
                    {index + 1}
                  </div>
                </div>
                <div className="p-6">
                  <span className="chip chip-coral">New prompt</span>
                  <h3 className="serif mt-4 text-3xl tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-4 text-sm font-semibold text-[color:var(--color-ink)]">
                    Prompt:
                  </p>
                  <blockquote className="mt-2 rounded-[var(--radius-lg)] bg-[color:var(--color-bg)] p-4 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                    {item.prompt}
                  </blockquote>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
