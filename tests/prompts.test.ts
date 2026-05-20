import assert from "node:assert/strict";
import test from "node:test";

import { buildGenerationPrompt } from "../src/lib/prompts";
import { THEMES, getTheme } from "../src/lib/themes";
import { getThemeVariationPrompts } from "../src/lib/theme-variations";
import { VIBES } from "../src/data/vibes";

const royalFamilyPortrait = getTheme("royal-family-portrait");

test("Royal Family Portrait preserves two adults plus one selected cat", () => {
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
        notes: "orange tabby cat",
        referencePaths: ["mochi.jpg"],
      },
    ],
    null,
    null,
  );

  assert.match(prompt, /Selected cast: two adults and one cat/i);
  assert.match(prompt, /Cast rule: show only the selected cast: 2 adults; one cat\./i);
  assert.match(
    prompt,
    /Reference identity map: reference image 1 is adult 1, reference image 2 is adult 2 and reference image 3 is cat 1\./i,
  );
  assert.match(prompt, /Total living subjects in the image must be exactly 3\./i);
  assert.match(prompt, /Selected pet references are required cast members/i);
  assert.match(prompt, /must appear as animals, not as extra adults/i);
  assert.match(prompt, /When shot directions describe human poses, gestures, hands, feet/i);
  assert.match(prompt, /place selected pets naturally beside the people/i);
  assert.doesNotMatch(prompt, /Elena/i);
  assert.doesNotMatch(prompt, /Mateo/i);
  assert.doesNotMatch(prompt, /Mochi/i);
  assert.doesNotMatch(prompt, /three adults/i);
  assert.doesNotMatch(prompt, /0 children/i);
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

  assert.match(prompt, /Cast rule: show only the selected cast: 2 adults; 2 children\./i);
  assert.match(prompt, /Total living subjects in the image must be exactly 4\./i);
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

const TREND_LED_VIBE_SLUGS = [
  "pop-icon-stage-family-photos",
  "galactic-family-adventure-photos",
  "iconic-crosswalk-album-cover-family-photos",
  "runway-editorial-family-photos",
  "noughties-family-throwback-photos",
];

const BLOCKED_PROMPT_TERMS =
  /Michael Jackson|Star Wars|Jedi|lightsaber|Disney|Lucasfilm|Beatles|Abbey Road|Devil Wears Prada|Darth|Yoda|Mandalorian/i;

test("trend-led vibes are valid catalog themes with variation prompts and SEO entries", () => {
  const themeIds = new Set(THEMES.map((theme) => theme.id));
  const vibeSlugs = new Set(VIBES.map((vibe) => vibe.slug));

  for (const themeId of TREND_LED_THEME_IDS) {
    assert.ok(themeIds.has(themeId), `${themeId} should be a normal selectable theme`);
    const theme = getTheme(themeId);
    assert.equal(theme.supportsPets, true);
    assert.equal(getThemeVariationPrompts(theme.id, theme.category).length, 4);
    assert.doesNotMatch(
      [theme.name, theme.blurb, theme.spec.assetType, theme.spec.camera, theme.spec.lighting, theme.spec.style].join(" "),
      BLOCKED_PROMPT_TERMS,
    );
  }

  for (const slug of TREND_LED_VIBE_SLUGS) {
    assert.ok(vibeSlugs.has(slug), `${slug} should be present on SEO/discovery vibe surfaces`);
  }
});

test("iconic crosswalk vibe keeps album-cover walking composition", () => {
  const theme = getTheme("iconic-crosswalk-album-cover");
  const stablePrompt = [
    theme.blurb,
    theme.spec.assetType,
    theme.spec.camera,
    theme.spec.lighting,
    theme.spec.style,
  ].join(" ");
  const variationPrompt = getThemeVariationPrompts(theme.id, theme.category).join(" ");

  assert.match(stablePrompt, /zebra crosswalk/i);
  assert.match(stablePrompt, /full-body side-profile march/i);
  assert.match(stablePrompt, /London-like/i);
  assert.match(stablePrompt, /not a posed sidewalk fashion portrait/i);
  assert.match(variationPrompt, /walking left-to-right/i);
  assert.match(variationPrompt, /head-to-toe/i);
  assert.match(variationPrompt, /not standing still/i);
  assert.match(variationPrompt, /no three-quarter crop/i);
});
