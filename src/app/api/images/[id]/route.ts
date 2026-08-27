import { NextResponse } from "next/server";
import sharp from "sharp";
import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { getCurrentUser, isAdmin } from "@/lib/auth-helpers";
import {
  deleteStoredImage,
  deleteStoredPrefix,
  isStoredImageMissingError,
  readStoredImage,
} from "@/lib/storage";
import { studioCutoffDate } from "@/lib/retention";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { addPreviewWatermark } from "@/lib/watermark";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;
  const admin = await isAdmin();
  const wantsAdminThumbnail =
    admin && new URL(req.url).searchParams.get("variant") === "admin-thumbnail";

  const photo = wantsAdminThumbnail
    ? []
    : await db
        .select({ photo: schema.photos })
        .from(schema.photos)
        .innerJoin(schema.people, eq(schema.photos.personId, schema.people.id))
        .where(and(eq(schema.photos.id, id), eq(schema.people.userId, user.id)))
        .limit(1);

  let key: string | null = null;
  let shouldWatermark = false;
  if (photo[0]) {
    key = `uploads/${photo[0].photo.personId}/${photo[0].photo.fileName}`;
  } else {
    const image = await db
      .select({
        image: schema.images,
        generation: schema.generations,
        creditUsageId: schema.creditUsages.id,
      })
      .from(schema.images)
      .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
      .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(
        admin
          ? eq(schema.images.id, id)
          : and(eq(schema.images.id, id), eq(schema.generations.userId, user.id)),
      )
      .limit(1);
    if (image[0]) {
      const { image: storedImage, generation } = image[0];
      if (!generation || generation.createdAt < studioCutoffDate(new Date(), generation.packTier)) {
        return new NextResponse("Not found", { status: 404 });
      }
      key = `generations/${storedImage.generationId}/${storedImage.fileName}`;
      shouldWatermark = generation.freePreview && !image[0].creditUsageId;
    }
  }

  if (!key) {
    return new NextResponse("Not found", { status: 404 });
  }

  let original: Buffer;
  try {
    original = await readStoredImage(key);
  } catch (error) {
    if (isStoredImageMissingError(error)) {
      return new NextResponse("Not found", { status: 404 });
    }
    console.error(`Failed to read stored image ${id}`, error);
    return new NextResponse("Image temporarily unavailable", { status: 502 });
  }

  const displayImage = shouldWatermark ? await addPreviewWatermark(original) : original;
  const data = wantsAdminThumbnail
    ? await sharp(displayImage)
        .rotate()
        .resize({ width: 640, height: 480, fit: "cover", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer()
    : displayImage;
  return new NextResponse(data as unknown as BodyInit, {
    headers: {
      "Content-Type": wantsAdminThumbnail
        ? "image/webp"
        : shouldWatermark
          ? "image/jpeg"
          : key.endsWith(".png")
            ? "image/png"
            : "image/jpeg",
      "Cache-Control": wantsAdminThumbnail ? "private, max-age=3600" : "private, no-store",
    },
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const [row] = await db
      .select({ image: schema.images, generation: schema.generations })
      .from(schema.images)
      .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
      .where(and(eq(schema.images.id, id), eq(schema.generations.userId, user.id)))
      .limit(1);

    if (!row || row.generation.createdAt < studioCutoffDate(new Date(), row.generation.packTier)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    if (row.image.parentImageId === null) {
      return NextResponse.json(
        { error: "Original takes cannot be deleted from this view." },
        { status: 400 },
      );
    }

    const key = `generations/${row.image.generationId}/${row.image.fileName}`;
    await Promise.all([
      deleteStoredImage(key),
      deleteStoredPrefix(`cache/upscales/${row.image.id}-`),
    ]);

    await db.transaction(async (tx) => {
      await tx.delete(schema.albumImages).where(eq(schema.albumImages.imageId, row.image.id));
      await tx
        .delete(schema.refinementHistory)
        .where(eq(schema.refinementHistory.resultImageId, row.image.id));
      await tx.delete(schema.images).where(eq(schema.images.id, row.image.id));
    });

    const fallbackImageId = row.image.rootImageId ?? row.image.parentImageId ?? null;
    revalidatePath(`/studio/generate/${row.generation.id}`);
    revalidatePath("/studio/album");
    if (fallbackImageId) revalidatePath(`/studio/refine/${fallbackImageId}`);

    return NextResponse.json({ ok: true, fallbackImageId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
