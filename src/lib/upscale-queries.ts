import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { readStoredImage, saveBuffer, storedImageExists } from "@/lib/storage";
import { runUpscale } from "@/lib/providers";
import type { UpscaleTarget } from "@/lib/providers/types";

function upscaleKey(imageId: string, target: UpscaleTarget) {
  return `cache/upscales/${imageId}-${target}.jpg`;
}

export async function upscaleImage(input: {
  userId: string;
  imageId: string;
  target: UpscaleTarget;
}) {
  const [image] = await db
    .select({ image: schema.images })
    .from(schema.images)
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .where(and(eq(schema.images.id, input.imageId), eq(schema.generations.userId, input.userId)))
    .limit(1);
  if (!image) throw new Error("Image not found");

  const sourceKey = `generations/${image.image.generationId}/${image.image.fileName}`;
  const cacheKey = upscaleKey(image.image.id, input.target);

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

export async function readUpscaledImage(userId: string, imageId: string, target: UpscaleTarget) {
  const [image] = await db
    .select({ id: schema.images.id })
    .from(schema.images)
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .where(and(eq(schema.images.id, imageId), eq(schema.generations.userId, userId)))
    .limit(1);

  if (!image) throw new Error("Image not found");
  return readStoredImage(upscaleKey(imageId, target));
}
