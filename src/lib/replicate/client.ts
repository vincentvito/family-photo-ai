let cachedClient: import("replicate").default | null = null;

/**
 * Lazily construct the Replicate SDK client. Single shared instance per
 * process; the auth token is read from REPLICATE_API_TOKEN.
 */
export async function getReplicateClient() {
  if (cachedClient) return cachedClient;
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not set");
  const Replicate = (await import("replicate")).default;
  cachedClient = new Replicate({ auth: token });
  return cachedClient;
}

/**
 * Replicate model outputs vary in shape across SDK versions:
 *   - string URL
 *   - string[] of URLs
 *   - FileOutput-like with .url() method
 * Normalize to a single URL string.
 */
export async function resolveOutputUrl(output: unknown): Promise<string> {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    return resolveOutputUrl(output[0]);
  }
  if (output && typeof output === "object") {
    const o = output as { url?: unknown };
    if (typeof o.url === "function") {
      const u = await (o.url as () => string | URL | Promise<string | URL>)();
      return typeof u === "string" ? u : u.toString();
    }
    if (typeof o.url === "string") return o.url;
  }
  throw new Error(`Unexpected Replicate output shape: ${JSON.stringify(output)?.slice(0, 200)}`);
}

/**
 * Download a model's output image as a Buffer, with mime type detection.
 */
export async function fetchOutputImage(
  url: string,
): Promise<{ buffer: Buffer; mimeType: "image/jpeg" | "image/png" }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download Replicate output: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const mimeType: "image/jpeg" | "image/png" = contentType.includes("png")
    ? "image/png"
    : "image/jpeg";
  return { buffer: Buffer.from(arrayBuffer), mimeType };
}
