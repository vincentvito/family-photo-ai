import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how FamilyShoot collects, uses, stores, and protects your account details, uploaded photos, generated images, and billing information.",
  alternates: {
    canonical: "/privacy",
  },
};

const lastUpdated = "May 8, 2026";

const sections: LegalSection[] = [
  {
    title: "1. What this policy covers",
    body: [
      "This Privacy Policy explains how FamilyShoot collects, uses, shares, and protects information when you visit our website, create an account, upload family photos, generate portraits or cards, purchase credits or subscriptions, or contact us for support.",
      "FamilyShoot is designed for consenting families and adults who want to create AI-assisted portraits, cards, refinements, and downloads from photos they provide.",
    ],
  },
  {
    title: "2. Information we collect",
    body: [
      "Account and contact details, such as your name, email address, authentication details, support messages, and communication preferences.",
      "Photos, prompts, people names or labels, theme choices, generated images, refinements, favorites, exports, and other files or creative inputs you upload or create through the service.",
      "Billing and purchase information, including your plan, credits, transaction status, subscription status, invoices, and payment-related identifiers. Payment card details are handled by our payment processor and are not stored directly by FamilyShoot.",
      "Technical information, such as IP address, device type, browser, operating system, pages visited, referring URLs, logs, error reports, and security events.",
    ],
  },
  {
    title: "3. How we use information",
    body: [
      "We use information to provide the service, including account access, uploads, AI generation, refinement, storage, album views, exports, billing, customer support, abuse prevention, and security.",
      "We may also use information to improve reliability and product quality, understand which features are useful, communicate service updates, enforce our policies, comply with legal obligations, and protect the rights and safety of users and others.",
      "We do not use your uploaded family photos or generated images to train FamilyShoot models unless you give us explicit permission for that separate purpose.",
    ],
  },
  {
    title: "4. Photos, likeness, and consent",
    body: [
      "You should only upload photos of yourself, your family members, or other people when you have the rights and permission needed to use their images with FamilyShoot.",
      "You may not use FamilyShoot to impersonate people, create misleading depictions, produce non-consensual intimate imagery, exploit minors, harass others, or generate unlawful or harmful content.",
      "We may review, block, remove, or report content when we believe it violates our policies, threatens safety, infringes rights, or is required by law.",
    ],
  },
  {
    title: "5. Retention and deletion",
    body: [
      "Generated photos and reference uploads are generally kept for 14 days for one-time packs and 90 days for Pro shoots, unless the product displays a different retention period or legal requirements require a longer period.",
      "You can delete available reference photos and finished images from your studio where the app provides a delete action. We may keep limited records for billing, fraud prevention, dispute handling, security, backups, or legal compliance.",
      "Backup copies and logs may take additional time to expire from our systems, but they are retained only as long as needed for operational, security, or legal purposes.",
    ],
  },
  {
    title: "6. Sharing and service providers",
    body: [
      "We share information with vendors that help us operate FamilyShoot, such as hosting, storage, authentication, email, analytics, payment processing, customer support, image processing, and security providers.",
      "FamilyShoot uses Replicate as a third-party AI generation platform. When you request an AI portrait, card, refinement, or upscale, the photos, prompts, and generation settings needed for that request may be sent to Replicate so it can process the image generation on our behalf.",
      "These providers may process information only as needed to provide services to us, protect the service, or comply with the law. Their own privacy policies may also apply when you interact with them directly or when they process data as part of the service, such as during payment checkout or AI generation.",
      "We may disclose information if required by law, to respond to lawful requests, to enforce our agreements, to protect users or the public, or as part of a merger, acquisition, financing, reorganization, or sale of assets.",
    ],
  },
  {
    title: "7. Payments and subscriptions",
    body: [
      "Purchases, subscriptions, invoices, billing portal actions, taxes, refunds, and payment methods are processed through our payment provider. We receive purchase status, plan, invoice, and payment identifiers needed to manage your account.",
      "Do not send payment card numbers or sensitive financial information to us by email or support chat.",
    ],
  },
  {
    title: "8. Security",
    body: [
      "We use reasonable technical and organizational safeguards designed to protect information against unauthorized access, loss, misuse, and alteration.",
      "No online service can guarantee perfect security. You are responsible for protecting access to your email account, sign-in methods, devices, and any shared download links or exported files.",
    ],
  },
  {
    title: "9. Your choices and rights",
    body: [
      "Depending on where you live, you may have rights to access, correct, delete, export, object to, or restrict certain uses of your personal information.",
      "You can contact us to request help with your information. We may need to verify your identity before fulfilling a request, and some information may be retained where permitted or required by law.",
    ],
  },
  {
    title: "10. Children",
    body: [
      "FamilyShoot is intended for adults. Do not create an account or use the service if you are under 18 or below the age of majority where you live.",
      "Adults may upload family photos that include children only when they have the rights and authority to do so, and only for lawful, appropriate, and family-oriented uses.",
    ],
  },
  {
    title: "11. International users",
    body: [
      "FamilyShoot may process and store information in the United States, Canada, and other locations where we or our service providers operate.",
      "By using the service, you understand that your information may be transferred to countries with privacy laws that differ from those in your location.",
    ],
  },
  {
    title: "12. Changes to this policy",
    body: [
      "We may update this Privacy Policy as FamilyShoot changes or legal requirements evolve. When we make material changes, we will update the date above and provide additional notice where appropriate.",
      "Your continued use of FamilyShoot after an updated policy becomes effective means the updated policy applies to your use of the service.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      label="Privacy"
      tone="sage"
      title="Privacy Policy"
      intro="Family photos are personal. This policy explains what we collect, why we collect it, and the controls you have over the photos and information you share with FamilyShoot."
      lastUpdated={lastUpdated}
      sections={sections}
      sidebarTitle="Contact"
      sidebar={
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
          Questions or privacy requests can be sent to{" "}
          <a
            href="mailto:hello@familyshoot.com"
            className="font-medium text-[color:var(--color-coral-deep)] hover:text-[color:var(--color-ink)]"
          >
            hello@familyshoot.com
          </a>
          .
        </p>
      }
      contactTitle="Contact us"
      contactBody={
        <>
          To ask a privacy question or make a privacy request, email{" "}
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
