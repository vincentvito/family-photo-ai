import { fetchOutputImage, getReplicateClient, resolveOutputUrl } from "./client";
import { MODELS } from "./models";
import { publicUrl } from "@/lib/storage";
import type { UpscaleArgs, UpscaleResult } from "@/lib/providers/types";

/**
 * Replicate-hosted upscaler. Tries Clarity first, falls back to Real-ESRGAN.
 */
export async function upscaleImage(args: UpscaleArgs): Promise<UpscaleResult> {
  const client = await getReplicateClient();
  const sourceUrl = publicUrl(args.sourceRelativePath);
  const scaleFactor = args.target === "16x20" ? 4 : 2;

  let output: unknown;
  try {
    output = await client.run(MODELS.clarityUpscaler, {
      input: {
        image: sourceUrl,
        scale_factor: scaleFactor,
        dynamic: 6,
        creativity: 0.25,
        resemblance: 0.6,
        output_format: "jpg",
      },
    });
  } catch {
    output = await client.run(MODELS.realEsrgan, {
      input: {
        image: sourceUrl,
        scale: scaleFactor,
        face_enhance: true,
      },
    });
  }

  const url = await resolveOutputUrl(output);
  const image = await fetchOutputImage(url);
  const meta = await (await import("sharp")).default(image.buffer).metadata();
  return {
    buffer: image.buffer,
    mimeType: image.mimeType,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}
