import type {
  ImageProvider,
  GenerateArgs,
  GenerateResult,
  RefineArgs,
  RefineResult,
} from "./types";
import { getReplicateClient, toDataUrl, resolveUrl, urlToImage } from "./replicate-common";

const MODEL_ID = "google/nano-banana-pro" as const;
type ModelSlug = `${string}/${string}`;

/**
 * Nano Banana Pro (Google Gemini 3 Pro Image Preview), hosted on Replicate.
 *
 * - Natively supports up to 14 reference images for identity lock on families +
 *   pets.
 * - Used for photoreal family generation and ALL refinement edits (multi-turn
 *   edit quality is materially better than FLUX Kontext on Replicate).
 * - Stateless: every call re-passes the original reference photos so identity
 *   and color palette don't drift across successive edits.
 *
 * Model is hosted at https://replicate.com/google/nano-banana-pro — single
 * REPLICATE_API_TOKEN covers both this and stylized/upscale Replicate models.
 */
export class NanoBananaProvider implements ImageProvider {
  id = "nanobanana" as const;
  label = "Nano Banana Pro";

  async generatePortrait(args: GenerateArgs): Promise<GenerateResult> {
    const client = await getReplicateClient();

    const references: string[] = [];
    for (const subject of args.subjects) {
      for (const ref of subject.referencePaths) {
        references.push(await toDataUrl(ref));
      }
    }
    if (args.locationReferencePath) {
      references.push(await toDataUrl(args.locationReferencePath));
    }
    if (args.seedImagePath) {
      references.push(await toDataUrl(args.seedImagePath));
    }

    // Nano Banana Pro returns a single image per call. Fan out 4 variants in
    // parallel with slightly different variation prompts.
    const calls = [0, 1, 2, 3].map(async (variant) => {
      const output = await client.run(MODEL_ID as ModelSlug, {
        input: {
          prompt: buildGeneratePromptText(args, variant),
          image_input: references,
          aspect_ratio: args.aspectRatio,
          resolution: "2K",
          output_format: "jpg",
          safety_filter_level: "block_only_high",
        },
      });
      return urlToImage(await resolveUrl(output));
    });

    const images = (await Promise.all(calls.map((p) => p.catch(() => null)))).filter(
      Boolean,
    ) as GenerateResult["images"];
    if (images.length === 0) {
      throw new Error("Nano Banana Pro returned no images");
    }
    return { images };
  }

  async refineImage(args: RefineArgs): Promise<RefineResult> {
    const client = await getReplicateClient();

    const imageInputs: string[] = [];
    // Original roster references — identity anchor, re-passed every turn.
    for (const { subject } of args.originalReferences) {
      for (const ref of subject.referencePaths) {
        imageInputs.push(await toDataUrl(ref));
      }
    }
    // Location reference, if one was supplied for the shoot, re-passed too.
    if (args.locationReferencePath) {
      imageInputs.push(await toDataUrl(args.locationReferencePath));
    }
    // The current frame being edited (goes last so the model knows which image to modify).
    imageInputs.push(await toDataUrl(args.baseImage.relativePath));

    const output = await client.run(MODEL_ID as ModelSlug, {
      input: {
        prompt: buildRefinePromptText(args),
        image_input: imageInputs,
        aspect_ratio: args.aspectRatio,
        resolution: "2K",
        output_format: "jpg",
        safety_filter_level: "block_only_high",
      },
    });

    const image = await urlToImage(await resolveUrl(output));
    return { images: [image] };
  }
}

/**
 * Wrap the framework-composed prompt (from buildGenerationPrompt) with a
 * tight set of anchoring notes. The composed prompt is the direction; the
 * notes are the rails. Kept short deliberately.
 */
function buildGeneratePromptText(args: GenerateArgs, variant: number): string {
  return [
    args.prompt,
    "",
    "Art-director rails:",
    "— Preserve every subject's identity faithfully from the attached reference photos: facial features, age, hair, skin tone; for pets, breed and markings.",
    "— All named subjects must appear together in one coherent composition, interacting naturally, never stiffly posed.",
    `— Output one high-resolution image at ${args.aspectRatio} aspect ratio. Return only the image.`,
    `— Variation ${variant + 1} of 4: subtly vary pose, gaze or micro-composition compared to other variations, but keep the same setting, light, wardrobe and mood.`,
  ].join("\n");
}

function buildRefinePromptText(args: RefineArgs): string {
  const historyLines =
    args.history.length > 0
      ? args.history.map((h, i) => `  ${i + 1}. ${h.instruction}`).join("\n")
      : "  (none)";

  return [
    `Art direction: refine the final image in the inputs (the current family portrait). Apply ONLY this change — "${args.instruction}". Everything else stays identical: every face, wardrobe, pose, framing, light, palette. Identities must match the original reference photos at the start of this input set.`,
    "",
    `Original brief: ${args.themeBlurb}`,
    "",
    "Previous art-director notes on this shoot, oldest to newest:",
    historyLines,
    "",
    `Return a single ${args.aspectRatio} image. No captions unless the change explicitly asks for text.`,
  ].join("\n");
}
