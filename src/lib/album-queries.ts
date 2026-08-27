import { db, schema } from "@/lib/db";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { studioCutoffDate } from "@/lib/retention";
import { retainedGenerationCondition } from "@/lib/retention-queries";

export async function toggleFavorite(userId: string, imageId: string) {
  const [imageRow] = await db
    .select({ image: schema.images, generation: schema.generations })
    .from(schema.images)
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .where(and(eq(schema.images.id, imageId), eq(schema.generations.userId, userId)))
    .limit(1);
  if (!imageRow) throw new Error("Image not found");
  const { image, generation } = imageRow;
  if (generation.createdAt < studioCutoffDate(new Date(), generation.packTier)) {
    throw new Error("This shoot has expired.");
  }

  const result = await setImageRating(userId, imageId, image.isFavorite ? null : "up");
  return result.isFavorite;
}

export type ImageRating = "up" | "down" | null;

export function getImageRatingEffects(rating: ImageRating) {
  return {
    isFavorite: rating === "up",
    shouldBeInAlbum: rating === "up",
  };
}

export async function setImageRating(userId: string, imageId: string, rating: ImageRating) {
  const [row] = await db
    .select({ image: schema.images, generation: schema.generations })
    .from(schema.images)
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .where(and(eq(schema.images.id, imageId), eq(schema.generations.userId, userId)))
    .limit(1);

  if (!row) throw new Error("Image not found");
  if (row.generation.createdAt < studioCutoffDate(new Date(), row.generation.packTier)) {
    throw new Error("This shoot has expired.");
  }

  const { isFavorite, shouldBeInAlbum } = getImageRatingEffects(rating);
  await db.transaction(async (tx) => {
    // Serialize first-album creation for this user. The unique indexes are the
    // final guard, while the lock also prevents split albums under concurrent likes.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

    await tx
      .update(schema.images)
      .set({ rating, ratedAt: rating ? new Date() : null, isFavorite })
      .where(and(eq(schema.images.id, imageId), eq(schema.images.generationId, row.generation.id)));

    const [album] = await tx
      .select()
      .from(schema.albums)
      .where(eq(schema.albums.userId, userId))
      .limit(1);

    if (shouldBeInAlbum) {
      const [insertedAlbum] = album
        ? []
        : await tx
            .insert(schema.albums)
            .values({ userId })
            .onConflictDoNothing({ target: schema.albums.userId })
            .returning();
      const albumRow =
        album ??
        insertedAlbum ??
        (await tx.select().from(schema.albums).where(eq(schema.albums.userId, userId)).limit(1))[0];
      if (!albumRow) throw new Error("Could not create album");

      await tx
        .insert(schema.albumImages)
        .values({ albumId: albumRow.id, imageId })
        .onConflictDoNothing({
          target: [schema.albumImages.albumId, schema.albumImages.imageId],
        });
    } else if (album) {
      await tx
        .delete(schema.albumImages)
        .where(
          and(eq(schema.albumImages.albumId, album.id), eq(schema.albumImages.imageId, imageId)),
        );
    }
  });

  revalidatePath("/studio/album");
  revalidatePath(`/studio/generate/${row.generation.id}`);
  return { rating, isFavorite };
}

export async function getAlbum(userId: string) {
  const [album] = await db
    .select()
    .from(schema.albums)
    .where(eq(schema.albums.userId, userId))
    .limit(1);
  if (!album) return { album: null, items: [] };

  const items = await db
    .select({
      image: {
        id: schema.images.id,
        aspectRatio: schema.images.aspectRatio,
        refineInstruction: schema.images.refineInstruction,
      },
      generation: {
        themeId: schema.generations.themeId,
        freePreview: schema.generations.freePreview,
      },
      creditUsageId: schema.creditUsages.id,
    })
    .from(schema.albumImages)
    .innerJoin(schema.images, eq(schema.albumImages.imageId, schema.images.id))
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
    .where(
      and(
        eq(schema.albumImages.albumId, album.id),
        eq(schema.generations.userId, userId),
        retainedGenerationCondition(),
      ),
    )
    .orderBy(desc(schema.albumImages.addedAt));

  return { album, items };
}

export async function getRecentShoots(userId: string, limit?: number) {
  const generationsQuery = db
    .select()
    .from(schema.generations)
    .where(and(eq(schema.generations.userId, userId), retainedGenerationCondition()))
    .orderBy(desc(schema.generations.createdAt));

  const generations =
    typeof limit === "number" ? await generationsQuery.limit(limit) : await generationsQuery;

  if (generations.length === 0) return [];

  const generationIds = generations.map((generation) => generation.id);
  const images = await db
    .select()
    .from(schema.images)
    .where(inArray(schema.images.generationId, generationIds))
    .orderBy(desc(schema.images.createdAt));

  const imagesByGeneration = new Map<string, typeof images>();
  for (const image of images) {
    const list = imagesByGeneration.get(image.generationId);
    if (list) list.push(image);
    else imagesByGeneration.set(image.generationId, [image]);
  }

  return generations.map((generation) => {
    const generationImages = imagesByGeneration.get(generation.id) ?? [];
    const originals = generationImages.filter((image) => image.parentImageId === null);
    return {
      generation,
      imageCount: originals.length,
      favoriteCount: generationImages.filter((image) => image.isFavorite).length,
      previewImageId: generationImages[0]?.id ?? null,
    };
  });
}
