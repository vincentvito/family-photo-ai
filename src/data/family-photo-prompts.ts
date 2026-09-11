import { VIBES } from "@/data/vibes";
import { STYLE_PROMPT_EXAMPLES } from "@/data/style-prompt-examples";
import { THEME_VARIATION_PROMPTS } from "@/lib/theme-variations";

export type PromptExample = {
  id: string;
  title: string;
  image: string;
  alt: string;
  prompt: string;
  href?: string;
  vibe?: string;
  tips?: readonly string[];
};

const VIBE_THEME_IDS: Record<string, string> = {
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

// Keep the original 20 anchor URLs stable while putting popular styles first.
const FEATURED_STYLES = [
  { slug: "superhero-family-photos", id: "prompt-21", name: "Superhero" },
  { slug: "ghibli-family-photos", id: "prompt-1", name: "Ghibli" },
  { slug: "minecraft-family-photos", id: "prompt-22", name: "Minecraft" },
];

export const FAMILYSHOOT_PROMPTS: PromptExample[] = [
  ...FEATURED_STYLES.map(({ slug, id, name }) => ({
    ...STYLE_PROMPT_EXAMPLES[slug][0],
    id,
    href: `/${slug}`,
    vibe: name,
  })),
  ...VIBES.slice(1, 10).map((vibe, index) => ({
    id: `prompt-${index + 2}`,
    title: `${vibe.name} family photo prompt`,
    vibe: vibe.name,
    image: vibe.image,
    alt: `${vibe.name} family photo example`,
    href: `/${vibe.slug}`,
    prompt: `Create a family portrait in the ${vibe.name} style from the selected reference photos. ${vibe.shortDescription} ${THEME_VARIATION_PROMPTS[VIBE_THEME_IDS[vibe.slug]]?.[0] ?? "Keep each selected person or pet visible."}`,
  })),
];

const CREATIVE_PROMPTS: Omit<PromptExample, "id">[] = [
  {
    title: "White cyclorama exaggerated faces",
    image: "/samples/best-family-photo-prompts/white-cyclorama-exaggerated-faces.webp",
    alt: "Family portrait in a white cyclorama studio with exaggerated facial expressions",
    href: "/white-cyclorama-family-photos",
    prompt:
      "Create a white cyclorama studio family photo where every person has a different exaggerated face: choose from a huge surprised grin, a dramatic raised eyebrow, a proudly playful smile, or a tiny confused squint, crisp fashion lighting, clean shadows, high-end campaign look.",
  },
  {
    title: "Private jet family",
    image: "/samples/best-family-photo-prompts/private-jet-family.webp",
    alt: "Luxury family portrait inside a private jet above the clouds",
    href: "/private-jet-family-photos",
    prompt:
      "Create a super rich family portrait inside a private jet, cream leather seats, champagne glasses for adults only, designer luggage, polished wood details, glowing window light above the clouds, confident relaxed poses, luxury editorial photography finish.",
  },
  {
    title: "Soccer team family",
    image: "/samples/best-family-photo-prompts/soccer-team-family.webp",
    alt: "Family posed as a professional soccer team on a stadium pitch",
    href: "/soccer-team-family-photos",
    prompt:
      "Create a soccer match team photo before the game, the family posed like a professional football squad on the pitch, matching blank jerseys with no club crests or readable names, stadium lights, muddy boots, serious game faces, one selected person holding the ball, realistic sports photography.",
  },
  {
    title: "Zero gravity family",
    image: "/samples/best-family-photo-prompts/zero-gravity-family.webp",
    alt: "Family floating in zero gravity inside a bright space station",
    href: "/zero-gravity-family-photos",
    prompt:
      "Create a zero-gravity family portrait floating inside a bright space station, hair and clothes gently drifting, toys and snacks suspended around them, Earth visible through a round window, playful astronaut socks, cinematic but believable lighting.",
  },
  {
    title: "Fridge magnet family",
    image: "/samples/best-family-photo-prompts/fridge-magnet-family.webp",
    alt: "Family portrait styled as a glossy vacation fridge magnet",
    prompt:
      "Create a fridge magnet-style family photo, tiny glossy souvenir magnet texture, rounded plastic edges, bright vacation colors, decorative blank souvenir-label shapes with no readable lettering, the family squeezed into a cheerful landmark scene, photographed as if stuck on a real refrigerator door.",
  },
  {
    title: "Western wanted family",
    image: "/samples/best-family-photo-prompts/western-wanted-family.webp",
    alt: "Sepia western wanted poster family portrait",
    href: "/western-wanted-family-photos",
    prompt:
      "Create a far west family poster with no readable text, sepia parchment texture, each family member posed like an old western outlaw, cowboy hats and dust coats, dramatic saloon lighting, blank decorative vintage typography bands, funny serious faces, worn paper edges.",
  },
  {
    title: "Fluffy cloud family",
    image: "/samples/best-family-photo-prompts/fluffy-cloud-family.webp",
    alt: "Dreamy family portrait on a fluffy cloud at sunrise",
    href: "/fluffy-cloud-family-photos",
    prompt:
      "Create a family portrait posing on a fluffy cloud high in the sky during a blue and pink sunrise, soft pastel glow, dreamy pajamas and robes, gentle wind, golden rim light, magical but photoreal faces, peaceful heavenly atmosphere.",
  },
  {
    title: "Cereal box family",
    image: "/samples/best-family-photo-prompts/cereal-box-family.webp",
    alt: "Family illustrated as mascots on a colorful cereal box",
    href: "/cereal-box-family-photos",
    prompt:
      "Create a giant cereal-box family portrait, the family illustrated as the mascots on a colorful breakfast cereal package, oversized spoons, flying cereal rings, bold supermarket packaging design, playful smiles, glossy product-photo lighting.",
  },
  {
    title: "Royal museum family",
    image: "/samples/best-family-photo-prompts/royal-museum-family.webp",
    alt: "Family painted as tiny rulers in a royal museum oil portrait",
    prompt:
      "Create a royal museum oil portrait of the family as tiny rulers of an imaginary kingdom, velvet capes, toy crowns, ornate gold frame, dramatic old-master lighting, tiny family crest, majestic poses with slightly humorous seriousness.",
  },
  {
    title: "Snow globe family",
    image: "/samples/best-family-photo-prompts/snow-globe-family.webp",
    alt: "Family photo inside a sparkling winter snow globe",
    prompt:
      "Create a family photo inside a snow globe, miniature winter village, sparkling flakes suspended in the glass, cozy scarves, curved glass reflections, warm cottage lights, a polished blank base with no readable engraving, magical holiday keepsake style.",
  },
];

export const NEW_PROMPTS: PromptExample[] = CREATIVE_PROMPTS.map((example, index) => ({
  ...example,
  id: `prompt-${index + 11}`,
}));

export const ALL_FAMILY_PHOTO_PROMPTS = [...FAMILYSHOOT_PROMPTS, ...NEW_PROMPTS];
