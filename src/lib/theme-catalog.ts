import { getThemeDisplayName } from "../data/theme-display-names";
import { THEMES, type Theme, type ThemeCategory } from "./themes";

const STARTER_THEME_IDS = [
  "stacked-love",
  "golden-hour-beach",
  "pixar-family",
  "superhero-family",
  "ghibli-countryside",
  "leibovitz-studio",
];

// Editorial release order from the original homepage's WEEKLY_TREND_ITEMS.
// Prepend each new weekly batch here; THEMES is grouped by category, not recency.
const WEEKLY_THEME_IDS = [
  "family-resemblance-portrait",
  "vintage-family-heirloom",
  "cozy-autumn-moodboard",
  "pumpkin-patch-farm-adventure",
  "jewel-tone-fall-studio",
  "whimsical-witchy-family-night",
  "burgundy-orchard-portrait",
  "poetcore-letter-portrait",
  "opalescent-future-family",
  "heirloom-brooch-studio",
  "whimsical-big-top-family",
  "lantern-glow-gathering",
  "butter-yellow-picnic",
  "paprika-plaid-autumn",
  "summerween-pumpkin-glow",
  "storybook-forest-family-adventure",
  "y3k-chrome-family-future",
  "polka-dot-porch-party",
  "neo-deco-family-portrait",
  "storybook-pen-pals",
  "mystic-outlands-adventure",
  "galactic-glow-family-adventure",
  "cozy-summerween-card",
  "butter-yellow-summer-card",
  "joyful-photo-dump",
  "storybook-ocean-quest",
  "poetcore-porch",
  "future-glow-family",
  "heirloom-pin-portrait",
  "retro-summer-postcard",
  "butter-yellow-summer-portrait",
  "scarf-garden-story",
  "family-watch-party",
  "toy-box-keepsake-portrait",
  "time-travel-toy-shelf",
  "retro-jazz-porch",
  "ocean-explorer-card",
  "cool-blue-lake-day",
  "poetcore-family-library-portrait",
  "neo-deco-celebration-card",
  "crochet-raffia-picnic-card",
];

export function getDiscoveryThemes(featuredIds: readonly string[]) {
  const byId = new Map(THEMES.map((theme) => [theme.id, theme]));
  const featured = new Set(featuredIds);
  const orderedIds = new Set([...WEEKLY_THEME_IDS, ...THEMES.map((theme) => theme.id)]);
  return [...orderedIds].flatMap((id) => {
    const theme = byId.get(id);
    return theme && !featured.has(id) ? [theme] : [];
  });
}

export function getFeaturedThemes(rankedIds: string[], limit = 6) {
  const byId = new Map(THEMES.map((theme) => [theme.id, theme]));
  const rankedThemes = [...new Set(rankedIds)].flatMap((id) => {
    const theme = byId.get(id);
    return theme ? [theme] : [];
  });
  const ranked = rankedThemes.length > 0;
  const themes = ranked
    ? rankedThemes
    : STARTER_THEME_IDS.flatMap((id) => {
        const theme = byId.get(id);
        return theme ? [theme] : [];
      });
  return { themes: themes.slice(0, limit), ranked };
}

function normalizeSearch(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase().trim();
}

export function filterThemeCatalog(
  themes: Theme[],
  query: string,
  category: ThemeCategory | "all",
) {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return themes.filter((theme) => {
    if (category !== "all" && theme.category !== category) return false;
    const haystack = normalizeSearch(
      `${getThemeDisplayName(theme)} ${theme.name} ${theme.blurb} ${theme.id.replaceAll("-", " ")}`,
    );
    return words.every((word) => haystack.includes(word));
  });
}
