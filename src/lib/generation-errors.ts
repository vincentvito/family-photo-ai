export const GENERATION_TEMPORARILY_UNAVAILABLE_MESSAGE =
  "The studio is temporarily unavailable. No photo credit was charged for this failed attempt. Please try again later.";

export class GenerationProviderError extends Error {
  constructor(message = GENERATION_TEMPORARILY_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "GenerationProviderError";
  }
}

export function isProviderRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return /(?:status\s*429|too many requests|rate limit|request was throttled)/iu.test(
      String(error ?? ""),
    );
  }

  const record = error as Record<string, unknown>;
  const response = record.response as
    | { status?: number; headers?: { get?: (name: string) => string | null } }
    | undefined;
  return (
    record.status === 429 ||
    record.statusCode === 429 ||
    response?.status === 429 ||
    /(?:status\s*429|too many requests|rate limit|request was throttled)/iu.test(
      String(record.message ?? error),
    )
  );
}

export function toPublicGenerationFailure(error: unknown): string {
  if (error instanceof GenerationProviderError) return error.message;
  return GENERATION_TEMPORARILY_UNAVAILABLE_MESSAGE;
}

export function publicGenerationErrorMessage(
  status: string,
  storedMessage: string | null,
): string | null {
  return status === "error" ? GENERATION_TEMPORARILY_UNAVAILABLE_MESSAGE : storedMessage;
}
