import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";
import { VIBES } from "@/data/vibes";
import { CARDS } from "@/data/cards";
import { STYLES } from "@/data/styles";

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden rounded-t-[2.5rem] px-6 py-20 sm:px-8 sm:py-24"
      style={{ background: "linear-gradient(180deg, #2E2239 0%, #231C2B 100%)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLogo size="md" tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[color:rgba(251,248,243,0.7)]">
            An AI family photo generator for frame-worthy portraits and holiday cards from the
            photos you already have.
          </p>
          <div className="mt-6">
            <Link href="/studio/roster" className="btn btn-coral btn-sm">
              Start a shoot
            </Link>
          </div>
        </div>

        <div>
          <p className="small-caps text-[color:rgba(251,248,243,0.55)]">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[color:rgba(251,248,243,0.85)]">
            <li>
              <Link href="/#gallery" className="hover:text-white transition-colors">
                Gallery
              </Link>
            </li>
            <li>
              <Link href="/trending" className="hover:text-white transition-colors">
                Trending 🔥
              </Link>
            </li>
            <li>
              <Link href="/#how" className="hover:text-white transition-colors">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/best-family-photo-prompts"
                className="hover:text-white transition-colors"
              >
                Best prompts to create a family photo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="small-caps text-[color:rgba(251,248,243,0.55)]">Care</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[color:rgba(251,248,243,0.85)]">
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </li>
            <li>
              <a
                href="mailto:hi@familyphotoshoot.ai"
                className="hover:text-white transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl border-t border-[color:rgba(251,248,243,0.1)] pt-10">
        <nav
          aria-label="Browse all"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          <HubPill href="/vibes" label="See all vibes" count={VIBES.length} />
          <HubPill href="/trending" label="Trending vibes" />
          <HubPill href="/cards" label="See all cards" count={CARDS.length} />
          <HubPill href="/styles" label="See all styles" count={STYLES.length} />
        </nav>

        <div className="mt-10 grid gap-10 md:grid-cols-3">
          <FooterLinkGroup
            title="Family portrait vibes"
            items={VIBES.map((v) => ({ href: `/${v.slug}`, label: v.name }))}
          />
          <FooterLinkGroup
            title="Family photo cards"
            items={CARDS.map((c) => ({ href: `/${c.slug}`, label: c.name }))}
          />
          <FooterLinkGroup
            title="Portrait art styles"
            items={STYLES.map((s) => ({ href: `/${s.slug}`, label: s.name }))}
          />
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-[color:rgba(251,248,243,0.1)] pt-8 sm:flex-row sm:items-center">
        <p className="text-xs text-[color:rgba(251,248,243,0.5)]">
          © {new Date().getFullYear()} Family Photoshoot. Made with care for families.
        </p>
        <p className="text-xs text-[color:rgba(251,248,243,0.5)]">A paid-only family studio.</p>
      </div>
    </footer>
  );
}

function FooterLinkGroup({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="small-caps text-[color:rgba(251,248,243,0.55)]">{title}</p>
      <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm text-[color:rgba(251,248,243,0.75)] sm:grid-cols-2">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="hover:text-white transition-colors">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HubPill({ href, label, count }: { href: string; label: string; count?: number }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-[color:rgba(251,248,243,0.18)] bg-[color:rgba(251,248,243,0.04)] px-4 py-2 text-sm text-[color:rgba(251,248,243,0.9)] transition-colors hover:border-[color:rgba(251,248,243,0.4)] hover:bg-[color:rgba(251,248,243,0.08)] hover:text-white"
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="rounded-full bg-[color:rgba(251,248,243,0.1)] px-2 py-0.5 text-xs text-[color:rgba(251,248,243,0.65)]">
          {count}
        </span>
      )}
    </Link>
  );
}
