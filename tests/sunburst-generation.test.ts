import assert from "node:assert/strict";
import test from "node:test";
import { getReplicateClient } from "../src/lib/replicate/client";
import {
  createGenerationPredictions,
  createSinglePrediction,
  reconcilePrediction,
} from "../src/lib/replicate/generate";
import { GENERATION_MODEL_IDS, getModel } from "../src/lib/replicate/models";

test("Sunburst sends all four references to each high-quality shot and supports retry/polling", async (t) => {
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
      return { id: `shot-${requests.length}` };
    },
  );
  const refs = ["a.jpg", "b.jpg", "c.jpg", "d.jpg"];
  const imageUrls = refs.map((ref) => `https://images.example.com/${ref}`);
  const modelId = "gpt-image-2.5-sunburst";
  assert.ok(GENERATION_MODEL_IDS.includes(modelId));
  assert.equal(getModel(modelId)?.priceUsd, 0.128);
  assert.equal(getModel(modelId)?.gptImageQuality, "high");

  const { slots } = await createGenerationPredictions({
    modelId,
    prompt: "Family portrait",
    slotPrompts: ["Garden", "Beach", "Studio", "Kitchen"],
    aspectRatio: "2:3",
    subjects: [
      { personId: "family", name: "Family", role: "adult", notes: null, referencePaths: refs },
    ],
  });
  assert.equal(slots.length, 4);
  assert.equal(requests.length, 4);
  for (const [index, request] of requests.entries()) {
    assert.equal(request.model, "openai/gpt-image-2.5-sunburst");
    assert.equal(request.input.quality, "high");
    assert.equal(request.input.number_of_images, 1);
    assert.equal(request.input.aspect_ratio, "2:3");
    assert.equal(request.input.output_format, "jpeg");
    assert.deepEqual(request.input.input_images, imageUrls);
    assert.ok(
      String(request.input.prompt).includes(["Garden", "Beach", "Studio", "Kitchen"][index]),
    );
  }
  await createSinglePrediction({
    modelId,
    basePrompt: "Garden",
    variantIndex: 0,
    aspectRatio: "1:1",
    imageUrls,
  });
  assert.equal(requests[4].model, "openai/gpt-image-2.5-sunburst");
  assert.equal(requests[4].input.quality, "high");
  t.mock.method(client.predictions, "get", async () => ({
    status: "succeeded",
    output: ["https://images.example.com/result.jpg"],
  }));
  assert.deepEqual(await reconcilePrediction(slots[0].id), {
    status: "succeeded",
    outputUrl: "https://images.example.com/result.jpg",
  });
});
