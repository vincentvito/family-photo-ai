import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import type { FaqItem } from '@/data/seo-content';

export type RelatedLink = { href: string; label: string; image: string };

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
  crossLinks: { hubHref: string; hubLabel: string; sample: RelatedLink[] };
  ctaHref: string;
  ctaLabel: string;
  breadcrumbs: { name: string; url: string }[];
};

export function LandingShell({
  h1,
  intro,
  heroImage,
  heroAlt,
  extraImages = [],
  extraImageLabel = 'Sample variation',
  whatIsTitle,
  whatIsBody,
  faqs,
  related,
  crossLinks,
  ctaHref,
  ctaLabel,
  breadcrumbs,
}: Props) {
  return (
    <>
      <Nav links={[{ href: '/vibes', label: 'Vibes' }, { href: '/cards', label: 'Cards' }, { href: '/styles', label: 'Styles' }]} />
      <main className="pt-28 pb-16">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-6 text-xs text-[color:var(--color-ink-muted)]">
          <ol className="flex flex-wrap gap-1">
            {breadcrumbs.map((b, i) => (
              <li key={b.url} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={b.url} className="hover:text-[color:var(--color-ink)]">{b.name}</Link>
                ) : (
                  <span className="text-[color:var(--color-ink)]">{b.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <section className="mx-auto mt-6 grid max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{h1}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">{intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={ctaHref} className="btn btn-coral">{ctaLabel}</Link>
              <Link href="/#gallery" className="btn btn-ghost">See more samples</Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]">
            <Image src={heroImage} alt={heroAlt} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-3xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">{whatIsTitle}</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-[color:var(--color-ink-muted)]">
            {whatIsBody.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </section>

        {extraImages.length > 0 && (
          <section className="mx-auto mt-20 max-w-6xl px-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">More sample directions</h2>
                <p className="mt-2 max-w-2xl text-base leading-relaxed text-[color:var(--color-ink-muted)]">
                  A few nearby ways families use this look for cards, prints, and profile-worthy portraits.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {extraImages.map((image, i) => (
                <div key={image} className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]">
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

        <section className="mx-auto mt-20 max-w-6xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Related styles you might love</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map(r => (
              <li key={r.href}>
                <Link href={r.href} className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image src={r.image} alt={r.label} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="px-4 py-3 text-sm font-medium">{r.label}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto mt-20 max-w-6xl px-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">More from {crossLinks.hubLabel}</h2>
            <Link href={crossLinks.hubHref} className="text-sm underline">Browse all</Link>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {crossLinks.sample.map(r => (
              <li key={r.href}>
                <Link href={r.href} className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image src={r.image} alt={r.label} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
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
            {faqs.map(f => (
              <div key={f.q} className="py-5">
                <dt className="text-base font-medium">{f.q}</dt>
                <dd className="mt-2 text-base leading-relaxed text-[color:var(--color-ink-muted)]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto mt-20 max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Ready to make yours?</h2>
          <p className="mt-3 text-[color:var(--color-ink-muted)]">Five selfies in, a frame-worthy family portrait out. About two minutes.</p>
          <div className="mt-6">
            <Link href={ctaHref} className="btn btn-coral">{ctaLabel}</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
