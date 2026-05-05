import path from "node:path";
import { db, schema } from "@/lib/db";
import { and, eq, asc, isNotNull, sql } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { z } from "zod";
import { saveGeneratedImage } from "@/lib/storage";
import { runRefine } from "@/lib/providers";
import { resolveTheme } from "@/lib/themes";
import { studioCutoffDate } from "@/lib/retention";
import { REFINE_CAP, LEGACY_REFINE_CAP, type PackTier } from "@/lib/pricing-packs";

function refineCapFor(packTier: string | null): number {
  if (!packTier) return LEGACY_REFINE_CAP;
  return REFINE_CAP[packTier as PackTier] ?? LEGACY_REFINE_CAP;
}

async function countShootRefines(generationId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.images)
    .where(
      and(eq(schema.images.generationId, generationId), isNotNull(schema.images.parentImageId)),
    );
  return Number(row?.total ?? 0);
}

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

  const refinesUsed = await countShootRefines(generation.id);
  const refinesMax = refineCapFor(generation.packTier);
  if (refinesUsed >= refinesMax) {
    throw new Error(
      `You've used all ${refinesMax} refines on this shoot. Start a new shoot to keep editing.`,
    );
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

  // Atomically re-check the cap and write the result. The pre-flight check
  // above keeps the common case fast; this transaction closes the race where
  // two concurrent refines both pass the pre-flight. The advisory lock is
  // scoped to this generation so other shoots aren't blocked, and the tx
  // contains no external calls so it stays short.
  const insertedImage = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`refine:${baseImage.generationId}`}))`,
    );

    const [capRow] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(schema.images)
      .where(
        and(
          eq(schema.images.generationId, baseImage.generationId),
          isNotNull(schema.images.parentImageId),
        ),
      );
    if (Number(capRow?.count ?? 0) >= refinesMax) {
      throw new Error(
        `You've used all ${refinesMax} refines on this shoot. Start a new shoot to keep editing.`,
      );
    }

    const [stepRow] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(schema.refinementHistory)
      .where(eq(schema.refinementHistory.rootImageId, rootImageId));
    const nextStep = Number(stepRow?.count ?? 0) + 1;

    const [img] = await tx
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

    await tx.insert(schema.refinementHistory).values({
      rootImageId,
      stepIndex: nextStep,
      instruction: parsed.instruction,
      resultImageId: img.id,
    });

    return img;
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

  const refinesUsed = images.filter((i) => i.parentImageId !== null).length;
  const refinesMax = refineCapFor(generation.packTier);

  return {
    image,
    generation: generation ?? null,
    timeline,
    refinesUsed,
    refinesMax,
  };
}
