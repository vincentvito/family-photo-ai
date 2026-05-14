import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
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
const OG_IMAGE_URL =
  process.env.NEXT_PUBLIC_OG_IMAGE_URL ??
  "https://deifos.github.io/images/familyphoto-og-banner.webp";

export const metadata: Metadata = {
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

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an AI family photo generator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is a way to create a finished family portrait from everyday photos you already have. FamilyShoot uses your uploads as visual references, then turns them into a polished portrait, illustration, or card.",
      },
    },
    {
      "@type": "Question",
      name: "Can I make a family portrait from separate photos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Upload separate photos of each person, child, or selected pet, and FamilyShoot combines them into one natural family portrait.",
      },
    },
    {
      "@type": "Question",
      name: "Can I make AI holiday cards or Christmas cards?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. FamilyShoot includes holiday and occasion card styles for Christmas, Hanukkah, Diwali, Eid, Lunar New Year, Easter, birthdays, new babies, graduations, and more.",
      },
    },
    {
      "@type": "Question",
      name: "How long are my photos stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Generated photos and reference uploads are kept for 14 days for one-time packs. FamilyShoot Pro shoots are kept for 90 days.",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        {children}
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
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
