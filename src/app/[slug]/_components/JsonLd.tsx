import type { FaqItem } from "@/data/seo-content";
import { PRICING_PACKS } from "@/lib/pricing-packs";

type Props = {
  url: string;
  name: string;
  description: string;
  image: string;
  faqs: FaqItem[];
  breadcrumbs: { name: string; url: string }[];
  type?: "WebPage" | "Product" | "CreativeWork";
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";
const STARTER_PACK = PRICING_PACKS.single_keepsake;

export function JsonLd({
  url,
  name,
  description,
  image,
  faqs,
  breadcrumbs,
  type = "WebPage",
}: Props) {
  const fullUrl = `${SITE_URL}${url}`;
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  const webPage = {
    "@context": "https://schema.org",
    "@type": type,
    name,
    description,
    url: fullUrl,
    image: fullImage,
    isPartOf: { "@type": "WebSite", name: "FamilyShoot", url: SITE_URL },
    ...(type === "Product"
      ? {
          brand: { "@type": "Brand", name: "FamilyShoot" },
          offers: {
            "@type": "Offer",
            url: fullUrl,
            priceCurrency: "USD",
            price: (STARTER_PACK.unitAmount / 100).toFixed(2),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            category: "Personalized family photo card",
          },
        }
      : {}),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: `${SITE_URL}${b.url}`,
    })),
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
