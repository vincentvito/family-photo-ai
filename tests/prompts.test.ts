import assert from "node:assert/strict";
import test from "node:test";

import { buildGenerationPrompt } from "../src/lib/prompts";
import { THEMES, getTheme } from "../src/lib/themes";
import { THEME_VARIATION_PROMPTS, getThemeVariationPrompts } from "../src/lib/theme-variations";
import { VIBES } from "../src/data/vibes";

const royalFamilyPortrait = getTheme("royal-family-portrait");

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
  "dockside-family-weekend",
  "backyard-sports-day-portrait",
  "slow-travel-summer-picnic",
  "sunset-festival-family-glow",
  "summer-color-pop-studio",
  "whimsical-adventure-postcard",
];

const WEEKLY_TREND_VIBE_SLUGS = [
  "dockside-family-weekend-photos",
  "backyard-sports-day-family-photos",
  "slow-travel-summer-picnic-family-photos",
  "sunset-festival-family-glow-photos",
  "summer-color-pop-studio-family-photos",
  "whimsical-adventure-postcard-family-photos",
];

const BLOCKED_PROMPT_TERMS =
  /Michael Jackson|Star Wars|Jedi|lightsaber|Disney|Lucasfilm|Beatles|Abbey Road|Devil Wears Prada|Darth|Yoda|Mandalorian/i;

const WEEKLY_BLOCKED_TERMS =
  /\b(Barbie|Swift|Beyonce|Marvel|DC Comics|Super Bowl|World Cup|Olympics|NBA|NFL|MLB|FIFA|Nike|Adidas|Coca-Cola|beer|wine|cocktail|weapon|gun|blood|gore|horror|sexy|sexual)\b/i;

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
  const vibeSlugs = new Set(VIBES.map((vibe) => vibe.slug));
  const themeIdCounts = new Map<string, number>();
  const vibeSlugCounts = new Map<string, number>();

  for (const theme of THEMES) {
    themeIdCounts.set(theme.id, (themeIdCounts.get(theme.id) ?? 0) + 1);
  }
  for (const vibe of VIBES) {
    vibeSlugCounts.set(vibe.slug, (vibeSlugCounts.get(vibe.slug) ?? 0) + 1);
  }

  for (const [id, count] of themeIdCounts) {
    assert.equal(count, 1, `${id} should be a unique theme id`);
  }
  for (const [slug, count] of vibeSlugCounts) {
    assert.equal(count, 1, `${slug} should be a unique vibe slug`);
  }

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
  }

  for (const slug of WEEKLY_TREND_VIBE_SLUGS) {
    assert.ok(vibeSlugs.has(slug), `${slug} should be present on SEO/discovery vibe surfaces`);
    const vibe = VIBES.find((entry) => entry.slug === slug)!;
    assert.ok(vibe.name.trim(), `${slug} should have a name`);
    assert.ok(vibe.keyword.trim(), `${slug} should have a primary keyword`);
    assert.ok(vibe.secondaryKeywords.length >= 3, `${slug} should have secondary keywords`);
    assert.ok(vibe.image.startsWith("/samples/"), `${slug} should use owned sample art`);
    assert.ok(vibe.shortDescription.trim(), `${slug} should have a short description`);
    assert.ok(vibe.related.length >= 3, `${slug} should expose related routes`);
    assert.doesNotMatch(
      [
        vibe.name,
        vibe.keyword,
        vibe.shortDescription,
        vibe.secondaryKeywords.join(" "),
        vibe.related.join(" "),
      ].join(" "),
      WEEKLY_BLOCKED_TERMS,
    );
  }
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
  assert.equal(variations.length, 4);
  assert.match(prompt, /off-white luxury paper textured wall/i);
  assert.match(prompt, /birthday-age number/i);
  assert.match(prompt, /carved into the wall/i);
  assert.match(prompt, /visible thickness/i);
  assert.match(prompt, /realistic inner shadows/i);
  assert.match(prompt, /face, shoulder, one hand or one foot/i);
  assert.match(prompt, /exact text "AVA ROSE\nCHAPTER 7\n365 MORE DAYS OF WONDER"/i);
  assert.match(prompt, /no hardcoded names/i);
  assert.match(prompt, /no hardcoded age/i);
  assert.match(variations.join(" "), /provided card text only/i);
  assert.match(variations.join(" "), /no sample names or sample ages/i);
  assert.doesNotMatch(prompt, /SKY LOU, CHAPTER 6/i);
  assert.doesNotMatch(prompt, /POPPY MAE, CHAPTER 4/i);
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
