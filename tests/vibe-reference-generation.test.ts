import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { getReplicateClient } from "../src/lib/replicate/client";
import { GENERATION_MODEL_IDS, MODEL_CATALOG } from "../src/lib/replicate/models";
import {
  createReferencePredictions,
  createSavedReferencePrediction,
} from "../src/lib/replicate/generate";
import { resolveGenerationMethod } from "../src/lib/generation-method";
import { THEMES } from "../src/lib/themes";
import {
  buildReferenceOutputInputs,
  buildReferencePrompt,
  getGenerationDemo,
  referenceInputUrls,
} from "../src/lib/vibe-reference";
import type { Subject } from "../src/lib/providers/types";
import manifest from "../src/lib/generation-demo-manifest.json";

const adult: Subject = {
  personId: "a",
  name: "Ava",
  role: "adult",
  referencePaths: ["uploads/a/first.jpg", "uploads/a/second.jpg"],
};
const child: Subject = {
  personId: "b",
  name: "Bo",
  role: "child",
  referencePaths: ["uploads/b/first.jpg"],
};
const pet: Subject = {
  personId: "c",
  name: "Pip",
  role: "pet",
  referencePaths: ["uploads/c/first.jpg"],
};

test("every built-in portrait has a versioned demo", () => {
  for (const theme of THEMES.filter((item) => item.category !== "card")) {
    const demo = getGenerationDemo(theme.id);
    assert.equal(demo.version, "v1");
    assert.match(demo.key, /^generation-demos\/v1\//);
  }
});

test("versioned demo sources decode and match their fixed hashes", async () => {
  for (const demo of Object.values(manifest)) {
    const bytes = await readFile(path.join(process.cwd(), "public", demo.source));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), demo.sha256, demo.assetId);
    const metadata = await sharp(bytes).metadata();
    assert.ok(Math.min(metadata.width ?? 0, metadata.height ?? 0) >= 512, demo.assetId);
  }
});

test("short prompt counts only selected subjects and keeps pets as animals", () => {
  const one = buildReferencePrompt({
    themeId: "golden-hour-beach",
    subjects: [adult],
    aspectRatio: "3:2",
  });
  assert.match(one, /1 person in image 2/);
  assert.match(one, /image 2: Ava \(adult\)/);
  assert.doesNotMatch(one, /images 2–2|Variant composition mode|expressionFlexibility/);

  const mixed = buildReferencePrompt({
    themeId: "golden-hour-beach",
    subjects: [adult, child, pet],
    aspectRatio: "2:3",
    wardrobeNote: "blue coats",
  });
  assert.match(mixed, /2 people and 1 pet in images 2–4/);
  assert.match(mixed, /image 3: Bo \(child\)/);
  assert.match(mixed, /image 4: Pip \(pet\)/);
  assert.match(mixed, /keep pets as animals/);
  assert.match(mixed, /2:3 shape/);
  assert.match(mixed, /blue coats/);
  assert.match(mixed, /instead of image 1's clothing/);
  assert.match(
    buildReferencePrompt({ themeId: "watercolor-storybook", subjects: [pet], aspectRatio: "1:1" }),
    /portrait.*1 pet in image 2/,
  );
});

test("each output saves its own demo first and one selfie per selected subject", () => {
  const inputs = buildReferenceOutputInputs({
    themeIds: ["golden-hour-beach", "watercolor-storybook", "autumn-cabin", "film-noir"],
    subjects: [adult, pet],
    aspectRatio: "1:1",
    modelId: "gpt-image-2",
  });
  assert.equal(inputs.length, 4);
  assert.deepEqual(
    inputs.map((input) => input.themeId),
    ["golden-hour-beach", "watercolor-storybook", "autumn-cabin", "film-noir"],
  );
  for (const input of inputs) {
    assert.equal(input.imageKeys[0], getGenerationDemo(input.themeId).key);
    assert.deepEqual(input.imageKeys.slice(1), ["uploads/a/first.jpg", "uploads/c/first.jpg"]);
    assert.equal(input.outputIndex, inputs.indexOf(input));
  }
  const repeated = buildReferenceOutputInputs({
    themeIds: ["golden-hour-beach"],
    subjects: [adult],
    aspectRatio: "3:2",
    modelId: "nanobanana",
  });
  assert.deepEqual(new Set(repeated.map((input) => input.imageKeys[0])).size, 1);
});

test("a missing demo stops reference preparation without falling back", () => {
  assert.throws(
    () =>
      buildReferenceOutputInputs({
        themeIds: ["missing-vibe"],
        subjects: [adult],
        aspectRatio: "3:2",
        modelId: "gpt-image-2",
      }),
    /No versioned generation demo/,
  );
});

test("method override needs admin authority and unsupported outputs stay current", () => {
  assert.equal(
    resolveGenerationMethod({
      eligiblePortrait: true,
      admin: false,
      requested: "vibe-reference",
      appDefault: "current-prompt",
    }),
    "current-prompt",
  );
  assert.equal(
    resolveGenerationMethod({
      eligiblePortrait: true,
      admin: true,
      requested: "vibe-reference",
      appDefault: "current-prompt",
    }),
    "vibe-reference",
  );
  assert.equal(
    resolveGenerationMethod({ eligiblePortrait: true, admin: false, appDefault: "vibe-reference" }),
    "vibe-reference",
  );
  assert.equal(
    resolveGenerationMethod({
      eligiblePortrait: false,
      admin: true,
      requested: "vibe-reference",
      appDefault: "vibe-reference",
    }),
    "current-prompt",
  );
});

test("provider receives exact saved prompt and order for launch and retry", async (t) => {
  const previousToken = process.env.REPLICATE_API_TOKEN;
  const previousCdn = process.env.CLOUDFLARE_PUBLIC_URL;
  process.env.REPLICATE_API_TOKEN = "test-token";
  process.env.CLOUDFLARE_PUBLIC_URL = "https://images.example.com";
  t.after(() => {
    if (previousToken === undefined) delete process.env.REPLICATE_API_TOKEN;
    else process.env.REPLICATE_API_TOKEN = previousToken;
    if (previousCdn === undefined) delete process.env.CLOUDFLARE_PUBLIC_URL;
    else process.env.CLOUDFLARE_PUBLIC_URL = previousCdn;
  });
  const client = await getReplicateClient();
  const requests: { model: string; input: Record<string, unknown> }[] = [];
  t.mock.method(
    client.predictions,
    "create",
    async (request: { model: string; input: Record<string, unknown> }) => {
      requests.push(request);
      return { id: `reference-${requests.length}` };
    },
  );
  const inputs = buildReferenceOutputInputs({
    themeIds: ["golden-hour-beach", "watercolor-storybook"],
    subjects: [adult, pet],
    aspectRatio: "2:3",
    modelId: "gpt-image-2",
  });
  await createReferencePredictions(inputs);
  assert.equal(requests.length, 4);
  for (const [index, request] of requests.entries()) {
    assert.equal(request.input.prompt, inputs[index].prompt);
    assert.deepEqual(request.input.input_images, referenceInputUrls(inputs[index]));
    assert.doesNotMatch(
      String(request.input.prompt),
      /Variant composition mode|Scene pressure|expressionFlexibility/,
    );
  }
  const saved = structuredClone(inputs[0]);
  saved.imageKeys[1] = "generations/old/references/subject-1.jpg";
  await createSavedReferencePrediction(saved);
  assert.equal(requests[4].input.prompt, saved.prompt);
  assert.deepEqual(requests[4].input.input_images, referenceInputUrls(saved));

  // Check every selectable model against its published Replicate input fields
  // without starting a paid prediction.
  for (const modelId of GENERATION_MODEL_IDS) {
    const input = buildReferenceOutputInputs({
      themeIds: ["golden-hour-beach"],
      subjects: [adult, pet],
      aspectRatio: "2:3",
      modelId,
    })[0];
    await createSavedReferencePrediction(input);
    const request = requests.at(-1)!;
    const isNano = modelId === "nanobanana" || modelId === "nano-banana-pro";
    const imageField = isNano ? "image_input" : "input_images";
    const expectedFields = isNano
      ? [
          "prompt",
          "image_input",
          "aspect_ratio",
          "resolution",
          "output_format",
          ...(modelId === "nano-banana-pro" ? ["safety_filter_level"] : []),
        ]
      : [
          "prompt",
          "input_images",
          "aspect_ratio",
          "quality",
          "number_of_images",
          "output_format",
          "moderation",
        ];
    assert.deepEqual(Object.keys(request.input).sort(), expectedFields.sort(), modelId);
    assert.deepEqual(request.input[imageField], referenceInputUrls(input), modelId);
    assert.equal(request.input.prompt, input.prompt, modelId);
    assert.equal(request.input.aspect_ratio, "2:3", modelId);
    assert.equal(request.model, MODEL_CATALOG[modelId].slug, modelId);
  }
});
