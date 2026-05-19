import assert from "node:assert/strict";
import test from "node:test";

import { buildGenerationPrompt } from "../src/lib/prompts";
import { getTheme } from "../src/lib/themes";

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

  assert.match(prompt, /Selected cast: two adults and one pet/i);
  assert.match(prompt, /Cast rule: show only the selected cast: 2 adults; one pet\./i);
  assert.match(
    prompt,
    /Reference identity map: reference image 1 is adult 1, reference image 2 is adult 2 and reference image 3 is pet 1\./i,
  );
  assert.match(prompt, /Total living subjects in the image must be exactly 3\./i);
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
