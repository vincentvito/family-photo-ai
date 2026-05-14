import type { Vibe } from './vibes';
import type { Card } from './cards';
import type { ArtStyle } from './styles';

export type FaqItem = { q: string; a: string };

const vibeSeoCopy: Record<string, { intro: string; whatIs: string; faqs?: FaqItem[] }> = {
  'royal-family-portrait': {
    intro:
      'Make a royal family portrait from regular phone selfies in about two minutes. Upload each person once, add a pet if you want, and FamilyShoot places your family inside a polished palace-style portrait with crowns, velvet, warm light, and a frame-ready finish.',
    whatIs:
      'A royal family portrait turns your uploaded selfies into a regal group image with formal posture, ceremonial wardrobe, ornate interiors, and polished portrait lighting. It is a strong choice for families who want something funny enough to share, but refined enough to print.\n\nFamilyShoot keeps the workflow practical. You can include up to five family members, or use four people and a pet. The finished portrait is high resolution, so it can become wall art, a gift, or the image on a family card.',
    faqs: [
      {
        q: 'Can I include a pet in a royal family portrait?',
        a: 'Yes. This vibe works well with four people and a pet. Dogs and cats can be styled into the scene with a ribbon, collar, or small royal detail while still looking like themselves.',
      },
      {
        q: 'Will this copy a real royal family photo?',
        a: 'No. The look is inspired by formal palace portraiture, not any specific royal household or public figure. Your family, clothing, and composition are generated as an original image.',
      },
    ],
  },
  'disney-world-family-photos': {
    intro:
      'Create a theme park family photo from selfies without needing everyone together in one perfect vacation shot. FamilyShoot builds a bright castle-plaza portrait with up to five family members, cheerful vacation styling, and a printable finish.',
    whatIs:
      'A Disney World style family photo captures the feeling of a castle vacation portrait: sunny plaza light, bright outfits, cheerful snacks, fireworks haze, and the whole family close together. The page is designed for families who came home with lots of phone photos but no single clean group portrait.\n\nFamilyShoot uses your uploaded references to keep each person recognizable, then creates a new family portrait in a generic theme-park setting. The result avoids logos and copyrighted characters, so it feels magical without depending on protected artwork.',
    faqs: [
      {
        q: 'Is this an official Disney photo?',
        a: 'No. This is an original theme-park inspired family portrait. It does not use official logos, character art, or park marks.',
      },
      {
        q: 'How many people can be in the theme park portrait?',
        a: 'FamilyShoot supports up to five family members in one generated portrait. That keeps the faces readable and matches the upload flow inside the app.',
      },
    ],
  },
  'national-park-family-photos': {
    intro:
      'Turn everyday selfies into a national park family photo with granite cliffs, pine forest, trail layers, and clean morning light. Use up to five people, or four people and a pet, to create a print-ready outdoor family portrait.',
    whatIs:
      'A national park family photo places your family in the kind of scenic overlook portrait people hope to capture on a big trip. Think trail clothes, soft alpine light, pine air, and a dramatic landscape behind everyone, without needing to plan the hike or coordinate a photographer.\n\nThis vibe is useful for outdoor families, holiday gifts, travel albums, and grandparents who want everyone in one image. Pets fit naturally here too, especially dogs on leash in the foreground.',
    faqs: [
      {
        q: 'Can my dog be in the national park family photo?',
        a: 'Yes. This is one of the strongest pet-friendly vibes. Four people and one dog works especially well because the dog can sit clearly in the foreground.',
      },
      {
        q: 'Does it use a specific national park?',
        a: 'The scene is inspired by North American park landscapes, with cliffs, pine forest, and trail details. It does not need to represent one exact park unless you describe that in a custom vibe.',
      },
    ],
  },
  'hawaii-family-photos': {
    intro:
      'Make a Hawaii family photo from the selfies you already have. FamilyShoot creates a warm island portrait with beach light, palms, leis, lava rock, and up to five family members together in one finished image.',
    whatIs:
      'A Hawaii family photo captures the vacation portrait people often want but rarely get cleanly: everyone looking good, ocean in the background, soft sunset light, and relaxed island clothing. It works well for travel memories, family cards, framed gifts, or a keepsake when the real trip photos are scattered across phones.\n\nFamilyShoot builds the final image from your references rather than editing one existing group shot. That means each person can come from a different selfie, then appear together in one cohesive beach portrait.',
    faqs: [
      {
        q: 'Do I need actual Hawaii vacation photos?',
        a: 'No. Regular selfies are enough. The Hawaii setting, wardrobe direction, and lighting are generated around your family.',
      },
      {
        q: 'Can this work for grandparents and kids together?',
        a: 'Yes. A five-person setup, such as two adults, two children, and one grandparent, fits the app limit and keeps faces large enough for a strong portrait.',
      },
    ],
  },
  'cape-cod-family-photos': {
    intro:
      'Create a Cape Cod family photo with cedar shingles, hydrangeas, dune grass, navy stripes, and soft New England beach light. Use up to five people, or four people and a dog, for a calm coastal portrait.',
    whatIs:
      'A Cape Cod family photo is a coastal New England portrait with weathered cottages, hydrangeas, sandy paths, white fences, and calm water in the background. It is less dramatic than a sunset beach shot and more like a relaxed summer keepsake you would frame at home.\n\nThis vibe is especially good for families who like classic coastal styling: cream sweaters, linen, navy stripes, bare feet, and an easy expression. Pets fit naturally into the scene, especially a dog seated at the family’s feet.',
    faqs: [
      {
        q: 'Can I include a dog in a Cape Cod family portrait?',
        a: 'Yes. Four people and one dog is a natural fit for this vibe, and it keeps the composition clean for printing.',
      },
      {
        q: 'How is Cape Cod different from the Golden Hour Beach vibe?',
        a: 'Golden Hour Beach is broader and more sunset-driven. Cape Cod is more specific: hydrangeas, cedar shingles, dune grass, navy and cream clothing, and a quieter New England mood.',
      },
    ],
  },
};

export const vibeFaqs = (v: Vibe): FaqItem[] => [
  ...(vibeSeoCopy[v.slug]?.faqs ?? []),
  {
    q: `How do I make a ${v.name} family portrait from my photos?`,
    a: `Upload five to ten selfies of each family member. FamilyShoot trains a private model on each face, then renders your family in the ${v.name} look. The whole thing takes about two minutes. You do not need a single good group photo.`,
  },
  {
    q: `Do I need a professional ${v.name.toLowerCase()} photo to start?`,
    a: `No. Regular phone selfies are exactly what we need. Different angles, different lighting, taken on different days. Skip the matching outfits and the staged photoshoot.`,
  },
  {
    q: `How is this different from a Ghibli or Pixar filter on ChatGPT or a free AI tool?`,
    a: `Filters edit one photo at a time and rarely keep faces consistent across a family. FamilyShoot trains on each person, then composes the whole family in one ${v.name} scene with believable likeness, posture, and light.`,
  },
  {
    q: `Can I print a ${v.name} family portrait or order a card with it?`,
    a: `Yes. Every render is high resolution and ready for wall prints. You can also turn it into a printed family card with one click.`,
  },
  {
    q: `Is my family photo data private?`,
    a: `Your uploads and the model trained on your family are private to your account. We do not use your photos to train shared models or sell anything to anyone.`,
  },
];

export const cardFaqs = (c: Card): FaqItem[] => [
  {
    q: `How do I make a ${c.name} family card without a perfect family photo?`,
    a: `Upload five to ten selfies of each person. FamilyShoot generates a ${c.name.toLowerCase()}-themed family photo with everyone in frame, then drops it into a printable card layout. About two minutes start to finish.`,
  },
  {
    q: `Do you print and mail the ${c.name} card?`,
    a: `Yes. Order printed cards on premium paper, or download the high-resolution file and print it anywhere. Digital share links are free.`,
  },
  {
    q: `Can I edit the greeting and add our family name to the ${c.name} card?`,
    a: `Yes. Every card is fully customizable. Change the greeting, add names, swap colors, pick a layout. The AI handles the family photo, you handle the words.`,
  },
  {
    q: `How is this different from Minted, Shutterfly, or Vistaprint photo cards?`,
    a: `Those services need you to already have a great family photo. FamilyShoot generates the family photo for you, then makes the card. No photographer, no matching outfits, no "everyone please smile at the same time".`,
  },
  {
    q: `When should I order ${c.name} cards to get them in time?`,
    a: `Card generation takes minutes. Printed cards typically ship within three to five business days. Digital cards arrive in your inbox the same day.`,
  },
];

export const styleFaqs = (s: ArtStyle): FaqItem[] => [
  {
    q: `How do I turn a family photo into a ${s.name.toLowerCase()} portrait?`,
    a: `Upload five to ten selfies of each family member. FamilyShoot generates a ${s.name.toLowerCase()} family portrait in about two minutes. No artist commission, no two-week wait.`,
  },
  {
    q: `Is this the same quality as a hand-painted ${s.name.toLowerCase()} portrait from photo services like Paint Your Life or PortraitFlip?`,
    a: `The finish is comparable, the turnaround is minutes instead of weeks, and the price is a fraction. You get high-resolution files for printing and framing.`,
  },
  {
    q: `Can I print my ${s.name.toLowerCase()} family portrait on canvas?`,
    a: `Yes. Every render is high resolution and ready for canvas, framed prints, or a printed card.`,
  },
  {
    q: `Do you need a perfect family photo to make the ${s.name.toLowerCase()} portrait?`,
    a: `No. Regular phone selfies are enough. Different angles and lighting actually help us capture each person better.`,
  },
  {
    q: `Is the ${s.name.toLowerCase()} portrait actually unique to my family or just a filter?`,
    a: `Unique. We train a private model on each face and compose your family together in the ${s.name.toLowerCase()} style. It is not a one-size filter.`,
  },
];

export const vibeIntro = (v: Vibe) =>
  vibeSeoCopy[v.slug]?.intro ??
  `A ${v.keyword} from your phone in about two minutes. Upload a handful of regular selfies of each family member and FamilyShoot will render your whole family in the ${v.name} look, ready to print or turn into a card. No photoshoot, no matching outfits, no waiting on a custom commission.`;

export const vibeWhatIsBody = (v: Vibe) =>
  vibeSeoCopy[v.slug]?.whatIs ??
  `A ${v.keyword} captures your family in the visual language of ${v.name}: color, lighting, posture, and mood you would expect from that world. FamilyShoot trains a private model on each face you upload, then composes the whole family in one ${v.name} scene. ` +
    `\n\nThe result is high resolution and ready for wall prints, digital sharing, or a printed family card. Two minutes from upload to finished portrait.`;

export const cardIntro = (c: Card) =>
  `${c.keyword.replace(/^\w/, ch => ch.toUpperCase())} that show your whole family at their best, without scheduling a photoshoot or wrangling everyone into matching outfits. Drop in selfies you already have, FamilyShoot generates the family photo, and the ${c.name} card is ready to print or share in minutes.`;

export const styleIntro = (s: ArtStyle) =>
  `A ${s.keyword} generated from the photos you already have. Same hand-painted look as a custom commission. Minutes instead of weeks, a fraction of the cost, ready for printing, framing, or sending as a card.`;
