import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { refineImage } from "@/lib/refine-queries";
import { isRateLimited } from "@/lib/request-limits";
import { GenerationProviderError, toPublicGenerationFailure } from "@/lib/generation-errors";

export const runtime = "nodejs";
export const maxDuration = 300;

const REFINES_PER_MINUTE = 2;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (await isRateLimited(`ai:refine:${user.id}`, REFINES_PER_MINUTE)) {
    return NextResponse.json(
      { error: "Too many regeneration attempts. Try again in a minute." },
      { status: 429 },
    );
  }
  const json = await req.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const result = await refineImage(user.id, json);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const providerFailure = err instanceof GenerationProviderError;
    return NextResponse.json(
      { error: providerFailure ? toPublicGenerationFailure(err) : message },
      { status: providerFailure ? 503 : 500 },
    );
  }
}
