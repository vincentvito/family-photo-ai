import path from "node:path";
import { db, schema } from "@/lib/db";
import { and, eq, asc, inArray, sql } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { z } from "zod";
import { saveGeneratedImage } from "@/lib/storage";
import { buildCustomTheme, getTheme } from "@/lib/themes";
import type { Theme } from "@/lib/themes";
import { getThemeVariationPrompts } from "@/lib/theme-variations";
import { buildGenerationPrompt } from "@/lib/prompts";
import {
  CARD_ART_STYLE_IDS,
  CARD_STYLE_SLOT_COUNT,
  DEFAULT_CARD_ART_STYLE_ID,
  buildCardArtStyleDirective,
  getCardArtStyle,
  resolveCardArtStyleSelections,
  type CardArtStyleId,
} from "@/lib/card-art-styles";
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
import { packIdToTier, type PackTier } from "@/lib/pricing-packs";

const AspectSchema = z.enum(["1:1", "3:2", "2:3"]);
const VARIANT_COUNT = 4;
const MAX_RETRIES_PER_SLOT = 1;

const CustomVibeSchema = z.object({
  description: z.string().trim().min(4).max(800),
  aspectRatio: AspectSchema,
});

const ModelIdSchema = z.enum(GENERATION_MODEL_IDS as [GenerationModelId, ...GenerationModelId[]]);
const OutputTypeSchema = z.enum(["photoshoot", "card"]);
const CardArtStyleIdSchema = z.enum([...CARD_ART_STYLE_IDS] as [
  CardArtStyleId,
  ...CardArtStyleId[],
]);
const CardSlotStyleSchema = z.union([CardArtStyleIdSchema, z.literal("default")]);

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
    outputType: OutputTypeSchema.optional(),
    wardrobeNote: z.string().trim().max(240).nullable().optional(),
    cardText: z.string().trim().max(120).nullable().optional(),
    locationReferencePath: z.string().trim().min(1).nullable().optional(),
    /** Canned-theme shape override. Ignored when customVibe is set. */
    aspectOverride: AspectSchema.nullable().optional(),
    /** Admin-only override of the runtime default model. Non-admins are ignored. */
    modelId: ModelIdSchema.optional(),
    /** Optional per-shoot roster filter. When omitted, the full roster is used. */
    subjectIds: z.array(z.string().min(1)).min(1).optional(),
    /** Card-only art treatment: one default plus optional per-output overrides. */
    cardArtStyles: z
      .object({
        defaultStyleId: CardArtStyleIdSchema.default(DEFAULT_CARD_ART_STYLE_ID),
        slotStyleIds: z.array(CardSlotStyleSchema).length(CARD_STYLE_SLOT_COUNT).optional(),
      })
      .optional(),
  })
  .refine((v) => !!v.themeId || !!v.customVibe, "Pick a vibe or describe your own.");

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
  const outputType = parsed.outputType ?? (theme.category === "card" ? "card" : "photoshoot");
  if (outputType === "card" && (parsed.customVibe || theme.category !== "card")) {
    throw new Error("Choose a card layout to create a card.");
  }
  if (outputType === "photoshoot" && theme.category === "card") {
    throw new Error("Choose card output before using a card layout.");
  }

  const roster = await loadRosterAsSubjects(actor.userId, parsed.subjectIds);
  if (roster.length === 0) {
    if (parsed.subjectIds && parsed.subjectIds.length > 0) {
      throw new Error("Pick at least one person or pet with a reference photo.");
    }
    throw new Error("Your roster is empty. Add at least one person with a reference photo.");
  }
  const withReference = roster.filter((subject) => subject.referencePaths.length > 0);
  if (withReference.length === 0) {
    throw new Error("Pick at least one person or pet with a reference photo.");
  }
  const missingReferences = roster.filter((subject) => subject.referencePaths.length === 0);
  if (missingReferences.length > 0 && !parsed.subjectIds) {
    throw new Error(
      `Add one reference photo for ${missingReferences.map((subject) => subject.name).join(", ")} before starting the shoot.`,
    );
  }
  // When the user picked subjects explicitly, silently drop those without a
  // reference photo rather than blocking the shoot — the selector already
  // surfaces missing-reference state to them.
  const effectiveRoster = parsed.subjectIds ? withReference : roster;

  const prompt = buildGenerationPrompt(
    theme,
    effectiveRoster,
    parsed.wardrobeNote,
    parsed.cardText ?? null,
  );
  const variationPrompts = buildLaunchVariationPrompts({
    theme,
    cardArtStyleIds:
      outputType === "card"
        ? resolveCardArtStyleSelections(
            parsed.cardArtStyles?.defaultStyleId ?? DEFAULT_CARD_ART_STYLE_ID,
            parsed.cardArtStyles?.slotStyleIds,
            VARIANT_COUNT,
          )
        : null,
  });

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
      roster: effectiveRoster,
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
      userId: actor.userId,
      status: "pending",
      subjectSnapshot: JSON.stringify(effectiveRoster),
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
    subjects: effectiveRoster,
    locationReferencePath: parsed.locationReferencePath ?? null,
    variants: VARIANT_COUNT,
    variationPrompts,
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

function buildLaunchVariationPrompts({
  theme,
  cardArtStyleIds,
}: {
  theme: Theme;
  cardArtStyleIds: readonly CardArtStyleId[] | null;
}): string[] {
  const baseVariations = getThemeVariationPrompts(theme.id, theme.category);
  if (!cardArtStyleIds) return [...baseVariations];

  return Array.from({ length: VARIANT_COUNT }, (_, index) => {
    const style = getCardArtStyle(cardArtStyleIds[index] ?? DEFAULT_CARD_ART_STYLE_ID);
    return buildCardVariationPrompt({
      slotIndex: index,
      layoutPrompt: baseVariations[index % baseVariations.length],
      styleDirective: buildCardArtStyleDirective(style),
    });
  });
}

function buildCardVariationPrompt({
  slotIndex,
  layoutPrompt,
  styleDirective,
}: {
  slotIndex: number;
  layoutPrompt: string;
  styleDirective: string;
}) {
  const slotCommands = [
    "Slot 1 composition: make a close portrait card. Subject occupies the lower-left or lower-center area, face prominent, greeting text in a large clean upper area.",
    "Slot 2 composition: make a standing or walking card. Show more body and garden environment, different pose from slot 1, greeting text on the opposite side.",
    "Slot 3 composition: make a seated or leaning card. Use bench, railing, doorway or foreground flowers as structure, different crop and prop placement from slots 1 and 2.",
    "Slot 4 composition: make a wide environmental card. Subject is smaller in the lower third, more occasion setting is visible, large calm negative space for the greeting.",
  ];

  return [
    slotCommands[slotIndex] ?? slotCommands[0],
    `Theme-specific layout: ${layoutPrompt}`,
    styleDirective,
    "This slot must not reuse the same pose, crop, prop placement or subject scale as the other card slots.",
  ].join(" ");
}

export async function getGenerationState(generationId: string, userId: string) {
  const [generation] = await db
    .select()
    .from(schema.generations)
    .where(and(eq(schema.generations.id, generationId), eq(schema.generations.userId, userId)))
    .limit(1);

  if (!generation) return null;
  if (generation.createdAt < studioCutoffDate()) return null;

  if (generation.status === "pending") {
    await reconcileGeneration(generation);
  }

  const [[refreshed], images] = await Promise.all([
    db
      .select()
      .from(schema.generations)
      .where(and(eq(schema.generations.id, generationId), eq(schema.generations.userId, userId)))
      .limit(1),
    db
      .select()
      .from(schema.images)
      .where(eq(schema.images.generationId, generationId))
      .orderBy(asc(schema.images.createdAt)),
  ]);

  return { generation: refreshed ?? generation, images: pickChainHeads(images) };
}

/**
 * Collapse refinement chains to their latest version. Each original variant
 * (`parentImageId === null`) becomes one slot in the returned list, occupied
 * by the most recent descendant in its chain. Order matches the originals'
 * createdAt so slot positions stay stable across refines.
 */
function pickChainHeads(images: schema.Image[]): schema.Image[] {
  const headByRoot = new Map<string, schema.Image>();
  const originalOrder = new Map<string, number>();
  for (const img of images) {
    if (img.parentImageId === null) originalOrder.set(img.id, img.createdAt.getTime());
    const key = img.rootImageId ?? img.id;
    const existing = headByRoot.get(key);
    if (!existing || existing.createdAt < img.createdAt) headByRoot.set(key, img);
  }
  return Array.from(headByRoot.values()).sort((a, b) => {
    const aRoot = a.rootImageId ?? a.id;
    const bRoot = b.rootImageId ?? b.id;
    return (originalOrder.get(aRoot) ?? 0) - (originalOrder.get(bRoot) ?? 0);
  });
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
            const newId = await retrySlot(generation, slotIndex, slots.length, slot);
            slots[slotIndex] = { ...slot, id: newId, retries: slot.retries + 1 };
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
      await markGenerationErrorAndRefundCredit(
        generation.id,
        finalErrors[0] ?? "All variants failed",
      );
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
  slot: PredictionSlot,
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
    variationPrompt: slot.variationPrompt,
    variationPrompts: getRetryVariationPrompts(generation.themeId),
    subjects,
    imageUrls,
  });
}

function getRetryVariationPrompts(themeId: string) {
  try {
    const theme = getTheme(themeId);
    return getThemeVariationPrompts(theme.id, theme.category);
  } catch {
    return undefined;
  }
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
        const slot: PredictionSlot = {
          id: entry.id,
          retries: typeof entry.retries === "number" ? entry.retries : 0,
        };
        if (typeof entry.variationPrompt === "string") {
          slot.variationPrompt = entry.variationPrompt;
        }
        return [slot];
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
      userId: actor.userId,
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
    let packTier: PackTier | null = null;
    if (spendCredit) {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);
      packTier = await resolvePackTierForNextCredit(tx, userId);
    }

    const [generation] = await tx
      .insert(schema.generations)
      .values({ ...values, packTier })
      .returning();

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

/**
 * FIFO-walk the user's purchases and grants in chronological order to
 * determine which bucket the next credit will be drawn from. Throws if the
 * user has no remaining balance. Grants default to "three" tier — admins
 * granting credits don't pick a tier, so we land in the middle.
 */
async function resolvePackTierForNextCredit(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
): Promise<PackTier> {
  const [usageRow] = await tx
    .select({
      total: sql<number>`coalesce(sum(${schema.creditUsages.credits}), 0)`,
    })
    .from(schema.creditUsages)
    .where(eq(schema.creditUsages.userId, userId));
  const used = Number(usageRow?.total ?? 0);

  const [purchases, grants] = await Promise.all([
    tx
      .select({
        packId: schema.creditTransactions.packId,
        credits: schema.creditTransactions.credits,
        createdAt: schema.creditTransactions.createdAt,
      })
      .from(schema.creditTransactions)
      .where(
        sql`${schema.creditTransactions.userId} = ${userId} and ${schema.creditTransactions.status} = 'completed'`,
      ),
    tx
      .select({
        credits: schema.creditGrants.credits,
        createdAt: schema.creditGrants.createdAt,
      })
      .from(schema.creditGrants)
      .where(eq(schema.creditGrants.userId, userId)),
  ]);

  const buckets: { tier: PackTier; credits: number; createdAt: Date }[] = [
    ...purchases.map((p) => ({
      tier: packIdToTier(p.packId),
      credits: p.credits,
      createdAt: p.createdAt,
    })),
    ...grants.map((g) => ({
      tier: "three" as const,
      credits: g.credits,
      createdAt: g.createdAt,
    })),
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const nextIndex = used + 1;
  let allocated = 0;
  for (const b of buckets) {
    allocated += b.credits;
    if (nextIndex <= allocated) return b.tier;
  }
  throw new Error("Buy a photo pack before starting a shoot.");
}

async function loadRosterAsSubjects(userId: string, subjectIds?: string[]): Promise<Subject[]> {
  const filter =
    subjectIds && subjectIds.length > 0
      ? and(eq(schema.people.userId, userId), inArray(schema.people.id, subjectIds))
      : eq(schema.people.userId, userId);
  const people = await db
    .select()
    .from(schema.people)
    .where(filter)
    .orderBy(asc(schema.people.createdAt));
  const personIds = people.map((person) => person.id);
  const photos =
    personIds.length > 0
      ? await db
          .select()
          .from(schema.photos)
          .where(inArray(schema.photos.personId, personIds))
          .orderBy(asc(schema.photos.createdAt))
      : [];
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
