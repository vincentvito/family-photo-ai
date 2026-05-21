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
