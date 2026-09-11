"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "@/components/i18n/LocalizedLink";
import { getThemeDisplayName } from "@/data/theme-display-names";
import { getThemeDetailHref } from "@/lib/theme-detail-links";
import { getThemeStudioHref } from "@/lib/theme-links";
import { type Theme, type ThemeCategory } from "@/lib/themes";
import { filterThemeCatalog, getDiscoveryThemes, getFeaturedThemes } from "@/lib/theme-catalog";

const PAGE_SIZE = 6;
const CATEGORIES = ["all", "photoreal", "stylized", "card"] as const;

function LookCard({
  theme,
  rank,
  compact = false,
}: {
  theme: Theme;
  rank?: number;
  compact?: boolean;
}) {
  const t = useTranslations("Landing.LookCollection");
  const name = getThemeDisplayName(theme);
  const studioHref = getThemeStudioHref(theme);
  const detailHref = getThemeDetailHref(theme);
  const hasDetailPage = detailHref !== "/vibes" && detailHref !== "/cards";

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <Link
        href={studioHref}
        prefetch={false}
        className="relative block aspect-[4/5] overflow-hidden bg-[color:var(--color-line)]"
        aria-label={t("createNamed", { name })}
      >
        <Image
          src={theme.coverImage}
          alt={t("imageAlt", { name })}
          fill
          sizes={
            compact
              ? "(max-width: 1023px) 50vw, 33vw"
              : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
        {rank && (
          <span
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-bg)] text-sm font-semibold shadow-sm"
            aria-label={t("rank", { rank })}
          >
            {String(rank).padStart(2, "0")}
          </span>
        )}
      </Link>
      <div className={`flex flex-1 flex-col ${compact ? "p-3 sm:p-5" : "p-5"}`}>
        <p
          className={`${compact ? "text-[0.625rem] sm:text-xs" : "text-xs"} break-words font-semibold uppercase tracking-[0.1em] text-[color:var(--color-ink-muted)]`}
        >
          {t(theme.category)}
        </p>
        <h3
          className={`serif mt-2 break-words leading-tight ${compact ? "text-lg sm:text-2xl" : "text-2xl"}`}
        >
          {name}
        </h3>
        <div
          className={`mt-auto flex flex-wrap items-center justify-between ${compact ? "gap-2 pt-3 sm:gap-3 sm:pt-5" : "gap-3 pt-5"}`}
        >
          <Link
            href={studioHref}
            prefetch={false}
            className={
              compact
                ? "inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-full bg-[color:var(--color-coral)] px-2 py-2 text-center text-xs font-semibold leading-snug text-white transition-colors hover:bg-[color:var(--color-coral-deep)] sm:w-auto sm:px-4 sm:text-sm"
                : "btn btn-coral btn-sm"
            }
            aria-label={t("createNamed", { name })}
          >
            {t("create")} <span aria-hidden>↗</span>
          </Link>
          {hasDetailPage && (
            <Link
              href={detailHref}
              prefetch={false}
              className={`${compact ? "inline-flex min-h-8 items-center text-xs sm:text-sm" : "text-sm"} underline underline-offset-4`}
              aria-label={t("detailsNamed", { name })}
            >
              {t("details")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Gallery({ favoriteThemeIds = [] }: { favoriteThemeIds?: string[] }) {
  const t = useTranslations("Landing.LookCollection");
  const { themes: favorites, ranked } = getFeaturedThemes(favoriteThemeIds);
  const discoveryThemes = getDiscoveryThemes(favorites.map((theme) => theme.id));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ThemeCategory | "all">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const filtered = filterThemeCatalog(discoveryThemes, query, category);
  const visible = filtered.slice(0, visibleCount);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div id="gallery" className="scroll-mt-32">
      <section
        aria-labelledby="favorite-looks-title"
        className="bg-[color:var(--color-sage)]/15 px-6 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="chip chip-sage">
                <span className="dot dot-sage" />
                {t(ranked ? "favoritesChip" : "curatedChip")}
              </span>
              <h2
                id="favorite-looks-title"
                className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl"
              >
                {t(ranked ? "favoritesTitle" : "curatedTitle")}
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-[color:var(--color-ink-muted)]">
                {t(ranked ? "favoritesBody" : "curatedBody")}
              </p>
            </div>
            <a href="#all-looks" className="btn btn-ghost">
              {t("browseLink", { count: discoveryThemes.length })} <span aria-hidden>↓</span>
            </a>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((theme, index) => (
              <LookCard key={theme.id} theme={theme} rank={ranked ? index + 1 : undefined} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="all-looks"
        aria-labelledby="all-looks-title"
        className="scroll-mt-32 px-6 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <span className="chip chip-plum">
            <span className="dot dot-plum" />
            {t("catalogChip")}
          </span>
          <h2
            id="all-looks-title"
            className="serif mt-4 text-4xl leading-[1.05] tracking-[-0.025em] sm:text-5xl"
          >
            {t("catalogTitle")}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-[color:var(--color-ink-muted)]">
            {t("catalogBody", { count: discoveryThemes.length })}
          </p>
          <div className="mt-8 flex flex-col gap-5">
            <label className="block max-w-xl">
              <span className="mb-2 block text-sm font-semibold">{t("searchLabel")}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder={t("searchPlaceholder")}
                aria-controls="look-results"
                className="w-full rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] px-4 py-3 text-base outline-offset-4 focus:outline-[color:var(--color-coral)]"
              />
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("catalogChip")}>
              {CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={category === value}
                  aria-controls="look-results"
                  onClick={() => {
                    setCategory(value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${category === value ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-bg)]" : "border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] hover:border-[color:var(--color-ink)]"}`}
                >
                  {t(value)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p
              role="status"
              aria-live="polite"
              className="text-sm text-[color:var(--color-ink-muted)]"
            >
              {t("results", { shown: visible.length, count: filtered.length })}
            </p>
            {(query || category !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm underline underline-offset-4"
              >
                {t("reset")}
              </button>
            )}
          </div>
          <div id="look-results" className="mt-5 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {visible.map((theme) => (
              <LookCard key={theme.id} theme={theme} compact />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[color:var(--color-line)] px-6 py-12 text-center">
              <h3 className="serif text-2xl">{t("emptyTitle")}</h3>
              <p className="mt-2 text-[color:var(--color-ink-muted)]">{t("emptyBody")}</p>
            </div>
          )}
          {visible.length < filtered.length && (
            <div className="mt-10 text-center">
              <button
                type="button"
                aria-controls="look-results"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="btn btn-ghost"
              >
                {t("loadMore")} <span aria-hidden>↓</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
