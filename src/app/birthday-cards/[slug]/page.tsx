import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BIRTHDAY_CARD_PAGES,
  birthdayCardPageBySlug,
  type BirthdayCardPage,
} from "@/data/birthday-card-pages";
import { CARDS } from "@/data/cards";
import { LandingShell, type RelatedLink } from "../../[slug]/_components/LandingShell";
import { JsonLd } from "../../[slug]/_components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

export function generateStaticParams() {
  return BIRTHDAY_CARD_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = birthdayCardPageBySlug(slug);
  if (!page) return {};

  const url = `/birthday-cards/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `${SITE_URL}${url}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE_URL}${url}`,
      type: "website",
      images: [
        {
          url: `${SITE_URL}${page.image}`,
          width: 1200,
          height: 1500,
          alt: `${page.name} sample`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [`${SITE_URL}${page.image}`],
    },
  };
}

const buildBody = (page: BirthdayCardPage) =>
  page.sections.map((section) => `${section.title}\n${section.body}`).join("\n\n") +
  `\n\nMessage ideas\n${page.messageExamples.map((example) => `• ${example}`).join("\n")}`;

export default async function BirthdayCardPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = birthdayCardPageBySlug(slug);
  if (!page) notFound();

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Birthday cards", url: "/cards" },
    { name: page.name, url: `/birthday-cards/${page.slug}` },
  ];

  const related: RelatedLink[] = page.related.map((item) => ({
    href: item.href,
    label: item.label,
    image: page.image,
  }));

  const crossSample: RelatedLink[] = CARDS.slice(0, 4).map((card) => ({
    href: `/${card.slug}`,
    label: card.name,
    image: card.image,
  }));

  return (
    <>
      <JsonLd
        url={`/birthday-cards/${page.slug}`}
        name={page.h1}
        description={page.description}
        image={page.image}
        faqs={page.faqs}
        breadcrumbs={breadcrumbs}
        type="WebPage"
      />
      <LandingShell
        h1={page.h1}
        intro={page.intro}
        heroImage={page.image}
        heroAlt={`${page.name} sample`}
        sampleImages={page.styleExamples}
        sampleEyebrow={page.styleEyebrow}
        sampleHeading={page.styleHeading}
        whatIsTitle={page.sections[0]?.title ?? page.name}
        whatIsBody={buildBody(page)}
        faqs={page.faqs}
        related={related}
        relatedHeading="Related birthday-card pages"
        crossLinks={{ hubHref: "/cards", hubLabel: "Cards", sample: crossSample }}
        ctaHref="/studio/roster"
        ctaLabel={page.ctaLabel}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
