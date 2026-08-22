import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prepareMerchExport, MerchExportTooLargeError } from "@/lib/merch-export";
import { isRateLimited } from "@/lib/request-limits";
import { readOwnedSourceImage } from "@/lib/upscale-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const EXPORTS_PER_MINUTE = 3;

export async function POST(_req: Request, { params }: { params: Promise<{ imageId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (await isRateLimited(`export:merch:${user.id}`, EXPORTS_PER_MINUTE)) {
    return NextResponse.json(
      { error: "Too many export attempts. Try again in a minute." },
      { status: 429 },
    );
  }

  const { imageId } = await params;

  try {
    const source = await readOwnedSourceImage(user.id, imageId);
    const result = await prepareMerchExport(source);

    return new NextResponse(result.buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": result.mimeType,
        "Content-Length": String(result.byteSize),
        "Content-Disposition": 'attachment; filename="familyshoot-merch-ready.jpg"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof MerchExportTooLargeError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    if (error instanceof Error && error.message === "Image not found") {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    if (error instanceof Error && error.message.startsWith("Unlock")) {
      return NextResponse.json(
        { error: "Unlock this free preview before exporting." },
        { status: 403 },
      );
    }

    console.error("Merchandise export failed", { userId: user.id, imageId, error });
    return NextResponse.json(
      { error: "We could not prepare this portrait. Try again shortly." },
      { status: 500 },
    );
  }
}
