import path from "node:path";
import { db, schema } from "@/lib/db";
import { and, eq, asc } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { z } from "zod";
import { saveGeneratedImage } from "@/lib/storage";
import { runRefine } from "@/lib/providers";
import { resolveTheme } from "@/lib/themes";
import { studioCutoffDate } from "@/lib/retention";

const RefineInput = z.object({
  imageId: z.string().min(1),
  instruction: z.string().trim().min(2).max(400),
});

export async function refineImage(userId: string, input: z.infer<typeof RefineInput>) {
  const parsed = RefineInput.parse(input);

  const [baseImage] = await db
    .select()
    .from(schema.images)
    .where(eq(schema.images.id, parsed.imageId))
    .limit(1);
  if (!baseImage) throw new Error("Image not found");

  const [generation] = await db
    .select()
    .from(schema.generations)
    .where(
      and(eq(schema.generations.id, baseImage.generationId), eq(schema.generations.userId, userId)),
    )
    .limit(1);
  if (!generation) throw new Error("Generation not found");
  if (generation.createdAt < studioCutoffDate()) {
    throw new Error("This shoot has expired.");
  }

  const theme = resolveTheme(generation);
  const rootImageId = baseImage.rootImageId ?? baseImage.id;

  const historyRows = await db
    .select({
      instruction: schema.refinementHistory.instruction,
      resultImageId: schema.refinementHistory.resultImageId,
      stepIndex: schema.refinementHistory.stepIndex,
      image: schema.images,
    })
    .from(schema.refinementHistory)
    .innerJoin(schema.images, eq(schema.refinementHistory.resultImageId, schema.images.id))
    .where(eq(schema.refinementHistory.rootImageId, rootImageId))
    .orderBy(asc(schema.refinementHistory.stepIndex));

  const history = historyRows.map((h) => ({
    instruction: h.instruction,
    imageId: h.resultImageId,
    imageRelativePath: path.posix.join("generations", h.image.generationId, h.image.fileName),
  }));

  const baseRelative = path.posix.join("generations", baseImage.generationId, baseImage.fileName);

  const result = await runRefine({
    baseImage: { imageId: baseImage.id, relativePath: baseRelative },
    history,
    instruction: parsed.instruction,
    themeBlurb: theme.blurb,
    aspectRatio: theme.aspectRatio as (typeof theme)["aspectRatio"],
  });

  const [refined] = result.images;
  if (!refined) throw new Error("Refinement returned no image");

  const saved = await saveGeneratedImage(
    refined.buffer,
    baseImage.generationId,
    refined.mimeType === "image/png" ? "png" : "jpg",
  );

  const [insertedImage] = await db
    .insert(schema.images)
    .values({
      generationId: baseImage.generationId,
      fileName: saved.fileName,
      width: refined.width ?? saved.width,
      height: refined.height ?? saved.height,
      aspectRatio: baseImage.aspectRatio,
      parentImageId: baseImage.id,
      rootImageId,
      refineInstruction: parsed.instruction,
    })
    .returning();

  const nextStep = history.length + 1;
  await db.insert(schema.refinementHistory).values({
    rootImageId,
    stepIndex: nextStep,
    instruction: parsed.instruction,
    resultImageId: insertedImage.id,
  });

  revalidatePath(`/studio/refine/${baseImage.id}`);
  revalidatePath(`/studio/refine/${insertedImage.id}`);
  return { imageId: insertedImage.id };
}

export async function getRefineState(userId: string, imageId: string) {
  const [image] = await db
    .select()
    .from(schema.images)
    .where(eq(schema.images.id, imageId))
    .limit(1);
  if (!image) return null;

  const rootImageId = image.rootImageId ?? image.id;
  const [[generation], history, images] = await Promise.all([
    db
      .select()
      .from(schema.generations)
      .where(
        and(eq(schema.generations.id, image.generationId), eq(schema.generations.userId, userId)),
      )
      .limit(1),
    db
      .select()
      .from(schema.refinementHistory)
      .where(eq(schema.refinementHistory.rootImageId, rootImageId))
      .orderBy(asc(schema.refinementHistory.stepIndex)),
    db
      .select()
      .from(schema.images)
      .where(and(eq(schema.images.generationId, image.generationId))),
  ]);
  if (!generation || generation.createdAt < studioCutoffDate()) return null;

  const timeline: { imageId: string; instruction: string | null }[] = [];
  const rootCandidate =
    images.find((i) => i.id === rootImageId) ??
    images.find((i) => i.rootImageId === null && i.parentImageId === null) ??
    image;
  timeline.push({ imageId: rootCandidate.id, instruction: null });
  for (const h of history) {
    timeline.push({ imageId: h.resultImageId, instruction: h.instruction });
  }

  return { image, generation: generation ?? null, timeline };
}
