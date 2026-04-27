"use server";

import { db, schema } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";

export async function toggleFavorite(imageId: string) {
  const [image] = await db
    .select()
    .from(schema.images)
    .where(eq(schema.images.id, imageId))
    .limit(1);
  if (!image) throw new Error("Image not found");

  const nextFav = !image.isFavorite;
  await db
    .update(schema.images)
    .set({ isFavorite: nextFav })
    .where(eq(schema.images.id, imageId));

  const [album] = await db
    .select()
    .from(schema.albums)
    .limit(1);

  const albumRow =
    album ??
    (await db.insert(schema.albums).values({}).returning())[0];

  if (nextFav) {
    const existing = await db
      .select()
      .from(schema.albumImages)
      .where(
        and(
          eq(schema.albumImages.albumId, albumRow.id),
          eq(schema.albumImages.imageId, imageId),
        ),
      );
    if (existing.length === 0) {
      await db.insert(schema.albumImages).values({
        albumId: albumRow.id,
        imageId,
      });
    }
  } else {
    await db
      .delete(schema.albumImages)
      .where(
        and(
          eq(schema.albumImages.albumId, albumRow.id),
          eq(schema.albumImages.imageId, imageId),
        ),
      );
  }

  revalidatePath("/studio/album");
  return nextFav;
}

export async function getAlbum() {
  const [album] = await db.select().from(schema.albums).limit(1);
  if (!album) return { album: null, items: [] };

  const rows = await db
    .select({
      image: schema.images,
      added: schema.albumImages.addedAt,
      generation: schema.generations,
    })
    .from(schema.albumImages)
    .innerJoin(schema.images, eq(schema.albumImages.imageId, schema.images.id))
    .innerJoin(
      schema.generations,
      eq(schema.images.generationId, schema.generations.id),
    )
    .where(eq(schema.albumImages.albumId, album.id))
    .orderBy(desc(schema.albumImages.addedAt));

  return { album, items: rows };
}
