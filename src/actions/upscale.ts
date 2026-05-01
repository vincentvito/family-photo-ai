"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { ensureStorageReady, storagePath } from "@/lib/storage";
import { upscale } from "@/lib/providers/router";
import type { UpscaleTarget } from "@/lib/providers/types";

export async function upscaleImage(input: { imageId: string; target: UpscaleTarget }) {
  const [image] = await db
    .select()
    .from(schema.images)
    .where(eq(schema.images.id, input.imageId))
    .limit(1);
  if (!image) throw new Error("Image not found");

  const sourceRelative = path.posix.join("generations", image.generationId, image.fileName);

  await ensureStorageReady();
  const outDir = storagePath("cache", "upscales");
  await fs.mkdir(outDir, { recursive: true });
  const outFile = `${image.id}-${input.target}.jpg`;
  const outAbs = path.join(outDir, outFile);

  try {
    await fs.access(outAbs);
    return { fileName: outFile };
  } catch {
    /* not cached yet */
  }

  const result = await upscale({
    sourceRelativePath: sourceRelative,
    target: input.target,
  });
  await fs.writeFile(outAbs, result.buffer);

  return { fileName: outFile };
}
