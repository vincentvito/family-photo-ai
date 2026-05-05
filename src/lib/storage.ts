import path from "node:path";
import sharp from "sharp";
import { nanoid } from "nanoid";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

let cachedClient: S3Client | null = null;

function bucket() {
  const name = process.env.CLOUDFLARE_BUCKET_NAME;
  if (!name) throw new Error("CLOUDFLARE_BUCKET_NAME not set");
  return name;
}

function s3() {
  if (cachedClient) return cachedClient;
  const endpoint = process.env.CLOUDFLARE_BUCKET_API;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Cloudflare R2 env: CLOUDFLARE_BUCKET_API, CLOUDFLARE_ACCESS_KEY_ID, CLOUDFLARE_SECRET_ACCESS_KEY",
    );
  }
  cachedClient = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cachedClient;
}

export type SavedImage = {
  fileName: string;
  /** R2 object key, e.g. "uploads/<personId>/<file>.jpg" */
  relativePath: string;
  width: number;
  height: number;
};

async function putObject(key: string, body: Buffer, contentType: string) {
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

async function streamToBuffer(stream: unknown): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer | Uint8Array>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Normalize an uploaded reference photo: strip EXIF, fit inside 2048px long edge,
 * save as JPEG under uploads/<personId>/<uuid>.jpg in R2.
 */
export async function saveReferencePhoto(buffer: Buffer, personId: string): Promise<SavedImage> {
  const fileName = `${nanoid(10)}.jpg`;
  const key = `uploads/${personId}/${fileName}`;

  const img = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const needsResize = (meta.width ?? 0) > 2048 || (meta.height ?? 0) > 2048;

  const pipeline = needsResize
    ? img.resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    : img;

  const { data, info } = await pipeline
    .jpeg({ quality: 88, mozjpeg: true })
    .withMetadata({ exif: {} })
    .toBuffer({ resolveWithObject: true });

  await putObject(key, data, "image/jpeg");

  return { fileName, relativePath: key, width: info.width, height: info.height };
}

/**
 * Normalize an uploaded location / mood reference photo for a custom vibe.
 */
export async function saveLocationReference(buffer: Buffer, userId: string): Promise<SavedImage> {
  const fileName = `${nanoid(10)}.jpg`;
  const key = `locations/${userId}/${fileName}`;

  const img = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const needsResize = (meta.width ?? 0) > 2048 || (meta.height ?? 0) > 2048;
  const pipeline = needsResize
    ? img.resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    : img;

  const { data, info } = await pipeline
    .jpeg({ quality: 88, mozjpeg: true })
    .withMetadata({ exif: {} })
    .toBuffer({ resolveWithObject: true });

  await putObject(key, data, "image/jpeg");

  return { fileName, relativePath: key, width: info.width, height: info.height };
}

/**
 * Save a generated image buffer under generations/<generationId>/<uuid>.<ext>.
 */
export async function saveGeneratedImage(
  buffer: Buffer,
  generationId: string,
  extension: "jpg" | "png" = "jpg",
): Promise<SavedImage> {
  const fileName = `${nanoid(10)}.${extension}`;
  const key = `generations/${generationId}/${fileName}`;

  const meta = await sharp(buffer).metadata();
  const contentType = extension === "png" ? "image/png" : "image/jpeg";
  await putObject(key, buffer, contentType);

  return {
    fileName,
    relativePath: key,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

/**
 * Save an arbitrary buffer under a known key. Used for the upscale cache.
 */
export async function saveBuffer(
  key: string,
  buffer: Buffer,
  contentType = "image/jpeg",
): Promise<void> {
  await putObject(key, buffer, contentType);
}

/**
 * Read an R2 object back as a Buffer, given its key.
 */
export async function readStoredImage(key: string): Promise<Buffer> {
  const res = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
  if (!res.Body) throw new Error(`R2 object missing: ${key}`);
  return streamToBuffer(res.Body);
}

/**
 * True if an R2 object exists at the given key.
 */
export async function storedImageExists(key: string): Promise<boolean> {
  try {
    await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Hard-delete an R2 object by key.
 */
export async function deleteStoredImage(key: string): Promise<void> {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

/**
 * Hard-delete every R2 object under a key prefix. Used when removing a person
 * or generation: clears their entire uploads/<id>/ or generations/<id>/ folder.
 */
export async function deleteStoredPrefix(prefix: string): Promise<void> {
  let token: string | undefined;
  do {
    const list = await s3().send(
      new ListObjectsV2Command({
        Bucket: bucket(),
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );
    const objects = (list.Contents ?? [])
      .map((o) => o.Key)
      .filter((k): k is string => typeof k === "string");
    if (objects.length > 0) {
      await s3().send(
        new DeleteObjectsCommand({
          Bucket: bucket(),
          Delete: { Objects: objects.map((Key) => ({ Key })), Quiet: true },
        }),
      );
    }
    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);
}

/**
 * Convert an R2-stored image to a base64 data URL (for sending to model APIs
 * that accept inline images, e.g. Replicate / Nano Banana).
 */
export async function imageToBase64(
  key: string,
): Promise<{ base64: string; mimeType: string }> {
  const buf = await readStoredImage(key);
  const ext = path.extname(key).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return { base64: buf.toString("base64"), mimeType };
}

/**
 * Public CDN URL for an R2 object key. Used by /api/images/[id] to redirect
 * the browser to the cached CDN copy.
 */
export function publicUrl(key: string): string {
  const base = process.env.CLOUDFLARE_PUBLIC_URL;
  if (!base) throw new Error("CLOUDFLARE_PUBLIC_URL not set");
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedKey = key.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedKey}`;
}
