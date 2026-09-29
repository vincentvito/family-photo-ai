import { OpenAIImageInput } from "./image-input";
import { readStoredImage } from "@/lib/storage";

export function assertOpenAIConfigured() {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    throw new Error("Direct OpenAI generation needs OPENAI_API_KEY on the server.");
  }
}

export class OpenAIImageError extends Error {
  constructor(
    public readonly status: number,
    public readonly requestId: string | null,
  ) {
    super(`OpenAI image request failed (${status}).`);
  }
}

export async function generateOpenAIImage(
  rawInput: OpenAIImageInput,
  dependencies = { fetch: globalThis.fetch, readImage: readStoredImage },
) {
  assertOpenAIConfigured();
  const input = OpenAIImageInput.parse(rawInput);
  const form = new FormData();
  form.set("model", input.model);
  form.set("quality", input.quality);
  form.set("size", input.size);
  form.set("output_format", input.outputFormat);
  form.set("moderation", input.moderation);
  form.set("prompt", input.prompt);
  form.set("n", "1");
  // Read private storage directly; preserve reference order, including the demo.
  for (const [index, key] of input.imageKeys.entries()) {
    const bytes = await dependencies.readImage(key);
    if (bytes.length >= 50 * 1024 * 1024) throw new Error("Reference image is too large.");
    const extension = key.toLowerCase().endsWith(".png")
      ? "png"
      : key.toLowerCase().endsWith(".webp")
        ? "webp"
        : "jpg";
    const type = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    form.append(
      "image[]",
      new Blob([new Uint8Array(bytes)], { type }),
      `reference-${index}.${extension}`,
    );
  }
  // No automatic network retry: a timeout can occur after a paid image was made.
  const response = await dependencies.fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(210_000),
  });
  const requestId = response.headers.get("x-request-id");
  if (!response.ok) throw new OpenAIImageError(response.status, requestId);
  const body = (await response.json()) as { data?: { b64_json?: string }[]; usage?: unknown };
  const encoded = body.data?.[0]?.b64_json;
  if (!encoded) throw new Error("OpenAI returned no image.");
  return {
    buffer: Buffer.from(encoded, "base64"),
    mimeType: "image/png" as const,
    requestId,
    usage: body.usage ?? null,
  };
}
