import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { readStoredImage } from "@/lib/storage";
import { studioCutoffDate } from "@/lib/retention";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;

  const photo = await db.select().from(schema.photos).where(eq(schema.photos.id, id)).limit(1);

  let key: string | null = null;
  if (photo[0]) {
    key = `uploads/${photo[0].personId}/${photo[0].fileName}`;
  } else {
    const image = await db.select().from(schema.images).where(eq(schema.images.id, id)).limit(1);
    if (image[0]) {
      const [generation] = await db
        .select()
        .from(schema.generations)
        .where(eq(schema.generations.id, image[0].generationId))
        .limit(1);
      if (!generation || generation.createdAt < studioCutoffDate()) {
        return new NextResponse("Not found", { status: 404 });
      }
      key = `generations/${image[0].generationId}/${image[0].fileName}`;
    }
  }

  if (!key) {
    return new NextResponse("Not found", { status: 404 });
  }

  const data = await readStoredImage(key);
  return new NextResponse(data as unknown as BodyInit, {
    headers: {
      "Content-Type": key.endsWith(".png") ? "image/png" : "image/jpeg",
      "Cache-Control": "private, no-store",
    },
  });
}
