import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { startGeneration } from "@/lib/generate-queries";
import { isRateLimited } from "@/lib/request-limits";

export const runtime = "nodejs";
export const maxDuration = 300;

const GENERATIONS_PER_MINUTE = 2;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (await isRateLimited(`ai:generate:${user.id}`, GENERATIONS_PER_MINUTE)) {
    return NextResponse.json(
      { error: "Too many generation attempts. Try again in a minute." },
      { status: 429 },
    );
  }
  const json = await req.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const result = await startGeneration(json, { userId: user.id });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    const needsCredits =
      message === "Your free preview is one-time. Add credits before starting another one." ||
      message === "Buy a photo pack before starting a shoot.";
    return NextResponse.json(
      { error: message, needsCredits },
      { status: needsCredits ? 402 : 500 },
    );
  }
}
