import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Review the terms that apply when you use FamilyShoot to upload photos, create AI family portraits, purchase credits or subscriptions, and download generated images.",
  alternates: {
    canonical: "/terms",
  },
};

const lastUpdated = "May 8, 2026";

const sections: LegalSection[] = [
  {
    title: "1. Agreement to these terms",
    body: [
      "These Terms and Conditions govern your access to and use of FamilyShoot, including our website, studio, photo upload tools, AI generation features, refinements, albums, downloads, billing flows, and related services.",
      "By creating an account, purchasing credits or a subscription, uploading content, or using FamilyShoot, you agree to these terms and to our Privacy Policy. If you do not agree, do not use the service.",
    ],
  },
  {
    title: "2. Eligibility",
    body: [
      "FamilyShoot is intended for adults. You must be at least 18 years old, or the age of majority where you live, to use the service.",
      "You are responsible for making sure your use of FamilyShoot complies with the laws and rules that apply to you.",
    ],
  },
  {
    title: "3. Accounts and security",
    body: [
      "You are responsible for the information you provide to us and for keeping access to your account, email, devices, and sign-in methods secure.",
      "You may not share, sell, transfer, or misuse your account, create accounts through automated means, interfere with authentication, or attempt to access another user's account or content.",
      "We may suspend or terminate accounts that violate these terms, create risk for the service, or are used for unlawful, abusive, fraudulent, or harmful activity.",
    ],
  },
  {
    title: "4. Photo rights and consent",
    body: [
      "You may upload photos only when you have the rights, permissions, and consents needed to use them with FamilyShoot and to create AI-generated portraits, cards, refinements, and downloads from them.",
      "If you upload photos of another person, including a family member, child, friend, client, or other identifiable person, you confirm that you have the authority and consent needed to do so.",
      "You are responsible for the content you upload, the prompts you submit, and the way you use or share generated images.",
    ],
  },
  {
    title: "5. Acceptable use",
    body: [
      "You may not use FamilyShoot to violate the law, infringe rights, harass or exploit others, impersonate people, create misleading or deceptive content, generate non-consensual intimate imagery, sexualize minors, produce hate or violent content, or invade someone's privacy.",
      "You may not attempt to bypass safety systems, overload the service, scrape or reverse engineer the service, introduce malware, abuse payment systems, resell access without permission, or use FamilyShoot to build a competing service.",
      "FamilyShoot is built for family-oriented portraits and cards. We may block prompts, uploads, generations, downloads, or accounts when we believe they violate these terms or create legal, safety, security, or reputational risk.",
    ],
  },
  {
    title: "6. AI-generated images",
    body: [
      "FamilyShoot uses automated and AI-assisted systems to create images from your uploads, prompts, and selected themes. We currently use Replicate as a third-party AI generation platform to process image generation, refinements, and upscales on our behalf.",
      "You should review generated images before using, printing, publishing, or sharing them. You are responsible for deciding whether an image is appropriate for your intended use.",
      "We do not guarantee that generations will match a prompt, preserve every detail, resemble every person perfectly, or be unique from images generated for other users.",
    ],
  },
  {
    title: "7. Ownership and licenses",
    body: [
      "You keep the rights you have in the photos, prompts, names, labels, and other materials you upload to FamilyShoot.",
      "You grant FamilyShoot a limited license to host, copy, process, transform, transmit, display, and store your uploads and generated images as needed to provide, secure, support, and improve the service.",
      "Subject to your compliance with these terms and payment of applicable fees, you may use the generated images you create for personal, family, and ordinary non-misleading commercial uses, provided your use does not violate anyone's rights or these terms.",
      "FamilyShoot owns the website, software, design, branding, systems, workflows, documentation, and other service materials, excluding user content and generated images to the extent rights belong to you under applicable law.",
    ],
  },
  {
    title: "8. Payments, credits, and subscriptions",
    body: [
      "Some FamilyShoot features require payment, credits, or an active subscription. Prices, plan features, credit amounts, and availability may change over time.",
      "Subscriptions renew automatically unless canceled before the renewal date through the billing flow we provide. Credits, packs, and subscriptions may be subject to additional checkout terms shown at purchase.",
      "Because FamilyShoot provides digital services and incurs generation, storage, and processing costs when you use the service, purchases are generally non-refundable except where required by law or expressly stated at checkout.",
      "If a payment fails, is reversed, is disputed, or appears fraudulent, we may suspend access, cancel credits or subscriptions, withhold downloads, or close the account.",
    ],
  },
  {
    title: "9. Storage, retention, and deletion",
    body: [
      "Reference photos and generated images are stored for limited periods described in the product and Privacy Policy. Current default retention is generally 14 days for one-time packs and 90 days for Pro shoots.",
      "You are responsible for downloading or preserving images you want to keep before they expire or are deleted. We are not responsible for content that is deleted, expires, becomes unavailable, or is lost.",
      "We may delete content to enforce these terms, protect the service, respond to legal requests, manage storage, or comply with retention limits.",
    ],
  },
  {
    title: "10. Third-party services",
    body: [
      "FamilyShoot may rely on third-party providers for hosting, storage, authentication, payments, email, analytics, customer support, image processing, and security. Replicate is our current third-party AI generation platform, and the files and prompts needed for a generation request may be sent to Replicate for processing.",
      "Third-party services may be subject to their own terms and privacy policies. We are not responsible for third-party services, websites, policies, outages, or changes.",
    ],
  },
  {
    title: "11. Disclaimers",
    body: [
      "FamilyShoot is provided on an 'as is' and 'as available' basis. To the fullest extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, title, non-infringement, availability, accuracy, and uninterrupted operation.",
      "We do not guarantee that the service will be error-free, secure, available at all times, produce a specific result, or meet your expectations for any particular photo, print, card, campaign, or use case.",
    ],
  },
  {
    title: "12. Limitation of liability",
    body: [
      "To the fullest extent permitted by law, FamilyShoot and its owners, employees, contractors, affiliates, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, lost content, or business interruption.",
      "To the fullest extent permitted by law, our total liability for any claim related to the service will not exceed the amount you paid to FamilyShoot for the service giving rise to the claim during the three months before the claim arose.",
    ],
  },
  {
    title: "13. Indemnity",
    body: [
      "You agree to defend, indemnify, and hold harmless FamilyShoot and its owners, employees, contractors, affiliates, and service providers from claims, damages, liabilities, costs, and expenses arising from your uploads, generated images, use of the service, violation of these terms, or violation of another person's rights.",
    ],
  },
  {
    title: "14. Changes and termination",
    body: [
      "We may change, suspend, or discontinue any part of FamilyShoot at any time, including features, pricing, plans, credits, models, storage, and availability.",
      "We may update these terms from time to time. When we make material changes, we will update the date above and provide additional notice where appropriate.",
      "You may stop using FamilyShoot at any time. We may suspend or terminate your access if you violate these terms, create risk, fail to pay, or use the service in a way we reasonably believe is harmful or unlawful.",
    ],
  },
  {
    title: "15. Governing law",
    body: [
      "These terms are governed by the laws of the jurisdiction where FamilyShoot is operated, without regard to conflict of law rules, unless mandatory consumer protection laws in your location require otherwise.",
      "If any part of these terms is found unenforceable, the remaining parts will remain in effect. Our failure to enforce a term is not a waiver of our right to enforce it later.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      label="Terms"
      tone="coral"
      title="Terms and Conditions"
      intro="These terms explain the rules for using FamilyShoot, including photo uploads, consent, AI-generated images, purchases, subscriptions, storage, and acceptable use."
      lastUpdated={lastUpdated}
      sections={sections}
      sidebarTitle="Related"
      sidebar={
        <>
          <Link
            href="/privacy"
            className="mt-3 block text-sm font-medium text-[color:var(--color-coral-deep)] hover:text-[color:var(--color-ink)]"
          >
            Privacy Policy
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
            Questions can be sent to{" "}
            <a
              href="mailto:hello@familyshoot.com"
              className="font-medium text-[color:var(--color-coral-deep)] hover:text-[color:var(--color-ink)]"
            >
              hello@familyshoot.com
            </a>
            .
          </p>
        </>
      }
      contactTitle="Contact us"
      contactBody={
        <>
          For questions about these terms, email{" "}
          <a
            href="mailto:hello@familyshoot.com"
            className="font-medium text-[color:var(--color-coral-deep)] hover:text-[color:var(--color-ink)]"
          >
            hello@familyshoot.com
          </a>
          .
        </>
      }
    />
  );
}
