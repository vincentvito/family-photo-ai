import { db, schema } from "@/lib/db";
import { studioCutoffDate } from "@/lib/retention";
import { deleteStoredImage, deleteStoredPrefix } from "@/lib/storage";
import { lt } from "drizzle-orm";

export async function cleanupExpiredStudio() {
  const cutoff = studioCutoffDate();

  const [expiredGenerations, expiredPeople] = await Promise.all([
    db.select().from(schema.generations).where(lt(schema.generations.createdAt, cutoff)),
    db.select().from(schema.people).where(lt(schema.people.createdAt, cutoff)),
  ]);

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
    ...expiredPeople.map((person) =>
      deleteStoredPrefix(`uploads/${person.id}/`).catch((err) => {
        console.warn(`cleanupExpiredStudio: failed to delete uploads for ${person.id}`, err);
      }),
    ),
  ]);

  await Promise.all([
    expiredGenerations.length > 0
      ? db.delete(schema.generations).where(lt(schema.generations.createdAt, cutoff))
      : Promise.resolve(),
    expiredPeople.length > 0
      ? db.delete(schema.people).where(lt(schema.people.createdAt, cutoff))
      : Promise.resolve(),
  ]);

  return {
    cutoff,
    generationsDeleted: expiredGenerations.length,
    peopleDeleted: expiredPeople.length,
  };
}
