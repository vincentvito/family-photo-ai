import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { nanoid } from "nanoid";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

type Subfolder = "uploads" | "generations" | "locations" | "cache";

export function storagePath(subfolder: Subfolder, ...segments: string[]) {
  return path.join(STORAGE_ROOT, subfolder, ...segments);
}

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function ensureStorageReady() {
  await Promise.all([
    ensureDir(storagePath("uploads")),
    ensureDir(storagePath("generations")),
    ensureDir(storagePath("locations")),
    ensureDir(storagePath("cache")),
    ensureDir(storagePath("cache", "thumbs")),
    ensureDir(storagePath("cache", "upscales")),
  ]);
}

export type SavedImage = {
  fileName: string;
  absolutePath: string;
  relativePath: string;
  width: number;
  height: number;
};

/**
 * Normalize an uploaded reference photo: strip EXIF, fit inside 2048px long edge,
 * save as JPEG under storage/uploads/<personId>/<uuid>.jpg.
 */
export async function saveReferencePhoto(buffer: Buffer, personId: string): Promise<SavedImage> {
  const dir = storagePath("uploads", personId);
  await ensureDir(dir);
  const fileName = `${nanoid(10)}.jpg`;
  const absolutePath = path.join(dir, fileName);

  const img = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const needsResize = (meta.width ?? 0) > 2048 || (meta.height ?? 0) > 2048;

  const pipeline = needsResize
    ? img.resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    : img;

  const { data, info } = await pipeline
    .jpeg({ quality: 88, mozjpeg: true })
    .withMetadata({ exif: {} }) // strip EXIF
    .toBuffer({ resolveWithObject: true });

  await fs.writeFile(absolutePath, data);

  return {
    fileName,
    absolutePath,
    relativePath: path.join("uploads", personId, fileName),
    width: info.width,
    height: info.height,
  };
}

/**
 * Normalize an uploaded location / mood reference photo for a custom vibe.
 * Lives under storage/locations/<uuid>.jpg, independent of any person.
 */
export async function saveLocationReference(buffer: Buffer): Promise<SavedImage> {
  const dir = storagePath("locations");
  await ensureDir(dir);
  const fileName = `${nanoid(10)}.jpg`;
  const absolutePath = path.join(dir, fileName);

  const img = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const needsResize = (meta.width ?? 0) > 2048 || (meta.height ?? 0) > 2048;
  const pipeline = needsResize
    ? img.resize({
        width: 2048,
        height: 2048,
        fit: "inside",
        withoutEnlargement: true,
      })
    : img;

  const { data, info } = await pipeline
    .jpeg({ quality: 88, mozjpeg: true })
    .withMetadata({ exif: {} })
    .toBuffer({ resolveWithObject: true });

  await fs.writeFile(absolutePath, data);

  return {
    fileName,
    absolutePath,
    relativePath: path.join("locations", fileName),
    width: info.width,
    height: info.height,
  };
}

/**
 * Save a generated image buffer under storage/generations/<generationId>/<uuid>.jpg.
 */
export async function saveGeneratedImage(
  buffer: Buffer,
  generationId: string,
  extension: "jpg" | "png" = "jpg",
): Promise<SavedImage> {
  const dir = storagePath("generations", generationId);
  await ensureDir(dir);
  const fileName = `${nanoid(10)}.${extension}`;
  const absolutePath = path.join(dir, fileName);

  // Normalize to standard JPEG/PNG with known dimensions.
  const img = sharp(buffer);
  const meta = await img.metadata();

  await fs.writeFile(absolutePath, buffer);

  return {
    fileName,
    absolutePath,
    relativePath: path.join("generations", generationId, fileName),
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

/**
 * Read any stored image back as a Buffer, given its relative path.
 */
export async function readStoredImage(relativePath: string): Promise<Buffer> {
  const abs = path.join(STORAGE_ROOT, relativePath);
  return fs.readFile(abs);
}

/**
 * Produce (and cache) a thumbnail for display in grids.
 */
export async function getThumbnail(relativePath: string, size = 320): Promise<string> {
  const hash = relativePath.replace(/[/\\]/g, "_");
  const thumbAbs = storagePath("cache", "thumbs", `${size}_${hash}`);
  try {
    await fs.access(thumbAbs);
    return thumbAbs;
  } catch {
    const src = path.join(STORAGE_ROOT, relativePath);
    await sharp(src)
      .resize({ width: size, height: size, fit: "cover", position: "attention" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(thumbAbs);
    return thumbAbs;
  }
}

/**
 * Convert a locally-stored image to a base64 data URL (for sending to model APIs).
 */
export async function imageToBase64(
  relativePath: string,
): Promise<{ base64: string; mimeType: string }> {
  const abs = path.join(STORAGE_ROOT, relativePath);
  const buf = await fs.readFile(abs);
  const ext = path.extname(abs).toLowerCase();
  const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return { base64: buf.toString("base64"), mimeType };
}

/**
 * Stream-friendly absolute path resolver, used by the /api/images/[id] route.
 */
export function resolveStoragePath(relativePath: string) {
  return path.join(STORAGE_ROOT, relativePath);
}
