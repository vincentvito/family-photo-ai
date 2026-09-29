import assert from "node:assert/strict";
import test from "node:test";
import { runRegeneration } from "../src/lib/refine-queries";
import { MockProvider } from "../src/lib/providers/mock";

test("mock mode intercepts OpenAI refinements before reading jobs or making paid requests", async (t) => {
  const previous = { NODE_ENV: process.env.NODE_ENV, MOCK_MODE: process.env.MOCK_MODE };
  Object.assign(process.env, { NODE_ENV: "test", MOCK_MODE: "1" });
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  const buffer = Buffer.from("mock output");
  t.mock.method(MockProvider.prototype, "generatePortrait", async () => ({
    images: [{ buffer, mimeType: "image/png" }],
  }));
  t.mock.method(globalThis, "fetch", async () => {
    assert.fail("Mock refinement must not make a network request");
  });
  const result = await runRegeneration({
    generation: {
      id: "mock-shoot",
      providerId: "openai",
      themeId: "test",
      prompt: "test",
    } as Parameters<typeof runRegeneration>[0]["generation"],
    subjects: [],
    aspectRatio: "1:1",
    instruction: "Smile",
    history: [],
    variantIndex: 0,
    rootImageId: "no-saved-job",
  });
  assert.equal(result.buffer, buffer);
});
