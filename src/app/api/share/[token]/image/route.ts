import { NextResponse } from "next/server";
import { getSharedImage } from "@/lib/share-queries";
import { readStoredImage } from "@/lib/storage";
import { addPreviewWatermark } from "@/lib/watermark";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const shared = await getSharedImage(token);
  if (!shared) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const original = await readStoredImage(shared.storageKey);
    const data = shared.shouldWatermark ? await addPreviewWatermark(original) : original;

    return new NextResponse(data as unknown as BodyInit, {
      headers: {
        "Content-Type": shared.shouldWatermark
          ? "image/jpeg"
          : shared.storageKey.endsWith(".png")
            ? "image/png"
            : "image/jpeg",
        "Cache-Control": shared.shouldWatermark
          ? "no-store"
          : "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
