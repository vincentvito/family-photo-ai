import path from "node:path";
import { db, schema } from "@/lib/db";
import { and, eq, asc, inArray, ne, sql } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { z } from "zod";
import { saveGeneratedImage } from "@/lib/storage";
import { THEMES, buildCustomTheme, getTheme, withAspectRatioOverride } from "@/lib/themes";
import type { Theme } from "@/lib/themes";
import { getThemeVariationPrompts } from "@/lib/theme-variations";
import { buildVibeSelectionPlan } from "@/lib/vibe-selection-plan";
import { buildGenerationPrompt } from "@/lib/prompts";
import {
  CARD_ART_STYLE_IDS,
  CARD_STYLE_SLOT_COUNT,
  DEFAULT_CARD_ART_STYLE_ID,
  buildCardArtStyleDirective,
  getCardArtStyle,
  isProCardArtStyle,
  resolveCardArtStyleSelections,
  type CardArtStyleId,
} from "@/lib/card-art-styles";
import type { AspectRatio, Subject } from "@/lib/providers/types";
import {
  buildGenerationPredictionPrompts,
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
import { isMockModeEnabled, isPromptDebugOnlyModeEnabled } from "@/lib/runtime-flags";
import {
  getCreditBalanceWithReader,
  getCurrentSubscription,
  isActiveSubscriptionStatus,
} from "@/lib/billing-queries";
import { MAX_SHOT_SUBJECTS } from "@/lib/generation-limits";

const AspectSchema = z.enum(["1:1", "3:2", "2:3"]);
const VARIANT_COUNT = 4;
const MAX_RETRIES_PER_SLOT = 1;
const FREE_PREVIEW_INELIGIBLE_MESSAGE =
  "Your free preview is one-time. Add credits before starting another one.";
const FREE_PREVIEW_UNIQUE_INDEX = "generations_user_free_preview_once_idx";
type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type DbReader = typeof db | DbTransaction;

export class PreviewUnlockExpiredError extends Error {
  constructor() {
    super("This preview has expired.");
    this.name = "PreviewUnlockExpiredError";
  }
}

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
    themeIds: z.array(z.string().min(1)).min(1).max(VARIANT_COUNT).optional(),
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
  .refine(
    (v) => !!v.themeId || !!v.themeIds?.length || !!v.customVibe,
    "Pick a vibe or describe your own.",
  );

export async function startGeneration(
  input: z.infer<typeof StartGenerationInput>,
  actor: { userId: string },
) {
  const parsed = StartGenerationInput.parse(input);
  const admin = await isAdmin();
  const requestedThemeIds = parsed.themeIds?.length
    ? parsed.themeIds
    : parsed.themeId
      ? [parsed.themeId]
      : [];
  const photoshootCatalog = THEMES.filter((catalogTheme) => catalogTheme.category !== "card");
  const selectionIsCard = requestedThemeIds.some((id) => {
    const t = THEMES.find((entry) => entry.id === id);
    return t?.category === "card";
  });
  const planCatalog = selectionIsCard ? THEMES : photoshootCatalog;
  const vibePlan = parsed.customVibe ? [] : buildVibeSelectionPlan(requestedThemeIds, planCatalog);
  if (!parsed.customVibe && vibePlan.length === 0) {
    throw new Error("Pick a valid vibe.");
  }

  let theme: Theme = parsed.customVibe
    ? buildCustomTheme({
        description: parsed.customVibe.description,
        aspectRatio: parsed.customVibe.aspectRatio,
      })
    : getTheme(vibePlan[0]?.themeId ?? parsed.themeId!);

  if (!parsed.customVibe && parsed.aspectOverride) {
    theme = { ...theme, aspectRatio: parsed.aspectOverride };
  }
  const outputType = parsed.outputType ?? (theme.category === "card" ? "card" : "photoshoot");
  if (outputType === "card" && parsed.themeIds && parsed.themeIds.length > 1) {
    throw new Error("Choose one card layout to create a card.");
  }
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
  if (!admin && !parsed.subjectIds && roster.length > MAX_SHOT_SUBJECTS) {
    throw new Error(`Choose up to ${MAX_SHOT_SUBJECTS} people or pets for one shot.`);
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
  if (!admin && effectiveRoster.length > MAX_SHOT_SUBJECTS) {
    throw new Error(`Choose up to ${MAX_SHOT_SUBJECTS} people or pets for one shot.`);
  }

  const cardArtStyleIds =
    outputType === "card"
      ? resolveCardArtStyleSelections(
          parsed.cardArtStyles?.defaultStyleId ?? DEFAULT_CARD_ART_STYLE_ID,
          parsed.cardArtStyles?.slotStyleIds,
          VARIANT_COUNT,
        )
      : null;

  if (cardArtStyleIds?.some(isProCardArtStyle)) {
    const subscription = await getCurrentSubscription(actor.userId);
    if (!isActiveSubscriptionStatus(subscription?.status)) {
      throw new Error("Subscribe to FamilyShoot Pro to use premium card style presets.");
    }
  }

  const prompt = buildGenerationPrompt(
    theme,
    effectiveRoster,
    parsed.wardrobeNote,
    parsed.cardText ?? null,
  );
  const plannedThemes =
    !parsed.customVibe && outputType === "photoshoot" && vibePlan.length > 0
      ? vibePlan.map((slot) => applyThemeAspectOverride(getTheme(slot.themeId), theme.aspectRatio))
      : [theme];
  const slotPrompts = plannedThemes.map((plannedTheme) =>
    buildGenerationPrompt(
      plannedTheme,
      effectiveRoster,
      parsed.wardrobeNote,
      parsed.cardText ?? null,
    ),
  );
  const variationPrompts = buildLaunchVariationPrompts({
    themes: plannedThemes,
    cardArtStyleIds,
  });

  const modelId = await resolveModelId(parsed.modelId, admin);
  if (!isAspectSupported(modelId, theme.aspectRatio)) {
    const supported = MODEL_CATALOG[modelId].supportedAspectRatios.join(", ");
    throw new Error(
      `${MODEL_CATALOG[modelId].label} doesn't support ${theme.aspectRatio} — pick one of ${supported}.`,
    );
  }

  if (isPromptDebugOnlyModeEnabled()) {
    const prompts = buildGenerationPredictionPrompts({
      basePrompt: prompt,
      slotPrompts,
      aspectRatio: theme.aspectRatio,
      variants: VARIANT_COUNT,
      variationPrompts,
    });
    console.log(
      [
        "",
        "================ PROMPT_DEBUG_ONLY: generation skipped ================",
        `themeId=${theme.id}`,
        `modelId=${modelId}`,
        `aspectRatio=${theme.aspectRatio}`,
        `subjects=${effectiveRoster.length}`,
        ...prompts.flatMap((finalPrompt, index) => [
          "",
          `--- VARIANT ${index + 1} ---`,
          finalPrompt,
        ]),
        "======================================================================",
        "",
      ].join("\n"),
    );
    return {
      generationId: "prompt-debug-only",
      debugPromptsOnly: true,
      prompts,
    };
  }

  if (isMockModeEnabled()) {
    return startMockGeneration({
      theme,
      prompt,
      roster: effectiveRoster,
      input: parsed,
      actor,
      modelId,
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
  });

  const { slots } = await createGenerationPredictions({
    prompt,
    slotPrompts,
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
  themes,
  cardArtStyleIds,
}: {
  themes: readonly Theme[];
  cardArtStyleIds: readonly CardArtStyleId[] | null;
}): string[] {
  const baseVariations =
    themes.length === 1
      ? getThemeVariationPrompts(themes[0].id, themes[0].category)
      : themes.map((theme, index) => {
          const themeVariations = getThemeVariationPrompts(theme.id, theme.category);
          return themeVariations[index % themeVariations.length];
        });
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

function applyThemeAspectOverride(theme: Theme, aspectRatio: AspectRatio): Theme {
  return withAspectRatioOverride(theme, aspectRatio);
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
    "Slot 2 composition: make a standing or walking card. Show three-quarter or full-body posture, more environment, and greeting text on the opposite side.",
    "Slot 3 composition: make a seated or leaning card. Use a bench, railing, doorway, table or foreground flowers as the visual anchor, with a medium crop and readable faces.",
    "Slot 4 composition: make a wide environmental card. Subject is smaller in the lower third, more occasion setting is visible, large calm negative space for the greeting.",
  ];

  return [
    slotCommands[slotIndex] ?? slotCommands[0],
    `Theme-specific layout: ${layoutPrompt}`,
    styleDirective,
  ].join(" ");
}

export async function getGenerationState(generationId: string, userId: string) {
  const [generation] = await db
    .select()
    .from(schema.generations)
    .where(and(eq(schema.generations.id, generationId), eq(schema.generations.userId, userId)))
    .limit(1);

  if (!generation) return null;
  if (generation.createdAt < studioCutoffDate(new Date(), generation.packTier)) return null;

  if (generation.status === "pending") {
    await reconcileGeneration(generation);
  }

  const [[refreshed], images, isUnlocked] = await Promise.all([
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
    isGenerationUnlocked(generationId, userId),
  ]);

  return {
    generation: refreshed ?? generation,
    images: pickChainHeads(images),
    isPreview: Boolean((refreshed ?? generation).freePreview) && !isUnlocked,
  };
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
            const newId = await retrySlot(generation, slotIndex, slot);
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
  slot: PredictionSlot,
): Promise<string> {
  const subjects = JSON.parse(generation.subjectSnapshot) as Subject[];
  const imageUrls = buildReferenceUrls(subjects, generation.locationReferencePath);
  const modelId = (
    GENERATION_MODEL_IDS.includes(generation.model as GenerationModelId)
      ? generation.model
      : "gpt-image-2"
  ) as GenerationModelId;
  return createSinglePrediction({
    modelId,
    basePrompt: generation.prompt,
    variantIndex: slotIndex,
    aspectRatio: (generation.aspectRatio ?? "3:2") as AspectRatio,
    variationPrompt: slot.variationPrompt,
    variationPrompts: getRetryVariationPrompts(generation.themeId),
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
}: {
  theme: Theme;
  prompt: string;
  roster: Subject[];
  input: z.infer<typeof StartGenerationInput>;
  actor: { userId: string };
  modelId: GenerationModelId;
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
}: {
  values: typeof schema.generations.$inferInsert;
  userId: string;
}) {
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

      let packTier: PackTier | null = null;
      const spendCredit = (await getCreditBalanceWithReader(tx, userId)) > 0;

      if (spendCredit) {
        packTier = await resolvePackTierForNextCredit(tx, userId);
      } else if (!(await canStartFreePreviewForTx(tx, userId))) {
        throw new Error(FREE_PREVIEW_INELIGIBLE_MESSAGE);
      }

      const [generation] = await tx
        .insert(schema.generations)
        .values({ ...values, packTier, freePreview: !spendCredit })
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
  } catch (err) {
    if (isUniqueViolation(err, FREE_PREVIEW_UNIQUE_INDEX)) {
      throw new Error(FREE_PREVIEW_INELIGIBLE_MESSAGE);
    }
    throw err;
  }
}

export async function canStartFreePreview(userId: string) {
  return canStartFreePreviewForTx(db, userId);
}

async function canStartFreePreviewForTx(tx: DbReader, userId: string) {
  const [
    previousPreview,
    previousPurchase,
    previousGrant,
    previousUsage,
    previousGiftPurchase,
    previousSubscription,
  ] = await Promise.all([
    tx
      .select({ id: schema.generations.id })
      .from(schema.generations)
      .where(
        and(
          eq(schema.generations.userId, userId),
          eq(schema.generations.freePreview, true),
          ne(schema.generations.status, "error"),
        ),
      )
      .limit(1),
    tx
      .select({ id: schema.creditTransactions.id })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.userId, userId))
      .limit(1),
    tx
      .select({ id: schema.creditGrants.id })
      .from(schema.creditGrants)
      .where(eq(schema.creditGrants.userId, userId))
      .limit(1),
    tx
      .select({ id: schema.creditUsages.id })
      .from(schema.creditUsages)
      .where(eq(schema.creditUsages.userId, userId))
      .limit(1),
    tx
      .select({ id: schema.giftCodes.id })
      .from(schema.giftCodes)
      .where(eq(schema.giftCodes.buyerUserId, userId))
      .limit(1),
    tx
      .select({ id: schema.subscriptions.id })
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, userId))
      .limit(1),
  ]);

  return (
    previousPreview.length === 0 &&
    previousPurchase.length === 0 &&
    previousGrant.length === 0 &&
    previousUsage.length === 0 &&
    previousGiftPurchase.length === 0 &&
    previousSubscription.length === 0
  );
}

function isUniqueViolation(err: unknown, indexName: string) {
  if (!err || typeof err !== "object") return false;
  const record = err as Record<string, unknown>;
  return (
    record.code === "23505" &&
    (record.constraint_name === indexName ||
      record.constraint === indexName ||
      String(record.message ?? "").includes(indexName))
  );
}

export async function isGenerationUnlocked(generationId: string, userId: string) {
  const rows = await db
    .select({ id: schema.creditUsages.id })
    .from(schema.creditUsages)
    .innerJoin(schema.generations, eq(schema.creditUsages.generationId, schema.generations.id))
    .where(and(eq(schema.generations.id, generationId), eq(schema.generations.userId, userId)))
    .limit(1);

  return rows.length > 0;
}

export async function unlockPreviewGeneration(generationId: string, userId: string) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

    const [generation] = await tx
      .select()
      .from(schema.generations)
      .where(and(eq(schema.generations.id, generationId), eq(schema.generations.userId, userId)))
      .limit(1);

    if (!generation) throw new Error("Preview not found.");
    if (!generation.freePreview) return { unlocked: true, alreadyUnlocked: true };
    if (generation.createdAt < studioCutoffDate(new Date(), generation.packTier)) {
      throw new PreviewUnlockExpiredError();
    }

    const [existingUsage] = await tx
      .select({ id: schema.creditUsages.id })
      .from(schema.creditUsages)
      .where(eq(schema.creditUsages.generationId, generationId))
      .limit(1);

    if (existingUsage) return { unlocked: true, alreadyUnlocked: true };

    const packTier = await resolvePackTierForNextCredit(tx, userId);

    await tx
      .update(schema.generations)
      .set({ packTier })
      .where(eq(schema.generations.id, generationId));

    await tx.insert(schema.creditUsages).values({
      userId,
      generationId,
      credits: 1,
    });

    return { unlocked: true, alreadyUnlocked: false };
  });
}

/**
 * FIFO-walk the user's purchases and grants in chronological order to
 * determine which bucket the next credit will be drawn from. Throws if the
 * user has no remaining balance. Grants default to "three" tier — admins
 * granting credits don't pick a tier, so we land in the middle.
 */
async function resolvePackTierForNextCredit(tx: DbTransaction, userId: string): Promise<PackTier> {
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
      referencePaths: photo ? [path.posix.join("uploads", person.id, photo.fileName)] : [],
    };
  });
}
