import { imageToBase64 } from "../storage";

export async function getReplicateClient() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not set");
  const Replicate = (await import("replicate")).default;
  return new Replicate({ auth: token });
}

export async function toDataUrl(relativePath: string): Promise<string> {
  const { base64, mimeType } = await imageToBase64(relativePath);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Replicate returns varied shapes across models:
 *   - string URL
 *   - string[] of URLs
 *   - FileOutput-like with .url() method
 *   - ReadableStream
 * Normalize to a single URL.
 */
export async function resolveUrl(output: unknown): Promise<string> {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    return resolveUrl(output[0]);
  }
  if (output && typeof output === "object") {
    const o = output as { url?: unknown };
    if (typeof o.url === "function") {
      const u = await (o.url as () => string | URL | Promise<string | URL>)();
      return typeof u === "string" ? u : u.toString();
    }
    if (typeof o.url === "string") return o.url;
  }
  throw new Error(
    `Unexpected Replicate output shape: ${JSON.stringify(output)?.slice(0, 200)}`,
  );
}

export async function urlToImage(url: string): Promise<{
  buffer: Buffer;
  mimeType: "image/jpeg" | "image/png";
}> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch Replicate output: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const mimeType: "image/jpeg" | "image/png" = contentType.includes("png")
    ? "image/png"
    : "image/jpeg";
  return { buffer: Buffer.from(arrayBuffer), mimeType };
}
