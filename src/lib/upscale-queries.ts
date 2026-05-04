import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { readStoredImage, saveBuffer, storedImageExists } from "@/lib/storage";
import { runUpscale } from "@/lib/providers";
import type { UpscaleTarget } from "@/lib/providers/types";

function upscaleKey(imageId: string, target: UpscaleTarget) {
  return `cache/upscales/${imageId}-${target}.jpg`;
}

export async function upscaleImage(input: { imageId: string; target: UpscaleTarget }) {
  const [image] = await db
    .select()
    .from(schema.images)
    .where(eq(schema.images.id, input.imageId))
    .limit(1);
  if (!image) throw new Error("Image not found");

  const sourceKey = `generations/${image.generationId}/${image.fileName}`;
  const cacheKey = upscaleKey(image.id, input.target);

  if (await storedImageExists(cacheKey)) {
    return { key: cacheKey };
  }

  const result = await runUpscale({
    sourceRelativePath: sourceKey,
    target: input.target,
  });
  await saveBuffer(cacheKey, result.buffer, "image/jpeg");

  return { key: cacheKey };
}

export async function readUpscaledImage(imageId: string, target: UpscaleTarget) {
  return readStoredImage(upscaleKey(imageId, target));
}
