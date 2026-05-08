import { fetchOutputImage, getReplicateClient } from "./client";
import { MODEL_CATALOG, type GenerationModelId, isAspectSupported } from "./models";
import { publicUrl } from "@/lib/storage";
import type { AspectRatio, Subject } from "@/lib/providers/types";

export type StartPredictionsArgs = {
  prompt: string;
  aspectRatio: AspectRatio;
  subjects: Subject[];
  locationReferencePath?: string | null;
  variants?: number;
  variationPrompts?: readonly string[];
  modelId: GenerationModelId;
};

/**
 * Per-slot record stored in `generations.replicate_prediction_ids` (JSON
 * array). Each slot maps 1:1 to a UI variant tile and is independently
 * retryable when the model errors transiently.
 */
export type PredictionSlot = {
  id: string;
  retries: number;
  variationPrompt?: string;
};

/**
 * Fan out one Replicate prediction per variant against the chosen model and
 * return the slot records (id + retries=0). Predictions run async on
 * Replicate; reconcile each slot later with `reconcilePrediction()`.
 */
export async function createGenerationPredictions(
  args: StartPredictionsArgs,
): Promise<{ slots: PredictionSlot[] }> {
  if (!isAspectSupported(args.modelId, args.aspectRatio)) {
    throw new Error(
      `${MODEL_CATALOG[args.modelId].label} does not support ${args.aspectRatio}. Supported: ${MODEL_CATALOG[args.modelId].supportedAspectRatios.join(", ")}.`,
    );
  }
  const variants = args.variants ?? 4;
  const imageUrls = buildReferenceUrls(args.subjects, args.locationReferencePath);

  const slotInputs = Array.from({ length: variants }, (_, i) => ({
    variationPrompt:
      args.variationPrompts && args.variationPrompts.length > 0
        ? args.variationPrompts[i % args.variationPrompts.length]
        : undefined,
  }));

  const ids = await Promise.all(
    slotInputs.map((slot, i) =>
      createSinglePrediction({
        modelId: args.modelId,
        basePrompt: args.prompt,
        variantIndex: i,
        totalVariants: variants,
        aspectRatio: args.aspectRatio,
        variationPrompt: slot.variationPrompt,
        subjects: args.subjects,
        imageUrls,
      }),
    ),
  );

  return {
    slots: ids.map((id, index) => ({
      id,
      retries: 0,
      ...(slotInputs[index].variationPrompt
        ? { variationPrompt: slotInputs[index].variationPrompt }
        : {}),
    })),
  };
}

/**
 * Create a single Replicate prediction. Used both for the initial fan-out
 * and for retrying a single failed slot. Each call requests one output image;
 * we fan out N parallel calls per generation regardless of model so the slot
 * abstraction stays uniform.
 */
export async function createSinglePrediction(args: {
  modelId: GenerationModelId;
  basePrompt: string;
  variantIndex: number;
  totalVariants: number;
  aspectRatio: AspectRatio;
  variationPrompt?: string;
  variationPrompts?: readonly string[];
  subjects: Subject[];
  imageUrls: string[];
}): Promise<string> {
  const client = await getReplicateClient();
  const model = MODEL_CATALOG[args.modelId];
  const prompt = buildVariantPrompt(
    args.basePrompt,
    args.variantIndex,
    args.totalVariants,
    args.aspectRatio,
    args.variationPrompt,
    args.variationPrompts,
    args.subjects,
  );

  const input =
    args.modelId === "nanobanana"
      ? {
          prompt,
          image_input: args.imageUrls,
          aspect_ratio: args.aspectRatio,
          resolution: "1K",
          output_format: "jpg",
        }
      : args.modelId === "nano-banana-pro"
        ? {
            prompt,
            image_input: args.imageUrls,
            aspect_ratio: args.aspectRatio,
            resolution: "2K",
            output_format: "jpg",
            safety_filter_level: "block_only_high",
          }
        : {
            prompt,
            input_images: args.imageUrls,
            aspect_ratio: args.aspectRatio,
            quality: "medium",
            number_of_images: 1,
            output_format: "jpeg",
          };

  const prediction = await client.predictions.create({
    model: model.slug,
    input,
  });
  return prediction.id;
}

export function buildReferenceUrls(
  subjects: Subject[],
  locationReferencePath?: string | null,
): string[] {
  const urls: string[] = [];
  for (const subject of subjects) {
    for (const ref of subject.referencePaths) {
      urls.push(publicUrl(ref));
    }
  }
  if (locationReferencePath) {
    urls.push(publicUrl(locationReferencePath));
  }
  return urls;
}

export type ReconciledPrediction =
  | { status: "starting" | "processing" }
  | { status: "succeeded"; outputUrl: string }
  | { status: "failed" | "canceled"; error: string };

/**
 * Fetch a single prediction's current state from Replicate and normalize the
 * output shape to a single image URL on success.
 */
export async function reconcilePrediction(predictionId: string): Promise<ReconciledPrediction> {
  const client = await getReplicateClient();
  const prediction = await client.predictions.get(predictionId);

  switch (prediction.status) {
    case "starting":
    case "processing":
      return { status: prediction.status };
    case "succeeded": {
      const outputUrl = extractOutputUrl(prediction.output);
      if (!outputUrl) {
        return { status: "failed", error: "Prediction succeeded but returned no image URL" };
      }
      return { status: "succeeded", outputUrl };
    }
    case "failed":
    case "canceled":
      return {
        status: prediction.status,
        error: prediction.error ? String(prediction.error) : `Prediction ${prediction.status}`,
      };
    default:
      return { status: "failed", error: `Unknown prediction status: ${prediction.status}` };
  }
}

export const fetchPredictionImage = fetchOutputImage;

function extractOutputUrl(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0) {
    return extractOutputUrl(output[0]);
  }
  return null;
}

function buildVariantPrompt(
  basePrompt: string,
  variant: number,
  totalVariants: number,
  aspectRatio: AspectRatio,
  variationPromptOverride?: string,
  variationPrompts?: readonly string[],
  subjects?: Subject[],
): string {
  const variationPrompt =
    variationPromptOverride ??
    (variationPrompts && variationPrompts.length > 0
      ? variationPrompts[variant % variationPrompts.length]
      : "Subtly vary pose, gaze or micro-composition compared to other variations, but keep the same setting, light, wardrobe and mood.");

  return [
    basePrompt,
    "",
    "Final generation instructions:",
    buildCastRail(subjects),
    "- Preserve the selected subject identities from the attached reference photos.",
    "- Do not add unselected people, duplicate subjects, background people, extra faces, pets or animals unless they are selected in the cast.",
    `— Output one high-resolution image at ${aspectRatio} aspect ratio. Return only the image.`,
    `— Variation ${variant + 1} of ${totalVariants}: ${variationPrompt}`,
    "- The variation composition is mandatory: follow its pose, seated-or-standing state, crop, subject scale, prop placement, foreground detail and text-space placement.",
    "- If a card art style is specified, apply that style to the entire card including the selected subject, face, skin, hair, clothes, background, foreground and greeting area.",
    "- Preserve the card greeting text requirements exactly.",
  ]
    .join("\n")
    .replace(/—|â€”/g, "-");
}

function buildCastRail(subjects?: Subject[]): string {
  if (!subjects || subjects.length === 0) {
    return "- Cast lock: use only the named subjects from the base prompt; no extras, duplicates or background people.";
  }

  const humans = subjects.filter((subject) => subject.role !== "pet");
  const pets = subjects.filter((subject) => subject.role === "pet");
  const humanNames = humans
    .map((subject) => subject.name)
    .filter(Boolean)
    .join(", ");
  const petNames = pets
    .map((subject) => subject.name)
    .filter(Boolean)
    .join(", ");

  return [
    `- Cast lock: exactly ${humans.length} visible human subject${humans.length === 1 ? "" : "s"}${humanNames ? ` (${humanNames})` : ""}; exactly ${pets.length} visible pet subject${pets.length === 1 ? "" : "s"}${petNames ? ` (${petNames})` : ""}.`,
    subjects.length === 1
      ? "This is a solo portrait; reinterpret words like family, everyone, each, all or together as the single selected subject only."
      : "This is a closed group portrait containing only the selected cast.",
    "No unselected people, no background people, no extra relatives, no strangers, no duplicate versions of a subject, no wall portraits or reflections that introduce extra faces.",
  ].join(" ");
}
