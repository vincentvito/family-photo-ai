import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { upscaleImage } from "@/actions/upscale";
import type { UpscaleTarget } from "@/lib/providers/types";
import { storagePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> },
) {
  const { imageId } = await params;
  const target = (req.nextUrl.searchParams.get("target") ?? "8x10") as UpscaleTarget;

  try {
    const { fileName } = await upscaleImage({ imageId, target });
    const abs = path.join(storagePath("cache", "upscales"), fileName);
    const data = await fs.readFile(abs);
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
