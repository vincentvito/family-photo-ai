import type {
  ImageProvider,
  GenerateResult,
  RefineResult,
  UpscaleArgs,
  UpscaleResult,
} from "./types";
import {
  getReplicateClient,
  toDataUrl,
  resolveUrl,
  urlToImage,
} from "./replicate-common";

type ModelSlug = `${string}/${string}`;

/**
 * Replicate provider — scoped to print-ready upscaling only.
 *
 * Historically this also generated stylized themes via FLUX 1.1 Pro img2img,
 * seeded from a photoreal Nano Banana pass. That path has been retired:
 * every theme (photoreal, stylized, card) now runs directly on Nano Banana
 * Pro via the NanoBananaProvider, and Replicate is retained solely for the
 * upscaler.
 */
export class ReplicateProvider implements ImageProvider {
  id = "replicate" as const;
  label = "Replicate (upscale only)";

  async generatePortrait(): Promise<GenerateResult> {
    throw new Error(
      "Replicate is no longer used for generation. All themes run on Nano Banana Pro.",
    );
  }

  async refineImage(): Promise<RefineResult> {
    throw new Error(
      "Refinement is always routed through Nano Banana Pro.",
    );
  }

  async upscale(args: UpscaleArgs): Promise<UpscaleResult> {
    const client = await getReplicateClient();
    const imageData = await toDataUrl(args.sourceRelativePath);
    const scaleFactor = args.target === "16x20" ? 4 : 2;

    let output: unknown;
    try {
      output = await client.run(
        "philz1337x/clarity-upscaler" as ModelSlug,
        {
          input: {
            image: imageData,
            scale_factor: scaleFactor,
            dynamic: 6,
            creativity: 0.25,
            resemblance: 0.6,
            output_format: "jpg",
          },
        },
      );
    } catch {
      output = await client.run(
        "nightmareai/real-esrgan" as ModelSlug,
        {
          input: {
            image: imageData,
            scale: scaleFactor,
            face_enhance: true,
          },
        },
      );
    }

    const url = await resolveUrl(output);
    const image = await urlToImage(url);
    if (!image) throw new Error("Upscale returned no image");
    const meta = await (await import("sharp")).default(image.buffer).metadata();
    return {
      buffer: image.buffer,
      mimeType: image.mimeType,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
    };
  }
}
