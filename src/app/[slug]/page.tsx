import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VIBES, vibeBySlug } from "@/data/vibes";
import type { Vibe } from "@/data/vibes";
import { CARDS, cardBySlug } from "@/data/cards";
import { STYLES, styleBySlug } from "@/data/styles";
import { OCCASION_PAGES, occasionPageBySlug, type OccasionPage } from "@/data/occasion-pages";
import { BIRTHDAY_CARD_SEO_PAGES } from "@/data/birthday-card-pages";
import {
  vibeFaqs,
  cardFaqs,
  styleFaqs,
  vibeIntro,
  cardIntro,
  styleIntro,
  type FaqItem,
} from "@/data/seo-content";
import { LandingShell, type RelatedLink } from "./_components/LandingShell";
import { JsonLd } from "./_components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

type Category = "vibe" | "card" | "style" | "occasion";

const FATHERS_DAY_SOURCE_IMAGES = [
  {
    label: "Dad",
    src: "/landing/fathers-day/fathers-day-dad-selfie.webp",
    alt: "Phone selfie of Dad in warm car light",
  },
  {
    label: "Kids",
    src: "/landing/fathers-day/fathers-day-kids-selfie.webp",
    alt: "Phone selfie of two smiling children at home",
  },
  {
    label: "Grandma",
    src: "/landing/fathers-day/fathers-day-grandma-selfie.webp",
    alt: "Phone selfie of Grandma in a cozy kitchen",
  },
  {
    label: "Pet",
    src: "/landing/fathers-day/fathers-day-pet-selfie.webp",
    alt: "Phone photo of a golden retriever in the living room",
  },
] as const;

const FATHERS_DAY_SAMPLE_IMAGES = [
  {
    label: "Soccer Team Family",
    caption: "A stadium-ready lineup for dads who would rather frame match day than another polite picnic.",
    src: "/landing/fathers-day/fathers-day-sample-soccer-team.webp",
    alt: "Finished Father's Day soccer team family portrait with Dad and family in matching jerseys",
  },
  {
    label: "Living Room Card",
    caption: "A cozy at-home keepsake that feels personal enough to print or send as a card.",
    src: "/landing/fathers-day/fathers-day-sample-living-room-v2.webp",
    alt: "Finished Father's Day living room portrait with Dad, children, Grandma, and a golden retriever",
  },
  {
    label: "Western Wanted Family",
    caption: "A goofy old-west wanted-poster portrait for families who want the gift to feel like a story.",
    src: "/landing/fathers-day/fathers-day-sample-western-wanted.webp",
    alt: "Finished Father's Day western wanted poster family portrait with cowboy hats and sepia paper texture",
  },
] as const;

function resolve(slug: string) {
  const occasion = occasionPageBySlug(slug);
  if (occasion) return { category: "occasion" as Category, item: occasion };
  const v = vibeBySlug(slug);
  if (v) return { category: "vibe" as Category, item: v };
  const c = cardBySlug(slug);
  if (c) return { category: "card" as Category, item: c };
  const s = styleBySlug(slug);
  if (s) return { category: "style" as Category, item: s };
  return null;
}

export function generateStaticParams() {
  return [
    ...VIBES.map((v) => ({ slug: v.slug })),
    ...CARDS.map((c) => ({ slug: c.slug })),
    ...STYLES.map((s) => ({ slug: s.slug })),
    ...OCCASION_PAGES.map((page) => ({ slug: page.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) return {};

  const { item, category } = r;
  const title =
    category === "vibe"
      ? `${item.name} Family Portrait | AI Generated from Your Photos | FamilyShoot`
      : category === "card"
        ? `${item.name} Family Cards | AI Photo Cards in Minutes | FamilyShoot`
        : category === "occasion"
          ? `${item.name} Family Portraits and Cards | FamilyShoot`
          : `${item.name} Family Portrait from Photo | Custom AI Painting | FamilyShoot`;

  const description = item.shortDescription;
  const url = `/${slug}`;
  const image = item.image;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${url}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${url}`,
      type: "website",
      images: [
        {
          url: `${SITE_URL}${image}`,
          width: 1200,
          height: 1500,
          alt: `${item.name} family portrait sample`,
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${SITE_URL}${image}`] },
  };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) notFound();

  const { category, item } = r;
  const extraImages = category === "vibe" ? (item as Vibe).extraImages : undefined;
  const isFathersDay = category === "occasion" && item.slug === "fathers-day";

  const hubMeta =
    category === "vibe"
      ? { href: "/vibes", label: "Vibes" }
      : category === "card"
        ? { href: "/cards", label: "Cards" }
        : category === "occasion"
          ? { href: "/occasions", label: "Occasions" }
          : { href: "/styles", label: "Styles" };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: hubMeta.label, url: hubMeta.href },
    { name: item.name, url: `/${slug}` },
  ];

  const h1 =
    category === "vibe"
      ? `${item.name} family portraits from your phone photos`
      : category === "card"
        ? `${item.name} family cards, made from selfies in minutes`
        : category === "occasion"
          ? (item as OccasionPage).h1
          : `${item.name} family portraits, generated from your photos`;

  const intro =
    category === "vibe"
      ? vibeIntro(item as never)
      : category === "card"
        ? cardIntro(item as never)
        : category === "occasion"
          ? (item as OccasionPage).intro
          : styleIntro(item as never);

  const faqs: FaqItem[] =
    category === "vibe"
      ? vibeFaqs(item as never)
      : category === "card"
        ? cardFaqs(item as never)
        : category === "occasion"
          ? [
              {
                q: `Can I preview my ${item.name} portrait before paying?`,
                a: "Yes. Start with a free watermarked preview. Unlock the high-resolution, print-ready version only if you like the result.",
              },
              {
                q: "Do all family members need to be in the same photo?",
                a: "No. Upload separate phone photos for each person or pet, and FamilyShoot composes the final portrait or card from those source photos.",
              },
              {
                q: "Can I use this as a card and a framed gift?",
                a: "Yes. The same generated keepsake can work as a digital share, printable card, or framed portrait after you unlock the high-resolution file.",
              },
            ]
          : styleFaqs(item as never);

  const whatIsTitle =
    category === "vibe"
      ? `What is a ${item.name} family portrait?`
      : category === "card"
        ? `What are ${item.name} family cards on FamilyShoot?`
        : category === "occasion"
          ? (item as OccasionPage).whatIsTitle
          : `What is a ${item.name.toLowerCase()} family portrait?`;

  const whatIsBody =
    category === "vibe"
      ? `A ${item.keyword} captures your family in the visual language of ${item.name}: color, lighting, posture, and mood you would expect from that world. FamilyShoot trains a private model on each face you upload, then composes the whole family in one ${item.name} scene. ` +
        `\n\nThe result is high resolution and ready for wall prints, digital sharing, or a printed family card. Two minutes from upload to finished portrait.`
      : category === "card"
        ? `A ${item.keyword.replace(/^\w/, (ch) => ch.toUpperCase())} on FamilyShoot is a printable family card with a generated, photo-realistic family image baked in. You do not need a perfect family photo to start. Upload selfies of each person, pick a ${item.name} design, and the card is ready to send or print.` +
          `\n\nUnlike Minted, Vistaprint, or Shutterfly, we do not assume you already have the family photo. We generate it. The card design, the family, and the print are produced in one flow.`
        : category === "occasion"
          ? (item as OccasionPage).whatIsBody
          : `A ${item.keyword} renders your family in a ${item.name.toLowerCase()} finish that mirrors a hand-painted commission. Brushwork, color, and composition are calibrated to the medium. FamilyShoot generates each portrait from the selfies you upload, so the family looks like itself, not like a stock illustration.` +
            `\n\nHand-painted portrait services like Paint Your Life and PortraitFlip take two to four weeks and cost hundreds of dollars. FamilyShoot delivers a comparable ${item.name.toLowerCase()} finish in minutes.`;

  const related: RelatedLink[] = item.related
    .slice(0, 4)
    .map((rs) => {
      const birthdayCardPage = BIRTHDAY_CARD_SEO_PAGES.find((page) => page.path === `/${rs}`);
      if (birthdayCardPage) {
        return {
          href: birthdayCardPage.path,
          label: birthdayCardPage.name,
          image: birthdayCardPage.image,
        };
      }

      const found = resolve(rs);
      if (!found) return null;
      return { href: `/${rs}`, label: found.item.name, image: found.item.image };
    })
    .filter((x): x is RelatedLink => x !== null);

  const otherCategory =
    category === "vibe"
      ? CARDS
      : category === "card"
        ? VIBES
        : category === "occasion"
          ? CARDS
          : VIBES;
  const otherCategoryHref =
    category === "vibe"
      ? "/cards"
      : category === "card"
        ? "/vibes"
        : category === "occasion"
          ? "/cards"
          : "/vibes";
  const otherCategoryLabel =
    category === "vibe"
      ? "Cards"
      : category === "card"
        ? "Vibes"
        : category === "occasion"
          ? "Cards"
          : "Vibes";
  const crossSample: RelatedLink[] = otherCategory.slice(0, 4).map((o) => ({
    href: `/${o.slug}`,
    label: o.name,
    image: o.image,
  }));

  return (
    <>
      <JsonLd
        url={`/${slug}`}
        name={h1}
        description={item.shortDescription}
        image={item.image}
        faqs={faqs}
        breadcrumbs={breadcrumbs}
        type={category === "card" ? "Product" : category === "style" ? "CreativeWork" : "WebPage"}
      />
      <LandingShell
        h1={h1}
        intro={intro}
        heroImage={item.image}
        heroAlt={`${item.name} family portrait sample`}
        extraImages={extraImages}
        extraImageLabel={`${item.name} family portrait sample variation`}
        whatIsTitle={whatIsTitle}
        whatIsBody={whatIsBody}
        faqs={faqs}
        related={related}
        relatedHeading={category === "occasion" ? "Related occasions and gift pages" : undefined}
        crossLinks={{
          hubHref: otherCategoryHref,
          hubLabel: otherCategoryLabel,
          sample: crossSample,
        }}
        ctaHref="/studio/roster"
        ctaLabel={
          category === "card"
            ? `Make your ${item.name} card`
            : category === "occasion"
              ? (item as OccasionPage).ctaLabel
              : `Make your ${item.name} portrait`
        }
        breadcrumbs={breadcrumbs}
        sourceImages={isFathersDay ? FATHERS_DAY_SOURCE_IMAGES : undefined}
        sampleImages={isFathersDay ? FATHERS_DAY_SAMPLE_IMAGES : undefined}
      />
    </>
  );
}
