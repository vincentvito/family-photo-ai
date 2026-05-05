import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { readStoredImage } from "@/lib/storage";
import { studioCutoffDate } from "@/lib/retention";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;

  const photo = await db
    .select({ photo: schema.photos })
    .from(schema.photos)
    .innerJoin(schema.people, eq(schema.photos.personId, schema.people.id))
    .where(and(eq(schema.photos.id, id), eq(schema.people.userId, user.id)))
    .limit(1);

  let key: string | null = null;
  if (photo[0]) {
    key = `uploads/${photo[0].photo.personId}/${photo[0].photo.fileName}`;
  } else {
    const image = await db
      .select({ image: schema.images, generation: schema.generations })
      .from(schema.images)
      .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
      .where(and(eq(schema.images.id, id), eq(schema.generations.userId, user.id)))
      .limit(1);
    if (image[0]) {
      const { image: storedImage, generation } = image[0];
      if (!generation || generation.createdAt < studioCutoffDate()) {
        return new NextResponse("Not found", { status: 404 });
      }
      key = `generations/${storedImage.generationId}/${storedImage.fileName}`;
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
