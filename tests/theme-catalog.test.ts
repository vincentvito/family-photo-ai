import assert from "node:assert/strict";
import test from "node:test";
import { getThemeDisplayName, THEME_DISPLAY_NAMES } from "../src/data/theme-display-names";
import {
  filterThemeCatalog,
  getDiscoveryThemes,
  getFeaturedThemes,
} from "../src/lib/theme-catalog";
import { getThemeStudioHref } from "../src/lib/theme-links";
import { parseStudioIntent, studioSearchParamsFromUrl } from "../src/lib/studio-intent";
import { THEMES } from "../src/lib/themes";

const FIRST_WEEKLY_LOOKS = [
  "cozy-reset-morning",
  "autumn-charm-portrait",
  "fashion-week-family-editorial",
  "jewel-tone-studio-card",
  "neo-deco-celebration-card",
  "pet-holiday-outtake",
] as const;

const NEXT_WEEKLY_LOOKS = [
  "burgundy-orchard-portrait",
  "poetcore-letter-portrait",
  "opalescent-future-family",
  "heirloom-brooch-studio",
  "whimsical-big-top-family",
  "lantern-glow-gathering",
];

test("featured looks retain ranking order without duplicates, unknown IDs or invented filler", () => {
  const rankedIds = [
    "missing-theme",
    "pixar-family",
    "golden-hour-beach",
    "pixar-family",
    "removed-theme",
  ];
  const featured = getFeaturedThemes(rankedIds);
  assert.equal(featured.ranked, true);
  assert.deepEqual(
    featured.themes.map((theme) => theme.id),
    ["pixar-family", "golden-hour-beach"],
  );
  assert.deepEqual(
    getFeaturedThemes(rankedIds, 1).themes.map((theme) => theme.id),
    ["pixar-family"],
  );
});

test("missing ranking data offers six valid curated looks without calling them ranked favorites", () => {
  for (const rankedIds of [[], ["missing-theme", "removed-theme"]]) {
    const featured = getFeaturedThemes(rankedIds);
    assert.equal(featured.ranked, false);
    assert.equal(featured.themes.length, 6);
    assert.equal(new Set(featured.themes.map((theme) => theme.id)).size, 6);
    assert.ok(featured.themes.every((theme) => THEMES.includes(theme)));
  }
});

test("discovery starts with six weekly looks and keeps their priority on the next page", () => {
  const featuredIds = getFeaturedThemes([]).themes.map((theme) => theme.id);
  const discovery = filterThemeCatalog(getDiscoveryThemes(featuredIds), "", "all");

  assert.deepEqual(
    discovery.slice(0, 6).map((theme) => theme.id),
    FIRST_WEEKLY_LOOKS,
  );
  assert.deepEqual(
    discovery.slice(6, 12).map((theme) => theme.id),
    NEXT_WEEKLY_LOOKS,
  );
});

test("weekly favorites are excluded from discovery and cannot return through search", () => {
  const discovery = getDiscoveryThemes(FIRST_WEEKLY_LOOKS);
  const discoveryIds = new Set(discovery.map((theme) => theme.id));

  assert.deepEqual(
    discovery.slice(0, 6).map((theme) => theme.id),
    NEXT_WEEKLY_LOOKS,
  );
  for (const id of FIRST_WEEKLY_LOOKS) {
    assert.equal(discoveryIds.has(id), false, id);
    const query = id.replaceAll("-", " ");
    assert.ok(filterThemeCatalog(THEMES, query, "all").some((theme) => theme.id === id));
    assert.ok(filterThemeCatalog(discovery, query, "all").every((theme) => theme.id !== id));
  }
  assert.deepEqual(
    filterThemeCatalog(discovery, "poetcore", "all").map((theme) => theme.id),
    [
      "poetcore-letter-portrait",
      "poetcore-porch",
      "poetcore-family-library-portrait",
      "poetcore-letterpress-family-card",
    ],
  );
});

test("featured and discovery looks partition the complete catalog without duplicates", () => {
  const catalogIds = new Set(THEMES.map((theme) => theme.id));
  const featuredScenarios = [
    getFeaturedThemes([]).themes.map((theme) => theme.id),
    FIRST_WEEKLY_LOOKS,
    ["burgundy-orchard-portrait", "pixar-family", "card-easter", "pixar-family"],
    [...catalogIds],
  ];

  for (const featuredIds of featuredScenarios) {
    const featuredSet = new Set(featuredIds);
    const discoveryIds = getDiscoveryThemes(featuredIds).map((theme) => theme.id);
    assert.equal(new Set(discoveryIds).size, discoveryIds.length);
    assert.ok(discoveryIds.every((id) => !featuredSet.has(id)));
    assert.deepEqual(new Set([...featuredSet, ...discoveryIds]), catalogIds);
    assert.equal(featuredSet.size + discoveryIds.length, catalogIds.size);
  }
});

test("discovery category filters and searches retain the curated weekly order", () => {
  const featuredIds = getFeaturedThemes([]).themes.map((theme) => theme.id);
  const discovery = getDiscoveryThemes(featuredIds);

  assert.deepEqual(
    filterThemeCatalog(discovery, "", "photoreal")
      .slice(0, 6)
      .map((theme) => theme.id),
    [
      "cozy-reset-morning",
      "autumn-charm-portrait",
      "fashion-week-family-editorial",
      "pet-holiday-outtake",
      "burgundy-orchard-portrait",
      "poetcore-letter-portrait",
    ],
  );
  assert.deepEqual(
    filterThemeCatalog(discovery, "", "stylized")
      .slice(0, 3)
      .map((theme) => theme.id),
    ["opalescent-future-family", "whimsical-big-top-family", "storybook-forest-family-adventure"],
  );
  assert.deepEqual(
    filterThemeCatalog(discovery, "", "card")
      .slice(0, 5)
      .map((theme) => theme.id),
    [
      "jewel-tone-studio-card",
      "neo-deco-celebration-card",
      "summerween-pumpkin-glow",
      "polka-dot-porch-party",
      "cozy-summerween-card",
    ],
  );
  for (const category of ["all", "photoreal"] as const) {
    assert.deepEqual(
      filterThemeCatalog(discovery, "poetcore", category).map((theme) => theme.id),
      [
        "poetcore-letter-portrait",
        "poetcore-porch",
        "poetcore-family-library-portrait",
        ...(category === "all" ? ["poetcore-letterpress-family-card"] : []),
      ],
    );
  }
});

test("unknown featured IDs do not remove or reorder discovery looks", () => {
  assert.deepEqual(getDiscoveryThemes(["missing-theme", "removed-theme"]), getDiscoveryThemes([]));
  const featuredIds = getFeaturedThemes([]).themes.map((theme) => theme.id);
  assert.deepEqual(
    getDiscoveryThemes(["missing-theme", ...featuredIds, "removed-theme"]),
    getDiscoveryThemes(featuredIds),
  );
});

test("catalog search finds renamed looks, their old names and descriptive details across the full catalog", () => {
  assert.deepEqual(filterThemeCatalog(THEMES, "  ", "all"), THEMES);
  for (const [query, expectedId] of [
    ["Y2K FLASH PHOTOS", "y2k-disposable"],
    ["Y2K Disposable", "y2k-disposable"],
    ["2003 fridge", "y2k-disposable"],
    ["DIA MUERTOS", "card-dia-de-muertos"],
    ["  díA   MuÉrtos  ", "card-dia-de-muertos"],
  ]) {
    assert.deepEqual(
      filterThemeCatalog(THEMES, query, "all").map((theme) => theme.id),
      [expectedId],
      query,
    );
  }
});

test("category filters intersect the search and unmatched searches stay empty", () => {
  const query = "yellow sunshine";
  assert.deepEqual(
    filterThemeCatalog(THEMES, query, "all")
      .map((theme) => theme.id)
      .sort(),
    ["butter-yellow-summer-card", "butter-yellow-summer-portrait"],
  );
  assert.deepEqual(
    filterThemeCatalog(THEMES, query, "photoreal").map((theme) => theme.id),
    ["butter-yellow-summer-portrait"],
  );
  assert.deepEqual(
    filterThemeCatalog(THEMES, query, "card").map((theme) => theme.id),
    ["butter-yellow-summer-card"],
  );
  assert.deepEqual(filterThemeCatalog(THEMES, query, "stylized"), []);
  assert.deepEqual(filterThemeCatalog(THEMES, "no-such-look-987654321", "all"), []);
});

test("display names reference existing stable IDs and leave every look with a distinct label", () => {
  const catalogIds = new Set(THEMES.map((theme) => theme.id));
  for (const [id, name] of Object.entries(THEME_DISPLAY_NAMES)) {
    assert.ok(catalogIds.has(id), `Unknown display-name override: ${id}`);
    assert.ok(name.trim(), `Empty display name: ${id}`);
    assert.equal(name, name.trim(), `Padded display name: ${id}`);
  }
  const labels = THEMES.map((theme) => getThemeDisplayName(theme).toLocaleLowerCase());
  assert.equal(new Set(labels).size, THEMES.length, "Every catalog label must be unique");
  assert.equal(getThemeDisplayName({ id: "future-look", name: "Future Look" }), "Future Look");
});

test("every catalog creation link preserves its stable look and correct portrait or card output", () => {
  for (const theme of THEMES) {
    const url = new URL(getThemeStudioHref(theme), "https://familyshoot.com");
    const isCard = theme.category === "card";
    assert.equal(url.pathname, "/studio/theme", theme.id);
    assert.equal(url.searchParams.get(isCard ? "card" : "theme"), theme.id);
    assert.equal(url.searchParams.has(isCard ? "theme" : "card"), false);
    assert.deepEqual(parseStudioIntent(studioSearchParamsFromUrl(url.searchParams), THEMES), {
      kind: "theme",
      output: isCard ? "card" : "photoshoot",
      themeId: theme.id,
    });
  }
});
