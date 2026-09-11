import assert from "node:assert/strict";
import test from "node:test";

import { STYLE_PROMPT_EXAMPLES } from "../src/data/style-prompt-examples";
import { buildGenerationPrompt } from "../src/lib/prompts";
import type { Subject } from "../src/lib/providers/types";
import {
  buildGenerationPredictionPrompts,
  resolvePredictionRetryContext,
} from "../src/lib/replicate/generate";
import { getThemeVariationPrompts } from "../src/lib/theme-variations";
import { buildCustomTheme, getTheme, resolveTheme } from "../src/lib/themes";

const subjects: Subject[] = [
  { personId: "adult-1", name: "Adult", role: "adult", referencePaths: ["adult.jpg"] },
  { personId: "child-1", name: "Child", role: "child", referencePaths: ["child.jpg"] },
  { personId: "pet-1", name: "Dog", role: "pet", referencePaths: ["dog.jpg"] },
];

for (const [slug, examples] of Object.entries(STYLE_PROMPT_EXAMPLES)) {
  test(`${slug} scene reaches custom generation without an imposed photographic treatment`, () => {
    const theme = buildCustomTheme({ description: examples[0].prompt, aspectRatio: "3:2" });
    const prompt = buildGenerationPrompt(theme, subjects);

    // Scene normalization is shared with all themes; creative details survive.
    assert.ok(prompt.includes(examples[0].prompt.replace(/\bfamily\b/giu, "group")));
    assert.match(prompt, /theme-appropriate anatomy/);
    assert.doesNotMatch(prompt, /Maintain coherent realistic anatomy/);
    assert.doesNotMatch(
      prompt,
      /cinematic color photograph|Kodak Portra|50mm-equivalent|shallow depth of field/,
    );
    assert.match(prompt, /Subjects: exactly three subjects only: 1 adult, 1 child and 1 pet/);
    assert.match(prompt, /Selected pet references are required cast members/);
    assert.match(prompt, /Aspect ratio: 3:2\./);
  });
}

test("custom styling stays prompt-directed for an unfamiliar medium and explicit framing", () => {
  const theme = buildCustomTheme({
    description:
      "A scratchboard group portrait: white cross-hatching on black, flat graphic shapes, overhead viewpoint, tight shoulder-up crop, every detail sharp.",
    aspectRatio: "1:1",
  });
  const prompt = buildGenerationPrompt(theme, subjects);

  assert.match(prompt, /scratchboard group portrait/);
  assert.match(prompt, /white cross-hatching on black/);
  assert.match(prompt, /overhead viewpoint, tight shoulder-up crop, every detail sharp/);
  assert.match(prompt, /preserve the user's requested composition and framing/);
  assert.match(prompt, /use per-output variations only to fill unspecified choices/);
  assert.match(
    prompt,
    /follow the user's requested medium, visual style, textures, palette and level of abstraction/,
  );
  assert.doesNotMatch(prompt, /eye-level composition|warm-neutral editorial palette/);
});

test("a scene without a medium gets a conditional photo fallback and the same generation route", () => {
  const theme = buildCustomTheme({
    description: "The group together in a quiet garden.",
    aspectRatio: "2:3",
  });
  const prompt = buildGenerationPrompt(theme, subjects);

  assert.match(
    prompt,
    /only when no medium or visual style is specified, use a natural photographic portrait/,
  );
  assert.equal(theme.id, "custom");
  assert.equal(theme.provider, "nanobanana");
  assert.equal(theme.acceptsCardText, undefined);
  assert.equal(theme.supportsPets, true);
  assert.equal(theme.category, "stylized");
  assert.equal(getThemeVariationPrompts(theme.id, theme.category).length, 4);
});

test("saved custom scenes resolve with the same medium and aspect after a reload", () => {
  const description = "A monochrome charcoal drawing with a wide low-angle composition.";
  const original = buildCustomTheme({ description, aspectRatio: "3:2" });
  const restored = resolveTheme({
    themeId: "custom",
    customVibeDescription: description,
    aspectRatio: "3:2",
  });

  assert.equal(
    buildGenerationPrompt(restored, subjects),
    buildGenerationPrompt(original, subjects),
  );
});

test("built-in photographic themes retain their realistic anatomy and film direction", () => {
  const prompt = buildGenerationPrompt(getTheme("golden-hour-beach"), subjects);

  assert.match(prompt, /Maintain coherent realistic anatomy/);
  assert.match(prompt, /Kodak Portra 400/);
  assert.match(prompt, /cinematic color photograph/);
});

test("final custom predictions retain explicit medium and framing across all four outputs", () => {
  for (const description of [
    STYLE_PROMPT_EXAMPLES["ghibli-family-photos"][0].prompt,
    STYLE_PROMPT_EXAMPLES["minecraft-family-photos"][0].prompt,
    "A monochrome scratchboard portrait, overhead viewpoint, tight shoulder-up crop, flat shapes, every detail sharp, calm expressions.",
  ]) {
    const theme = buildCustomTheme({ description, aspectRatio: "1:1" });
    const basePrompt = buildGenerationPrompt(theme, subjects);
    const prompts = buildGenerationPredictionPrompts({
      basePrompt,
      aspectRatio: theme.aspectRatio,
      variationPrompts: getThemeVariationPrompts(theme.id, theme.category),
    });

    assert.equal(prompts.length, 4);
    assert.equal(new Set(prompts).size, 4);
    for (const prompt of prompts) {
      assert.ok(prompt.includes(basePrompt));
      assert.match(prompt, /take precedence over variation suggestions/);
      assert.match(prompt, /Preserve every specified detail; vary only unspecified choices/);
      assert.match(prompt, /intentional simplifications or abstraction/);
      assert.doesNotMatch(prompt, /Variant composition mode:|Lens feel:|subjects occupy roughly/);
      assert.doesNotMatch(
        prompt,
        /realistic facial proportions|natural facial geometry|Expression override:/,
      );
      assert.doesNotMatch(prompt, /Kodak Portra|cinematic color photograph/);
    }
  }
});

test("a custom retry recognizes the stored direction without new generation metadata", () => {
  const theme = buildCustomTheme({
    description: "A blue ink line drawing in a tightly cropped overhead view.",
    aspectRatio: "2:3",
  });
  const basePrompt = buildGenerationPrompt(theme, subjects);
  const retry = resolvePredictionRetryContext(
    { id: "existing-prediction", retries: 1, basePrompt },
    { prompt: "older generation prompt", themeId: "custom" },
  );
  const [prompt] = buildGenerationPredictionPrompts({
    basePrompt: retry.basePrompt,
    aspectRatio: "2:3",
    variants: 1,
  });

  assert.match(prompt, /blue ink line drawing in a tightly cropped overhead view/);
  assert.match(prompt, /Custom scene variation 1:/);
  assert.doesNotMatch(prompt, /Variant composition mode:/);
});

test("preset predictions keep their established per-slot composition behavior", () => {
  const theme = getTheme("golden-hour-beach");
  const [prompt] = buildGenerationPredictionPrompts({
    basePrompt: buildGenerationPrompt(theme, subjects),
    aspectRatio: theme.aspectRatio,
    variants: 1,
    variationPrompts: getThemeVariationPrompts(theme.id, theme.category),
  });

  assert.match(prompt, /Variant composition mode:/);
  assert.match(prompt, /Lens feel:/);
  assert.match(prompt, /subjects occupy roughly/);
  assert.match(prompt, /Expression override:/);
  assert.doesNotMatch(prompt, /Custom scene variation/);
});
