import assert from "node:assert/strict";
import test from "node:test";

import { buildVibeSelectionPlan } from "../src/lib/vibe-selection-plan";

const catalog = [
  { id: "beach", name: "Beach" },
  { id: "cabin", name: "Cabin" },
  { id: "studio", name: "Studio" },
  { id: "storybook", name: "Storybook" },
  { id: "noir", name: "Noir" },
];

test("one selected vibe repeats across all four slots", () => {
  const plan = buildVibeSelectionPlan(["beach"], catalog);

  assert.deepEqual(
    plan.map((slot) => slot.themeId),
    ["beach", "beach", "beach", "beach"],
  );
  assert.deepEqual(
    plan.map((slot) => slot.source),
    ["selected", "repeat", "repeat", "repeat"],
  );
});

test("two selected vibes are filled with two deterministic recommendations", () => {
  const plan = buildVibeSelectionPlan(["cabin", "beach"], catalog);

  assert.deepEqual(
    plan.map((slot) => slot.themeId),
    ["cabin", "beach", "studio", "storybook"],
  );
  assert.deepEqual(
    plan.map((slot) => slot.source),
    ["selected", "selected", "auto", "auto"],
  );
});

test("three selected vibes are filled with one deterministic recommendation", () => {
  const plan = buildVibeSelectionPlan(["beach", "studio", "noir"], catalog);

  assert.deepEqual(
    plan.map((slot) => slot.themeId),
    ["beach", "studio", "noir", "cabin"],
  );
  assert.deepEqual(
    plan.map((slot) => slot.source),
    ["selected", "selected", "selected", "auto"],
  );
});

test("four selected vibes stay unchanged", () => {
  const plan = buildVibeSelectionPlan(["noir", "studio", "cabin", "beach"], catalog);

  assert.deepEqual(
    plan.map((slot) => slot.themeId),
    ["noir", "studio", "cabin", "beach"],
  );
  assert.deepEqual(
    plan.map((slot) => slot.source),
    ["selected", "selected", "selected", "selected"],
  );
});

test("duplicate and unknown selected ids are ignored before filling slots", () => {
  const plan = buildVibeSelectionPlan(["beach", "beach", "missing", "studio"], catalog);

  assert.deepEqual(
    plan.map((slot) => slot.themeId),
    ["beach", "studio", "cabin", "storybook"],
  );
});
