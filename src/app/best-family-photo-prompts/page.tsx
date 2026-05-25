import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";

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
  prompt: string;
  href?: string;
};

const FAMILYSHOOT_PROMPTS: PromptExample[] = [
  {
    title: "Studio Ghibli countryside family portrait",
    vibe: "Studio Ghibli",
    image: "/samples/theme-ghibli-countryside.jpg",
    href: "/ghibli-family-photos",
    prompt:
      "Create a warm Studio Ghibli-inspired family portrait in a sunlit countryside meadow, soft watercolor light, gentle wind in the grass, cozy handmade clothing, expressive but natural faces, dreamy storybook atmosphere, everyone clearly recognizable from the reference photos.",
  },
  {
    title: "Pixar-style animated family photo",
    vibe: "Pixar",
    image: "/samples/theme-pixar.jpg",
    href: "/pixar-family-photos",
    prompt:
      "Create a polished Pixar-inspired 3D family portrait with expressive stylized character design, soft rounded forms, warm cinematic lighting, rich tactile materials, appealing eyes, premium family-animation charm, and recognizable identities from the uploaded photos.",
  },
  {
    title: "Wes Anderson symmetrical family tableau",
    vibe: "Wes Anderson",
    image: "/samples/theme-wes-anderson.jpg",
    href: "/wes-anderson-family-photos",
    prompt:
      "Create a Wes Anderson-style family photo with perfect centered symmetry, pastel wardrobe, deadpan expressions, vintage hotel-lobby colors, tidy props, flat frontal composition, soft film grain, and the whole family posed like an elegant cinematic tableau.",
  },
  {
    title: "Slim Aarons poolside family portrait",
    vibe: "Slim Aarons",
    image: "/samples/theme-slim-aarons.jpg",
    href: "/slim-aarons-family-photos",
    prompt:
      "Create a Slim Aarons-inspired luxury family portrait by a turquoise pool, golden afternoon light, relaxed jet-set wardrobe, tasteful sunglasses, elegant resort architecture, candid-but-composed posing, warm film color, and effortless vacation energy.",
  },
  {
    title: "Norman Rockwell Americana family painting",
    vibe: "Norman Rockwell",
    image: "/samples/theme-norman-rockwell.jpg",
    href: "/norman-rockwell-family-photos",
    prompt:
      "Create a Norman Rockwell-inspired family portrait with warm Americana storytelling, soft painterly brushwork, expressive everyday gestures, cozy home details, gentle humor, glowing skin tones, and a frame-worthy illustrated magazine-cover finish.",
  },
  {
    title: "Editorial luxe family portrait",
    vibe: "Editorial Luxe",
    image: "/samples/theme-leibovitz.jpg",
    href: "/annie-leibovitz-family-photos",
    prompt:
      "Create a premium editorial family portrait with magazine-grade lighting, refined wardrobe color harmony, subtle luxury styling, clean professional retouch restraint, crisp faces, painterly shadows, and a polished Vanity Fair-style commercial portrait finish.",
  },
  {
    title: "Stacked Love black-and-white studio portrait",
    vibe: "Stacked Love",
    image: "/samples/theme-stacked-love.jpg",
    href: "/stacked-love-family-photos",
    prompt:
      "Create a viral black-and-white studio family portrait on a clean white background, everyone gently stacked and leaning together, close physical connection, soft studio lighting, natural smiles, crisp faces, elegant monochrome contrast, and a modern keepsake feel.",
  },
  {
    title: "Galactic family adventure poster",
    vibe: "Galactic Family Adventure",
    image: "/samples/theme-galactic-family-adventure.png",
    href: "/galactic-family-adventure-photos",
    prompt:
      "Create a heroic galactic family adventure portrait with twin-sun horizon light, cinematic hangar shadows, desert-planet atmosphere, subtle sci-fi wardrobe, epic but family-friendly composition, dramatic rim light, and everyone posed like brave explorers.",
  },
  {
    title: "Clay 3D keepsake family portrait",
    vibe: "Clay / 3D",
    image: "/samples/card-art-styles/clay-3d.jpg",
    href: "/clay-3d-family-portraits",
    prompt:
      "Create a tactile handmade clay 3D family portrait with matte clay texture, rounded sculpted forms, soft studio lighting, tiny handcrafted details, warm smiles, recognizable faces, and the charm of a miniature stop-motion keepsake diorama.",
  },
  {
    title: "Cinematic noir family photo",
    vibe: "Cinematic Noir",
    image: "/samples/theme-film-noir.jpg",
    prompt:
      "Create a premium cinematic noir family portrait in elegant black and white, dramatic window-shaped light, refined 1940s studio atmosphere, luminous monochrome skin tones, tailored wardrobe, polished film-still composition, and mysterious but warm family energy.",
  },
];

const NEW_PROMPTS: string[] = [
  "Create a white cyclorama studio family photo where every person has a different exaggerated face: one huge surprised grin, one dramatic raised eyebrow, one cartoonishly proud smile, one tiny confused squint, crisp fashion lighting, clean shadows, high-end campaign look.",
  "Create a super rich family portrait inside a private jet, cream leather seats, champagne glasses for adults only, designer luggage, polished wood details, glowing window light above the clouds, confident relaxed poses, luxury editorial photography finish.",
  "Create a soccer match team photo before the game, the family posed like a professional football squad on the pitch, matching jerseys with family names, stadium lights, muddy boots, serious game faces, one kid holding the ball, realistic sports photography.",
  "Create a zero-gravity family portrait floating inside a bright space station, hair and clothes gently drifting, toys and snacks suspended around them, Earth visible through a round window, playful astronaut socks, cinematic but believable lighting.",
  "Create a fridge magnet-style family photo, tiny glossy souvenir magnet texture, rounded plastic edges, bright vacation colors, cute slightly kitsch lettering, the family squeezed into a cheerful landmark scene, photographed as if stuck on a real refrigerator door.",
  "Create a Wanted Dead or Alive far west family poster, sepia parchment texture, each family member posed like an old western outlaw, cowboy hats and dust coats, dramatic saloon lighting, bold vintage typography, funny serious faces, worn paper edges.",
  "Create a family portrait posing on a fluffy cloud high in the sky during a blue and pink sunrise, soft pastel glow, dreamy pajamas and robes, gentle wind, golden rim light, magical but photoreal faces, peaceful heavenly atmosphere.",
  "Create a giant cereal-box family portrait, the family illustrated as the mascots on a colorful breakfast cereal package, oversized spoons, flying cereal rings, bold supermarket packaging design, playful smiles, glossy product-photo lighting.",
  "Create a royal museum oil portrait of the family as tiny rulers of an imaginary kingdom, velvet capes, toy crowns, ornate gold frame, dramatic old-master lighting, tiny family crest, majestic poses with slightly humorous seriousness.",
  "Create a family photo inside a snow globe, miniature winter village, sparkling flakes suspended in the glass, cozy scarves, curved glass reflections, warm cottage lights, the base engraved with Our Family, magical holiday keepsake style.",
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
                    alt={`${item.vibe} family photo prompt example`}
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

          <ol className="grid gap-4 md:grid-cols-2">
            {NEW_PROMPTS.map((prompt, index) => (
              <li
                key={prompt}
                className="rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-sm)]"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-bg-tinted-coral)] font-[var(--font-fraunces)] text-lg text-[color:var(--color-coral)]">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold text-[color:var(--color-ink)]">Prompt:</p>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                  {prompt}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
