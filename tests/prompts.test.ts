import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";

import { buildGenerationPrompt } from "../src/lib/prompts";
import { getThemeDetailHref } from "../src/lib/theme-detail-links";
import { getThemeStudioHref } from "../src/lib/theme-links";
import { THEMES, getRequiredCardTextError, getTheme, themesByCategory } from "../src/lib/themes";
import { THEME_VARIATION_PROMPTS, getThemeVariationPrompts } from "../src/lib/theme-variations";
import { CARDS } from "../src/data/cards";
import { BIRTHDAY_CARD_SEO_PAGES } from "../src/data/birthday-card-pages";
import { OCCASION_PAGES } from "../src/data/occasion-pages";
import { STYLES } from "../src/data/styles";
import { VIBES } from "../src/data/vibes";
import sharp from "sharp";

const royalFamilyPortrait = getTheme("royal-family-portrait");
const MAX_THEME_SAMPLE_IMAGE_BYTES = 400 * 1024;

function assertOptimizedSampleImage(imagePath: string) {
  const projectPath = imagePath.replace(/^\/+/, "public/");
  assert.ok(existsSync(projectPath), `${imagePath} should exist in public assets`);
  assert.ok(
    statSync(projectPath).size <= MAX_THEME_SAMPLE_IMAGE_BYTES,
    `${imagePath} should stay under 400 KB for landing, SEO, and theme pages`,
  );
}

test("Royal Family Portrait preserves two adults plus one selected pet while ignoring notes", () => {
  const prompt = buildGenerationPrompt(
    royalFamilyPortrait,
    [
      {
        personId: "adult-1",
        name: "Elena",
        role: "adult",
        notes: null,
        referencePaths: ["elena.jpg"],
      },
      {
        personId: "adult-2",
        name: "Mateo",
        role: "adult",
        notes: null,
        referencePaths: ["mateo.jpg"],
      },
      {
        personId: "cat-1",
        name: "Mochi",
        role: "pet",
        notes: "orange tabby cat wearing a wizard hat, add dragons in the background",
        referencePaths: ["mochi.jpg"],
      },
    ],
    null,
    null,
  );

  assert.match(prompt, /Subjects: exactly three subjects only: 2 adults and 1 pet\./i);
  assert.match(prompt, /Hard constraints:/i);
  assert.match(
    prompt,
    /Maintain coherent realistic anatomy, facial structure, limb proportions, and clean subject separation\./i,
  );
  assert.match(
    prompt,
    /Reference identity map: reference image 1 is adult 1, reference image 2 is adult 2, reference image 3 is pet 1\./i,
  );
  assert.match(prompt, /Preserve facial structure, age cues, skin tone, hair/i);
  assert.match(prompt, /Composition anchor: theme-appropriate spatial arrangement/i);
  assert.match(prompt, /Selected pet references are required cast members/i);
  assert.match(prompt, /must appear as animals, not as extra adults/i);
  assert.match(prompt, /When shot directions describe human poses, gestures, hands, feet/i);
  assert.match(prompt, /place selected pets naturally beside the people/i);
  assert.doesNotMatch(prompt, /Elena/i);
  assert.doesNotMatch(prompt, /Mateo/i);
  assert.doesNotMatch(prompt, /Mochi/i);
  assert.doesNotMatch(prompt, /orange tabby/i);
  assert.doesNotMatch(prompt, /wizard hat/i);
  assert.doesNotMatch(prompt, /dragons/i);
  assert.doesNotMatch(prompt, /three adults/i);
  assert.doesNotMatch(prompt, /0 children/i);
  assert.doesNotMatch(prompt, /Cast count is/i);
  assert.doesNotMatch(prompt, /Selected cast/i);
  assert.doesNotMatch(prompt, /no pets/i);
});

test("Reference identity map omits roster names", () => {
  const prompt = buildGenerationPrompt(
    royalFamilyPortrait,
    [
      {
        personId: "adult-1",
        name: "WhatsApp Image 2026 05 12 At 11.18.53",
        role: "adult",
        notes: null,
        referencePaths: ["uploads/adult-1/whatsapp.jpg"],
      },
      {
        personId: "child-1",
        name: "Arena",
        role: "child",
        notes: null,
        referencePaths: ["uploads/child-1/arena.jpg"],
      },
    ],
    null,
    null,
  );

  assert.match(prompt, /reference image 1 is adult 1/i);
  assert.match(prompt, /reference image 2 is child 1/i);
  assert.doesNotMatch(prompt, /Arena/i);
  assert.doesNotMatch(prompt, /WhatsApp Image/i);
});

test("People-only casts do not add pet or animal exclusions", () => {
  const prompt = buildGenerationPrompt(
    getTheme("stacked-love"),
    [
      {
        personId: "adult-1",
        name: "Adult One",
        role: "adult",
        notes: null,
        referencePaths: ["adult-one.jpg"],
      },
      {
        personId: "adult-2",
        name: "Adult Two",
        role: "adult",
        notes: null,
        referencePaths: ["adult-two.jpg"],
      },
      {
        personId: "child-1",
        name: "Child One",
        role: "child",
        notes: null,
        referencePaths: ["child-one.jpg"],
      },
      {
        personId: "child-2",
        name: "Child Two",
        role: "child",
        notes: null,
        referencePaths: ["child-two.jpg"],
      },
    ],
    null,
    null,
  );

  assert.match(prompt, /Subjects: exactly four subjects only: 2 adults and 2 children\./i);
  assert.match(prompt, /Hard constraints:/i);
  assert.doesNotMatch(prompt, /Cast count is/i);
  assert.doesNotMatch(prompt, /no pets/i);
  assert.doesNotMatch(prompt, /Do not add animals/i);
  assert.doesNotMatch(prompt, /background free of .*animals/i);
});

const TREND_LED_THEME_IDS = [
  "pop-icon-stage-portrait",
  "galactic-family-adventure",
  "iconic-crosswalk-album-cover",
  "runway-editor-in-chief-family-editorial",
  "noughties-family-throwback",
];

const CREATIVE_PROMPT_THEME_IDS = [
  "private-jet-family",
  "soccer-team-family",
  "white-cyclorama-exaggerated-faces",
  "zero-gravity-family",
  "western-wanted-family",
  "fluffy-cloud-family",
  "cereal-box-family",
];

const CREATIVE_PROMPT_VIBE_SLUGS = [
  "private-jet-family-photos",
  "soccer-team-family-photos",
  "white-cyclorama-family-photos",
  "zero-gravity-family-photos",
  "western-wanted-family-photos",
  "fluffy-cloud-family-photos",
  "cereal-box-family-photos",
];

const TREND_LED_VIBE_SLUGS = [
  "pop-icon-stage-family-photos",
  "galactic-family-adventure-photos",
  "iconic-crosswalk-album-cover-family-photos",
  "runway-editorial-family-photos",
  "noughties-family-throwback-photos",
];

const WEEKLY_TREND_THEME_IDS = [
  "butter-yellow-picnic",
  "neo-deco-family-portrait",
  "storybook-pen-pals",
  "mystic-outlands-adventure",
  "galactic-glow-family-adventure",
  "cozy-summerween-card",
  "dockside-family-weekend",
  "backyard-sports-day-portrait",
  "slow-travel-summer-picnic",
  "sunset-festival-family-glow",
  "summer-color-pop-studio",
  "whimsical-adventure-postcard",
  "retro-summer-postcard",
  "butter-yellow-summer-portrait",
  "scarf-garden-story",
  "summer-color-hunt",
  "family-watch-party",
  "ocean-explorer-card",
  "toy-box-keepsake-portrait",
  "time-travel-toy-shelf",
  "retro-jazz-porch",
  "cool-blue-lake-day",
  "poetcore-family-library-portrait",
  "burgundy-orchard-portrait",
  "poetcore-letter-portrait",
  "opalescent-future-family",
  "heirloom-brooch-studio",
  "whimsical-big-top-family",
  "lantern-glow-gathering",
  "neo-deco-celebration-card",
  "crochet-raffia-picnic-card",
  "butter-yellow-summer-card",
  "joyful-photo-dump",
  "storybook-ocean-quest",
  "poetcore-porch",
  "future-glow-family",
  "heirloom-pin-portrait",
  "paprika-plaid-autumn",
  "summerween-pumpkin-glow",
  "storybook-forest-family-adventure",
  "y3k-chrome-family-future",
  "polka-dot-porch-party",
  "back-to-school-storybook-morning",
  "tiny-boo-crew",
  "vintage-pumpkin-patch-postcard",
  "editorial-jewel-tone-fall-portrait",
  "dino-explorer-family-adventure",
  "golden-late-summer-beach-legacy",
];

const WEEKLY_TREND_DETAIL_SLUGS = [
  "butter-yellow-picnic-family-photos",
  "neo-deco-family-portrait-photos",
  "storybook-pen-pals-family-photos",
  "mystic-outlands-adventure-family-photos",
  "galactic-glow-family-adventure-photos",
  "cozy-summerween-family-cards",
  "dockside-family-weekend-photos",
  "backyard-sports-day-family-photos",
  "slow-travel-summer-picnic-family-photos",
  "sunset-festival-family-glow-photos",
  "summer-color-pop-studio-family-photos",
  "whimsical-adventure-postcard-family-photos",
  "retro-summer-postcard-family-photos",
  "butter-yellow-summer-family-photos",
  "scarf-garden-story-family-photos",
  "summer-color-hunt-family-photos",
  "family-watch-party-photos",
  "ocean-explorer-family-cards",
  "toy-box-keepsake-family-photos",
  "time-travel-toy-shelf-family-photos",
  "retro-jazz-porch-family-photos",
  "cool-blue-lake-day-family-photos",
  "poetcore-family-library-photos",
  "burgundy-orchard-family-photos",
  "poetcore-letter-family-photos",
  "opalescent-future-family-photos",
  "heirloom-brooch-family-photos",
  "whimsical-big-top-family-photos",
  "lantern-glow-gathering-family-photos",
  "neo-deco-celebration-family-cards",
  "crochet-raffia-picnic-family-cards",
  "butter-yellow-summer-family-cards",
  "joyful-photo-dump-family-photos",
  "storybook-ocean-quest-family-photos",
  "poetcore-porch-family-photos",
  "future-glow-family-photos",
  "heirloom-pin-portrait-family-photos",
  "paprika-plaid-autumn-family-photos",
  "summerween-pumpkin-glow-family-cards",
  "storybook-forest-family-adventure-photos",
  "y3k-chrome-family-future-photos",
  "polka-dot-porch-party-family-cards",
  "back-to-school-storybook-morning-family-photos",
  "tiny-boo-crew-family-photos",
  "vintage-pumpkin-patch-postcard-family-photos",
  "editorial-jewel-tone-fall-portrait-family-photos",
  "dino-explorer-family-adventure-family-photos",
  "golden-late-summer-beach-legacy-family-photos",
];

const NEW_WEEKLY_TREND_PAIRS = [
  ["retro-summer-postcard", "retro-summer-postcard-family-photos"],
  ["toy-box-keepsake-portrait", "toy-box-keepsake-family-photos"],
  ["cool-blue-lake-day", "cool-blue-lake-day-family-photos"],
  ["poetcore-family-library-portrait", "poetcore-family-library-photos"],
  ["burgundy-orchard-portrait", "burgundy-orchard-family-photos"],
  ["poetcore-letter-portrait", "poetcore-letter-family-photos"],
  ["opalescent-future-family", "opalescent-future-family-photos"],
  ["heirloom-brooch-studio", "heirloom-brooch-family-photos"],
  ["whimsical-big-top-family", "whimsical-big-top-family-photos"],
  ["lantern-glow-gathering", "lantern-glow-gathering-family-photos"],
  ["neo-deco-celebration-card", "neo-deco-celebration-family-cards"],
  ["crochet-raffia-picnic-card", "crochet-raffia-picnic-family-cards"],
  ["butter-yellow-summer-card", "butter-yellow-summer-family-cards"],
  ["joyful-photo-dump", "joyful-photo-dump-family-photos"],
  ["storybook-ocean-quest", "storybook-ocean-quest-family-photos"],
  ["poetcore-porch", "poetcore-porch-family-photos"],
  ["future-glow-family", "future-glow-family-photos"],
  ["heirloom-pin-portrait", "heirloom-pin-portrait-family-photos"],
] as const;

const CURRENT_TASK_WEEKLY_TREND_PAIRS = [
  ["butter-yellow-picnic", "butter-yellow-picnic-family-photos"],
  ["neo-deco-family-portrait", "neo-deco-family-portrait-photos"],
  ["storybook-pen-pals", "storybook-pen-pals-family-photos"],
  ["mystic-outlands-adventure", "mystic-outlands-adventure-family-photos"],
  ["galactic-glow-family-adventure", "galactic-glow-family-adventure-photos"],
  ["cozy-summerween-card", "cozy-summerween-family-cards"],
  ["paprika-plaid-autumn", "paprika-plaid-autumn-family-photos"],
  ["summerween-pumpkin-glow", "summerween-pumpkin-glow-family-cards"],
  ["storybook-forest-family-adventure", "storybook-forest-family-adventure-photos"],
  ["y3k-chrome-family-future", "y3k-chrome-family-future-photos"],
  ["polka-dot-porch-party", "polka-dot-porch-party-family-cards"],
  ["back-to-school-storybook-morning", "back-to-school-storybook-morning-family-photos"],
  ["tiny-boo-crew", "tiny-boo-crew-family-photos"],
  ["vintage-pumpkin-patch-postcard", "vintage-pumpkin-patch-postcard-family-photos"],
  ["editorial-jewel-tone-fall-portrait", "editorial-jewel-tone-fall-portrait-family-photos"],
  ["dino-explorer-family-adventure", "dino-explorer-family-adventure-family-photos"],
  ["golden-late-summer-beach-legacy", "golden-late-summer-beach-legacy-family-photos"],
] as const;

const WEEKLY_TREND_THEME_IDS_SET = new Set(WEEKLY_TREND_THEME_IDS);

const NEW_WEEKLY_CARD_THEME_IDS = new Set([
  "neo-deco-celebration-card",
  "crochet-raffia-picnic-card",
  "butter-yellow-summer-card",
]);

const CURRENT_TASK_CARD_THEME_IDS = new Set([
  "cozy-summerween-card",
  "summerween-pumpkin-glow",
  "polka-dot-porch-party",
]);

const REQUIRED_WEEKLY_TREND_PROMPT_MARKERS: Record<
  (typeof NEW_WEEKLY_TREND_PAIRS)[number][0],
  readonly string[]
> = {
  "retro-summer-postcard": ["postcard", "summer"],
  "toy-box-keepsake-portrait": ["wooden blocks", "keepsake"],
  "cool-blue-lake-day": ["cool-blue", "lake"],
  "poetcore-family-library-portrait": ["library", "letter"],
  "burgundy-orchard-portrait": ["burgundy", "orchard"],
  "poetcore-letter-portrait": ["letter", "writing-room"],
  "opalescent-future-family": ["opalescent", "future"],
  "heirloom-brooch-studio": ["heirloom", "brooch"],
  "whimsical-big-top-family": ["big-top", "bunting"],
  "lantern-glow-gathering": ["lantern", "blue-hour"],
  "neo-deco-celebration-card": ["geometric", "card"],
  "crochet-raffia-picnic-card": ["crochet", "raffia"],
  "butter-yellow-summer-card": ["butter-yellow", "negative space"],
  "joyful-photo-dump": ["mid-laugh", "soft flash"],
  "storybook-ocean-quest": ["tide pools", "watercolor"],
  "poetcore-porch": ["porch", "stationery"],
  "future-glow-family": ["opalescent", "chrome"],
  "heirloom-pin-portrait": ["heirloom", "brooch"],
};

const BLOCKED_PROMPT_TERMS =
  /Michael Jackson|Star Wars|Jedi|lightsaber|Disney|Lucasfilm|Beatles|Abbey Road|Devil Wears Prada|Darth|Yoda|Mandalorian/i;

const WEEKLY_BLOCKED_TERMS =
  /\b(Barbie|Swift|Beyonce|Beyoncé|Marvel|DC Comics|Super Bowl|World Cup|Olympics|NBA|NFL|MLB|FIFA|Nike|Adidas|Coca-Cola|Toy Story|Pixar|Disney|Minions|Moana|DreamWorks|Illumination|TikTok|Instagram|beer|wine|cocktail|weapon|gun|blood|gore|horror|sexy|sexual)\b/i;

test("theme and vibe catalogs have required fields and unique route identifiers", () => {
  const themeIdCounts = new Map<string, number>();
  const vibeSlugCounts = new Map<string, number>();

  for (const theme of THEMES) {
    themeIdCounts.set(theme.id, (themeIdCounts.get(theme.id) ?? 0) + 1);
    assert.ok(theme.id.trim(), "theme id should be present");
    assert.ok(theme.name.trim(), `${theme.id} should have a label`);
    assert.ok(theme.blurb.trim(), `${theme.id} should have a blurb`);
    assert.ok(theme.coverImage.trim(), `${theme.id} should have a cover image`);
    assert.ok(theme.spec.assetType.trim(), `${theme.id} should have a prompt asset type`);
    assert.ok(theme.spec.camera.trim(), `${theme.id} should have prompt camera guidance`);
    assert.ok(theme.spec.lighting.trim(), `${theme.id} should have prompt lighting guidance`);
    assert.ok(theme.spec.style.trim(), `${theme.id} should have prompt style guidance`);
    assert.equal(theme.provider, "nanobanana", `${theme.id} should use the current generator`);
    assert.ok(
      existsSync(theme.coverImage.replace(/^\/+/, "public/")),
      `${theme.coverImage} should exist`,
    );
    assert.equal(getThemeVariationPrompts(theme.id, theme.category).length, 4);
  }

  for (const vibe of VIBES) {
    vibeSlugCounts.set(vibe.slug, (vibeSlugCounts.get(vibe.slug) ?? 0) + 1);
    assert.ok(vibe.slug.trim(), "vibe slug should be present");
    assert.ok(vibe.name.trim(), `${vibe.slug} should have a name`);
    assert.ok(vibe.keyword.trim(), `${vibe.slug} should have a primary keyword`);
    assert.ok(vibe.secondaryKeywords.length >= 1, `${vibe.slug} should have secondary keywords`);
    assert.ok(vibe.image.trim(), `${vibe.slug} should have an image`);
    assert.ok(vibe.shortDescription.trim(), `${vibe.slug} should have a short description`);
    assert.ok(vibe.related.length >= 1, `${vibe.slug} should have related routes`);
    assert.ok(existsSync(vibe.image.replace(/^\/+/, "public/")), `${vibe.image} should exist`);
    for (const extraImage of vibe.extraImages ?? []) {
      assert.ok(existsSync(extraImage.replace(/^\/+/, "public/")), `${extraImage} should exist`);
    }
  }

  for (const [id, count] of themeIdCounts) {
    assert.equal(count, 1, `${id} should be a unique theme id`);
  }
  for (const [slug, count] of vibeSlugCounts) {
    assert.equal(count, 1, `${slug} should be a unique vibe slug`);
  }
});

test("trend-led vibes are valid catalog themes with variation prompts and SEO entries", () => {
  const themeIds = new Set(THEMES.map((theme) => theme.id));
  const vibeSlugs = new Set(VIBES.map((vibe) => vibe.slug));

  for (const themeId of TREND_LED_THEME_IDS) {
    assert.ok(themeIds.has(themeId), `${themeId} should be a normal selectable theme`);
    const theme = getTheme(themeId);
    assert.equal(theme.supportsPets, true);
    assert.equal(getThemeVariationPrompts(theme.id, theme.category).length, 4);
    assert.doesNotMatch(
      [
        theme.name,
        theme.blurb,
        theme.spec.assetType,
        theme.spec.camera,
        theme.spec.lighting,
        theme.spec.style,
      ].join(" "),
      BLOCKED_PROMPT_TERMS,
    );
  }

  for (const slug of TREND_LED_VIBE_SLUGS) {
    assert.ok(vibeSlugs.has(slug), `${slug} should be present on SEO/discovery vibe surfaces`);
  }
});

test("creative prompt ideas are selectable app themes with homepage-ready images", () => {
  const themeIds = new Set(THEMES.map((theme) => theme.id));
  const vibeSlugs = new Set(VIBES.map((vibe) => vibe.slug));

  for (const themeId of CREATIVE_PROMPT_THEME_IDS) {
    assert.ok(themeIds.has(themeId), `${themeId} should be a normal selectable theme`);
    const theme = getTheme(themeId);
    assert.notEqual(theme.category, "card");
    assert.ok(theme.coverImage.includes("/samples/best-family-photo-prompts/"));
    assertOptimizedSampleImage(theme.coverImage);
    assert.equal(theme.provider, "nanobanana");
    assert.ok(
      THEME_VARIATION_PROMPTS[theme.id],
      `${theme.id} should have custom per-slot variation prompts`,
    );
    assert.equal(getThemeVariationPrompts(theme.id, theme.category).length, 4);
  }

  for (const slug of CREATIVE_PROMPT_VIBE_SLUGS) {
    assert.ok(vibeSlugs.has(slug), `${slug} should be present on SEO/discovery vibe surfaces`);
  }
});

test("weekly trend-led vibes are selectable, discoverable, safe, and pet-gated", () => {
  const themeIds = new Set(THEMES.map((theme) => theme.id));
  const discoveryPages = [...VIBES, ...CARDS];
  const discoverySlugs = new Set(discoveryPages.map((page) => page.slug));

  for (const themeId of WEEKLY_TREND_THEME_IDS) {
    assert.ok(themeIds.has(themeId), `${themeId} should be a normal selectable theme`);
    const theme = getTheme(themeId);
    assert.ok(theme.name.trim(), `${themeId} should have a label`);
    assert.ok(theme.blurb.trim(), `${themeId} should have a blurb`);
    assert.ok(theme.coverImage.startsWith("/samples/"), `${themeId} should use owned sample art`);
    assert.equal(theme.provider, "nanobanana");
    assert.equal(theme.supportsPets, true);
    assert.equal(getThemeVariationPrompts(theme.id, theme.category).length, 4);

    const promptFields = [
      theme.name,
      theme.blurb,
      theme.spec.assetType,
      theme.spec.scene ?? "",
      theme.spec.camera,
      theme.spec.composition ?? "",
      theme.spec.lighting,
      theme.spec.style,
      theme.spec.safety ?? "",
      getThemeVariationPrompts(theme.id, theme.category).join(" "),
    ].join(" ");

    assert.doesNotMatch(promptFields, WEEKLY_BLOCKED_TERMS);
    assert.doesNotMatch(promptFields, /\b(dog|cat|kitten|puppy|animal|pet)\b/i);

    const peopleOnlyPrompt = buildGenerationPrompt(
      theme,
      [
        {
          personId: "adult-1",
          name: "Adult One",
          role: "adult",
          notes: null,
          referencePaths: ["adult-one.jpg"],
        },
        {
          personId: "child-1",
          name: "Child One",
          role: "child",
          notes: null,
          referencePaths: ["child-one.jpg"],
        },
      ],
      null,
      null,
    );

    assert.doesNotMatch(peopleOnlyPrompt, /\b(dog|cat|kitten|puppy|animal|pet)\b/i);

    const petSelectedPrompt = buildGenerationPrompt(
      theme,
      [
        {
          personId: "adult-1",
          name: "Adult One",
          role: "adult",
          notes: null,
          referencePaths: ["adult-one.jpg"],
        },
        {
          personId: "dog-1",
          name: "Rex dog",
          role: "pet",
          notes: "make this pet a mascot in team gear",
          referencePaths: ["rex.jpg"],
        },
      ],
      null,
      theme.acceptsCardText ? "Summer Party" : null,
    );

    assert.match(petSelectedPrompt, /Subjects: exactly two subjects only: 1 adult and 1 pet\./i);
    assert.match(petSelectedPrompt, /reference image 2 is dog 1/i);
    assert.match(petSelectedPrompt, /Selected pet references are required cast members/i);
    assert.match(petSelectedPrompt, /unselected animals/i);
    assert.match(petSelectedPrompt, /must appear as animals, not as extra adults/i);
    assert.doesNotMatch(petSelectedPrompt, /mascot in team gear/i);
  }

  for (const slug of WEEKLY_TREND_DETAIL_SLUGS) {
    assert.ok(discoverySlugs.has(slug), `${slug} should have an SEO discovery page`);
    const page = discoveryPages.find((entry) => entry.slug === slug)!;
    assert.ok(page.name.trim(), `${slug} should have a name`);
    assert.ok(page.keyword.trim(), `${slug} should have a primary keyword`);
    assert.ok(page.secondaryKeywords.length >= 3, `${slug} should have secondary keywords`);
    assert.ok(page.image.startsWith("/samples/"), `${slug} should use owned sample art`);
    assert.ok(page.shortDescription.trim(), `${slug} should have a short description`);
    assert.ok(page.related.length >= 3, `${slug} should expose related routes`);
    assert.doesNotMatch(
      [
        page.name,
        page.keyword,
        page.shortDescription,
        page.secondaryKeywords.join(" "),
        page.related.join(" "),
      ].join(" "),
      WEEKLY_BLOCKED_TERMS,
    );
  }

  for (const [themeId, slug] of NEW_WEEKLY_TREND_PAIRS) {
    const theme = getTheme(themeId);
    const page = discoveryPages.find((entry) => entry.slug === slug)!;
    assert.ok(theme.spec.safety?.trim(), `${themeId} should include a prompt safety section`);
    assert.equal(
      page.image,
      theme.coverImage,
      `${themeId} discovery image should match the selectable theme cover fallback`,
    );
    assertOptimizedSampleImage(theme.coverImage);

    const markerText = [
      theme.name,
      theme.blurb,
      theme.spec.assetType,
      theme.spec.scene ?? "",
      theme.spec.camera,
      theme.spec.composition ?? "",
      theme.spec.lighting,
      theme.spec.style,
      theme.spec.safety ?? "",
      getThemeVariationPrompts(theme.id, theme.category).join(" "),
      page.name,
      page.keyword,
      page.shortDescription,
      page.secondaryKeywords.join(" "),
    ].join(" ");
    for (const marker of REQUIRED_WEEKLY_TREND_PROMPT_MARKERS[themeId]) {
      assert.match(markerText, new RegExp(marker, "i"), `${themeId} should preserve ${marker}`);
    }

    if (NEW_WEEKLY_CARD_THEME_IDS.has(themeId)) {
      assert.equal(theme.category, "card");
      assert.equal(theme.acceptsCardText, true);
    }
  }

  for (const [themeId, slug] of CURRENT_TASK_WEEKLY_TREND_PAIRS) {
    const theme = getTheme(themeId);
    const page = discoveryPages.find((entry) => entry.slug === slug)!;

    assert.ok(theme.spec.safety?.trim(), `${themeId} should include a prompt safety section`);
    assert.equal(
      page.image,
      theme.coverImage,
      `${themeId} discovery image should match the selectable theme cover fallback`,
    );
    assertOptimizedSampleImage(theme.coverImage);

    if (CURRENT_TASK_CARD_THEME_IDS.has(themeId)) {
      assert.equal(theme.category, "card");
      assert.equal(theme.acceptsCardText, true);
    } else {
      assert.notEqual(theme.category, "card");
    }
  }

  const newWeeklyImagePaths = NEW_WEEKLY_TREND_PAIRS.map(
    ([themeId]) => getTheme(themeId).coverImage,
  );
  assert.equal(
    new Set(newWeeklyImagePaths).size,
    newWeeklyImagePaths.length,
    "new weekly themes should use distinct sample images",
  );

  const existingThemeImagePaths = new Set(
    THEMES.filter((theme) => !WEEKLY_TREND_THEME_IDS_SET.has(theme.id)).map(
      (theme) => theme.coverImage,
    ),
  );
  for (const imagePath of newWeeklyImagePaths) {
    assert.equal(
      existingThemeImagePaths.has(imagePath),
      false,
      `${imagePath} should not reuse an older theme cover`,
    );
  }
});

test("homepage vibe cards resolve to detail pages before the studio flow", () => {
  const homepageThemeIds = [
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
    "cool-blue-lake-day",
    "poetcore-family-library-portrait",
    "burgundy-orchard-portrait",
    "poetcore-letter-portrait",
    "opalescent-future-family",
    "heirloom-brooch-studio",
    "whimsical-big-top-family",
    "lantern-glow-gathering",
    "neo-deco-celebration-card",
    "crochet-raffia-picnic-card",
    "private-jet-family",
    "soccer-team-family",
    "leibovitz-studio",
    "golden-hour-beach",
    "back-to-school-storybook-morning",
    "tiny-boo-crew",
    "vintage-pumpkin-patch-postcard",
    "editorial-jewel-tone-fall-portrait",
    "dino-explorer-family-adventure",
    "golden-late-summer-beach-legacy",
  ];
  const coverImages = new Set<string>();

  for (const themeId of homepageThemeIds) {
    const theme = getTheme(themeId);
    const href = getThemeDetailHref(theme);
    assert.match(href, /^\/[^?]+$/u, `${themeId} should link to an existing detail route`);
    assert.doesNotMatch(
      href,
      /^\/studio\/theme/u,
      `${themeId} should not skip to generation step 3`,
    );
    assert.notEqual(href, "/vibes", `${themeId} should link to its own detail page`);
    assert.notEqual(href, "/cards", `${themeId} should link to its own detail page`);
    assert.equal(
      coverImages.has(theme.coverImage),
      false,
      `${themeId} should not reuse another homepage vibe cover image`,
    );
    coverImages.add(theme.coverImage);
  }
});

test("theme cover images do not cross-wire different vibe descriptions", () => {
  const coverByPath = new Map<string, string>();

  for (const theme of THEMES) {
    assert.ok(
      existsSync(theme.coverImage.replace(/^\/+/, "public/")),
      `${theme.coverImage} should exist`,
    );
    const previousTheme = coverByPath.get(theme.coverImage);
    assert.equal(
      previousTheme,
      undefined,
      `${theme.id} should not reuse ${theme.coverImage} from ${previousTheme}`,
    );
    coverByPath.set(theme.coverImage, theme.id);
  }
});

test("card themes use card discovery pages and canonical studio links", () => {
  const cardThemes = THEMES.filter((theme) => theme.category === "card");
  const cardPagesByThemeId = new Map(
    CARDS.flatMap((card) => (card.themeId ? [[card.themeId, card] as const] : [])),
  );

  assert.equal(cardPagesByThemeId.size, cardThemes.length);

  for (const theme of cardThemes) {
    const card = cardPagesByThemeId.get(theme.id);
    assert.ok(card, `${theme.id} should have one card discovery page`);
    assert.match(card.slug, /-family-cards$/u);
    assert.equal(getThemeDetailHref(theme), `/${card.slug}`);
    assert.equal(
      getThemeStudioHref(theme),
      `/studio/theme?output=card&card=${encodeURIComponent(theme.id)}`,
    );
    assert.equal(
      VIBES.some((vibe) => vibe.slug === card.slug),
      false,
      `${card.slug} must not be stored in the vibe catalog`,
    );
  }

  for (const card of CARDS) {
    if (!card.themeId) continue;
    assert.equal(getTheme(card.themeId).category, "card");
  }
});

test("all discovery-page related links resolve", () => {
  const discoveryPages = [...VIBES, ...CARDS, ...STYLES, ...OCCASION_PAGES];
  const slugs = new Set(discoveryPages.map((page) => page.slug));

  for (const page of BIRTHDAY_CARD_SEO_PAGES) {
    slugs.add(page.path.replace(/^\/+/, ""));
  }

  for (const page of discoveryPages) {
    for (const relatedSlug of page.related ?? []) {
      assert.ok(slugs.has(relatedSlug), `${page.slug} links to missing page ${relatedSlug}`);
    }
  }
});

test("new and replaced theme previews match their declared aspect ratio", async () => {
  const expectedRatios = { "3:2": 3 / 2, "2:3": 2 / 3, "1:1": 1, "4:5": 4 / 5, "16:9": 16 / 9 };
  const checkedThemeIds = [...WEEKLY_TREND_THEME_IDS, "card-anniversary"];

  for (const themeId of checkedThemeIds) {
    const theme = getTheme(themeId);
    const metadata = await sharp(theme.coverImage.replace(/^\/+/, "public/")).metadata();
    assert.ok(metadata.width && metadata.height, `${theme.id} preview should have dimensions`);
    const actualRatio = metadata.width / metadata.height;
    const expectedRatio = expectedRatios[theme.aspectRatio];
    const relativeDifference = Math.abs(actualRatio - expectedRatio) / expectedRatio;
    assert.ok(
      relativeDifference <= 0.02,
      `${theme.id} preview is ${metadata.width}x${metadata.height}, expected ${theme.aspectRatio}`,
    );
  }
});

test("deep-linked studio theme URLs preselect the requested vibe", () => {
  const pageSource = readFileSync("src/app/studio/theme/page.tsx", "utf8");
  const boardSource = readFileSync("src/components/studio/ThemeBoard.tsx", "utf8");

  assert.match(pageSource, /theme\?: string/);
  assert.match(pageSource, /initialThemeId=\{selectedTheme\?\.id \?\? null\}/);
  assert.match(boardSource, /initialThemeId\?: string \| null/);
  assert.match(boardSource, /initialThemeId \? \[initialThemeId\] : \[\]/);
});

test("vibe detail pages use a clear Begin a Shoot CTA", () => {
  const source = readFileSync("src/app/[slug]/page.tsx", "utf8");
  assert.match(source, /"Begin a Shoot"/);
  assert.doesNotMatch(source, /Make your \$\{item\.name\} portrait/);
});

test("new weekly theme specs leave roster and card text details to the prompt composer", () => {
  const adultOnlyRoster = [
    {
      personId: "adult-1",
      name: "Adult One",
      role: "adult" as const,
      notes: null,
      referencePaths: ["adult-one.jpg"],
    },
  ];

  for (const [themeId] of NEW_WEEKLY_TREND_PAIRS) {
    const theme = getTheme(themeId);
    const stableSpecText = [
      theme.spec.scene ?? "",
      theme.spec.camera,
      theme.spec.composition ?? "",
      theme.spec.lighting,
      theme.spec.style,
      theme.spec.safety ?? "",
    ].join(" ");

    assert.doesNotMatch(stableSpecText, /\bselected cast\b/i);
    assert.doesNotMatch(stableSpecText, /\b(parents?|children|adults?|pets?|dogs?|cats?)\b/i);
    assert.doesNotMatch(stableSpecText, /Cloud Dancer/i);

    for (const variation of getThemeVariationPrompts(theme.id, theme.category)) {
      assert.doesNotMatch(variation, /\bselected cast\b/i);
    }

    const prompt = buildGenerationPrompt(
      theme,
      adultOnlyRoster,
      null,
      theme.acceptsCardText ? "Happy Summer" : null,
    );
    assert.match(prompt, /Subjects: exactly one subject only: 1 adult\./i);
    assert.doesNotMatch(prompt, /exactly .*children/i);
    assert.doesNotMatch(prompt, /\b(dog|cat|pet)\b/i);

    if (NEW_WEEKLY_CARD_THEME_IDS.has(themeId)) {
      assert.match(prompt, /render the exact text "Happy Summer"/);
      assert.match(prompt, /No watermarks, no other text anywhere in the image\./);
    } else {
      assert.doesNotMatch(prompt, /render the exact text/i);
    }
  }

  for (const [themeId] of CURRENT_TASK_WEEKLY_TREND_PAIRS) {
    const theme = getTheme(themeId);
    const stableSpecText = [
      theme.spec.scene ?? "",
      theme.spec.camera,
      theme.spec.composition ?? "",
      theme.spec.lighting,
      theme.spec.style,
      theme.spec.safety ?? "",
    ].join(" ");

    assert.doesNotMatch(stableSpecText, /\bselected cast\b/i);
    assert.doesNotMatch(stableSpecText, /\b(parents?|children|adults?|pets?|dogs?|cats?)\b/i);

    for (const variation of getThemeVariationPrompts(theme.id, theme.category)) {
      assert.doesNotMatch(variation, /\bselected cast\b/i);
    }

    const prompt = buildGenerationPrompt(
      theme,
      adultOnlyRoster,
      null,
      theme.acceptsCardText ? "Happy Summer" : null,
    );
    assert.match(prompt, /Subjects: exactly one subject only: 1 adult\./i);
    assert.doesNotMatch(prompt, /exactly .*children/i);
    assert.doesNotMatch(prompt, /\b(dog|cat|pet)\b/i);

    if (CURRENT_TASK_CARD_THEME_IDS.has(themeId)) {
      assert.match(prompt, /render the exact text "Happy Summer"/);
      assert.match(prompt, /No watermarks, no other text anywhere in the image\./);
    } else {
      assert.doesNotMatch(prompt, /render the exact text/i);
    }
  }
});

test("time-travel toy shelf prompt transforms people into toy figurines", () => {
  const prompt = buildGenerationPrompt(
    getTheme("time-travel-toy-shelf"),
    [
      {
        personId: "adult-1",
        name: "Adult One",
        role: "adult",
        notes: null,
        referencePaths: ["adult-one.jpg"],
      },
    ],
    null,
    null,
  );

  assert.match(prompt, /transformed into handmade toy figurines/i);
  assert.match(prompt, /do not render full-size real human people/i);
  assert.match(prompt, /theme-appropriate anatomy/i);
});

test("luxury carved-number birthday card is selectable, dynamic and guarded", () => {
  const theme = getTheme("card-luxury-carved-number-birthday");
  const variations = getThemeVariationPrompts(theme.id, theme.category);
  const prompt = buildGenerationPrompt(
    theme,
    [
      {
        personId: "child-1",
        name: "Sky Lou",
        role: "child",
        notes: null,
        referencePaths: ["child.jpg"],
      },
    ],
    null,
    "AVA ROSE\nCHAPTER 7\n365 MORE DAYS OF WONDER",
  );

  assert.equal(theme.category, "card");
  assert.equal(theme.aspectRatio, "2:3");
  assert.equal(theme.acceptsCardText, true);
  assert.equal(theme.supportsPets, true);
  assert.equal(
    getRequiredCardTextError(theme, null),
    "Add birthday card text with the age for this carved-number card.",
  );
  assert.equal(
    getRequiredCardTextError(theme, "AVA ROSE"),
    "Include the birthday age in the card text so the carved number is correct.",
  );
  assert.equal(getRequiredCardTextError(theme, "AVA ROSE - CHAPTER 7"), null);
  assert.equal(theme.coverImage, "/samples/theme-card-luxury-carved-number-birthday.webp");
  assertOptimizedSampleImage(theme.coverImage);
  assert.equal(variations.length, 4);
  assert.doesNotMatch(theme.spec.assetType, /3:4/);
  assert.match(prompt, /off-white luxury paper textured wall/i);
  assert.match(prompt, /birthday-age number/i);
  assert.match(prompt, /carved into it/i);
  assert.match(prompt, /visible paper thickness/i);
  assert.match(prompt, /realistic inner shadows/i);
  assert.match(prompt, /exact text "AVA ROSE\nCHAPTER 7\n365 MORE DAYS OF WONDER"/i);
  assert.match(prompt, /no fixed sample names/i);
  assert.match(prompt, /no fixed sample age/i);
  assert.match(variations.join(" "), /provided card text only/i);
  assert.match(variations.join(" "), /no sample names or sample ages/i);
  assert.doesNotMatch(prompt, /SKY LOU, CHAPTER 6/i);
  assert.doesNotMatch(prompt, /POPPY MAE, CHAPTER 4/i);
  assert.doesNotMatch(`${prompt} ${variations.join(" ")}`, /3:4/i);

  const cardThemeIds = themesByCategory().card.map((entry) => entry.id);
  assert.equal(
    cardThemeIds.indexOf("card-luxury-carved-number-birthday"),
    cardThemeIds.indexOf("card-birthday") + 1,
  );
});

test("iconic crosswalk vibe keeps album-cover walking composition", () => {
  const theme = getTheme("iconic-crosswalk-album-cover");
  const stablePrompt = [
    theme.blurb,
    theme.spec.assetType,
    theme.spec.scene,
    theme.spec.camera,
    theme.spec.composition,
    theme.spec.lighting,
    theme.spec.style,
    theme.spec.safety,
  ].join(" ");
  const variationPrompt = getThemeVariationPrompts(theme.id, theme.category).join(" ");

  assert.match(stablePrompt, /zebra crosswalk/i);
  assert.match(stablePrompt, /side-oriented cinematic crosswalk walk/i);
  assert.match(stablePrompt, /slight natural face turns/i);
  assert.match(stablePrompt, /London-like/i);
  assert.match(stablePrompt, /not a posed sidewalk fashion portrait/i);
  assert.match(variationPrompt, /walking left-to-right/i);
  assert.match(variationPrompt, /mostly side-facing bodies with slight natural face turns/i);
  assert.match(variationPrompt, /not standing still/i);
  assert.doesNotMatch(`${stablePrompt} ${variationPrompt}`, /full-body side-profile march/i);
  assert.doesNotMatch(`${stablePrompt} ${variationPrompt}`, /strict side profile/i);
});
