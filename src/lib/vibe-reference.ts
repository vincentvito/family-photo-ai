import manifest from "./generation-demo-manifest.json";
import type { AspectRatio, Subject } from "./providers/types";
import { MODEL_CATALOG, type GenerationModelId, type ModelSlug } from "./replicate/models";
import { publicUrl, storedImageExists } from "./storage";
import { THEMES } from "./themes";

type Demo = {
  assetId: string;
  version: string;
  key: string;
  direction: string;
  category: "photoreal" | "stylized";
};
const demos = manifest as Record<string, Demo>;

export class ReferenceInputUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReferenceInputUnavailableError";
  }
}

export type ReferenceOutputInput = {
  version: 1;
  outputIndex: number;
  themeId: string;
  demoAssetId: string;
  demoVersion: string;
  modelId: GenerationModelId;
  modelSlug: ModelSlug;
  providerSettings: {
    quality?: "low" | "medium" | "high" | "auto";
    resolution?: "1K" | "2K";
    outputFormat: "jpg" | "jpeg";
    moderation?: "low";
    safetyFilterLevel?: "block_only_high";
  };
  prompt: string;
  /** Durable R2 keys in provider order: demo, then one selfie per subject. */
  imageKeys: string[];
  aspectRatio: AspectRatio;
};

export function getGenerationDemo(themeId: string): Demo {
  const demo = demos[themeId];
  if (!demo) throw new Error(`No versioned generation demo is configured for ${themeId}.`);
  return demo;
}

export async function validateAllGenerationDemos(): Promise<void> {
  const portraitIds = THEMES.filter((theme) => theme.category !== "card").map((theme) => theme.id);
  const missing: string[] = [];
  for (let start = 0; start < portraitIds.length; start += 10) {
    const batch = portraitIds.slice(start, start + 10);
    const results = await Promise.all(
      batch.map(async (id) => {
        const demo = getGenerationDemo(id);
        return {
          id,
          exists: (await storedImageExists(demo.key)) && (await isPublicDemoReachable(demo.key)),
        };
      }),
    );
    missing.push(...results.filter((result) => !result.exists).map((result) => result.id));
  }
  if (missing.length)
    throw new ReferenceInputUnavailableError(
      `Generation demos are unavailable for: ${missing.join(", ")}.`,
    );
}

export function buildReferencePrompt(args: {
  themeId: string;
  subjects: readonly Subject[];
  aspectRatio: AspectRatio;
  wardrobeNote?: string | null;
}): string {
  const demo = getGenerationDemo(args.themeId);
  const people = args.subjects.filter((subject) => subject.role !== "pet");
  const pets = args.subjects.filter((subject) => subject.role === "pet");
  const labels = args.subjects.map(
    (subject, index) =>
      `image ${index + 2}: ${subject.name} (${subject.role === "pet" ? "pet" : subject.role === "child" ? "child" : "adult"})`,
  );
  const roster = [
    people.length ? `${people.length} ${people.length === 1 ? "person" : "people"}` : "",
    pets.length ? `${pets.length} ${pets.length === 1 ? "pet" : "pets"}` : "",
  ]
    .filter(Boolean)
    .join(" and ");
  const sourceImages =
    args.subjects.length === 1 ? "image 2" : `images 2–${args.subjects.length + 1}`;
  return [
    `Recreate the portrait in image 1 using only the ${roster} in ${sourceImages}.`,
    `Subjects: ${labels.join("; ")}. Include each once, with no additional people or animals.`,
    "Use image 1 for medium, visual style, and arrangement only; use the later images for identity. Preserve recognizable faces, features, and ages, and keep pets as animals.",
    `${demo.direction} Adapt the arrangement to this group size and ${args.aspectRatio} shape without dropping or repeating anyone.`,
    args.wardrobeNote?.trim()
      ? `Use this wardrobe instead of image 1's clothing: ${args.wardrobeNote.trim()}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildReferenceOutputInputs(args: {
  themeIds: readonly string[];
  subjects: readonly Subject[];
  aspectRatio: AspectRatio;
  wardrobeNote?: string | null;
  modelId: GenerationModelId;
}): ReferenceOutputInput[] {
  return Array.from({ length: 4 }, (_, outputIndex) => {
    const themeId = args.themeIds[outputIndex % args.themeIds.length];
    const demo = getGenerationDemo(themeId);
    const selfieKeys = args.subjects.map((subject) => {
      const key = subject.referencePaths[0];
      if (!key) throw new Error(`Missing selfie for ${subject.name}.`);
      return key;
    });
    return {
      version: 1 as const,
      outputIndex,
      themeId,
      demoAssetId: demo.assetId,
      demoVersion: demo.version,
      modelId: args.modelId,
      modelSlug: MODEL_CATALOG[args.modelId].slug,
      providerSettings:
        args.modelId === "nanobanana"
          ? { resolution: "1K", outputFormat: "jpg" }
          : args.modelId === "nano-banana-pro"
            ? { resolution: "2K", outputFormat: "jpg", safetyFilterLevel: "block_only_high" }
            : {
                quality: MODEL_CATALOG[args.modelId].gptImageQuality ?? "medium",
                outputFormat: "jpeg",
                moderation: "low",
              },
      prompt: buildReferencePrompt({
        themeId,
        subjects: args.subjects,
        aspectRatio: args.aspectRatio,
        wardrobeNote: args.wardrobeNote,
      }),
      imageKeys: [demo.key, ...selfieKeys],
      aspectRatio: args.aspectRatio,
    };
  });
}

export async function validateReferenceInputs(
  inputs: readonly ReferenceOutputInput[],
): Promise<void> {
  const keys = [...new Set(inputs.flatMap((input) => input.imageKeys))];
  const availability = await Promise.all(keys.map((key) => storedImageExists(key)));
  const missing = keys.filter((_, index) => !availability[index]);
  if (missing.length)
    throw new ReferenceInputUnavailableError(
      `Required generation reference is unavailable: ${missing.join(", ")}.`,
    );
  const demoKeys = [...new Set(inputs.map((input) => input.imageKeys[0]))];
  const reachable = await Promise.all(demoKeys.map(isPublicDemoReachable));
  const blocked = demoKeys.filter((_, index) => !reachable[index]);
  if (blocked.length)
    throw new ReferenceInputUnavailableError(
      `Generation demo URL is not reachable: ${blocked.join(", ")}.`,
    );
}

async function isPublicDemoReachable(key: string): Promise<boolean> {
  try {
    const response = await fetch(publicUrl(key), { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

export function referenceInputUrls(input: ReferenceOutputInput): string[] {
  return input.imageKeys.map(publicUrl);
}
