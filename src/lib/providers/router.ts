import type { ImageProvider, UpscaleArgs, UpscaleResult } from "./types";
import { MockProvider } from "./mock";
import { NanoBananaProvider } from "./nanobanana";
import { ReplicateProvider } from "./replicate";

const mock = new MockProvider();
const nanoBanana = new NanoBananaProvider();
const replicate = new ReplicateProvider();

function mockMode() {
  return (
    process.env.NEXT_PUBLIC_MOCK_MODE === "1" ||
    process.env.MOCK_MODE === "1"
  );
}

export function availableProviders() {
  // Both Nano Banana Pro and the stylized/upscale Replicate models are served
  // from Replicate, so a single REPLICATE_API_TOKEN unlocks everything.
  const hasReplicate = !!process.env.REPLICATE_API_TOKEN;
  return {
    nanobanana: hasReplicate,
    replicate: hasReplicate,
  };
}

/**
 * Pick the provider to use for initial generation.
 * Every theme (photoreal, stylized, card) and every custom vibe now runs on
 * Nano Banana Pro. Falls back to the mock provider if no Replicate token is
 * available.
 */
export function pickGenerationProvider(): ImageProvider {
  if (mockMode()) return mock;
  return availableProviders().nanobanana ? nanoBanana : mock;
}

/** Refinement is ALWAYS routed through Nano Banana Pro (with mock fallback). */
export function pickRefineProvider(): ImageProvider {
  if (mockMode()) return mock;
  return availableProviders().nanobanana ? nanoBanana : mock;
}

/** Upscaling always goes through Replicate (with mock fallback). */
export async function upscale(args: UpscaleArgs): Promise<UpscaleResult> {
  if (mockMode() || !availableProviders().replicate) {
    return mock.upscale!(args);
  }
  return replicate.upscale!(args);
}

export function providerStatusLabel() {
  if (mockMode()) return "Mock mode — no API calls will be made.";
  const a = availableProviders();
  if (!a.nanobanana && !a.replicate) return "No API keys set — running in mock mode.";
  const parts: string[] = [];
  parts.push(a.nanobanana ? "Nano Banana Pro ✓" : "Nano Banana Pro ✕");
  parts.push(a.replicate ? "Replicate ✓" : "Replicate ✕");
  return parts.join("  ·  ");
}
