import type { Vibe } from './vibes';
import type { Card } from './cards';
import type { ArtStyle } from './styles';

export type FaqItem = { q: string; a: string };

export const vibeFaqs = (v: Vibe): FaqItem[] => [
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
  `A ${v.keyword} from your phone in about two minutes. Upload a handful of regular selfies of each family member and FamilyShoot will render your whole family in the ${v.name} look, ready to print or turn into a card. No photoshoot, no matching outfits, no waiting on a custom commission.`;

export const cardIntro = (c: Card) =>
  `${c.keyword.replace(/^\w/, ch => ch.toUpperCase())} that show your whole family at their best, without scheduling a photoshoot or wrangling everyone into matching outfits. Drop in selfies you already have, FamilyShoot generates the family photo, and the ${c.name} card is ready to print or share in minutes.`;

export const styleIntro = (s: ArtStyle) =>
  `A ${s.keyword} generated from the photos you already have. Same hand-painted look as a custom commission. Minutes instead of weeks, a fraction of the cost, ready for printing, framing, or sending as a card.`;
