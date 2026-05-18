import { fetchOutputImage, getReplicateClient } from "./client";
import { MODEL_CATALOG, type GenerationModelId, isAspectSupported } from "./models";
import { publicUrl } from "@/lib/storage";
import type { AspectRatio, Subject } from "@/lib/providers/types";

export type StartPredictionsArgs = {
  prompt: string;
  slotPrompts?: readonly string[];
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
  basePrompt?: string;
  variationPrompt?: string;
};

const ANATOMY_PROPORTION_DIRECTIVE =
  "Anatomy and scale: keep each selected subject natural and proportional; avoid warped faces, oversized heads, tiny hands, stretched or duplicate limbs, and distorted clothing.";

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
    basePrompt:
      args.slotPrompts && args.slotPrompts.length > 0
        ? args.slotPrompts[i % args.slotPrompts.length]
        : args.prompt,
    variationPrompt:
      args.variationPrompts && args.variationPrompts.length > 0
        ? args.variationPrompts[i % args.variationPrompts.length]
        : undefined,
  }));

  const ids = await Promise.all(
    slotInputs.map((slot, i) =>
      createSinglePrediction({
        modelId: args.modelId,
        basePrompt: slot.basePrompt,
        variantIndex: i,
        aspectRatio: args.aspectRatio,
        variationPrompt: slot.variationPrompt,
        imageUrls,
      }),
    ),
  );

  return {
    slots: ids.map((id, index) => ({
      id,
      retries: 0,
      ...(slotInputs[index].basePrompt !== args.prompt
        ? { basePrompt: slotInputs[index].basePrompt }
        : {}),
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
  aspectRatio: AspectRatio;
  variationPrompt?: string;
  variationPrompts?: readonly string[];
  imageUrls: string[];
}): Promise<string> {
  const client = await getReplicateClient();
  const model = MODEL_CATALOG[args.modelId];
  const prompt = buildVariantPrompt(
    args.basePrompt,
    args.variantIndex,
    args.aspectRatio,
    args.variationPrompt,
    args.variationPrompts,
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
            quality: model.gptImageQuality ?? "medium",
            number_of_images: 1,
            output_format: "jpeg",
            moderation: "low",
          };

  const prediction = await client.predictions.create({
    model: model.slug,
    input,
  });
  return prediction.id;
}

export function buildGenerationPredictionPrompts(args: {
  basePrompt: string;
  slotPrompts?: readonly string[];
  aspectRatio: AspectRatio;
  variants?: number;
  variationPrompts?: readonly string[];
}): string[] {
  const variants = args.variants ?? 4;
  return Array.from({ length: variants }, (_, variantIndex) => {
    const basePrompt =
      args.slotPrompts && args.slotPrompts.length > 0
        ? args.slotPrompts[variantIndex % args.slotPrompts.length]
        : args.basePrompt;
    return buildVariantPrompt(
      basePrompt,
      variantIndex,
      args.aspectRatio,
      args.variationPrompts && args.variationPrompts.length > 0
        ? args.variationPrompts[variantIndex % args.variationPrompts.length]
        : undefined,
    );
  });
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
  aspectRatio: AspectRatio,
  variationPromptOverride?: string,
  variationPrompts?: readonly string[],
): string {
  const variationPrompt = normalizeVariationPrompt(
    variationPromptOverride ??
      (variationPrompts && variationPrompts.length > 0
        ? variationPrompts[variant % variationPrompts.length]
        : "Use a natural alternate pose, gaze or micro-composition while keeping the same setting, light, wardrobe and mood."),
  );

  return [
    `Shot direction: ${variationPrompt}`,
    `Variant framing: ${buildVariantFraming(variant, variationPrompt)}`,
    "Use the shot direction and variant framing as the source of truth for pose, crop, subject scale, foreground detail and negative space.",
    "",
    basePrompt,
    "",
    ANATOMY_PROPORTION_DIRECTIVE,
    "Reference handling: preserve each selected subject's facial identity, age cues, skin tone, hair and recognizable features; do not copy selfie expression, pose, lighting, background, clothing or camera angle.",
    "Expression direction: use relaxed, warm expressions that fit the shot direction and setting.",
    `Aspect ratio: ${aspectRatio}.`,
  ]
    .join("\n")
    .replace(/—|â€”/g, "-");
}

function normalizeVariationPrompt(prompt: string): string {
  return prompt
    .replace(/\bfamily\b/giu, "selected cast")
    .replace(/\beveryone\b/giu, "the selected cast");
}

function buildVariantFraming(variant: number, prompt: string): string {
  if (/slot 1 composition/iu.test(prompt)) {
    return "close card portrait, face prominent, selected cast placed low or to one side, large clean greeting area";
  }
  if (/slot 2 composition/iu.test(prompt)) {
    return "standing or walking card, three-quarter to full-body posture, more environment visible, greeting area balanced opposite the cast";
  }
  if (/slot 3 composition/iu.test(prompt)) {
    return "anchored seated or leaning card, medium crop, readable faces, bench/railing/doorway/table/flowers used as structure";
  }
  if (/slot 4 composition/iu.test(prompt)) {
    return "wide environmental card, selected cast smaller in the lower third, occasion setting dominates, large calm greeting area";
  }
  if (/\b(horizontal cheek line|tight shoulder-up row|heads nearly level)\b/iu.test(prompt)) {
    return "tight horizontal portrait, selected cast spread across the frame with heads nearly level, faces and shoulders prominent";
  }
  if (/\b(album-cover|magazine cover|negative space)\b/iu.test(prompt)) {
    return "graphic album-cover portrait, selected cast clustered asymmetrically with clean white negative space, chest-up to waist-up crop";
  }
  if (
    /\b(seated|sitting|leaning|bench|couch|floor|table|blanket|steps|porch|rail|doorway|lounger)\b/iu.test(
      prompt,
    )
  ) {
    return "anchored medium portrait, selected cast held in a clear still arrangement, waist-up or knee-up crop, faces readable, named prop or setting element framing an edge";
  }
  if (
    /\b(walking|standing|moving|mid-stride|action|candid|toss|play|passing|reaching|lifting|holding|placing|opening|gesture)\b/iu.test(
      prompt,
    )
  ) {
    return "candid story-beat composition, selected cast caught in the named action or interaction, asymmetrical spacing, visible hands or feet, lower or closer camera energy";
  }
  if (
    /\b(close|tight|tighter|waist-up|chest-up|shoulder-up|shoulder|face|faces)\b/iu.test(prompt)
  ) {
    return "genuinely tight portrait, faces and shoulders prominent, compressed background, no standard full-body group setup";
  }
  if (
    /\b(wide|environmental|establishing|world|landscape|lower third|full room|full-room)\b/iu.test(
      prompt,
    )
  ) {
    return "wide environmental composition, selected cast small-to-medium in frame, strong location context, visible foreground and background layers";
  }

  const lanes = [
    "wide or full-body establishing option, selected cast small-to-medium in frame, strong location context, visible foreground and background layers",
    "anchored medium portrait option, selected cast held in a clear still arrangement, waist-up or knee-up crop, faces readable, one named prop or setting element framing an edge",
    "candid story-beat option, selected cast caught in the named action or interaction, asymmetrical spacing, visible hands or feet, lower or closer camera energy",
    "crop-contrast option, either a genuinely tight face-and-shoulders portrait or a very graphic negative-space composition if the shot direction asks for width; avoid a standard medium group portrait",
  ];
  return lanes[variant % lanes.length];
}
