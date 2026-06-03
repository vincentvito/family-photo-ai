import { db, schema } from "@/lib/db";
import { studioCutoffDate } from "@/lib/retention";
import { deleteStoredImage, deleteStoredPrefix } from "@/lib/storage";
import { and, eq, inArray, lt, or, sql } from "drizzle-orm";

const TEMP_ROSTER_RETENTION_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function cleanupExpiredStudio() {
  const cutoff = studioCutoffDate();
  const proCutoff = studioCutoffDate(new Date(), "pro");
  const tempRosterCutoff = new Date(Date.now() - TEMP_ROSTER_RETENTION_DAYS * DAY_MS);

  const [expiredGenerations, oldPeople, activeProSubscriptions] = await Promise.all([
    db
      .select()
      .from(schema.generations)
      .where(
        or(
          and(eq(schema.generations.packTier, "pro"), lt(schema.generations.createdAt, proCutoff)),
          and(
            sql`${schema.generations.packTier} is distinct from 'pro'`,
            lt(schema.generations.createdAt, cutoff),
          ),
        ),
      ),
    db
      .select()
      .from(schema.people)
      .where(
        or(
          lt(schema.people.createdAt, cutoff),
          and(sql`${schema.people.userId} like 'temp:%'`, lt(schema.people.createdAt, tempRosterCutoff)),
        ),
      ),
    db
      .select({ userId: schema.subscriptions.userId })
      .from(schema.subscriptions)
      .where(sql`${schema.subscriptions.status} in ('active', 'trialing')`),
  ]);
  const activeProUserIds = new Set(
    activeProSubscriptions.map((subscription) => subscription.userId),
  );
  const expiredPeople = oldPeople.filter(
    (person) => person.userId.startsWith("temp:") || !activeProUserIds.has(person.userId),
  );
  const expiredGenerationIds = expiredGenerations.map((generation) => generation.id);
  const expiredImages =
    expiredGenerationIds.length > 0
      ? await db
          .select({ id: schema.images.id })
          .from(schema.images)
          .where(inArray(schema.images.generationId, expiredGenerationIds))
      : [];

  await Promise.all([
    ...expiredGenerations.flatMap((generation) => {
      const tasks = [
        deleteStoredPrefix(`generations/${generation.id}/`).catch((err) => {
          console.warn(`cleanupExpiredStudio: failed to delete generation ${generation.id}`, err);
        }),
      ];
      if (generation.locationReferencePath) {
        tasks.push(
          deleteStoredImage(generation.locationReferencePath).catch((err) => {
            console.warn(
              `cleanupExpiredStudio: failed to delete location ${generation.locationReferencePath}`,
              err,
            );
          }),
        );
      }
      return tasks;
    }),
    ...expiredImages.map((image) =>
      deleteStoredPrefix(`cache/upscales/${image.id}-`).catch((err) => {
        console.warn(`cleanupExpiredStudio: failed to delete upscales for ${image.id}`, err);
      }),
    ),
    ...expiredPeople.map((person) =>
      deleteStoredPrefix(`uploads/${person.id}/`).catch((err) => {
        console.warn(`cleanupExpiredStudio: failed to delete uploads for ${person.id}`, err);
      }),
    ),
  ]);

  if (expiredPeople.length > 0) {
    await db.delete(schema.people).where(
      inArray(
        schema.people.id,
        expiredPeople.map((person) => person.id),
      ),
    );
  }

  return {
    cutoff,
    generationsStoragePurged: expiredGenerations.length,
    upscaleCachesPurged: expiredImages.length,
    peopleDeleted: expiredPeople.length,
    tempRosterCutoff,
  };
}
