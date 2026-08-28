import Link from "@/components/i18n/LocalizedLink";
import BrandLogo from "@/components/brand/BrandLogo";
import { VIBES } from "@/data/vibes";
import { CARDS } from "@/data/cards";
import { STYLES } from "@/data/styles";
import { OCCASION_PAGES } from "@/data/occasion-pages";
import { BIRTHDAY_CARD_PAGES } from "@/data/birthday-card-pages";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("Landing.Footer");
  return (
    <footer
      className="relative overflow-hidden rounded-t-[2.5rem] px-6 py-20 sm:px-8 sm:py-24"
      style={{ background: "linear-gradient(180deg, #2E2239 0%, #231C2B 100%)" }}
    >
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <BrandLogo size="md" tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[color:rgba(251,248,243,0.7)]">
            {t("body")}
          </p>
          <div className="mt-6">
            <Link href="/studio/roster" className="btn btn-coral btn-sm">
              {t("startPreview")}
            </Link>
          </div>
        </div>

        <div>
          <p className="small-caps text-[color:rgba(251,248,243,0.55)]">{t("product")}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[color:rgba(251,248,243,0.85)]">
            <li>
              <Link href="/#gallery" className="hover:text-white transition-colors">
                {t("gallery")}
              </Link>
            </li>
            <li>
              <Link href="/trending" className="hover:text-white transition-colors">
                {t("trending")} 🔥
              </Link>
            </li>
            <li>
              <Link href="/#how" className="hover:text-white transition-colors">
                {t("how")}
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="hover:text-white transition-colors">
                {t("pricing")}
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                {t("blog")}
              </Link>
            </li>
            <li>
              <Link
                href="/best-family-photo-prompts"
                className="hover:text-white transition-colors"
              >
                {t("bestPrompts")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="small-caps text-[color:rgba(251,248,243,0.55)]">{t("care")}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-[color:rgba(251,248,243,0.85)]">
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                {t("terms")}
              </Link>
            </li>
            <li>
              <a
                href="mailto:hi@familyphotoshoot.ai"
                className="hover:text-white transition-colors"
              >
                {t("contact")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl border-t border-[color:rgba(251,248,243,0.1)] pt-10">
        <nav
          aria-label={t("browseAll")}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          <HubPill href="/vibes" label={t("allVibes")} count={VIBES.length} />
          <HubPill href="/trending" label={t("trendingVibes")} />
          <HubPill href="/cards" label={t("allCards")} count={CARDS.length} />
          <HubPill
            href="/birthday-cards"
            label={t("birthdayIdeas")}
            count={BIRTHDAY_CARD_PAGES.length}
          />
          <HubPill href="/occasions" label={t("occasionPages")} count={OCCASION_PAGES.length} />
          <HubPill href="/styles" label={t("allStyles")} count={STYLES.length} />
        </nav>

        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <FooterLinkGroup
            title={t("vibeGroup")}
            items={VIBES.map((v) => ({ href: `/${v.slug}`, label: v.name }))}
          />
          <FooterLinkGroup
            title={t("cardGroup")}
            items={CARDS.map((c) => ({ href: `/${c.slug}`, label: c.name }))}
          />
          <FooterLinkGroup
            title={t("birthdayGroup")}
            items={BIRTHDAY_CARD_PAGES.map((page) => ({
              href: `/birthday-cards/${page.slug}`,
              label: page.name,
            }))}
          />
          <FooterLinkGroup
            title={t("occasionGroup")}
            items={OCCASION_PAGES.map((page) => ({ href: `/${page.slug}`, label: page.name }))}
          />
          <FooterLinkGroup
            title={t("styleGroup")}
            items={STYLES.map((s) => ({ href: `/${s.slug}`, label: s.name }))}
          />
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col items-start justify-between gap-4 border-t border-[color:rgba(251,248,243,0.1)] pt-8 sm:flex-row sm:items-center">
        <p className="text-xs text-[color:rgba(251,248,243,0.5)]">
          © {new Date().getFullYear()} {t("copyright")}
        </p>
        <TinyshelfBadge />
        <p className="text-xs text-[color:rgba(251,248,243,0.5)]">{t("paidStudio")}</p>
      </div>
    </footer>
  );
}

export function TinyshelfBadge() {
  return (
    <a href="https://www.tinyshelf.co/?ref=familyshoot.com" title="Featured on tinyshelf">
      {/* The badge is served as an SVG by Tinyshelf and does not need image optimization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://www.tinyshelf.co/badge/tinyshelf-badge-light-5ca4026a.svg"
        alt="Featured on tinyshelf"
        width={216}
        height={64}
      />
    </a>
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
