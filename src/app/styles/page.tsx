import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import { STYLES } from '@/data/styles';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://familyshoot.com';

export const metadata: Metadata = {
  title: 'Family Portrait Art Styles: Watercolor, Oil Painting, Storybook | FamilyShoot',
  description: 'Hand-painted-look family portraits from your photos. Watercolor, oil painting, colored pencil, storybook, clay 3D, and studio photoshoot. Minutes, not weeks.',
  alternates: { canonical: `${SITE_URL}/styles` },
};

export default function StylesHub() {
  return (
    <>
      <Nav links={[{ href: '/vibes', label: 'Vibes' }, { href: '/cards', label: 'Cards' }, { href: '/styles', label: 'Styles' }]} />
      <main className="pt-28 pb-16">
        <header className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Family portrait art styles</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--color-ink-muted)]">
            Hand-painted, illustrated, sculpted, or studio-shot. Pick the finish, upload selfies, and FamilyShoot delivers a portrait that looks commissioned in about two minutes.
          </p>
        </header>
        <ul className="mx-auto mt-12 grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {STYLES.map(s => (
            <li key={s.slug}>
              <Link href={`/${s.slug}`} className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={s.image} alt={`${s.name} family portrait`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="px-5 py-4">
                  <div className="text-base font-semibold">{s.name}</div>
                  <div className="mt-1 text-sm text-[color:var(--color-ink-muted)]">{s.shortDescription}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
