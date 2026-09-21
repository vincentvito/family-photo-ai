export const GENERATION_METHODS = ["current-prompt", "vibe-reference"] as const;
export type GenerationMethod = (typeof GENERATION_METHODS)[number];
export const DEFAULT_GENERATION_METHOD: GenerationMethod = "current-prompt";

export function isGenerationMethod(value: unknown): value is GenerationMethod {
  return GENERATION_METHODS.includes(value as GenerationMethod);
}

export function resolveGenerationMethod(args: {
  eligiblePortrait: boolean;
  admin: boolean;
  requested?: GenerationMethod;
  appDefault: GenerationMethod;
}): GenerationMethod {
  if (!args.eligiblePortrait) return DEFAULT_GENERATION_METHOD;
  return args.admin && args.requested ? args.requested : args.appDefault;
}
