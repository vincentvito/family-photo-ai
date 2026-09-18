import assert from "node:assert/strict";
import test from "node:test";

import { buildGenerationPredictionPrompts } from "../src/lib/replicate/generate";
import { buildGenerationPrompt } from "../src/lib/prompts";
import { getTheme, withAspectRatioOverride } from "../src/lib/themes";
import { getThemeVariationPrompts } from "../src/lib/theme-variations";

test("buildGenerationPredictionPrompts uses per-slot vibe prompts", () => {
  const prompts = buildGenerationPredictionPrompts({
    basePrompt: "base vibe",
    slotPrompts: [
      "cozy kitchen vibe",
      "cinematic forest vibe",
      "studio portrait vibe",
      "beach sunset vibe",
    ],
    aspectRatio: "2:3",
    variants: 4,
    variationPrompts: ["variation A", "variation B", "variation C", "variation D"],
  });

  assert.equal(prompts.length, 4);
  assert.match(prompts[0], /cozy kitchen vibe/);
  assert.match(prompts[0], /variation A/);
  assert.match(prompts[0], /Variant composition mode:/);
  assert.match(prompts[0], /subjects occupy roughly/i);
  assert.match(prompts[0], /Environment:/);
  assert.match(prompts[0], /Pose and limbs:/);
  assert.match(prompts[0], /Lens feel:/);
  assert.match(prompts[0], /Focus priority:/);
  assert.match(prompts[0], /Lighting discipline:/);
  assert.match(prompts[0], /Scene pressure:/);
  assert.match(prompts[0], /Maintain equal visual importance and facial readability/i);
  assert.match(prompts[0], /Avoid placing faces or hands too close to image edges/i);
  assert.match(prompts[1], /cinematic forest vibe/);
  assert.match(prompts[1], /variation B/);
  assert.match(prompts[2], /studio portrait vibe/);
  assert.match(prompts[2], /variation C/);
  assert.match(prompts[3], /beach sunset vibe/);
  assert.match(prompts[3], /variation D/);
});

test("variant prompts do not duplicate aspect ratio and adapt expression by scene", () => {
  const theme = getTheme("iconic-crosswalk-album-cover");
  const basePrompt = buildGenerationPrompt(theme, [
    { personId: "adult-1", name: "Adult 1", role: "adult", notes: null, referencePaths: ["a.jpg"] },
    { personId: "adult-2", name: "Adult 2", role: "adult", notes: null, referencePaths: ["b.jpg"] },
  ]);
  const [prompt] = buildGenerationPredictionPrompts({
    basePrompt,
    aspectRatio: theme.aspectRatio,
    variants: 1,
    variationPrompts: [
      "selected cast walking left-to-right across a zebra crosswalk, stylish coats, soft overcast city light",
    ],
  });

  assert.equal(prompt.match(/Aspect ratio:/g)?.length, 1);
  assert.match(prompt, /Expression override:/i);
  assert.match(prompt, /Do not preserve the exact expression, smile shape, eyebrow tension/i);
  assert.match(prompt, /Scene-driven expressions: expressionFlexibility=high/i);
  assert.match(prompt, /expressionIntensity=low/i);
  assert.match(prompt, /rather than copying the expressions from the source photos/i);
  assert.match(prompt, /Calm confident expressions/i);
  assert.match(prompt, /Scene pressure: dense scene/i);
  assert.match(prompt, /Focus priority: faces and front-facing eyes first/i);
  assert.doesNotMatch(prompt, /walking,,/i);
  assert.doesNotMatch(prompt, /selected cast/i);
});

test("aspect overrides update theme asset type language", () => {
  const theme = withAspectRatioOverride(getTheme("renaissance-oil"), "3:2");
  const prompt = buildGenerationPrompt(theme, [
    { personId: "adult-1", name: "Adult 1", role: "adult", notes: null, referencePaths: ["a.jpg"] },
    { personId: "adult-2", name: "Adult 2", role: "adult", notes: null, referencePaths: ["b.jpg"] },
  ]);

  assert.match(prompt, /A 3:2 Dutch-Golden-Age style oil painting/);
  assert.doesNotMatch(prompt, /A 2:3 Dutch-Golden-Age style oil painting/);
});

test("layout space in either prompt section does not add outer-space direction", () => {
  for (const layout of [
    "negative space above the subjects",
    "greeting space on the left",
    "blank wall space behind the subjects",
    "enough space around the subjects",
  ]) {
    for (const section of ["base", "variation"]) {
      const [prompt] = buildGenerationPredictionPrompts({
        basePrompt: `A natural group photograph.${section === "base" ? ` Leave ${layout}.` : ""}`,
        aspectRatio: "3:2",
        variants: 1,
        variationPrompts: [
          `A close portrait.${section === "variation" ? ` Leave ${layout}.` : ""}`,
        ],
      });

      assert.ok(prompt.includes(layout), `${section}: preserve the requested ${layout}`);
      assert.doesNotMatch(prompt, /Subtle awe and adventurous curiosity/, `${section}: ${layout}`);
      assert.match(prompt, /Scene pressure: low-density scene/, `${section}: ${layout}`);
      assert.match(prompt, /Relaxed warm expressions/, `${section}: ${layout}`);
    }
  }
});

test("popular portrait and card variants do not get accidental space expressions", () => {
  const subjects = [
    { personId: "adult-1", name: "Adult 1", role: "adult" as const, referencePaths: ["a.jpg"] },
  ];
  for (const themeId of [
    "golden-hour-beach",
    "stacked-love",
    "leibovitz-studio",
    "vintage-polaroid",
    "card-christmas",
    "wes-anderson",
    "pixar-family",
    "kinfolk-kitchen",
    "autumn-cabin",
    "card-mothers-day",
  ]) {
    const theme = getTheme(themeId);
    const prompts = buildGenerationPredictionPrompts({
      basePrompt: buildGenerationPrompt(theme, subjects),
      aspectRatio: theme.aspectRatio,
      variationPrompts: getThemeVariationPrompts(themeId, theme.category),
    });

    prompts.forEach((prompt, index) => {
      assert.doesNotMatch(
        prompt,
        /Subtle awe and adventurous curiosity/,
        `${themeId} slot ${index + 1}`,
      );
      assert.doesNotMatch(prompt, /Scene pressure: complex scene/, `${themeId} slot ${index + 1}`);
    });
  }
});

test("explicit outer-space scenes retain adventurous expressions and scene handling", () => {
  for (const scene of [
    "A portrait in outer space",
    "A portrait in deep space",
    "A group floating in space",
    "A portrait inside a space station",
    "A portrait inside a space-station module",
    "A SPACE-OPERA portrait",
    "A space-adventure portrait",
  ]) {
    const [prompt] = buildGenerationPredictionPrompts({
      basePrompt: scene,
      aspectRatio: "3:2",
      variants: 1,
      variationPrompts: ["A close portrait with negative space for a greeting."],
    });

    assert.match(prompt, /Subtle awe and adventurous curiosity/, scene);
    assert.match(prompt, /Scene pressure: complex scene/, scene);
  }

  for (const themeId of [
    "galactic-family-adventure",
    "galactic-glow-family-adventure",
    "zero-gravity-family",
  ]) {
    const theme = getTheme(themeId);
    const prompts = buildGenerationPredictionPrompts({
      basePrompt: buildGenerationPrompt(theme, [
        { personId: "adult-1", name: "Adult 1", role: "adult", referencePaths: ["a.jpg"] },
      ]),
      aspectRatio: theme.aspectRatio,
      variationPrompts: getThemeVariationPrompts(themeId, theme.category),
    });

    for (const prompt of prompts) {
      assert.match(prompt, /Subtle awe and adventurous curiosity/, themeId);
      assert.match(prompt, /Scene pressure: complex scene/, themeId);
    }
  }
});
