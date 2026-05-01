import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { resolveStoragePath, getThumbnail } from "@/lib/storage";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thumb = req.nextUrl.searchParams.get("thumb");

  const photo = await db.select().from(schema.photos).where(eq(schema.photos.id, id)).limit(1);

  let relativePath: string | null = null;
  if (photo[0]) {
    relativePath = path.posix.join("uploads", photo[0].personId, photo[0].fileName);
  } else {
    const image = await db.select().from(schema.images).where(eq(schema.images.id, id)).limit(1);
    if (image[0]) {
      relativePath = path.posix.join("generations", image[0].generationId, image[0].fileName);
    }
  }

  if (!relativePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const filePath = thumb
      ? await getThumbnail(relativePath, parseInt(thumb, 10) || 320)
      : resolveStoragePath(relativePath);
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return new NextResponse(data as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
