import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth-helpers";
import { redeemGiftCode } from "@/lib/gift-queries";

export const runtime = "nodejs";

const REDEEM_RATE_LIMIT_WINDOW_MS = 60_000;
const REDEEM_RATE_LIMIT_MAX = 8;
// Best-effort, single-instance throttle. Use shared KV/Redis for a real Vercel-wide limit.
const redeemAttempts = new Map<string, number[]>();

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitKey = `${session.user.id}:${ip}`;
  if (isRedeemRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { error: "Too many redeem attempts. Try again soon." },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => null)) as { code?: string } | null;
  const result = await redeemGiftCode({
    code: body?.code ?? "",
    userId: session.user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  revalidatePath("/studio/account");
  revalidatePath("/studio");

  return NextResponse.json({
    credits: result.gift.credits,
    code: result.gift.code,
  });
}

function isRedeemRateLimited(key: string) {
  const now = Date.now();
  const recent = (redeemAttempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < REDEEM_RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= REDEEM_RATE_LIMIT_MAX) {
    redeemAttempts.set(key, recent);
    return true;
  }

  recent.push(now);
  redeemAttempts.set(key, recent);
  return false;
}
