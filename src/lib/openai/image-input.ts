import { z } from "zod";
import type { AspectRatio } from "@/lib/providers/types";

// Stored with each job. A later default change must not change a queued request.
export const OpenAIImageInput = z.object({
  version: z.literal(1),
  model: z.enum(["gpt-image-2.5-sunburst", "gpt-image-2.5-flare"]),
  quality: z.literal("medium"),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]),
  outputFormat: z.literal("png"),
  moderation: z.literal("low"),
  prompt: z.string().min(1).max(32000),
  imageKeys: z.array(z.string().min(1)).min(1).max(10),
});
export type OpenAIImageInput = z.infer<typeof OpenAIImageInput>;

export const OPENAI_IMAGE_SIZES: Record<AspectRatio, OpenAIImageInput["size"]> = {
  "1:1": "1024x1024",
  "3:2": "1536x1024",
  "2:3": "1024x1536",
};
