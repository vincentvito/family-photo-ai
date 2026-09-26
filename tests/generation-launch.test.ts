import assert from "node:assert/strict";
import test from "node:test";
import { getReplicateClient } from "../src/lib/replicate/client";
import {
  createGenerationPredictions,
  createReferencePredictions,
} from "../src/lib/replicate/generate";
import { buildReferenceOutputInputs } from "../src/lib/vibe-reference";

test("current method reports each job before the last provider request returns", async (t) => {
  const oldToken = process.env.REPLICATE_API_TOKEN;
  const oldCdn = process.env.CLOUDFLARE_PUBLIC_URL;
  process.env.REPLICATE_API_TOKEN = "test-token";
  process.env.CLOUDFLARE_PUBLIC_URL = "https://images.example.com";
  t.after(() => {
    if (oldToken === undefined) delete process.env.REPLICATE_API_TOKEN;
    else process.env.REPLICATE_API_TOKEN = oldToken;
    if (oldCdn === undefined) delete process.env.CLOUDFLARE_PUBLIC_URL;
    else process.env.CLOUDFLARE_PUBLIC_URL = oldCdn;
  });

  const client = await getReplicateClient();
  let releaseLast!: () => void;
  const lastRequest = new Promise<void>((resolve) => {
    releaseLast = resolve;
  });
  let requestCount = 0;
  t.mock.method(client.predictions, "create", async () => {
    const index = requestCount++;
    if (index === 3) await lastRequest;
    return { id: `job-${index}` };
  });

  const saved: number[] = [];
  const launch = createGenerationPredictions(
    {
      modelId: "gpt-image-2",
      prompt: "Family portrait",
      aspectRatio: "1:1",
      subjects: [{ personId: "a", name: "Ava", role: "adult", referencePaths: ["uploads/a.jpg"] }],
    },
    async (_slot, index) => {
      saved.push(index);
    },
  );
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(saved, [0, 1, 2]);
  releaseLast();
  const { slots } = await launch;
  assert.deepEqual(saved, [0, 1, 2, 3]);
  assert.deepEqual(
    slots.map((slot) => slot.id),
    ["job-0", "job-1", "job-2", "job-3"],
  );
});

test("reference method cancels all created jobs if one slot cannot be saved", async (t) => {
  const oldToken = process.env.REPLICATE_API_TOKEN;
  const oldCdn = process.env.CLOUDFLARE_PUBLIC_URL;
  process.env.REPLICATE_API_TOKEN = "test-token";
  process.env.CLOUDFLARE_PUBLIC_URL = "https://images.example.com";
  t.after(() => {
    if (oldToken === undefined) delete process.env.REPLICATE_API_TOKEN;
    else process.env.REPLICATE_API_TOKEN = oldToken;
    if (oldCdn === undefined) delete process.env.CLOUDFLARE_PUBLIC_URL;
    else process.env.CLOUDFLARE_PUBLIC_URL = oldCdn;
  });

  const client = await getReplicateClient();
  let requestCount = 0;
  const canceled: string[] = [];
  t.mock.method(client.predictions, "create", async () => ({ id: `reference-${requestCount++}` }));
  t.mock.method(client.predictions, "cancel", async (id: string) => {
    canceled.push(id);
  });
  const inputs = buildReferenceOutputInputs({
    themeIds: ["golden-hour-beach"],
    subjects: [{ personId: "a", name: "Ava", role: "adult", referencePaths: ["uploads/a.jpg"] }],
    aspectRatio: "1:1",
    modelId: "gpt-image-2",
  });

  await assert.rejects(
    createReferencePredictions(inputs, async (_slot, index) => {
      if (index === 1) throw new Error("Database write failed");
    }),
    /Database write failed/,
  );
  assert.deepEqual(canceled.sort(), ["reference-0", "reference-1", "reference-2", "reference-3"]);
});
