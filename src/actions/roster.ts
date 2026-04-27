"use server";

import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import fs from "node:fs/promises";
import path from "node:path";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import {
  ensureStorageReady,
  saveReferencePhoto,
  storagePath,
} from "@/lib/storage";
import { z } from "zod";

const RoleSchema = z.enum(["adult", "child", "pet"]);

export async function listRoster() {
  const people = await db
    .select()
    .from(schema.people)
    .orderBy(asc(schema.people.createdAt));

  const roster = await Promise.all(
    people.map(async (person) => {
      const photos = await db
        .select()
        .from(schema.photos)
        .where(eq(schema.photos.personId, person.id))
        .orderBy(asc(schema.photos.createdAt));
      return { person, photos };
    }),
  );

  return roster;
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
  const photos = await db
    .select()
    .from(schema.photos)
    .where(eq(schema.photos.personId, personId));

  await db.delete(schema.people).where(eq(schema.people.id, personId));

  const dir = storagePath("uploads", personId);
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  revalidatePath("/studio/roster");
  return photos.length;
}

export async function addPhotoToPerson(input: {
  personId: string;
  buffer: Buffer;
}) {
  await ensureStorageReady();
  const saved = await saveReferencePhoto(input.buffer, input.personId);

  const existing = await db
    .select()
    .from(schema.photos)
    .where(eq(schema.photos.personId, input.personId))
    .limit(1);

  const inserted = await db
    .insert(schema.photos)
    .values({
      personId: input.personId,
      fileName: saved.fileName,
      width: saved.width,
      height: saved.height,
      isPrimary: existing.length === 0,
    })
    .returning();

  revalidatePath("/studio/roster");
  return inserted[0];
}

export async function removePhoto(photoId: string) {
  const photo = await db
    .select()
    .from(schema.photos)
    .where(eq(schema.photos.id, photoId))
    .limit(1);

  if (!photo[0]) return;
  const abs = path.join(
    storagePath("uploads", photo[0].personId),
    photo[0].fileName,
  );
  await fs.rm(abs, { force: true }).catch(() => {});
  await db.delete(schema.photos).where(eq(schema.photos.id, photoId));

  revalidatePath("/studio/roster");
}
