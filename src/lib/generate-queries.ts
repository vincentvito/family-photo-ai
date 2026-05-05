import path from "node:path";
import { db, schema } from "@/lib/db";
import { eq, asc, inArray, sql } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { z } from "zod";
import { saveGeneratedImage } from "@/lib/storage";
import { buildCustomTheme, getTheme } from "@/lib/themes";
import type { Theme } from "@/lib/themes";
import { buildGenerationPrompt } from "@/lib/prompts";
import type { AspectRatio, Subject } from "@/lib/providers/types";
import {
  buildReferenceUrls,
  createGenerationPredictions,
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
import { getDefaultModel } from "@/lib/admin-queries";
import { isAdmin } from "@/lib/auth-helpers";
import { studioCutoffDate } from "@/lib/retention";

const AspectSchema = z.enum(["1:1", "4:5", "3:2", "2:3", "16:9"]);

const CustomVibeSchema = z.object({
  description: z.string().trim().min(4).max(800),
  aspectRatio: AspectSchema,
});

const ModelIdSchema = z.enum(GENERATION_MODEL_IDS as [GenerationModelId, ...GenerationModelId[]]);

async function markGenerationErrorAndRefundCredit(generationId: string, errorMessage: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(schema.generations)
      .set({
        status: "error",
        errorMessage,
      })
      .where(eq(schema.generations.id, generationId));

    await tx.delete(schema.creditUsages).where(eq(schema.creditUsages.generationId, generationId));
  });
}

const StartGenerationInput = z
  .object({
    themeId: z.string().min(1).optional(),
    customVibe: CustomVibeSchema.optional(),
    wardrobeNote: z.string().trim().max(240).nullable().optional(),
    cardText: z.string().trim().max(120).nullable().optional(),
    locationReferencePath: z.string().trim().min(1).nullable().optional(),
    /** Canned-theme shape override. Ignored when customVibe is set. */
    aspectOverride: AspectSchema.nullable().optional(),
    /** Admin-only override of the runtime default model. Non-admins are ignored. */
    modelId: ModelIdSchema.optional(),
  })
  .refine((v) => !!v.themeId || !!v.customVibe, "Pick a vibe or describe your own.");

const VARIANT_COUNT = 4;
const MAX_RETRIES_PER_SLOT = 1;

function isMockMode() {
  return process.env.NEXT_PUBLIC_MOCK_MODE === "1" || process.env.MOCK_MODE === "1";
}

export async function startGeneration(
  input: z.infer<typeof StartGenerationInput>,
  actor: { userId: string },
) {
  const parsed = StartGenerationInput.parse(input);
  const admin = await isAdmin();
  const spendCredit = true;

  let theme: Theme = parsed.customVibe
    ? buildCustomTheme({
        description: parsed.customVibe.description,
        aspectRatio: parsed.customVibe.aspectRatio,
      })
    : getTheme(parsed.themeId!);

  if (!parsed.customVibe && parsed.aspectOverride) {
    theme = { ...theme, aspectRatio: parsed.aspectOverride };
  }

  const roster = await loadRosterAsSubjects();
  if (roster.length === 0) {
    throw new Error("Your roster is empty. Add at least one person with a reference photo.");
  }
  const missingReferences = roster.filter((subject) => subject.referencePaths.length === 0);
  if (missingReferences.length > 0) {
    throw new Error(
      `Add one reference photo for ${missingReferences.map((subject) => subject.name).join(", ")} before starting the shoot.`,
    );
  }

  const prompt = buildGenerationPrompt(theme, roster, parsed.wardrobeNote, parsed.cardText ?? null);

  const modelId = await resolveModelId(parsed.modelId, admin);
  if (!isAspectSupported(modelId, theme.aspectRatio)) {
    const supported = MODEL_CATALOG[modelId].supportedAspectRatios.join(", ");
    throw new Error(
      `${MODEL_CATALOG[modelId].label} doesn't support ${theme.aspectRatio} — pick one of ${supported}.`,
    );
  }

  if (isMockMode()) {
    return startMockGeneration({
      theme,
      prompt,
      roster,
      input: parsed,
      actor,
      modelId,
      spendCredit,
    });
  }

  const generation = await createGenerationRecord({
    values: {
      themeId: theme.id,
      prompt,
      providerId: modelId,
      status: "pending",
      subjectSnapshot: JSON.stringify(roster),
      wardrobeNote: parsed.wardrobeNote ?? null,
      cardText: parsed.cardText ?? null,
      aspectRatio: theme.aspectRatio,
      locationReferencePath: parsed.locationReferencePath ?? null,
      customVibeDescription: parsed.customVibe?.description ?? null,
      model: modelId,
    },
    userId: actor.userId,
    spendCredit,
  });

  const { slots } = await createGenerationPredictions({
    prompt,
    aspectRatio: theme.aspectRatio,
    subjects: roster,
    locationReferencePath: parsed.locationReferencePath ?? null,
    variants: VARIANT_COUNT,
    modelId,
  }).catch(async (err) => {
    await markGenerationErrorAndRefundCredit(
      generation.id,
      err instanceof Error ? err.message : "Failed to start predictions",
    );
    throw err;
  });

  await db
    .update(schema.generations)
    .set({ replicatePredictionIds: JSON.stringify(slots) })
    .where(eq(schema.generations.id, generation.id));

  return { generationId: generation.id };
}

/**
 * Pick the model for this shoot. Admins may override per-shoot via the input;
 * everyone else falls back to the admin-configured default.
 */
async function resolveModelId(
  requested: GenerationModelId | undefined,
  admin: boolean,
): Promise<GenerationModelId> {
  if (requested && admin) return requested;
  return getDefaultModel();
}

export async function getGenerationState(generationId: string) {
  const [generation] = await db
    .select()
    .from(schema.generations)
    .where(eq(schema.generations.id, generationId))
    .limit(1);

  if (!generation) return null;
  if (generation.createdAt < studioCutoffDate()) return null;

  if (generation.status === "pending") {
    await reconcileGeneration(generation);
  }

  const [[refreshed], images] = await Promise.all([
    db.select().from(schema.generations).where(eq(schema.generations.id, generationId)).limit(1),
    db
      .select()
      .from(schema.images)
      .where(eq(schema.images.generationId, generationId))
      .orderBy(asc(schema.images.createdAt)),
  ]);

  return { generation: refreshed ?? generation, images };
}

/**
 * Walk every slot tied to this generation, fetch its current Replicate state,
 * and persist new images / retry failures. Idempotent: the unique
 * replicate_prediction_id index guards against double-inserts when polling
 * races with itself. Failed slots get one auto-retry before being marked
 * permanently failed.
 */
async function reconcileGeneration(generation: typeof schema.generations.$inferSelect) {
  const slots = parseSlots(generation.replicatePredictionIds);
  if (slots.length === 0) return;

  const predictionIds = slots.map((s) => s.id);
  const existing = await db
    .select({ predictionId: schema.images.replicatePredictionId })
    .from(schema.images)
    .where(
      predictionIds.length > 0
        ? inArray(schema.images.replicatePredictionId, predictionIds)
        : undefined,
    );
  const completed = new Set(existing.map((e) => e.predictionId).filter(Boolean) as string[]);

  let mutatedSlots = false;
  let completedNow = 0;
  const finalErrors: string[] = [];

  await Promise.all(
    slots.map(async (slot, slotIndex) => {
      if (completed.has(slot.id)) return;
      try {
        const result = await reconcilePrediction(slot.id);

        if (result.status === "succeeded") {
          const { buffer, mimeType } = await fetchPredictionImage(result.outputUrl);
          const saved = await saveGeneratedImage(
            buffer,
            generation.id,
            mimeType === "image/png" ? "png" : "jpg",
          );
          await db
            .insert(schema.images)
            .values({
              generationId: generation.id,
              fileName: saved.fileName,
              width: saved.width,
              height: saved.height,
              aspectRatio: generation.aspectRatio ?? "3:2",
              replicatePredictionId: slot.id,
            })
            .onConflictDoNothing({ target: schema.images.replicatePredictionId });
          completedNow += 1;
          return;
        }

        if (result.status === "failed" || result.status === "canceled") {
          if (slot.retries < MAX_RETRIES_PER_SLOT) {
            const newId = await retrySlot(generation, slotIndex, slots.length);
            slots[slotIndex] = { id: newId, retries: slot.retries + 1 };
            mutatedSlots = true;
          } else {
            finalErrors.push(result.error);
          }
        }
        // status === "starting" | "processing": leave for next poll
      } catch (err) {
        // Network / R2 / db errors don't burn the retry budget — try again next poll.
        console.warn(`reconcileGeneration: slot ${slot.id} threw, will retry next poll`, err);
      }
    }),
  );

  if (mutatedSlots) {
    await db
      .update(schema.generations)
      .set({ replicatePredictionIds: JSON.stringify(slots) })
      .where(eq(schema.generations.id, generation.id));
  }

  const succeededTotal = completed.size + completedNow;
  const settled = succeededTotal + finalErrors.length;
  if (settled >= slots.length) {
    if (succeededTotal > 0) {
      await db
        .update(schema.generations)
        .set({ status: "done" })
        .where(eq(schema.generations.id, generation.id));
    } else {
      await markGenerationErrorAndRefundCredit(generation.id, finalErrors[0] ?? "All variants failed");
    }
    revalidatePath(`/studio/generate/${generation.id}`);
  } else if (completedNow > 0 || mutatedSlots) {
    revalidatePath(`/studio/generate/${generation.id}`);
  }
}

async function retrySlot(
  generation: typeof schema.generations.$inferSelect,
  slotIndex: number,
  totalSlots: number,
): Promise<string> {
  const subjects = JSON.parse(generation.subjectSnapshot) as Subject[];
  const imageUrls = buildReferenceUrls(subjects, generation.locationReferencePath);
  const modelId = (
    GENERATION_MODEL_IDS.includes(generation.model as GenerationModelId)
      ? generation.model
      : "nanobanana"
  ) as GenerationModelId;
  return createSinglePrediction({
    modelId,
    basePrompt: generation.prompt,
    variantIndex: slotIndex,
    totalVariants: totalSlots,
    aspectRatio: (generation.aspectRatio ?? "3:2") as AspectRatio,
    imageUrls,
  });
}

/**
 * Parse the slots column. Accepts both new-shape `{id, retries}[]` and the
 * legacy `string[]` shape from earlier test runs (treated as retries=0).
 */
function parseSlots(raw: string | null): PredictionSlot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry): PredictionSlot[] => {
      if (typeof entry === "string") return [{ id: entry, retries: 0 }];
      if (entry && typeof entry === "object" && typeof entry.id === "string") {
        return [{ id: entry.id, retries: typeof entry.retries === "number" ? entry.retries : 0 }];
      }
      return [];
    });
  } catch {
    return [];
  }
}

async function startMockGeneration({
  theme,
  prompt,
  roster,
  input,
  actor,
  modelId,
  spendCredit,
}: {
  theme: Theme;
  prompt: string;
  roster: Subject[];
  input: z.infer<typeof StartGenerationInput>;
  actor: { userId: string };
  modelId: GenerationModelId;
  spendCredit: boolean;
}) {
  const { MockProvider } = await import("@/lib/providers/mock");
  const mock = new MockProvider();

  const generation = await createGenerationRecord({
    values: {
      themeId: theme.id,
      prompt,
      providerId: "mock",
      status: "pending",
      subjectSnapshot: JSON.stringify(roster),
      wardrobeNote: input.wardrobeNote ?? null,
      cardText: input.cardText ?? null,
      aspectRatio: theme.aspectRatio,
      locationReferencePath: input.locationReferencePath ?? null,
      customVibeDescription: input.customVibe?.description ?? null,
      model: modelId,
    },
    userId: actor.userId,
    spendCredit,
  });

  try {
    const result = await mock.generatePortrait({
      themeId: theme.id,
      themeBlurb: theme.blurb,
      prompt,
      aspectRatio: theme.aspectRatio,
      subjects: roster,
      wardrobeNote: input.wardrobeNote,
      cardText: input.cardText,
      generationId: generation.id,
      seedImagePath: null,
      locationReferencePath: input.locationReferencePath ?? null,
    });

    for (const img of result.images) {
      const saved = await saveGeneratedImage(
        img.buffer,
        generation.id,
        img.mimeType === "image/png" ? "png" : "jpg",
      );
      await db.insert(schema.images).values({
        generationId: generation.id,
        fileName: saved.fileName,
        width: img.width ?? saved.width,
        height: img.height ?? saved.height,
        aspectRatio: theme.aspectRatio,
      });
    }

    await db
      .update(schema.generations)
      .set({ status: "done" })
      .where(eq(schema.generations.id, generation.id));
  } catch (err) {
    await markGenerationErrorAndRefundCredit(
      generation.id,
      err instanceof Error ? err.message : "Mock generation failed",
    );
    throw err;
  }

  return { generationId: generation.id };
}

async function createGenerationRecord({
  values,
  userId,
  spendCredit,
}: {
  values: typeof schema.generations.$inferInsert;
  userId: string;
  spendCredit: boolean;
}) {
  return db.transaction(async (tx) => {
    if (spendCredit) {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);
      const [purchaseRow] = await tx
        .select({
          total: sql<number>`coalesce(sum(${schema.creditTransactions.credits}), 0)`,
        })
        .from(schema.creditTransactions)
        .where(
          sql`${schema.creditTransactions.userId} = ${userId} and ${schema.creditTransactions.status} = 'completed'`,
        );
      const [usageRow] = await tx
        .select({
          total: sql<number>`coalesce(sum(${schema.creditUsages.credits}), 0)`,
        })
        .from(schema.creditUsages)
        .where(eq(schema.creditUsages.userId, userId));
      const [grantRow] = await tx
        .select({
          total: sql<number>`coalesce(sum(${schema.creditGrants.credits}), 0)`,
        })
        .from(schema.creditGrants)
        .where(eq(schema.creditGrants.userId, userId));

      const balance =
        Number(purchaseRow?.total ?? 0) +
        Number(grantRow?.total ?? 0) -
        Number(usageRow?.total ?? 0);
      if (balance < 1) {
        throw new Error("Buy a photo pack before starting a shoot.");
      }
    }

    const [generation] = await tx.insert(schema.generations).values(values).returning();

    if (spendCredit) {
      await tx.insert(schema.creditUsages).values({
        userId,
        generationId: generation.id,
        credits: 1,
      });
    }

    return generation;
  });
}

async function loadRosterAsSubjects(): Promise<Subject[]> {
  const [people, photos] = await Promise.all([
    db.select().from(schema.people).orderBy(asc(schema.people.createdAt)),
    db.select().from(schema.photos).orderBy(asc(schema.photos.createdAt)),
  ]);
  const photoByPerson = new Map<string, (typeof photos)[number]>();

  for (const photo of photos) {
    photoByPerson.set(photo.personId, photo);
  }

  return people.map((person) => {
    const photo = photoByPerson.get(person.id);
    return {
      personId: person.id,
      name: person.name,
      role: person.role,
      notes: person.notes,
      referencePaths: photo ? [path.posix.join("uploads", person.id, photo.fileName)] : [],
    };
  });
}
