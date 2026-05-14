export const CARD_STYLE_SLOT_COUNT = 4;

export const CARD_ART_STYLE_IDS = [
  "photoshoot",
  "watercolor",
  "pixar",
  "storybook",
  "oil-painting",
  "clay-3d",
  "editorial-luxe",
  "colored-pencil",
  "cinematic-noir",
] as const;

export type CardArtStyleId = (typeof CARD_ART_STYLE_IDS)[number];
export type CardSlotStyleSelection = CardArtStyleId | "default";

export type CardArtStyle = {
  id: CardArtStyleId;
  name: string;
  shortName: string;
  blurb: string;
  previewImage: string;
  promptDirective: string;
  proOnly?: boolean;
};

export const DEFAULT_CARD_ART_STYLE_ID: CardArtStyleId = "photoshoot";

export const CARD_ART_STYLES: readonly CardArtStyle[] = [
  {
    id: "photoshoot",
    name: "Photoshoot",
    shortName: "Photo",
    blurb: "Natural portrait polish with real light and believable camera texture.",
    previewImage: "/samples/card-art-styles/photoshoot.jpg",
    promptDirective:
      "Apply a premium natural photoshoot treatment: realistic camera optics, natural skin texture, soft editorial lighting, and believable photographic detail.",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    shortName: "Watercolor",
    blurb: "Soft washes, paper grain, delicate edges, and airy color.",
    previewImage: "/samples/card-art-styles/watercolor.jpg",
    promptDirective:
      "Apply a delicate watercolor illustration treatment: translucent washes, visible textured paper grain, soft edges, gentle pigment blooms, and airy color.",
  },
  {
    id: "pixar",
    name: "Pixar",
    shortName: "Pixar",
    blurb: "Warm 3D animated character charm with cinematic family-card polish.",
    previewImage: "/samples/theme-pixar.jpg",
    promptDirective:
      "Apply a polished Pixar-inspired 3D animated feature treatment: expressive stylized character design, soft rounded forms, warm cinematic lighting, rich tactile materials, appealing eyes, and premium family-animation charm.",
  },
  {
    id: "storybook",
    name: "Storybook",
    shortName: "Storybook",
    blurb: "Cozy illustrated charm with soft ink and family-card sweetness.",
    previewImage: "/samples/card-art-styles/storybook.jpg",
    promptDirective:
      "Apply a cozy storybook illustration treatment: soft ink outlines, warm painted details, lightly whimsical character styling, and a gentle keepsake-book finish.",
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    shortName: "Oil",
    blurb: "Painterly brush texture, warm depth, and classic portrait richness.",
    previewImage: "/samples/card-art-styles/oil-painting.jpg",
    promptDirective:
      "Apply a classical oil painting treatment: layered brush texture, rich warm depth, gentle chiaroscuro, painterly edges, and a refined heirloom portrait finish.",
  },
  {
    id: "clay-3d",
    name: "Clay / 3D",
    shortName: "Clay",
    blurb: "Handmade 3D character softness with tactile clay detail.",
    previewImage: "/samples/card-art-styles/clay-3d.jpg",
    promptDirective:
      "Apply a tactile handmade clay / 3D character treatment: matte clay texture, rounded sculpted forms, soft studio lighting, and handcrafted keepsake charm.",
  },
  {
    id: "editorial-luxe",
    name: "Editorial Luxe",
    shortName: "Luxe",
    blurb: "Magazine-grade portrait polish, refined wardrobe color, and elevated lighting.",
    previewImage: "/samples/theme-leibovitz.jpg",
    promptDirective:
      "Apply a premium editorial portrait treatment: magazine-grade lighting, refined wardrobe color harmony, subtle luxury styling, clean professional retouch restraint, crisp faces, and polished commercial portrait finish.",
    proOnly: true,
  },
  {
    id: "colored-pencil",
    name: "Colored Pencil",
    shortName: "Pencil",
    blurb: "Layered pencil texture, warm paper tone, and handmade keepsake detail.",
    previewImage: "/samples/card-art-styles/colored-pencil.jpg",
    promptDirective:
      "Apply a premium colored-pencil illustration treatment: layered pencil strokes, warm toothy paper, precise hand-drawn facial detail, gentle tonal blending, and refined keepsake-card craft.",
    proOnly: true,
  },
  {
    id: "cinematic-noir",
    name: "Cinematic Noir",
    shortName: "Noir",
    blurb: "Elegant contrast, dramatic window light, and classic studio atmosphere.",
    previewImage: "/samples/theme-film-noir.jpg",
    promptDirective:
      "Apply a premium cinematic noir portrait treatment: elegant black-and-white contrast, dramatic window-shaped light, refined 1940s studio atmosphere, luminous skin tones in monochrome, and polished film-still composition.",
    proOnly: true,
  },
];

export const PRO_CARD_ART_STYLES = CARD_ART_STYLES.filter((style) => style.proOnly);

export function getCardArtStyle(id: CardArtStyleId): CardArtStyle {
  const style = CARD_ART_STYLES.find((item) => item.id === id);
  if (!style) throw new Error(`Unknown card art style: ${id}`);
  return style;
}

export function isProCardArtStyle(id: CardArtStyleId): boolean {
  return getCardArtStyle(id).proOnly === true;
}

export function resolveCardArtStyleSelections(
  defaultStyleId: CardArtStyleId = DEFAULT_CARD_ART_STYLE_ID,
  slotStyleIds: readonly CardSlotStyleSelection[] = [],
  slotCount = CARD_STYLE_SLOT_COUNT,
): CardArtStyleId[] {
  return Array.from({ length: slotCount }, (_, index) => {
    const slotStyle = slotStyleIds[index];
    return slotStyle && slotStyle !== "default" ? slotStyle : defaultStyleId;
  });
}

export function buildCardArtStyleDirective(style: CardArtStyle): string {
  const wholeCardDirective =
    style.id === "photoshoot"
      ? "Apply this treatment to the entire card image, including the selected subject, clothing, flowers, background, greeting area and foreground details."
      : "Apply this treatment to the entire card image, including the selected subject's face, skin, hair, clothing, flowers, background, greeting area and foreground details. Do not leave the selected subject photorealistic; the person must be rendered in this same art style while staying recognizable from the references.";

  return [
    `Card art style: ${style.name}.`,
    style.promptDirective,
    wholeCardDirective,
    "Keep the selected card layout, greeting text requirements, negative space, holiday or occasion details, selected cast, recognizable identities, and overall family-positive mood.",
  ].join(" ");
}
