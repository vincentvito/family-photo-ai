import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { upscaleImage, readUpscaledImage } from "@/lib/upscale-queries";
import type { UpscaleTarget } from "@/lib/providers/types";
import { isRateLimited } from "@/lib/request-limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const UPSCALES_PER_MINUTE = 2;

function parsePrintTarget(value: string | null): Extract<UpscaleTarget, "8x10" | "16x20"> | null {
  if (value === null) return "8x10";
  if (value === "8x10" || value === "16x20") return value;
  return null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ imageId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (await isRateLimited(`ai:upscale:${user.id}`, UPSCALES_PER_MINUTE)) {
    return NextResponse.json(
      { error: "Too many upscale attempts. Try again in a minute." },
      { status: 429 },
    );
  }
  const { imageId } = await params;
  const target = parsePrintTarget(req.nextUrl.searchParams.get("target"));
  if (!target) {
    return NextResponse.json({ error: "invalid target" }, { status: 400 });
  }

  try {
    await upscaleImage({ userId: user.id, imageId, target });
    const data = await readUpscaledImage(user.id, imageId, target);
    return new NextResponse(data as unknown as BodyInit, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="portrait-${target}.jpg"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upscale failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
