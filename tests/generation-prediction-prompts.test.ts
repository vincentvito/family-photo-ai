import assert from "node:assert/strict";
import test from "node:test";

import { buildGenerationPredictionPrompts } from "../src/lib/replicate/generate";
import { buildGenerationPrompt } from "../src/lib/prompts";
import { getTheme, withAspectRatioOverride } from "../src/lib/themes";

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
  assert.match(prompts[1], /cinematic forest vibe/);
  assert.match(prompts[1], /variation B/);
  assert.match(prompts[2], /studio portrait vibe/);
  assert.match(prompts[2], /variation C/);
  assert.match(prompts[3], /beach sunset vibe/);
  assert.match(prompts[3], /variation D/);
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
