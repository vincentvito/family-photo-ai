import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { LAST_MINUTE_BIRTHDAY_CARD_PAGE as page } from "@/data/birthday-card-pages";
import { JsonLd } from "../../[slug]/_components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

const messageExamples = [
  {
    recipient: "For grandma",
    message:
      "Happy birthday to the heart of our family. We love you more than words can fit on one card.",
  },
  {
    recipient: "For a kid",
    message:
      "Happy birthday to our favorite little adventurer. Keep being curious, wild, and wonderfully you.",
  },
  {
    recipient: "For long-distance family",
    message: "We may be far apart today, but you are right here with us in every memory.",
  },
] as const;

const faqs = [
  {
    q: "Can a last-minute birthday card still feel personal?",
    a: "Yes. The fastest way to make it feel thoughtful is to anchor the card in a real relationship: family photos, a shared memory, a favorite pet, or a message that sounds like you wrote it for one person.",
  },
  {
    q: "What photos work best for a personalized birthday card?",
    a: "Clear phone photos of the birthday person, family members, partners, kids, grandparents, friends, or pets work best. They do not all need to come from the same moment.",
  },
  {
    q: "Where does the Create a birthday card button go?",
    a: "It starts the current FamilyShoot creation flow where you can add people and pets, choose a card direction, and create a birthday-card image from your photos.",
  },
] as const;

export const metadata: Metadata = {
  title: page.seoTitle,
  description: page.metaDescription,
  alternates: { canonical: `${SITE_URL}${page.path}` },
  openGraph: {
    title: page.seoTitle,
    description: page.metaDescription,
    url: `${SITE_URL}${page.path}`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}${page.image}`,
        width: 1200,
        height: 1500,
        alt: "Personalized birthday card made from family photos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: page.seoTitle,
    description: page.metaDescription,
    images: [`${SITE_URL}${page.image}`],
  },
};

export default function LastMinutePersonalizedBirthdayCardPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Birthday cards", url: "/birthday-family-cards" },
    { name: "Last-minute personalized birthday cards", url: page.path },
  ];

  return (
    <>
      <JsonLd
        url={page.path}
        name={page.h1}
        description={page.metaDescription}
        image={page.image}
        faqs={faqs.map((faq) => ({ q: faq.q, a: faq.a }))}
        breadcrumbs={breadcrumbs}
        type="WebPage"
      />
      <Nav
        links={[
          { href: "/vibes", label: "Vibes" },
          { href: "/cards", label: "Cards" },
          { href: "/styles", label: "Styles" },
        ]}
      />
      <main className="pt-28 pb-16">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-6xl px-6 text-xs text-[color:var(--color-ink-muted)]"
        >
          <ol className="flex flex-wrap gap-1">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.url} className="flex items-center gap-1">
                {index > 0 && <span>/</span>}
                {index < breadcrumbs.length - 1 ? (
                  <Link href={breadcrumb.url} className="hover:text-[color:var(--color-ink)]">
                    {breadcrumb.name}
                  </Link>
                ) : (
                  <span className="text-[color:var(--color-ink)]">{breadcrumb.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <section className="mx-auto mt-6 grid max-w-6xl gap-10 px-6 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="small-caps text-[color:var(--color-coral-deep)]">
              Personalized birthday cards
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
              {page.heroCopy}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={page.ctaHref} className="btn btn-coral">
                {page.ctaLabel}
              </Link>
              <Link href="#message-examples" className="btn btn-ghost">
                See message examples
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]">
            <Image
              src={page.image}
              alt="Warm birthday card portrait with space for a personal greeting"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </section>

        <section className="mx-auto mt-20 grid max-w-6xl gap-5 px-6 lg:grid-cols-3">
          <article className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-white/80 p-6 shadow-[var(--shadow-soft)]">
            <h2 className="text-2xl font-semibold tracking-tight">
              For when “Happy Birthday” is not enough
            </h2>
            <p className="mt-4 leading-relaxed text-[color:var(--color-ink-muted)]">
              A generic greeting can feel thin when the birthday matters. Start with a photo that
              already carries emotion, then pair it with a short line that names the relationship,
              the memory, or the person you are celebrating.
            </p>
          </article>
          <article className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-white/80 p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Birthday cards for kids, partners, grandparents, friends, and pet lovers
            </h2>
            <p className="mt-4 leading-relaxed text-[color:var(--color-ink-muted)]">
              Use a favorite kid photo for something playful, a couple photo for a romantic note, a
              grandparent portrait for a keepsake, or a pet photo for the person whose camera roll is
              mostly paws. FamilyShoot works best when the card idea is specific to the recipient.
            </p>
          </article>
        </section>

        <section className="mx-auto mt-16 max-w-3xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Ideas for same-day birthday messages
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-[color:var(--color-ink-muted)]">
            <p>
              Keep the note short, warm, and specific. Mention the birthday person by role or name,
              point to one thing you love about them, and close with a line that feels like your
              voice.
            </p>
            <p>
              If you are sending the card today, avoid apologizing too much. A sincere message and a
              meaningful photo usually feels better than a long explanation.
            </p>
          </div>
        </section>

        <section id="message-examples" className="mx-auto mt-16 max-w-6xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Birthday message examples by recipient
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {messageExamples.map((example) => (
              <figure
                key={example.recipient}
                className="rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-cream)] p-5"
              >
                <figcaption className="text-sm font-semibold text-[color:var(--color-coral-deep)]">
                  {example.recipient}
                </figcaption>
                <blockquote className="mt-3 text-base leading-relaxed text-[color:var(--color-ink)]">
                  “{example.message}”
                </blockquote>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-3xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            FAQ: last-minute personalized birthday cards
          </h2>
          <dl className="mt-6 divide-y divide-[color:var(--color-line)]">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-5">
                <dt className="text-base font-medium">{faq.q}</dt>
                <dd className="mt-2 text-base leading-relaxed text-[color:var(--color-ink-muted)]">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto mt-20 max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Make the birthday card personal.</h2>
          <p className="mt-3 text-[color:var(--color-ink-muted)]">
            Bring together the people, pets, and memory behind the birthday note.
          </p>
          <div className="mt-6">
            <Link href={page.ctaHref} className="btn btn-coral">
              {page.ctaLabel}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
