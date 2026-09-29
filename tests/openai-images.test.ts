import assert from "node:assert/strict";
import test from "node:test";
import { generateOpenAIImage, OpenAIImageError } from "../src/lib/openai/images";
import { OpenAIImageInput, OPENAI_IMAGE_SIZES } from "../src/lib/openai/image-input";

function setKey(t: { after: (fn: () => void) => void }, value: string) {
  const original = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = value;
  t.after(() => {
    if (original === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = original;
  });
}

const input: OpenAIImageInput = {
  version: 1,
  model: "gpt-image-2.5-sunburst",
  quality: "medium",
  size: "1536x1024",
  outputFormat: "png",
  moderation: "low",
  prompt: "Exact saved prompt.",
  imageKeys: ["demo.png", "person.jpg", "pet.webp"],
};

test("both direct models send identical settings and ordered image bytes", async (t) => {
  setKey(t, "test-key");
  for (const model of ["gpt-image-2.5-sunburst", "gpt-image-2.5-flare"] as const) {
    const reads: string[] = [];
    const result = await generateOpenAIImage(
      { ...input, model },
      {
        readImage: async (key) => {
          reads.push(key);
          return Buffer.from(key);
        },
        fetch: async (url, options) => {
          assert.equal(url, "https://api.openai.com/v1/images/edits");
          assert.equal(options?.method, "POST");
          assert.deepEqual(options?.headers, { Authorization: "Bearer test-key" });
          const form = options?.body as FormData;
          assert.equal(form.get("model"), model);
          assert.equal(form.get("quality"), "medium");
          assert.equal(form.get("size"), "1536x1024");
          assert.equal(form.get("prompt"), input.prompt);
          assert.equal(form.get("output_format"), "png");
          assert.equal(form.get("n"), "1");
          assert.equal(form.has("input_fidelity"), false);
          const files = form.getAll("image[]") as File[];
          assert.deepEqual(await Promise.all(files.map((file) => file.text())), input.imageKeys);
          return Response.json(
            {
              data: [{ b64_json: Buffer.from("result").toString("base64") }],
              usage: { total_tokens: 123 },
            },
            { headers: { "x-request-id": "request-1" } },
          );
        },
      },
    );
    assert.deepEqual(reads, input.imageKeys);
    assert.equal(result.buffer.toString(), "result");
    assert.equal(result.requestId, "request-1");
    assert.deepEqual(result.usage, { total_tokens: 123 });
  }
  assert.deepEqual(OPENAI_IMAGE_SIZES, {
    "1:1": "1024x1024",
    "3:2": "1536x1024",
    "2:3": "1024x1536",
  });
});

test("missing credentials, invalid inputs, and rejected references make no paid request", async (t) => {
  setKey(t, "");
  let calls = 0;
  const dependencies = {
    readImage: async () => Buffer.from("ref"),
    fetch: async () => {
      calls++;
      return Response.json({});
    },
  };
  await assert.rejects(generateOpenAIImage(input, dependencies), /OPENAI_API_KEY/);
  process.env.OPENAI_API_KEY = "test-key";
  await assert.rejects(generateOpenAIImage({ ...input, imageKeys: [] }, dependencies));
  await assert.rejects(
    generateOpenAIImage({ ...input, imageKeys: Array(11).fill("ref.jpg") }, dependencies),
  );
  await assert.rejects(
    generateOpenAIImage(input, {
      ...dependencies,
      readImage: async () => {
        throw new Error("Missing reference");
      },
    }),
    /Missing reference/,
  );
  assert.equal(calls, 0);
});

test("errors and uncertain timeouts are never retried automatically", async (t) => {
  setKey(t, "test-key");
  let calls = 0;
  await assert.rejects(
    generateOpenAIImage(input, {
      readImage: async () => Buffer.from("ref"),
      fetch: async () => {
        calls++;
        return new Response("Private provider details", {
          status: 429,
          headers: { "x-request-id": "limited" },
        });
      },
    }),
    (error: unknown) =>
      error instanceof OpenAIImageError &&
      error.status === 429 &&
      error.requestId === "limited" &&
      !error.message.includes("Private"),
  );
  assert.equal(calls, 1);
  await assert.rejects(
    generateOpenAIImage(input, {
      readImage: async () => Buffer.from("ref"),
      fetch: async () => {
        calls++;
        throw new DOMException("Timed out", "TimeoutError");
      },
    }),
  );
  assert.equal(calls, 2);
});
