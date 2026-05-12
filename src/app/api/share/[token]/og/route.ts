export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import sharp from "sharp";
import { NextResponse } from "next/server";
import { getSharedImage } from "@/lib/share-queries";
import { readStoredImage } from "@/lib/storage";
import { addPreviewWatermark } from "@/lib/watermark";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shared = await getSharedImage(token);
  if (!shared) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const original = await readStoredImage(shared.storageKey);
    const source = shared.shouldWatermark ? await addPreviewWatermark(original) : original;
    const data = await sharp(source, { failOn: "none" })
      .rotate()
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return new NextResponse(data as unknown as BodyInit, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
