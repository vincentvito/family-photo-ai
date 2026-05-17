import assert from "node:assert/strict";
import test from "node:test";

import { buildGenerationPrompt } from "../src/lib/prompts";
import { getTheme } from "../src/lib/themes";

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
  assert.match(prompt, /Cast rule: show only the selected cast: 2 adults; 0 children; one cat\./i);
  assert.match(prompt, /Mochi is a cat/i);
  assert.match(prompt, /Selected pets must remain animals, not extra adults/i);
  assert.doesNotMatch(prompt, /three adults/i);
  assert.doesNotMatch(prompt, /no pets/i);
});
