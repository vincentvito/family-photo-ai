import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { db, schema } from "@/lib/db";
import { asc, eq, inArray } from "drizzle-orm";
import { saveReferencePhoto, deleteStoredImage, deleteStoredPrefix } from "@/lib/storage";
import { z } from "zod";

const RoleSchema = z.enum(["adult", "child", "pet"]);

export async function listRoster() {
  const [people, photos] = await Promise.all([
    db.select().from(schema.people).orderBy(asc(schema.people.createdAt)),
    db.select().from(schema.photos).orderBy(asc(schema.photos.createdAt)),
  ]);
  const photoByPerson = new Map<string, (typeof photos)[number]>();

  for (const photo of photos) {
    photoByPerson.set(photo.personId, photo);
  }

  return people.map((person) => ({
    person,
    photos: photoByPerson.has(person.id) ? [photoByPerson.get(person.id)!] : [],
  }));
}

export async function addPerson(input: {
  name: string;
  role: "adult" | "child" | "pet";
  notes?: string | null;
}) {
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(60),
      role: RoleSchema,
      notes: z.string().trim().max(200).nullable().optional(),
    })
    .parse(input);

  const inserted = await db
    .insert(schema.people)
    .values({
      name: parsed.name,
      role: parsed.role,
      notes: parsed.notes ?? null,
    })
    .returning();

  revalidatePath("/studio/roster");
  return inserted[0];
}

export async function updatePerson(input: {
  id: string;
  name?: string;
  role?: "adult" | "child" | "pet";
  notes?: string | null;
}) {
  const parsed = z
    .object({
      id: z.string().min(1),
      name: z.string().trim().min(1).max(60).optional(),
      role: RoleSchema.optional(),
      notes: z.string().trim().max(200).nullable().optional(),
    })
    .parse(input);

  await db
    .update(schema.people)
    .set({
      ...(parsed.name !== undefined ? { name: parsed.name } : {}),
      ...(parsed.role !== undefined ? { role: parsed.role } : {}),
      ...(parsed.notes !== undefined ? { notes: parsed.notes } : {}),
    })
    .where(eq(schema.people.id, parsed.id));

  revalidatePath("/studio/roster");
}

export async function removePerson(personId: string) {
  const photos = await db.select().from(schema.photos).where(eq(schema.photos.personId, personId));

  await db.delete(schema.people).where(eq(schema.people.id, personId));

  await deleteStoredPrefix(`uploads/${personId}/`).catch((err) => {
    console.warn(`removePerson: R2 prefix delete failed for ${personId}`, err);
  });

  revalidatePath("/studio/roster");
  return photos.length;
}

export async function addPhotoToPerson(input: { personId: string; buffer: Buffer }) {
  const person = await db
    .select({ id: schema.people.id })
    .from(schema.people)
    .where(eq(schema.people.id, input.personId))
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

export async function removePhoto(photoId: string) {
  const photo = await db.select().from(schema.photos).where(eq(schema.photos.id, photoId)).limit(1);

  if (!photo[0]) return;
  const key = `uploads/${photo[0].personId}/${photo[0].fileName}`;
  await db.delete(schema.photos).where(eq(schema.photos.id, photoId));
  await deleteStoredImage(key).catch((err) => {
    console.warn(`removePhoto: R2 delete failed for ${key}`, err);
  });

  revalidatePath("/studio/roster");
}
