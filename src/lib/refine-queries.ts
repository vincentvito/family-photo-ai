import { db, schema } from "@/lib/db";
import { and, eq, asc, isNotNull, sql } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { z } from "zod";
import { saveGeneratedImage } from "@/lib/storage";
import { studioCutoffDate } from "@/lib/retention";
import { REFINE_CAP, LEGACY_REFINE_CAP, type PackTier } from "@/lib/pricing-packs";
import type { AspectRatio, Subject } from "@/lib/providers/types";
import {
  buildReferenceUrls,
  createSinglePrediction,
  fetchPredictionImage,
  reconcilePrediction,
  type PredictionSlot,
} from "@/lib/replicate/generate";
import {
  GENERATION_MODEL_IDS,
  MODEL_CATALOG,
  isAspectSupported,
  type GenerationModelId,
} from "@/lib/replicate/models";
import { shouldUseMockProviderFallback } from "@/lib/runtime-flags";

const REGENERATION_TIMEOUT_MS = 270_000;

type RegeneratedImage = {
  buffer: Buffer;
  mimeType: "image/jpeg" | "image/png";
  width?: number;
  height?: number;
  predictionId?: string;
};

function refineCapFor(packTier: string | null): number {
  if (!packTier) return LEGACY_REFINE_CAP;
  return REFINE_CAP[packTier as PackTier] ?? LEGACY_REFINE_CAP;
}

async function countImageRefines(generationId: string, rootImageId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`count(*)` })
    .from(schema.images)
    .where(
      and(
        eq(schema.images.generationId, generationId),
        eq(schema.images.rootImageId, rootImageId),
        isNotNull(schema.images.parentImageId),
      ),
    );
  return Number(row?.total ?? 0);
}

const RefineInput = z.object({
  imageId: z.string().min(1),
  instruction: z.string().trim().min(2).max(400),
});

function isAspectRatio(value: string | null): value is AspectRatio {
  return value === "1:1" || value === "3:2" || value === "2:3";
}

function parseSubjects(raw: string): Subject[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Subject[]) : [];
  } catch {
    return [];
  }
}

function parsePredictionSlots(raw: string | null): PredictionSlot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry): PredictionSlot[] => {
      if (typeof entry === "string") return [{ id: entry, retries: 0 }];
      if (entry && typeof entry === "object" && typeof entry.id === "string") {
        return [
          {
            id: entry.id,
            retries: typeof entry.retries === "number" ? entry.retries : 0,
            ...(typeof entry.variationPrompt === "string"
              ? { variationPrompt: entry.variationPrompt }
              : {}),
          },
        ];
      }
      return [];
    });
  } catch {
    return [];
  }
}

function resolveModelId(model: string): GenerationModelId {
  return GENERATION_MODEL_IDS.includes(model as GenerationModelId)
    ? (model as GenerationModelId)
    : "gpt-image-2";
}

function resolveOriginalSlot(
  generation: typeof schema.generations.$inferSelect,
  rootImage: typeof schema.images.$inferSelect,
) {
  const slots = parsePredictionSlots(generation.replicatePredictionIds);
  const slotIndex = rootImage.replicatePredictionId
    ? slots.findIndex((slot) => slot.id === rootImage.replicatePredictionId)
    : -1;

  return {
    variantIndex: slotIndex >= 0 ? slotIndex : 0,
    originalVariationPrompt: slotIndex >= 0 ? slots[slotIndex].variationPrompt : undefined,
  };
}

function buildRegenerationGuidance({
  instruction,
  history,
  originalVariationPrompt,
}: {
  instruction: string;
  history: { instruction: string }[];
  originalVariationPrompt?: string;
}) {
  const notes = [...history.map((step) => step.instruction), instruction];
  const historyLines = notes.map((note, index) => `  ${index + 1}. ${note}`).join("\n");

  return [
    originalVariationPrompt
      ? `Original selected-image variation to keep: ${originalVariationPrompt}`
      : "Keep the same composition family as the selected original image.",
    "Regenerate from the original shoot prompt and the original reference roster. Do not edit or copy pixels from a previous output image; create a fresh high-quality image from the references.",
    "Apply this art-direction guidance, oldest to newest, with the latest note taking priority:",
    historyLines,
    "Preserve the selected cast identities, theme, aspect ratio, card text, setting, lighting, wardrobe and overall mood unless the guidance explicitly asks to change one of them.",
  ].join("\n");
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForPredictionImage(predictionId: string): Promise<RegeneratedImage> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < REGENERATION_TIMEOUT_MS) {
    const result = await reconcilePrediction(predictionId);
    if (result.status === "succeeded") {
      return fetchPredictionImage(result.outputUrl);
    }
    if (result.status === "failed" || result.status === "canceled") {
      throw new Error(result.error);
    }
    await wait(1800);
  }
  throw new Error("Regeneration is still running. Try again in a moment.");
}

async function runMockRegeneration(args: {
  generation: typeof schema.generations.$inferSelect;
  subjects: Subject[];
  aspectRatio: AspectRatio;
  instruction: string;
}): Promise<RegeneratedImage> {
  const { MockProvider } = await import("@/lib/providers/mock");
  const mock = new MockProvider();
  const result = await mock.generatePortrait({
    themeId: args.generation.themeId,
    themeBlurb: `Regenerated with guidance: ${args.instruction}`,
    prompt: args.generation.prompt,
    aspectRatio: args.aspectRatio,
    subjects: args.subjects,
    wardrobeNote: args.generation.wardrobeNote,
    cardText: args.generation.cardText,
    generationId: `${args.generation.id}:${args.instruction}:${Date.now()}`,
    seedImagePath: null,
    locationReferencePath: args.generation.locationReferencePath,
  });
  const [image] = result.images;
  if (!image) throw new Error("Regeneration returned no image");
  return image;
}

async function runRegeneration(args: {
  generation: typeof schema.generations.$inferSelect;
  subjects: Subject[];
  aspectRatio: AspectRatio;
  instruction: string;
  history: { instruction: string }[];
  originalVariationPrompt?: string;
  variantIndex: number;
}): Promise<RegeneratedImage> {
  if (shouldUseMockProviderFallback()) {
    return runMockRegeneration({
      generation: args.generation,
      subjects: args.subjects,
      aspectRatio: args.aspectRatio,
      instruction: args.instruction,
    });
  }

  const modelId = resolveModelId(args.generation.model);
  if (!isAspectSupported(modelId, args.aspectRatio)) {
    const supported = MODEL_CATALOG[modelId].supportedAspectRatios.join(", ");
    throw new Error(
      `${MODEL_CATALOG[modelId].label} doesn't support ${args.aspectRatio} - pick one of ${supported}.`,
    );
  }

  const imageUrls = buildReferenceUrls(args.subjects, args.generation.locationReferencePath);
  const variationPrompt = buildRegenerationGuidance({
    instruction: args.instruction,
    history: args.history,
    originalVariationPrompt: args.originalVariationPrompt,
  });

  const predictionId = await createSinglePrediction({
    modelId,
    basePrompt: args.generation.prompt,
    variantIndex: args.variantIndex,
    aspectRatio: args.aspectRatio,
    variationPrompt,
    imageUrls,
  });
  const image = await waitForPredictionImage(predictionId);
  return { ...image, predictionId };
}

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
  if (generation.createdAt < studioCutoffDate(new Date(), generation.packTier)) {
    throw new Error("This shoot has expired.");
  }
  const [usage] = await db
    .select({ id: schema.creditUsages.id })
    .from(schema.creditUsages)
    .where(eq(schema.creditUsages.generationId, generation.id))
    .limit(1);
  if (generation.freePreview && !usage) {
    throw new Error("Unlock this free preview before regenerating.");
  }

  const rootImageId = baseImage.rootImageId ?? baseImage.id;
  const [rootImage] = await db
    .select()
    .from(schema.images)
    .where(and(eq(schema.images.id, rootImageId), eq(schema.images.generationId, generation.id)))
    .limit(1);

  const refinesUsed = await countImageRefines(generation.id, rootImageId);
  const refinesMax = refineCapFor(generation.packTier);
  if (refinesUsed >= refinesMax) {
    throw new Error(
      `You've used all ${refinesMax} regenerations for this image. Choose another image or start a new shoot to keep going.`,
    );
  }

  const historyRows = await db
    .select({
      instruction: schema.refinementHistory.instruction,
      resultImageId: schema.refinementHistory.resultImageId,
      stepIndex: schema.refinementHistory.stepIndex,
    })
    .from(schema.refinementHistory)
    .where(eq(schema.refinementHistory.rootImageId, rootImageId))
    .orderBy(asc(schema.refinementHistory.stepIndex));

  const subjects = parseSubjects(generation.subjectSnapshot);
  if (subjects.length === 0) {
    throw new Error("This shoot is missing its original roster snapshot.");
  }
  const aspectRatio = isAspectRatio(generation.aspectRatio)
    ? generation.aspectRatio
    : isAspectRatio(baseImage.aspectRatio)
      ? baseImage.aspectRatio
      : "3:2";
  const sourceRoot = rootImage ?? baseImage;
  const originalSlot = resolveOriginalSlot(generation, sourceRoot);
  const regenerated = await runRegeneration({
    generation,
    subjects,
    aspectRatio,
    instruction: parsed.instruction,
    history: historyRows,
    originalVariationPrompt: originalSlot.originalVariationPrompt,
    variantIndex: originalSlot.variantIndex,
  });

  if (!regenerated) throw new Error("Regeneration returned no image");

  const saved = await saveGeneratedImage(
    regenerated.buffer,
    baseImage.generationId,
    regenerated.mimeType === "image/png" ? "png" : "jpg",
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
          eq(schema.images.rootImageId, rootImageId),
          isNotNull(schema.images.parentImageId),
        ),
      );
    if (Number(capRow?.count ?? 0) >= refinesMax) {
      throw new Error(
        `You've used all ${refinesMax} regenerations for this image. Choose another image or start a new shoot to keep going.`,
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
        width: regenerated.width ?? saved.width,
        height: regenerated.height ?? saved.height,
        aspectRatio: baseImage.aspectRatio,
        parentImageId: baseImage.id,
        rootImageId,
        refineInstruction: parsed.instruction,
        replicatePredictionId: regenerated.predictionId ?? null,
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
  revalidatePath(`/studio/generate/${generation.id}`);
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
  if (!generation || generation.createdAt < studioCutoffDate(new Date(), generation.packTier)) {
    return null;
  }

  const timeline: { imageId: string; instruction: string | null }[] = [];
  const rootCandidate =
    images.find((i) => i.id === rootImageId) ??
    images.find((i) => i.rootImageId === null && i.parentImageId === null) ??
    image;
  timeline.push({ imageId: rootCandidate.id, instruction: null });
  for (const h of history) {
    timeline.push({ imageId: h.resultImageId, instruction: h.instruction });
  }

  const refinesUsed = images.filter(
    (i) => i.parentImageId !== null && i.rootImageId === rootImageId,
  ).length;
  const refinesMax = refineCapFor(generation.packTier);

  return {
    image,
    generation: generation ?? null,
    timeline,
    refinesUsed,
    refinesMax,
  };
}
