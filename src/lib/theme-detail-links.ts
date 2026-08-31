import { CARDS } from "@/data/cards";
import { VIBES } from "@/data/vibes";
import type { Theme } from "@/lib/themes";

const DETAIL_SLUG_OVERRIDES: Record<string, string> = {
  "leibovitz-studio": "annie-leibovitz-family-photos",
  "national-geographic": "national-geographic-family-photos",
  "royal-family-portrait": "royal-family-portrait",
  "toy-box-keepsake-portrait": "toy-box-keepsake-family-photos",
  "poetcore-family-library-portrait": "poetcore-family-library-photos",
  "heirloom-brooch-studio": "heirloom-brooch-family-photos",
  "family-watch-party": "family-watch-party-photos",
};

const DETAIL_SLUGS = new Set([...VIBES.map((vibe) => vibe.slug), ...CARDS.map((card) => card.slug)]);

function candidateSlugs(themeId: string) {
  return [
    DETAIL_SLUG_OVERRIDES[themeId],
    `${themeId}-family-photos`,
    `${themeId}-photos`,
    `${themeId.replace(/-portrait$/u, "")}-family-photos`,
    `${themeId.replace(/-card$/u, "-card")}-family-photos`,
    themeId,
  ].filter((slug): slug is string => Boolean(slug));
}

export function getThemeDetailHref(theme: Pick<Theme, "id" | "category">) {
  const slug = candidateSlugs(theme.id).find((candidate) => DETAIL_SLUGS.has(candidate));
  if (slug) return `/${slug}`;
  return theme.category === "card" ? "/cards" : "/vibes";
}
