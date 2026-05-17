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
