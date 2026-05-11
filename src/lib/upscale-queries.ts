import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { readStoredImage, saveBuffer, storedImageExists } from "@/lib/storage";
import { runUpscale } from "@/lib/providers";
import type { UpscaleTarget } from "@/lib/providers/types";

function upscaleKey(imageId: string, target: UpscaleTarget) {
  return `cache/upscales/${imageId}-${target}.jpg`;
}

async function ensureOwnedImage(userId: string, imageId: string) {
  const [row] = await db
    .select({
      image: schema.images,
      freePreview: schema.generations.freePreview,
      creditUsageId: schema.creditUsages.id,
    })
    .from(schema.images)
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
    .where(and(eq(schema.images.id, imageId), eq(schema.generations.userId, userId)))
    .limit(1);
  if (!row) throw new Error("Image not found");
  if (row.freePreview && !row.creditUsageId) {
    throw new Error("Unlock this free preview before exporting.");
  }
  return row.image;
}

const pendingUpscales = new Map<string, Promise<{ key: string }>>();

export async function upscaleImage(input: {
  userId: string;
  imageId: string;
  target: UpscaleTarget;
}): Promise<{ key: string }> {
  const image = await ensureOwnedImage(input.userId, input.imageId);
  const cacheKey = upscaleKey(image.id, input.target);

  if (await storedImageExists(cacheKey)) return { key: cacheKey };

  const pending = pendingUpscales.get(cacheKey);
  if (pending) return pending;

  const sourceKey = `generations/${image.generationId}/${image.fileName}`;
  const task = (async () => {
    const result = await runUpscale({
      sourceRelativePath: sourceKey,
      target: input.target,
    });
    await saveBuffer(cacheKey, result.buffer, "image/jpeg");
    return { key: cacheKey };
  })();

  pendingUpscales.set(cacheKey, task);
  try {
    return await task;
  } finally {
    pendingUpscales.delete(cacheKey);
  }
}

export async function readUpscaledImage(
  userId: string,
  imageId: string,
  target: UpscaleTarget,
): Promise<Buffer> {
  const image = await ensureOwnedImage(userId, imageId);
  return readStoredImage(upscaleKey(image.id, target));
}
