import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { upscaleImage, readUpscaledImage } from "@/lib/upscale-queries";
import type { UpscaleTarget } from "@/lib/providers/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest, { params }: { params: Promise<{ imageId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { imageId } = await params;
  const target = (req.nextUrl.searchParams.get("target") ?? "8x10") as UpscaleTarget;

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
