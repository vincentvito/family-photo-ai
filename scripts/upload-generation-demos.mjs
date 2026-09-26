import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(path.join(root, "src/lib/generation-demo-manifest.json"), "utf8"),
);
const required = [
  "CLOUDFLARE_BUCKET_NAME",
  "CLOUDFLARE_BUCKET_API",
  "CLOUDFLARE_ACCESS_KEY_ID",
  "CLOUDFLARE_SECRET_ACCESS_KEY",
  "CLOUDFLARE_PUBLIC_URL",
];
for (const name of required) if (!process.env[name]) throw new Error(`${name} is required.`);
const client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_BUCKET_API,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});
let uploaded = 0;
for (const [id, demo] of Object.entries(manifest)) {
  const bytes = await readFile(path.join(root, "public", demo.source));
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== demo.sha256) throw new Error(`${id}: source changed; make a new demo version.`);
  const meta = await sharp(bytes).metadata();
  if (!meta.width || !meta.height || Math.min(meta.width, meta.height) < 512)
    throw new Error(`${id}: demo resolution is too small.`);
  const contentType =
    meta.format === "png" ? "image/png" : meta.format === "webp" ? "image/webp" : "image/jpeg";
  try {
    const existing = await client.send(
      new HeadObjectCommand({ Bucket: process.env.CLOUDFLARE_BUCKET_NAME, Key: demo.key }),
    );
    if (existing.ContentLength !== bytes.length)
      throw new Error(`${id}: versioned asset has a different size.`);
  } catch (error) {
    if (error.name !== "NotFound" && error.$metadata?.httpStatusCode !== 404) throw error;
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: demo.key,
        Body: bytes,
        ContentType: contentType,
      }),
    );
    uploaded++;
  }
  const response = await fetch(
    `${process.env.CLOUDFLARE_PUBLIC_URL.replace(/\/+$/, "")}/${demo.key}`,
    { method: "HEAD" },
  );
  if (!response.ok) throw new Error(`${id}: public demo URL returned ${response.status}.`);
}
console.log(`Verified ${Object.keys(manifest).length} demos; uploaded ${uploaded}.`);
