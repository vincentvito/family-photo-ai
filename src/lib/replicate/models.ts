import type { AspectRatio } from "@/lib/providers/types";

/**
 * Single source of truth for every Replicate model slug we run. Update the
 * value here and the change propagates to generation, refinement, and upscale.
 */
export const MODELS = {
  /** Google Nano Banana 2 - used for both initial generation and refinement. */
  nanoBanana: "google/nano-banana-2",
  /** Google Nano Banana Pro - higher-resolution image generation/editing model. */
  nanoBananaPro: "google/nano-banana-pro",
  /** OpenAI GPT Image 2 - default photoreal model. */
  gptImage2: "openai/gpt-image-2",
  /** Print-ready upscaler (preferred). */
  clarityUpscaler: "philz1337x/clarity-upscaler",
  /** Fallback upscaler when Clarity is unavailable. */
  realEsrgan: "nightmareai/real-esrgan",
} as const;

export type ModelSlug = (typeof MODELS)[keyof typeof MODELS];

/**
 * Generation-capable models. The `id` is what we persist on
 * `generations.model` and accept from admin UIs; the `slug` is the Replicate
 * model identifier. Pricing is per output image at the configured tier so the
 * admin can see cost before kicking off a shoot.
 */
export type GenerationModelId = "nanobanana" | "nano-banana-pro" | "gpt-image-2";

export type GenerationModel = {
  id: GenerationModelId;
  slug: ModelSlug;
  label: string;
  /** Roughly USD per output image at the tier we use. */
  priceUsd: number;
  priceLabel: string;
  /** Configuration tier shown in the UI, such as "1K resolution" or "Medium quality". */
  tierLabel: string;
  supportedAspectRatios: readonly AspectRatio[];
};

const SUPPORTED_ASPECTS: readonly AspectRatio[] = ["1:1", "3:2", "2:3"];

export const MODEL_CATALOG: Record<GenerationModelId, GenerationModel> = {
  nanobanana: {
    id: "nanobanana",
    slug: MODELS.nanoBanana,
    label: "Nano Banana 2",
    priceUsd: 0.067,
    priceLabel: "$0.067 / image",
    tierLabel: "1K resolution",
    supportedAspectRatios: SUPPORTED_ASPECTS,
  },
  "nano-banana-pro": {
    id: "nano-banana-pro",
    slug: MODELS.nanoBananaPro,
    label: "Nano Banana Pro",
    priceUsd: 0.15,
    priceLabel: "$0.15 / image",
    tierLabel: "2K resolution",
    supportedAspectRatios: SUPPORTED_ASPECTS,
  },
  "gpt-image-2": {
    id: "gpt-image-2",
    slug: MODELS.gptImage2,
    label: "GPT Image 2",
    priceUsd: 0.047,
    priceLabel: "$0.047 / image",
    tierLabel: "Medium quality",
    supportedAspectRatios: SUPPORTED_ASPECTS,
  },
};

export const GENERATION_MODEL_IDS = Object.keys(MODEL_CATALOG) as GenerationModelId[];

export function getModel(id: string): GenerationModel | null {
  return id in MODEL_CATALOG ? MODEL_CATALOG[id as GenerationModelId] : null;
}

export function isAspectSupported(modelId: GenerationModelId, aspect: AspectRatio): boolean {
  return MODEL_CATALOG[modelId].supportedAspectRatios.includes(aspect);
}
