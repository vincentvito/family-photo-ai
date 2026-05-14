import { refineImage as refineViaReplicate } from "@/lib/replicate/refine";
import { upscaleImage as upscaleViaReplicate } from "@/lib/replicate/upscale";
import {
  hasReplicateToken,
  isMockModeEnabled,
  isProductionRuntime,
  shouldUseMockProviderFallback,
} from "@/lib/runtime-flags";
import { MockProvider } from "./mock";
import type { RefineArgs, RefineResult, UpscaleArgs, UpscaleResult } from "./types";

const mock = new MockProvider();

/** Refine via Nano Banana 2, with mock fallback for dev / missing token. */
export async function runRefine(args: RefineArgs): Promise<RefineResult> {
  if (shouldUseMockProviderFallback()) return mock.refineImage(args);
  return refineViaReplicate(args);
}

/** Upscale via Replicate, with mock fallback for dev / missing token. */
export async function runUpscale(args: UpscaleArgs): Promise<UpscaleResult> {
  if (shouldUseMockProviderFallback()) return mock.upscale!(args);
  return upscaleViaReplicate(args);
}

export function providerStatusLabel() {
  if (isMockModeEnabled()) return "Mock mode - no API calls will be made.";
  if (isProductionRuntime() && !hasReplicateToken()) return "REPLICATE_API_TOKEN is missing.";
  if (!hasReplicateToken()) return "No REPLICATE_API_TOKEN set - running in mock mode.";
  return "Nano Banana 2 ready";
}
