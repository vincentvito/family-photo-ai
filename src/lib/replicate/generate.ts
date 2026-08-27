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
  themeId?: string;
  artStyleId?: string;
};

export function resolvePredictionRetryContext(
  slot: PredictionSlot,
  generation: { prompt: string; themeId: string },
) {
  return {
    basePrompt: slot.basePrompt ?? generation.prompt,
    themeId: slot.themeId ?? generation.themeId,
  };
}

type CompositionMode = {
  cropType: string;
  cameraDistance: string;
  facePriority: "critical" | "high" | "medium";
  environmentPriority: "low" | "medium" | "high";
  poseStyle: string;
  lensStyle: string;
  spacingRule: string;
  subjectSize: string;
  backgroundComplexity: "simple" | "moderate" | "rich";
  expressionFlexibility: "medium" | "high";
  expressionIntensity: "low" | "medium" | "medium-high";
};

type ScenePressure = "low" | "medium" | "high" | "very-high";

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

  const results = await Promise.allSettled(
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

  const rejected = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (rejected) {
    const createdIds = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    await Promise.allSettled(createdIds.map((id) => cancelPrediction(id)));
    throw rejected.reason;
  }

  const ids = results.map((result) => (result as PromiseFulfilledResult<string>).value);

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

async function cancelPrediction(predictionId: string): Promise<void> {
  const client = await getReplicateClient();
  await client.predictions.cancel(predictionId);
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
  _aspectRatio: AspectRatio,
  variationPromptOverride?: string,
  variationPrompts?: readonly string[],
): string {
  const rawVariationPrompt = normalizeVariationPrompt(
    variationPromptOverride ??
      (variationPrompts && variationPrompts.length > 0
        ? variationPrompts[variant % variationPrompts.length]
        : "Use a natural alternate pose, gaze or micro-composition while keeping the same setting, light, wardrobe and mood."),
  );
  const scenePressure = getScenePressure(`${basePrompt} ${rawVariationPrompt}`);
  const compositionMode = tuneCompositionMode(
    getCompositionMode(variant, rawVariationPrompt),
    scenePressure,
  );
  const shotDetail = stripCompositionLanguage(rawVariationPrompt);
  const expressionDirection = getExpressionDirection(
    `${basePrompt} ${rawVariationPrompt}`,
    compositionMode,
  );

  return [
    "Variant composition mode:",
    buildCompositionModePrompt(compositionMode, scenePressure),
    "Use this composition mode as the source of truth for crop, camera distance, subject scale, lens feel, spacing, and environment priority.",
    "",
    `Shot detail: ${shotDetail}`,
    "",
    "Base scene and identity:",
    basePrompt,
    "",
    "Expression override:",
    "Identity preservation applies only to facial structure, age cues, skin tone, hair, and recognizable facial features.",
    "Do not preserve the exact expression, smile shape, eyebrow tension, mouth shape, selfie emotion, or facial pose from the reference images.",
    "",
    `Scene-driven expressions: ${expressionDirection}`,
  ]
    .join("\n")
    .replace(/—|â€”/g, "-");
}

function normalizeVariationPrompt(prompt: string): string {
  return prompt
    .replace(/\bselected cast\b/giu, "subjects")
    .replace(/\bfamily\b/giu, "subjects")
    .replace(/\beveryone\b/giu, "the subjects");
}

function stripCompositionLanguage(prompt: string): string {
  return prompt
    .replace(/\bfull-body or three-quarter\b/giu, "clear")
    .replace(/\bfull-body\b/giu, "clear")
    .replace(/\bhead-to-toe\b/giu, "clear")
    .replace(/\bwaist-up or shoulder-up\b/giu, "close")
    .replace(/\bwaist-up\b/giu, "close")
    .replace(/\bshoulder-up\b/giu, "close")
    .replace(/\bknee-up\b/giu, "medium")
    .replace(/\bthree-quarter\b/giu, "medium")
    .replace(/\btight(?:er)?\b/giu, "intimate")
    .replace(/\bwide\b/giu, "environmental")
    .replace(/\bside-oriented cinematic walk\b/giu, "walking")
    .replace(/\bside-oriented street-crossing line\b/giu, "street-crossing line")
    .replace(
      /\bmostly side-facing(?: bodies)?(?: with slight natural face turns(?: toward camera)?(?: for readable faces)?)?\b/giu,
      "",
    )
    .replace(/\bwith slight natural face turns(?: toward camera)?(?: for readable faces)?\b/giu, "")
    .replace(/\breadable faces?\b/giu, "")
    .replace(/\bfaces readable\b/giu, "")
    .replace(/\bevenly spaced(?: one behind another)?\b/giu, "")
    .replace(/\bwithout overlap\b/giu, "")
    .replace(/\bvertical album-cover framing\b/giu, "album-cover mood")
    .replace(/\s{2,}/gu, " ")
    .replace(/\s+,/gu, ",")
    .replace(/,\s*,/gu, ",")
    .replace(/:\s*,\s*/gu, ": ")
    .replace(/,\s*\./gu, ".")
    .trim();
}

function getScenePressure(text: string): ScenePressure {
  if (/\b(space|galactic|starship|hangar|royal|palace|court|guardian)\b/iu.test(text)) {
    return "very-high";
  }
  if (/\b(crosswalk|zebra|runway|fashion|stage|concert|editorial|city-office)\b/iu.test(text)) {
    return "high";
  }
  if (/\b(city|bridge|cafe|café|kitchen|orchard|market|room|interior|table)\b/iu.test(text)) {
    return "medium";
  }
  return "low";
}

function tuneCompositionMode(mode: CompositionMode, pressure: ScenePressure): CompositionMode {
  if (pressure === "low") return mode;

  if (pressure === "medium") {
    return {
      ...mode,
      spacingRule: `${mode.spacingRule}; preserve equal visual importance for each subject`,
      expressionFlexibility: "high",
    };
  }

  if (pressure === "high") {
    return {
      ...mode,
      facePriority: mode.facePriority === "medium" ? "high" : mode.facePriority,
      backgroundComplexity:
        mode.backgroundComplexity === "rich" ? "moderate" : mode.backgroundComplexity,
      spacingRule: `${mode.spacingRule}; controlled subject separation and equal visual importance for each subject`,
      expressionFlexibility: "high",
    };
  }

  return {
    ...mode,
    facePriority: "critical",
    environmentPriority: mode.environmentPriority === "high" ? "medium" : mode.environmentPriority,
    backgroundComplexity: "moderate",
    spacingRule: `${mode.spacingRule}; strict subject separation and equal visual importance for each subject`,
    expressionFlexibility: "high",
  };
}

function getCompositionMode(variant: number, prompt: string): CompositionMode {
  if (/slot 1 composition/iu.test(prompt)) {
    return {
      cropType: "close portrait card crop",
      cameraDistance: "close",
      facePriority: "critical",
      environmentPriority: "low",
      poseStyle: "still or gently affectionate",
      lensStyle: "natural portrait compression",
      spacingRule: "tight grouping placed low or to one side with clean greeting area",
      subjectSize: "subjects occupy roughly 65-80% of image height",
      backgroundComplexity: "simple",
      expressionFlexibility: "high",
      expressionIntensity: "medium",
    };
  }
  if (/slot 2 composition/iu.test(prompt)) {
    return {
      cropType: "medium-full card crop",
      cameraDistance: "moderate",
      facePriority: "high",
      environmentPriority: "medium",
      poseStyle: "standing or walking",
      lensStyle: "natural cinematic portrait perspective",
      spacingRule: "clear cast silhouette balanced opposite greeting space",
      subjectSize: "subjects occupy roughly 55-70% of image height",
      backgroundComplexity: "moderate",
      expressionFlexibility: "high",
      expressionIntensity: "medium",
    };
  }
  if (/slot 3 composition/iu.test(prompt)) {
    return {
      cropType: "medium anchored card crop",
      cameraDistance: "moderate-close",
      facePriority: "high",
      environmentPriority: "medium",
      poseStyle: "seated, leaning, or anchored near a prop",
      lensStyle: "moderate editorial lens compression",
      spacingRule: "stable grouping around one prop or architectural edge",
      subjectSize: "subjects occupy roughly 60-75% of image height",
      backgroundComplexity: "moderate",
      expressionFlexibility: "high",
      expressionIntensity: "medium",
    };
  }
  if (/slot 4 composition/iu.test(prompt)) {
    return {
      cropType: "environmental card crop",
      cameraDistance: "moderate-wide",
      facePriority: "medium",
      environmentPriority: "high",
      poseStyle: "simple readable pose",
      lensStyle: "natural editorial perspective without wide-angle distortion",
      spacingRule: "cast in lower third with large calm greeting area",
      subjectSize: "subjects occupy roughly 35-50% of image height",
      backgroundComplexity: "rich",
      expressionFlexibility: "high",
      expressionIntensity: "medium",
    };
  }
  if (/\b(horizontal cheek line|tight shoulder-up row|heads nearly level)\b/iu.test(prompt)) {
    return closePortraitMode("horizontal face-led grouping");
  }
  if (/\b(crosswalk|zebra crossing|street-crossing)\b/iu.test(prompt)) {
    return {
      cropType: "medium-full crosswalk walking frame",
      cameraDistance: "moderate",
      facePriority: "high",
      environmentPriority: "medium",
      poseStyle: "side-oriented cinematic walk with slight natural face turns",
      lensStyle: "moderate editorial lens compression",
      spacingRule: "evenly spaced along crosswalk stripes without overlap",
      subjectSize: "subjects occupy roughly 60-75% of image height",
      backgroundComplexity: "moderate",
      expressionFlexibility: "high",
      expressionIntensity: "low",
    };
  }
  if (/\b(album-cover|magazine cover|negative space|crop-contrast)\b/iu.test(prompt)) {
    return {
      cropType: "graphic portrait crop",
      cameraDistance: "close-to-moderate",
      facePriority: "critical",
      environmentPriority: "low",
      poseStyle: "composed editorial stillness",
      lensStyle: "85mm-equivalent portrait compression",
      spacingRule: "tight staggered grouping with one clean negative-space field",
      subjectSize: "subjects occupy roughly 65-80% of image height",
      backgroundComplexity: "simple",
      expressionFlexibility: "high",
      expressionIntensity: "low",
    };
  }
  if (
    /\b(seated|sitting|leaning|bench|couch|floor|table|blanket|steps|porch|rail|doorway|lounger)\b/iu.test(
      prompt,
    )
  ) {
    return {
      cropType: "medium anchored portrait crop",
      cameraDistance: "moderate-close",
      facePriority: "high",
      environmentPriority: "medium",
      poseStyle: "still seated, leaning, or clustered arrangement",
      lensStyle: "moderate editorial lens compression",
      spacingRule: "clear grouping anchored by one named prop or setting edge",
      subjectSize: "subjects occupy roughly 60-75% of image height",
      backgroundComplexity: "moderate",
      expressionFlexibility: "high",
      expressionIntensity: "medium",
    };
  }
  if (
    /\b(walking|standing|moving|mid-stride|action|candid|toss|play|passing|reaching|lifting|holding|placing|opening|gesture)\b/iu.test(
      prompt,
    )
  ) {
    return {
      cropType: "medium-full story frame",
      cameraDistance: "moderate",
      facePriority: "high",
      environmentPriority: "medium",
      poseStyle: "single clear action beat",
      lensStyle: "natural cinematic portrait perspective",
      spacingRule: "asymmetrical spacing with hands or feet visible when relevant",
      subjectSize: "subjects occupy roughly 60-75% of image height",
      backgroundComplexity: "moderate",
      expressionFlexibility: "high",
      expressionIntensity: "medium-high",
    };
  }
  if (
    /\b(close|tight|tighter|waist-up|chest-up|shoulder-up|shoulder|face|faces)\b/iu.test(prompt)
  ) {
    return closePortraitMode("faces and shoulders prominent");
  }
  if (
    /\b(wide|environmental|establishing|world|landscape|lower third|full room|full-room)\b/iu.test(
      prompt,
    )
  ) {
    return {
      cropType: "environmental portrait frame",
      cameraDistance: "moderate-wide",
      facePriority: "medium",
      environmentPriority: "high",
      poseStyle: "simple stable pose",
      lensStyle: "natural editorial perspective without wide-angle distortion",
      spacingRule: "clear silhouettes with foreground and background layers",
      subjectSize: "subjects occupy roughly 40-55% of image height",
      backgroundComplexity: "rich",
      expressionFlexibility: "high",
      expressionIntensity: "medium",
    };
  }

  const lanes: CompositionMode[] = [
    environmentalMode(),
    {
      cropType: "medium anchored portrait crop",
      cameraDistance: "moderate-close",
      facePriority: "high",
      environmentPriority: "medium",
      poseStyle: "still clear arrangement",
      lensStyle: "moderate editorial lens compression",
      spacingRule: "coherent grouping with one prop or setting edge",
      subjectSize: "subjects occupy roughly 60-75% of image height",
      backgroundComplexity: "moderate",
      expressionFlexibility: "high",
      expressionIntensity: "medium",
    },
    {
      cropType: "medium-full story frame",
      cameraDistance: "moderate",
      facePriority: "high",
      environmentPriority: "medium",
      poseStyle: "single clear candid action",
      lensStyle: "natural cinematic portrait perspective",
      spacingRule: "asymmetrical spacing without overlap",
      subjectSize: "subjects occupy roughly 60-75% of image height",
      backgroundComplexity: "moderate",
      expressionFlexibility: "high",
      expressionIntensity: "medium",
    },
    closePortraitMode("face-led crop contrast"),
  ];
  return lanes[variant % lanes.length];
}

function closePortraitMode(spacingRule: string): CompositionMode {
  return {
    cropType: "close portrait crop",
    cameraDistance: "close",
    facePriority: "critical",
    environmentPriority: "low",
    poseStyle: "still or subtly expressive",
    lensStyle: "85mm-equivalent portrait compression",
    spacingRule,
    subjectSize: "subjects occupy roughly 70-85% of image height",
    backgroundComplexity: "simple",
    expressionFlexibility: "high",
    expressionIntensity: "low",
  };
}

function environmentalMode(): CompositionMode {
  return {
    cropType: "environmental portrait frame",
    cameraDistance: "moderate-wide",
    facePriority: "medium",
    environmentPriority: "high",
    poseStyle: "simple stable pose",
    lensStyle: "natural editorial perspective without wide-angle distortion",
    spacingRule: "clear silhouettes with foreground and background layers",
    subjectSize: "subjects occupy roughly 40-55% of image height",
    backgroundComplexity: "rich",
    expressionFlexibility: "high",
    expressionIntensity: "medium",
  };
}

function buildCompositionModePrompt(mode: CompositionMode, scenePressure: ScenePressure): string {
  return [
    `Crop: ${mode.cropType}; ${mode.cameraDistance} camera distance; ${mode.subjectSize}.`,
    `Focus priority: ${renderFocusPriority(mode)}`,
    `Faces: ${renderFacePriority(mode.facePriority)} Maintain equal visual importance and facial readability across all subjects. Avoid heavy face overlap or partial facial occlusion between subjects.`,
    `Environment: ${renderEnvironment(mode)}`,
    `Pose and limbs: ${mode.poseStyle}; ${renderPoseLogic(mode.poseStyle)}`,
    `Spacing: ${mode.spacingRule}. Avoid placing faces or hands too close to image edges where distortion may occur.`,
    `Lens feel: ${renderLensStyle(mode.lensStyle)}`,
    "Lighting discipline: preserve readable skin tones and facial detail under all lighting conditions.",
    `Scene pressure: ${renderScenePressure(scenePressure)}`,
  ].join("\n");
}

function renderFocusPriority(mode: CompositionMode): string {
  if (/\bcrosswalk|walking|walk\b/iu.test(`${mode.cropType} ${mode.poseStyle}`)) {
    return "faces and front-facing eyes first, crosswalk geometry secondary.";
  }
  if (
    /\bfashion|runway|stage|editorial|portrait crop|graphic\b/iu.test(
      `${mode.cropType} ${mode.poseStyle}`,
    )
  ) {
    return "faces, posture, and wardrobe texture first.";
  }
  if (
    /\benvironmental|world|space|hangar|adventure\b/iu.test(`${mode.cropType} ${mode.poseStyle}`)
  ) {
    return "faces and silhouette readability against the environment first.";
  }
  return "faces and subject separation first, setting detail secondary.";
}

function renderFacePriority(priority: CompositionMode["facePriority"]): string {
  if (priority === "critical") {
    return "make faces the dominant readable detail with crisp expressions.";
  }
  if (priority === "high") {
    return "keep every face clearly readable without shrinking the subjects.";
  }
  return "keep faces coherent and readable while allowing more environment.";
}

function renderEnvironmentPriority(priority: CompositionMode["environmentPriority"]): string {
  if (priority === "high") {
    return "let the setting carry strong visual context while preserving subject clarity.";
  }
  if (priority === "medium") {
    return "balance setting context with subject readability.";
  }
  return "keep the setting secondary to the faces and grouping.";
}

function renderEnvironment(mode: CompositionMode): string {
  if (mode.environmentPriority === "low") {
    return "Soft atmospheric background shapes with minimal distracting detail.";
  }
  return `${renderEnvironmentPriority(mode.environmentPriority)} ${renderBackgroundComplexity(mode.backgroundComplexity)}`;
}

function renderBackgroundComplexity(complexity: CompositionMode["backgroundComplexity"]): string {
  if (complexity === "simple") {
    return "Clean uncluttered background with soft environmental detail.";
  }
  if (complexity === "moderate") {
    return "Layered environmental depth with readable but non-distracting detail.";
  }
  return "Rich cinematic environment with multiple readable depth layers; no crowding around the subjects.";
}

function renderScenePressure(pressure: ScenePressure): string {
  if (pressure === "very-high") {
    return "complex scene, keep spacing disciplined and simplify nearby background details around the subjects.";
  }
  if (pressure === "high") {
    return "dense scene, prioritize subject separation and face clarity over extra environmental detail.";
  }
  if (pressure === "medium") {
    return "balanced scene, keep environment readable without competing with the selected subjects.";
  }
  return "low-density scene, allow relaxed spacing and clean silhouettes.";
}

function renderPoseLogic(poseStyle: string): string {
  if (/\bwalk|walking|mid-stride|action|candid|gesture|moving\b/iu.test(poseStyle)) {
    return "natural alternating posture, readable hands, clean limb separation, restrained motion blur.";
  }
  if (/\bseated|leaning|anchored|clustered\b/iu.test(poseStyle)) {
    return "relaxed hands, stable shoulders, no tangled arms, no hidden faces.";
  }
  return "minimal limb motion, relaxed posture, clean hand placement.";
}

function renderLensStyle(lensStyle: string): string {
  if (/\b85mm|portrait compression|portrait-compressed\b/iu.test(lensStyle)) {
    return "natural portrait compression, minimal perspective distortion, realistic facial proportions.";
  }
  if (/\bwide-angle|without wide-angle distortion\b/iu.test(lensStyle)) {
    return "natural perspective without wide-angle face or limb distortion.";
  }
  if (/\bcinematic portrait perspective\b/iu.test(lensStyle)) {
    return "slight environmental depth while preserving natural facial geometry and realistic proportions.";
  }
  return "natural editorial perspective, realistic proportions, no stretched edge anatomy.";
}

function getExpressionDirection(text: string, mode: CompositionMode): string {
  const metadata = `expressionFlexibility=${mode.expressionFlexibility}; expressionIntensity=${mode.expressionIntensity}.`;

  if (/\b(crosswalk|zebra|street-crossing|1960s|music-magazine)\b/iu.test(text)) {
    return `${metadata} Expressions should emotionally match the cinematic scene, mood, lighting, and atmosphere rather than copying the expressions from the source photos. Calm confident expressions, natural and unforced.`;
  }
  if (/\b(space|galactic|starship|hangar|adventure|guardian)\b/iu.test(text)) {
    return `${metadata} Expressions should emotionally match the cinematic scene, mood, lighting, and atmosphere rather than copying the expressions from the source photos. Subtle awe and adventurous curiosity without exaggerated acting.`;
  }
  if (/\b(runway|fashion|editorial|office|luxury|stage|concert)\b/iu.test(text)) {
    return `${metadata} Expressions should emotionally match the cinematic scene, mood, lighting, and atmosphere rather than copying the expressions from the source photos. Restrained editorial confidence with composed expressions.`;
  }
  if (/\b(noughties|throwback|mall|sticker|flash|y2k|party|ball-pit)\b/iu.test(text)) {
    return `${metadata} Expressions should emotionally match the cinematic scene, mood, lighting, and atmosphere rather than copying the expressions from the source photos. Natural playful smiles and candid warmth.`;
  }
  if (/\b(royal|palace|court|ceremonial)\b/iu.test(text)) {
    return `${metadata} Expressions should emotionally match the cinematic scene, mood, lighting, and atmosphere rather than copying the expressions from the source photos. Dignified calm expressions with gentle warmth.`;
  }
  if (/\b(card|christmas|holiday|birthday|mother|father|newborn|graduation)\b/iu.test(text)) {
    return `${metadata} Expressions should emotionally match the cinematic scene, mood, lighting, and atmosphere rather than copying the expressions from the source photos. Warm approachable expressions suited to a keepsake card.`;
  }
  return `${metadata} Expressions should emotionally match the cinematic scene, mood, lighting, and atmosphere rather than copying the expressions from the source photos. Relaxed warm expressions that fit the shot direction and setting.`;
}
