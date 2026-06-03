import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import type { FaqItem } from "@/data/seo-content";

export type RelatedLink = { href: string; label: string; image: string };
type ImageTile = { label: string; src: string; alt: string };
type SampleImage = ImageTile & { caption: string };

type Props = {
  h1: string;
  intro: string;
  heroImage: string;
  heroAlt: string;
  extraImages?: readonly string[];
  extraImageLabel?: string;
  whatIsTitle: string;
  whatIsBody: string;
  faqs: FaqItem[];
  related: RelatedLink[];
  relatedHeading?: string;
  crossLinks: { hubHref: string; hubLabel: string; sample: RelatedLink[] };
  ctaHref: string;
  ctaLabel: string;
  breadcrumbs: { name: string; url: string }[];
  sourceImages?: readonly ImageTile[];
  sampleImages?: readonly SampleImage[];
};

export function LandingShell({
  h1,
  intro,
  heroImage,
  heroAlt,
  extraImages = [],
  extraImageLabel = "Sample variation",
  whatIsTitle,
  whatIsBody,
  faqs,
  related,
  relatedHeading = "Related styles you might love",
  crossLinks,
  ctaHref,
  ctaLabel,
  breadcrumbs,
  sourceImages = [],
  sampleImages = [],
}: Props) {
  const sampleHref = sampleImages.length > 0 ? "#samples" : "/#gallery";

  return (
    <>
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
            {breadcrumbs.map((b, i) => (
              <li key={b.url} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={b.url} className="hover:text-[color:var(--color-ink)]">
                    {b.name}
                  </Link>
                ) : (
                  <span className="text-[color:var(--color-ink)]">{b.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <section className="mx-auto mt-6 grid max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            {sampleImages.length > 0 && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-coral-deep)] shadow-[var(--shadow-sm)]">
                <span className="dot dot-coral" />
                Father&apos;s Day campaign
              </div>
            )}
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {h1}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
              {intro}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={ctaHref} className="btn btn-coral">
                {ctaLabel}
              </Link>
              <Link href={sampleHref} className="btn btn-ghost">
                See more samples
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]">
              <Image
                src={heroImage}
                alt={heroAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {sourceImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2 sm:absolute sm:-bottom-5 sm:left-5 sm:right-5 sm:mt-0">
                {sourceImages.map((image) => (
                  <figure
                    key={image.src}
                    className="overflow-hidden rounded-[var(--radius-sm)] border border-[color:rgba(31,26,36,0.14)] bg-[color:var(--color-bg-elevated)] p-1 shadow-[var(--shadow-md)]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[6px]">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 640px) 23vw, 120px"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="truncate px-1 pt-1 text-center text-[0.62rem] font-semibold text-[color:var(--color-ink-muted)]">
                      {image.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>

        {sourceImages.length > 0 && (
          <section className="mx-auto mt-20 max-w-6xl px-6 sm:mt-24">
            <div className="grid gap-8 rounded-[var(--radius-xl)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 shadow-[var(--shadow-md)] sm:p-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
              <div>
                <p className="small-caps text-[color:var(--color-coral-deep)]">
                  Separate selfies are enough
                </p>
                <h2 className="mt-3 text-3xl leading-tight tracking-tight sm:text-4xl">
                  No one needs to be in the same room.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[color:var(--color-ink-muted)]">
                  Pull Dad, kids, grandparents, and pets from different phones. FamilyShoot uses
                  those everyday photos to compose one Father&apos;s Day-ready portrait.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {sourceImages.map((image, index) => (
                  <figure
                    key={image.src}
                    className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-md)] border border-[color:rgba(31,26,36,0.12)] bg-[color:var(--color-bg)] shadow-[var(--shadow-sm)]"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 160px"
                      className="object-cover"
                    />
                    <figcaption className="absolute inset-x-2 bottom-2 flex">
                      <span className="rounded-full bg-[color:rgba(31,26,36,0.78)] px-2.5 py-1 text-[0.68rem] font-semibold leading-none text-[color:var(--color-bg)] backdrop-blur">
                        {index + 1}. {image.label}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {sampleImages.length > 0 && (
          <section id="samples" className="mx-auto mt-20 max-w-6xl px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="small-caps text-[color:var(--color-coral-deep)]">
                  Three Father&apos;s Day directions
                </p>
                <h2 className="mt-3 text-3xl leading-tight tracking-tight sm:text-4xl">
                  Three Father&apos;s Day gifts you can make from simple phone photos.
                </h2>
              </div>
              <Link href={ctaHref} className="btn btn-ghost self-start sm:self-auto">
                Start with your photos
              </Link>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {sampleImages.map((image) => (
                <figure
                  key={image.src}
                  className="group overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-md)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--color-bg-tinted-butter)]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                    />
                  </div>
                  <figcaption className="p-4">
                    <p className="text-sm font-semibold text-[color:var(--color-ink)]">
                      {image.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                      {image.caption}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {extraImages.length > 0 && (
          <section className="mx-auto mt-20 max-w-6xl px-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">More sample directions</h2>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-[color:var(--color-ink-muted)]">
                  A few nearby ways families use this look for cards, prints, and profile-worthy
                  portraits.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {extraImages.map((image, i) => (
                <div
                  key={image}
                  className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]"
                >
                  <Image
                    src={image}
                    alt={`${extraImageLabel} ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto mt-20 max-w-3xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">{whatIsTitle}</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-[color:var(--color-ink-muted)]">
            {whatIsBody.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">{relatedHeading}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={r.image}
                      alt={r.label}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-4 py-3 text-sm font-medium">{r.label}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              More from {crossLinks.hubLabel}
            </h2>
            <Link href={crossLinks.hubHref} className="text-sm underline">
              Browse all
            </Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {crossLinks.sample.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={r.image}
                      alt={r.label}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-4 py-3 text-sm font-medium">{r.label}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto mt-20 max-w-3xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Frequently asked</h2>
          <dl className="mt-6 divide-y divide-[color:var(--color-line)]">
            {faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-base font-medium">{f.q}</dt>
                <dd className="mt-2 text-base leading-relaxed text-[color:var(--color-ink-muted)]">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto mt-20 max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Ready to make yours?</h2>
          <p className="mt-3 text-[color:var(--color-ink-muted)]">
            A few selfies in, a frame-worthy family portrait out. About two minutes.
          </p>
          <div className="mt-6">
            <Link href={ctaHref} className="btn btn-coral">
              {ctaLabel}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
