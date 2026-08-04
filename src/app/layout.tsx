import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import ImpersonationBanner from "@/components/ImpersonationBanner";
import MarketingEmailPopup from "@/components/landing/MarketingEmailPopup";
import { getMessages } from "@/lib/i18n/locales";
import { getRequestLocale } from "@/lib/i18n/server";
import { absoluteLocalizedUrl, languageAlternates } from "@/lib/i18n/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";
const SITE_NAME = "FamilyShoot";
const TITLE = "AI Family Photo Generator | FamilyShoot";
const DESCRIPTION =
  "Turn scattered iPhone photos into a frame-worthy family portrait or holiday card in about two minutes. Pick a vibe, upload references, and keep what you love.";
const OG_IMAGE_URL = process.env.NEXT_PUBLIC_OG_IMAGE_URL ?? "/og/familyshoot-share.png";

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · FamilyShoot",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "Next.js",
  keywords: [
    "AI family photo generator",
    "AI family portrait generator",
    "family photo generator",
    "AI family photos",
    "AI family portraits",
    "family portrait generator",
    "AI family photo maker",
    "AI family photo app",
    "AI photoshoot family portraits",
    "family portrait from separate photos",
    "combine family photos into one portrait",
    "create family portrait from individual photos",
    "AI family photo combiner",
    "merge family photos into one",
    "AI family holiday card generator",
    "AI Christmas card generator",
    "family photoshoot ideas",
    "print-ready family portraits",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "photography",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "FamilyShoot - turn everyday family selfies into polished portraits and cards.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: "sZct6DPyVgYbhSAhs4cFZ7wY7nduBpNgsB36CZk_WZk",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const seo = getMessages(locale).Landing.Seo;
  const canonical = absoluteLocalizedUrl("/", locale, SITE_URL);

  return {
    ...baseMetadata,
    title: {
      default: seo.title,
      template: "%s · FamilyShoot",
    },
    description: seo.description,
    alternates: {
      canonical,
      languages: languageAlternates("/", SITE_URL),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      url: canonical,
      locale,
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "FamilyShoot - turn everyday family selfies into polished portraits and cards.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [OG_IMAGE_URL],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#231c2b" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  email: "hello@familyshoot.com",
};

const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const messages = getMessages(locale);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: messages.Landing.Faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <html lang={locale} className={`${inter.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ImpersonationBanner />
          {children}
          <MarketingEmailPopup />
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <Script
          src="https://feedbackbasket.com/api/widget/script/cmosomkpt000004jjnork17r2"
          strategy="afterInteractive"
        />
        <GoogleAnalytics measurementId="G-2QKFPB9239" />
      </body>
    </html>
  );
}
