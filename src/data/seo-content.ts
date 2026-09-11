import type { Vibe } from "./vibes";
import type { Card } from "./cards";
import type { ArtStyle } from "./styles";
import {
  MAX_SHOT_SUBJECTS,
  SHOT_SUBJECT_CONSISTENCY_WARNING_THRESHOLD,
} from "../lib/generation-limits";

export type FaqItem = { q: string; a: string };

const vibeSeoCopy: Record<string, { intro: string; whatIs: string; faqs?: FaqItem[] }> = {
  "royal-family-portrait": {
    intro:
      "Make a royal family portrait from regular phone selfies in about two minutes. Upload each person once, add a pet if you want, and FamilyShoot places your family inside a polished palace-style portrait with crowns, velvet, warm light, and a frame-ready finish.",
    whatIs: `A royal family portrait turns your uploaded photos into a regal group image with formal posture, ceremonial wardrobe, ornate interiors, and polished portrait lighting. Try parents and children gathered around a velvet chair, or include the family dog beside the throne.\n\nYou can select up to ${MAX_SHOT_SUBJECTS} people or pets for one portrait. Groups of ${SHOT_SUBJECT_CONSISTENCY_WARNING_THRESHOLD} or fewer usually give more consistent likeness. Start with a free watermarked preview on your first shoot, then unlock the high-resolution file if you want to print or share it.`,
    faqs: [
      {
        q: "Can I include a pet in a royal family portrait?",
        a: "Yes. This vibe works well with four people and a pet. Dogs and cats can be styled into the scene with a ribbon, collar, or small royal detail while still looking like themselves.",
      },
      {
        q: "Will this copy a real royal family photo?",
        a: "No. The look is inspired by formal palace portraiture, not any specific royal household or public figure. Your family, clothing, and composition are generated as an original image.",
      },
    ],
  },
  "disney-world-family-photos": {
    intro:
      "Create a theme park family photo from separate phone photos. Choose a bright castle-plaza setting and cheerful vacation styling, then try a free watermarked preview on your first shoot.",
    whatIs:
      "A Disney World style family photo captures the feeling of a castle vacation portrait: sunny plaza light, bright outfits, cheerful snacks, fireworks haze, and the family close together. It works with the separate phone photos you brought home, even if you missed a group shot.\n\nFamilyShoot uses those photos as visual references to create a new portrait in a theme-park inspired setting. Check everyone's likeness in the preview before unlocking the file. This is an original generated keepsake, not an official park photograph.",
    faqs: [
      {
        q: "Is this an official Disney photo?",
        a: "No. This is an original theme-park inspired family portrait. It does not use official logos, character art, or park marks.",
      },
      {
        q: "How many people can be in the theme park portrait?",
        a: `You can select up to ${MAX_SHOT_SUBJECTS} people or pets. Groups of ${SHOT_SUBJECT_CONSISTENCY_WARNING_THRESHOLD} or fewer usually give more consistent likeness. Add at least one clear reference photo for each person or pet you select.`,
      },
    ],
  },
  "national-park-family-photos": {
    intro:
      "Turn everyday phone photos into a national park family portrait with granite cliffs, pine forest, trail layers, and clean morning light. Include the people and pets you want in the scene, then unlock your favorite result for downloading and printing.",
    whatIs:
      "A national park family photo places your family in the kind of scenic overlook portrait people hope to capture on a big trip. Think trail clothes, soft alpine light, pine air, and a dramatic landscape behind everyone, without needing to plan the hike or coordinate a photographer.\n\nThis vibe is useful for outdoor families, holiday gifts, travel albums, and grandparents who want everyone in one image. Pets fit naturally here too, especially dogs on leash in the foreground.",
    faqs: [
      {
        q: "Can my dog be in the national park family photo?",
        a: "Yes. This is one of the strongest pet-friendly vibes. Four people and one dog works especially well because the dog can sit clearly in the foreground.",
      },
      {
        q: "Does it use a specific national park?",
        a: "The scene is inspired by North American park landscapes, with cliffs, pine forest, and trail details. It does not need to represent one exact park unless you describe that in a custom vibe.",
      },
    ],
  },
  "hawaii-family-photos": {
    intro:
      "Make a Hawaii family photo from the phone photos you already have. FamilyShoot creates a new island-inspired portrait with beach light, palms, leis, and your selected family members together in one image.",
    whatIs:
      "A Hawaii family photo captures the vacation portrait people often want but rarely get cleanly: everyone looking good, ocean in the background, soft sunset light, and relaxed island clothing. It works well for travel memories, family cards, framed gifts, or a keepsake when the real trip photos are scattered across phones.\n\nFamilyShoot builds the final image from your references rather than editing one existing group shot. That means each person can come from a different selfie, then appear together in one cohesive beach portrait.",
    faqs: [
      {
        q: "Do I need actual Hawaii vacation photos?",
        a: "No. Regular selfies are enough. The Hawaii setting, wardrobe direction, and lighting are generated around your family.",
      },
      {
        q: "Can this work for grandparents and kids together?",
        a: `Yes. Upload a clear reference photo for each person and select them for the shoot. Two adults, two children, and one grandparent is one possible group. You can include up to ${MAX_SHOT_SUBJECTS} people or pets, though smaller groups usually give more consistent likeness.`,
      },
    ],
  },
  "cape-cod-family-photos": {
    intro:
      "Create a Cape Cod family photo with cedar shingles, hydrangeas, dune grass, navy stripes, and soft New England beach light. Bring separate photos of your family and dog together in a new coastal portrait.",
    whatIs:
      "A Cape Cod family photo is a coastal New England portrait with weathered cottages, hydrangeas, sandy paths, white fences, and calm water in the background. It is less dramatic than a sunset beach shot and more like a relaxed summer keepsake you would frame at home.\n\nThis vibe is especially good for families who like classic coastal styling: cream sweaters, linen, navy stripes, bare feet, and an easy expression. Pets fit naturally into the scene, especially a dog seated at the family’s feet.",
    faqs: [
      {
        q: "Can I include a dog in a Cape Cod family portrait?",
        a: "Yes. Four people and one dog is a natural fit for this vibe, and it keeps the composition clean for printing.",
      },
      {
        q: "How is Cape Cod different from the Golden Hour Beach vibe?",
        a: "Golden Hour Beach is broader and more sunset-driven. Cape Cod is more specific: hydrangeas, cedar shingles, dune grass, navy and cream clothing, and a quieter New England mood.",
      },
    ],
  },
};

export const vibeFaqs = (v: Vibe): FaqItem[] => [
  ...(vibeSeoCopy[v.slug]?.faqs ?? []),
  {
    q: `How do I make a ${v.name} family portrait from my photos?`,
    a: `Add at least one clear, well-lit reference photo for each person or pet in My Family, then choose ${v.name}. FamilyShoot uses those photos as visual guides to create a new portrait. Your first shoot can start as a free watermarked preview; unlock the high-resolution files if you like the result.`,
  },
  {
    q: `Do I need a professional ${v.name.toLowerCase()} photo to start?`,
    a: "No. A clear phone photo is enough to start. For people, choose a front-facing photo with at least the shoulders visible; a full-body photo can also help with height and posture. Everyone can come from a separate photo.",
  },
  {
    q: "Does FamilyShoot edit an existing group photo or create a new portrait?",
    a: `It creates a new ${v.name} portrait from your reference photos. People and pets can come from separate pictures. The lighting, clothing, setting, and poses are generated, so check each person's likeness in the preview.`,
  },
  {
    q: `Can I print a ${v.name} family portrait or order a card with it?`,
    a: "After unlocking a portrait, download the high-resolution file for printing. You can upload it to our Printify-powered shop for available keepsakes or use a printer of your choice. Physical products are ordered and paid for separately from your FamilyShoot shoot.",
  },
  {
    q: `Is my family photo data private?`,
    a: "We do not use your photos to train FamilyShoot. Your uploads are processed to create the portraits, cards, refinements, and downloads you request, including processing by our image-generation providers. You can remove reference photos and finished images through the delete options in your studio.",
  },
];

export const cardFaqs = (c: Card): FaqItem[] => [
  {
    q: `How do I make a ${c.name} family card without a perfect family photo?`,
    a: `Add at least one clear reference photo for each person or pet, choose a ${c.name} card theme, and enter your greeting in the card text field. FamilyShoot creates new card images from those references. Your first shoot can start as a free watermarked preview.`,
  },
  {
    q: `Do you print and mail the ${c.name} card?`,
    a: "FamilyShoot creates the digital card image. After unlocking it, download the file and upload it to our Printify-powered shop for available printed products, or use a printer of your choice. The shop handles its own checkout, printing, delivery, and order support.",
  },
  {
    q: `Can I add a greeting and our family name to the ${c.name} card?`,
    a: "Yes. Enter a short greeting and names in the Greeting / card text field before starting the shoot. You can also choose an art style for each card variation. The words become part of the generated image, so check spelling and readability before downloading or printing; there is no separate text or layout editor.",
  },
  {
    q: "Do I need a finished family photo before making a card?",
    a: "No. Each person or pet can come from a different photo. FamilyShoot uses those references to create a new family scene and card image together, so you can start without a group photo.",
  },
  {
    q: `When should I order ${c.name} cards to get them in time?`,
    a: "Allow time to create the card and check the faces and greeting. Once the result is ready and unlocked, you can download it from your studio. For physical cards, check the print provider's production and delivery estimate for your destination before ordering.",
  },
];

export const styleFaqs = (s: ArtStyle): FaqItem[] => [
  {
    q: `How do I turn a family photo into a ${s.name.toLowerCase()} portrait?`,
    a: `Add at least one clear reference photo for each person or pet, then choose the ${s.name} style. FamilyShoot uses the photos as visual guides to create a new portrait. Start with a free watermarked preview on your first shoot, then unlock the high-resolution files if you want to keep them.`,
  },
  {
    q: "Is this a hand-painted portrait or a digital image?",
    a: `It is an AI-created digital image in the ${s.name} style. You can preview the finish and likeness before unlocking the high-resolution file. Any canvas or framed version is a print of that image, not an original hand-painted work.`,
  },
  {
    q: `Can I print my ${s.name.toLowerCase()} family portrait on canvas?`,
    a: "Yes. After unlocking the portrait, download the high-resolution file and choose a canvas or other print product from a print provider. Check that the file dimensions and crop suit the size you want before ordering.",
  },
  {
    q: `Do you need a perfect family photo to make the ${s.name.toLowerCase()} portrait?`,
    a: "No. Use a clear, well-lit phone photo for each person or pet. Front-facing photos with shoulders or full body visible help with likeness and proportions. The photos can be taken separately.",
  },
  {
    q: `Is the ${s.name.toLowerCase()} portrait actually unique to my family or just a filter?`,
    a: `FamilyShoot creates a new ${s.name} portrait using your family's photos as references. It does not train a private model on each face. The style changes the appearance of the whole scene, and likeness can vary, so review the result before unlocking it.`,
  },
];

export const vibeIntro = (v: Vibe) =>
  vibeSeoCopy[v.slug]?.intro ??
  `Create a ${v.keyword} from the phone photos you already have. Add a clear reference photo for each person or pet, choose ${v.name}, and see them together in a new portrait. Try a free watermarked preview on your first shoot, then unlock the high-resolution files for downloading and printing.`;

export const vibeWhatIsBody = (v: Vibe) =>
  vibeSeoCopy[v.slug]?.whatIs ??
  `A ${v.keyword} brings your selected family members into a new scene with the colors, lighting, and atmosphere of ${v.name}. FamilyShoot uses each person's or pet's uploaded photos as visual references; everyone can come from a different picture.\n\nChoose clear photos, check each face in the result, and unlock the high-resolution file when you are happy with it. You can then download it for sharing or upload it to a print provider for a card or framed keepsake.`;

export const cardIntro = (c: Card) =>
  `Create ${c.keyword} from separate photos of your family and pets. Choose a ${c.name} theme, add a short greeting, and try a free watermarked preview on your first shoot. Unlock your favorite result to download the high-resolution card image for sharing or printing.`;

export const styleIntro = (s: ArtStyle) =>
  `Create a ${s.keyword} from your own phone photos. FamilyShoot uses your references to create a new digital portrait in the ${s.name} style. Try a free watermarked preview on your first shoot, then unlock the high-resolution file for sharing or printing.`;
