import { MockProvider } from "./mock";
import { refineImage as refineViaReplicate } from "@/lib/replicate/refine";
import { upscaleImage as upscaleViaReplicate } from "@/lib/replicate/upscale";
import type { RefineArgs, RefineResult, UpscaleArgs, UpscaleResult } from "./types";

const mock = new MockProvider();

function mockMode() {
  return process.env.NEXT_PUBLIC_MOCK_MODE === "1" || process.env.MOCK_MODE === "1";
}

function hasReplicate() {
  return !!process.env.REPLICATE_API_TOKEN;
}

/** Refine via Nano Banana 2, with mock fallback for dev / missing token. */
export async function runRefine(args: RefineArgs): Promise<RefineResult> {
  if (mockMode() || !hasReplicate()) return mock.refineImage(args);
  return refineViaReplicate(args);
}

/** Upscale via Replicate, with mock fallback for dev / missing token. */
export async function runUpscale(args: UpscaleArgs): Promise<UpscaleResult> {
  if (mockMode() || !hasReplicate()) return mock.upscale!(args);
  return upscaleViaReplicate(args);
}

export function providerStatusLabel() {
  if (mockMode()) return "Mock mode — no API calls will be made.";
  if (!hasReplicate()) return "No REPLICATE_API_TOKEN set — running in mock mode.";
  return "Nano Banana 2 ✓";
}
