import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VIBES, vibeBySlug } from "@/data/vibes";
import type { Vibe } from "@/data/vibes";
import { CARDS, cardBySlug } from "@/data/cards";
import { STYLES, styleBySlug } from "@/data/styles";
import { OCCASION_PAGES, occasionPageBySlug, type OccasionPage } from "@/data/occasion-pages";
import { BIRTHDAY_CARD_SEO_PAGES } from "@/data/birthday-card-pages";
import { STYLE_PROMPT_EXAMPLES } from "@/data/style-prompt-examples";
import { getPromptStudioHref } from "@/lib/theme-links";
import {
  vibeFaqs,
  cardFaqs,
  styleFaqs,
  vibeIntro,
  vibeWhatIsBody,
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
    caption:
      "A stadium-ready lineup for dads who would rather frame match day than another polite picnic.",
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
    caption:
      "A goofy old-west wanted-poster portrait for families who want the gift to feel like a story.",
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
  const isBirthdayCardSeoPage =
    category === "occasion" && item.image.startsWith("/seo/birthday-cards/");
  const title =
    category === "vibe" && STYLE_PROMPT_EXAMPLES[slug]
      ? `${item.name} Family Portraits from Photos | FamilyShoot`
      : category === "vibe"
        ? `${item.name} Family Portrait | AI Generated from Your Photos | FamilyShoot`
        : category === "card"
          ? `${item.name} Family Cards | AI Photo Cards in Minutes | FamilyShoot`
          : category === "occasion"
            ? ((item as OccasionPage).metaTitle ?? `${(item as OccasionPage).h1} | FamilyShoot`)
            : `${item.name} Family Portrait from Photo | Custom AI Painting | FamilyShoot`;

  const description =
    category === "occasion"
      ? ((item as OccasionPage).metaDescription ?? item.shortDescription)
      : item.shortDescription;
  const url = `/${slug}`;
  const image = item.image;
  const imageAlt = isBirthdayCardSeoPage
    ? `${item.name} birthday card sample`
    : `${item.name} family portrait sample`;

  return {
    title: { absolute: title },
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
          alt: imageAlt,
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
  const promptExamples = STYLE_PROMPT_EXAMPLES[slug] ?? [];
  const extraImages = category === "vibe" ? (item as Vibe).extraImages : undefined;
  const isFathersDay = category === "occasion" && item.slug === "fathers-day";
  const isBirthdayCardSeoPage =
    category === "occasion" && item.image.startsWith("/seo/birthday-cards/");

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
                q: isBirthdayCardSeoPage
                  ? `Can I preview my ${item.name} before paying?`
                  : `Can I preview my ${item.name} portrait before paying?`,
                a: isBirthdayCardSeoPage
                  ? "Yes. Start with a free watermarked preview. Unlock the high-resolution, print-ready card or invitation only if you like the result."
                  : "Yes. Start with a free watermarked preview. Unlock the high-resolution, print-ready version only if you like the result.",
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
      ? vibeWhatIsBody(item as never)
      : category === "card"
        ? `FamilyShoot creates a new ${item.name} card image from separate photos of your family and pets. Add a clear reference photo for each person or pet, choose a card theme and art style, and enter a short greeting before starting the shoot.` +
          `\n\nYour first shoot can start as a free watermarked preview. Check the faces and text before unlocking the high-resolution files. You can then download a card image for sharing or upload it to a print provider. Physical products have a separate checkout, with production and delivery estimates from that provider.`
        : category === "occasion"
          ? (item as OccasionPage).whatIsBody
          : `A ${item.keyword} is a new digital image made from your family's reference photos in the ${item.name} style. Each person or pet can come from a separate picture. Clear photos help guide likeness and proportions as the style changes the scene's colors, textures, and lighting.` +
            `\n\nReview the faces and finish in your first free watermarked preview. If you want to keep the result, unlock the high-resolution file and download it for sharing or printing. Check the image size and crop with your chosen print provider before ordering.`;

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
        heroAlt={
          isBirthdayCardSeoPage
            ? `${item.name} birthday card sample`
            : `${item.name} family portrait sample`
        }
        extraImages={extraImages}
        promptExamples={promptExamples}
        promptStyleName={item.name}
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
        ctaHref={
          promptExamples[0] ? getPromptStudioHref(promptExamples[0].prompt) : "/studio/roster"
        }
        ctaLabel={
          promptExamples.length > 0
            ? "Create this look"
            : category === "card"
              ? "Begin a Card"
              : category === "occasion"
                ? (item as OccasionPage).ctaLabel
                : "Begin a Shoot"
        }
        breadcrumbs={breadcrumbs}
        keywordHighlights={
          category === "occasion"
            ? [
                "Separate photos welcome",
                "People and pets",
                "Free first preview",
                "Paid high-resolution downloads",
              ]
            : undefined
        }
        sourceImages={isFathersDay ? FATHERS_DAY_SOURCE_IMAGES : undefined}
        sampleImages={isFathersDay ? FATHERS_DAY_SAMPLE_IMAGES : undefined}
        heroLayout={isBirthdayCardSeoPage ? "centered" : "split"}
      />
    </>
  );
}
