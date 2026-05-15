import { fetchOutputImage, getReplicateClient, resolveOutputUrl } from "./client";
import { MODELS } from "./models";
import { publicUrl } from "@/lib/storage";
import type { RefineArgs, RefineResult } from "@/lib/providers/types";

/**
 * Sync refinement on GPT Image 2. Returns a single edited image. Stays
 * synchronous because each call is a single image (~10-30s) and runs from a
 * server action where we can bump maxDuration if needed.
 */
export async function refineImage(args: RefineArgs): Promise<RefineResult> {
  const client = await getReplicateClient();

  const output = await client.run(MODELS.gptImage2, {
    input: {
      prompt: buildRefinePrompt(args),
      input_images: [publicUrl(args.baseImage.relativePath)],
      aspect_ratio: args.aspectRatio,
      quality: "medium",
      number_of_images: 1,
      output_format: "jpeg",
      moderation: "low",
    },
  });

  const url = await resolveOutputUrl(output);
  const image = await fetchOutputImage(url);
  return { images: [image] };
}

function buildRefinePrompt(args: RefineArgs): string {
  const historyLines =
    args.history.length > 0
      ? args.history.map((h, i) => `  ${i + 1}. ${h.instruction}`).join("\n")
      : "  (none)";

  return [
    `Art direction: refine the input image (the current family portrait). Apply ONLY this change — "${args.instruction}". Everything else stays identical: every face, wardrobe, pose, framing, light, palette.`,
    "",
    `Original brief: ${args.themeBlurb}`,
    "",
    "Previous art-director notes on this shoot, oldest to newest:",
    historyLines,
    "",
    `Return a single ${args.aspectRatio} image. No captions unless the change explicitly asks for text.`,
  ].join("\n");
}
