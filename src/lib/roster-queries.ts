import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { db, schema } from "@/lib/db";
import { and, asc, eq, inArray } from "drizzle-orm";
import { saveReferencePhoto, deleteStoredImage, deleteStoredPrefix } from "@/lib/storage";
import { z } from "zod";
import { ROSTER_NAME_MAX_LENGTH } from "@/lib/roster-constants";
import type { Person, Photo } from "@/../db/schema";

const RoleSchema = z.enum(["adult", "child", "pet"]);

export type RosterPerson = Omit<Person, "notes">;
export type RosterEntry = { person: RosterPerson; photos: Photo[] };

export function stripRosterPersonNotes(person: Person): RosterPerson {
  return {
    id: person.id,
    userId: person.userId,
    name: person.name,
    role: person.role,
    createdAt: person.createdAt,
  };
}

export async function listRoster(userId: string) {
  const people = await db
    .select()
    .from(schema.people)
    .where(eq(schema.people.userId, userId))
    .orderBy(asc(schema.people.createdAt));

  const personIds = people.map((person) => person.id);
  const photos =
    personIds.length > 0
      ? await db
          .select()
          .from(schema.photos)
          .where(inArray(schema.photos.personId, personIds))
          .orderBy(asc(schema.photos.createdAt))
      : [];
  const photoByPerson = new Map<string, (typeof photos)[number]>();

  for (const photo of photos) {
    photoByPerson.set(photo.personId, photo);
  }

  return people.map((person): RosterEntry => ({
    person: stripRosterPersonNotes(person),
    photos: photoByPerson.has(person.id) ? [photoByPerson.get(person.id)!] : [],
  }));
}

export function hideRosterPhotoStorage(roster: RosterEntry[]): RosterEntry[] {
  return roster.map((entry) => ({
    person: entry.person,
    photos: entry.photos.map((photo, index) => ({
      ...photo,
      id: `guest-reference-${entry.person.id}-${index}`,
      fileName: "",
      width: 0,
      height: 0,
    })),
  }));
}

export async function addPerson(input: {
  userId: string;
  name: string;
  role: "adult" | "child" | "pet";
}) {
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(ROSTER_NAME_MAX_LENGTH),
      userId: z.string().min(1),
      role: RoleSchema,
    })
    .parse(input);

  const inserted = await db
    .insert(schema.people)
    .values({
      userId: parsed.userId,
      name: parsed.name,
      role: parsed.role,
      notes: null,
    })
    .returning();

  revalidatePath("/studio/roster");
  return inserted[0];
}

export async function updatePerson(input: {
  userId: string;
  id: string;
  name?: string;
  role?: "adult" | "child" | "pet";
}) {
  const parsed = z
    .object({
      id: z.string().min(1),
      userId: z.string().min(1),
      name: z.string().trim().min(1).max(ROSTER_NAME_MAX_LENGTH).optional(),
      role: RoleSchema.optional(),
    })
    .parse(input);

  await db
    .update(schema.people)
    .set({
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.role !== undefined ? { role: parsed.role } : {}),
    })
    .where(and(eq(schema.people.id, parsed.id), eq(schema.people.userId, parsed.userId)));

  revalidatePath("/studio/roster");
}

export async function removePerson(userId: string, personId: string) {
  const [person] = await db
    .select({ id: schema.people.id })
    .from(schema.people)
    .where(and(eq(schema.people.id, personId), eq(schema.people.userId, userId)))
    .limit(1);

  if (!person) {
    return 0;
  }

  const photos = await db.select().from(schema.photos).where(eq(schema.photos.personId, personId));

  await db
    .delete(schema.people)
    .where(and(eq(schema.people.id, personId), eq(schema.people.userId, userId)));

  await deleteStoredPrefix(`uploads/${personId}/`).catch((err) => {
    console.warn(`removePerson: R2 prefix delete failed for ${personId}`, err);
  });

  revalidatePath("/studio/roster");
  return photos.length;
}

export async function addPhotoToPerson(input: {
  userId: string;
  personId: string;
  buffer: Buffer;
}) {
  const person = await db
    .select({ id: schema.people.id })
    .from(schema.people)
    .where(and(eq(schema.people.id, input.personId), eq(schema.people.userId, input.userId)))
    .limit(1);

  if (!person[0]) {
    throw new Error("Person not found.");
  }

  const existing = await db
    .select()
    .from(schema.photos)
    .where(eq(schema.photos.personId, input.personId));

  const saved = await saveReferencePhoto(input.buffer, input.personId);

  const inserted = await db
    .insert(schema.photos)
    .values({
      personId: input.personId,
      fileName: saved.fileName,
      width: saved.width,
      height: saved.height,
      isPrimary: true,
    })
    .returning();

  if (existing.length > 0) {
    await db.delete(schema.photos).where(
      inArray(
        schema.photos.id,
        existing.map((photo) => photo.id),
      ),
    );

    await Promise.allSettled(
      existing.map((photo) => {
        const key = `uploads/${photo.personId}/${photo.fileName}`;
        return deleteStoredImage(key);
      }),
    );
  }

  revalidatePath("/studio/roster");
  return inserted[0];
}

export async function removePhoto(userId: string, photoId: string) {
  const [photo] = await db
    .select({ photo: schema.photos, person: schema.people })
    .from(schema.photos)
    .innerJoin(schema.people, eq(schema.photos.personId, schema.people.id))
    .where(and(eq(schema.photos.id, photoId), eq(schema.people.userId, userId)))
    .limit(1);

  if (!photo) return;
  const key = `uploads/${photo.photo.personId}/${photo.photo.fileName}`;
  await db.delete(schema.photos).where(eq(schema.photos.id, photoId));
  await deleteStoredImage(key).catch((err) => {
    console.warn(`removePhoto: R2 delete failed for ${key}`, err);
  });

  revalidatePath("/studio/roster");
}
