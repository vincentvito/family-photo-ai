import { db, schema } from "@/lib/db";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { studioCutoffDate } from "@/lib/retention";

export async function toggleFavorite(imageId: string) {
  const [imageRow, [album]] = await Promise.all([
    db
      .select({ image: schema.images, generation: schema.generations })
      .from(schema.images)
      .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
      .where(eq(schema.images.id, imageId))
      .limit(1)
      .then((rows) => rows[0]),
    db.select().from(schema.albums).limit(1),
  ]);
  if (!imageRow) throw new Error("Image not found");
  const { image, generation } = imageRow;
  if (generation.createdAt < studioCutoffDate()) {
    throw new Error("This shoot has expired.");
  }

  const nextFav = !image.isFavorite;
  const albumRow = album ?? (await db.insert(schema.albums).values({}).returning())[0];

  if (nextFav) {
    const [, existing] = await Promise.all([
      db.update(schema.images).set({ isFavorite: true }).where(eq(schema.images.id, imageId)),
      db
        .select({ id: schema.albumImages.id })
        .from(schema.albumImages)
        .where(
          and(eq(schema.albumImages.albumId, albumRow.id), eq(schema.albumImages.imageId, imageId)),
        )
        .limit(1),
    ]);
    if (existing.length === 0) {
      await db.insert(schema.albumImages).values({ albumId: albumRow.id, imageId });
    }
  } else {
    await Promise.all([
      db.update(schema.images).set({ isFavorite: false }).where(eq(schema.images.id, imageId)),
      db
        .delete(schema.albumImages)
        .where(
          and(eq(schema.albumImages.albumId, albumRow.id), eq(schema.albumImages.imageId, imageId)),
        ),
    ]);
  }

  revalidatePath("/studio/album");
  return nextFav;
}

export async function getAlbum() {
  const [album] = await db.select().from(schema.albums).limit(1);
  if (!album) return { album: null, items: [] };

  const activeSince = studioCutoffDate();
  const items = await db
    .select({
      image: {
        id: schema.images.id,
        aspectRatio: schema.images.aspectRatio,
        refineInstruction: schema.images.refineInstruction,
      },
      generation: { themeId: schema.generations.themeId },
    })
    .from(schema.albumImages)
    .innerJoin(schema.images, eq(schema.albumImages.imageId, schema.images.id))
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .where(and(eq(schema.albumImages.albumId, album.id), gte(schema.generations.createdAt, activeSince)))
    .orderBy(desc(schema.albumImages.addedAt));

  return { album, items };
}

export async function getRecentShoots(limit = 8) {
  const activeSince = studioCutoffDate();
  const generations = await db
    .select()
    .from(schema.generations)
    .where(gte(schema.generations.createdAt, activeSince))
    .orderBy(desc(schema.generations.createdAt))
    .limit(limit);

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
    return {
      generation,
      imageCount: generationImages.length,
      favoriteCount: generationImages.filter((image) => image.isFavorite).length,
      previewImageId: generationImages[0]?.id ?? null,
    };
  });
}
