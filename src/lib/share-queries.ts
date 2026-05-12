import { cache } from "react";
import { nanoid } from "nanoid";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { retainedGenerationCondition } from "@/lib/retention-queries";
import { studioExpiresAt } from "@/lib/retention";

export type SharedImage = NonNullable<Awaited<ReturnType<typeof getSharedImage>>>;

export async function createImageShare(userId: string, imageId: string) {
  const [row] = await db
    .select({
      image: schema.images,
      generation: schema.generations,
    })
    .from(schema.images)
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .where(
      and(
        eq(schema.images.id, imageId),
        eq(schema.generations.userId, userId),
        retainedGenerationCondition(),
      ),
    )
    .limit(1);

  if (!row) throw new Error("Image not found or expired.");

  const [existing] = await db
    .select()
    .from(schema.imageShares)
    .where(
      and(
        eq(schema.imageShares.imageId, imageId),
        eq(schema.imageShares.userId, userId),
        isNull(schema.imageShares.revokedAt),
      ),
    )
    .limit(1);

  if (existing) return existing;

  const [share] = await db
    .insert(schema.imageShares)
    .values({
      imageId,
      userId,
      token: nanoid(24),
    })
    .returning();

  return share;
}

export const getSharedImage = cache(async (token: string) => {
  const [row] = await db
    .select({
      share: schema.imageShares,
      image: schema.images,
      generation: schema.generations,
      creditUsageId: schema.creditUsages.id,
    })
    .from(schema.imageShares)
    .innerJoin(schema.images, eq(schema.imageShares.imageId, schema.images.id))
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
    .where(
      and(
        eq(schema.imageShares.token, token),
        isNull(schema.imageShares.revokedAt),
        retainedGenerationCondition(),
      ),
    )
    .limit(1);

  if (!row) return null;

  return {
    ...row,
    expiresAt: studioExpiresAt(row.generation.createdAt, row.generation.packTier),
    shouldWatermark: row.generation.freePreview && !row.creditUsageId,
    storageKey: `generations/${row.image.generationId}/${row.image.fileName}`,
  };
});
