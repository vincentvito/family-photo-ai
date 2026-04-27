"use server";

import path from "node:path";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { z } from "zod";
import {
  ensureStorageReady,
  saveGeneratedImage,
} from "@/lib/storage";
import { buildCustomTheme, getTheme, resolveTheme } from "@/lib/themes";
import type { Theme } from "@/lib/themes";
import { pickGenerationProvider } from "@/lib/providers/router";
import { buildGenerationPrompt } from "@/lib/prompts";
import type { Subject } from "@/lib/providers/types";

const AspectSchema = z.enum(["1:1", "4:5", "3:2", "2:3", "16:9"]);

const CustomVibeSchema = z.object({
  description: z.string().trim().min(4).max(800),
  aspectRatio: AspectSchema,
});

const StartGenerationInput = z
  .object({
    themeId: z.string().min(1).optional(),
    customVibe: CustomVibeSchema.optional(),
    wardrobeNote: z.string().trim().max(240).nullable().optional(),
    cardText: z.string().trim().max(120).nullable().optional(),
    locationReferencePath: z.string().trim().min(1).nullable().optional(),
    /** Canned-theme shape override. Ignored when customVibe is set. */
    aspectOverride: AspectSchema.nullable().optional(),
  })
  .refine(
    (v) => !!v.themeId || !!v.customVibe,
    "Pick a vibe or describe your own.",
  );

export async function startGeneration(
  input: z.infer<typeof StartGenerationInput>,
) {
  const parsed = StartGenerationInput.parse(input);

  let theme: Theme = parsed.customVibe
    ? buildCustomTheme({
        description: parsed.customVibe.description,
        aspectRatio: parsed.customVibe.aspectRatio,
      })
    : getTheme(parsed.themeId!);

  // Apply shape override for canned themes (custom vibes carry their own aspect).
  if (!parsed.customVibe && parsed.aspectOverride) {
    theme = { ...theme, aspectRatio: parsed.aspectOverride };
  }

  const roster = await loadRosterAsSubjects();
  if (roster.length === 0) {
    throw new Error(
      "Your roster is empty. Add at least one person with a reference photo.",
    );
  }
  if (roster.every((r) => r.referencePaths.length === 0)) {
    throw new Error("No reference photos uploaded yet.");
  }

  await ensureStorageReady();

  const provider = pickGenerationProvider(theme.id);
  const prompt = buildGenerationPrompt(
    theme,
    roster,
    parsed.wardrobeNote,
    parsed.cardText ?? null,
  );

  const [generation] = await db
    .insert(schema.generations)
    .values({
      themeId: theme.id,
      prompt,
      providerId: provider.id,
      status: "pending",
      subjectSnapshot: JSON.stringify(roster),
      wardrobeNote: parsed.wardrobeNote ?? null,
      cardText: parsed.cardText ?? null,
      aspectRatio: theme.aspectRatio,
      locationReferencePath: parsed.locationReferencePath ?? null,
      customVibeDescription: parsed.customVibe?.description ?? null,
    })
    .returning();

  runGeneration(generation.id).catch((err) => {
    console.error("runGeneration failed", err);
  });

  return { generationId: generation.id };
}

async function runGeneration(generationId: string) {
  const [generation] = await db
    .select()
    .from(schema.generations)
    .where(eq(schema.generations.id, generationId))
    .limit(1);

  if (!generation) return;

  const theme = resolveTheme(generation);
  const subjects = JSON.parse(generation.subjectSnapshot) as Subject[];
  const provider = pickGenerationProvider(theme.id);

  try {
    const result = await provider.generatePortrait({
      themeId: theme.id,
      themeBlurb: theme.blurb,
      prompt: generation.prompt,
      aspectRatio: theme.aspectRatio,
      subjects,
      wardrobeNote: generation.wardrobeNote,
      cardText: generation.cardText,
      generationId: generation.id,
      seedImagePath: null,
      locationReferencePath: generation.locationReferencePath ?? null,
    });

    if (result.images.length === 0) {
      throw new Error("Provider returned no images");
    }

    for (const img of result.images) {
      const saved = await saveGeneratedImage(
        img.buffer,
        generation.id,
        img.mimeType === "image/png" ? "png" : "jpg",
      );
      await db.insert(schema.images).values({
        generationId: generation.id,
        fileName: saved.fileName,
        width: img.width ?? saved.width,
        height: img.height ?? saved.height,
        aspectRatio: theme.aspectRatio,
      });
    }

    await db
      .update(schema.generations)
      .set({ status: "done" })
      .where(eq(schema.generations.id, generation.id));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    await db
      .update(schema.generations)
      .set({ status: "error", errorMessage: message })
      .where(eq(schema.generations.id, generation.id));
  } finally {
    revalidatePath(`/studio/generate/${generationId}`);
  }
}

export async function getGenerationState(generationId: string) {
  const [generation] = await db
    .select()
    .from(schema.generations)
    .where(eq(schema.generations.id, generationId))
    .limit(1);

  if (!generation) return null;

  const images = await db
    .select()
    .from(schema.images)
    .where(eq(schema.images.generationId, generationId))
    .orderBy(asc(schema.images.createdAt));

  return {
    generation,
    images,
  };
}

async function loadRosterAsSubjects(): Promise<Subject[]> {
  const people = await db
    .select()
    .from(schema.people)
    .orderBy(asc(schema.people.createdAt));

  return Promise.all(
    people.map(async (person) => {
      const photos = await db
        .select()
        .from(schema.photos)
        .where(eq(schema.photos.personId, person.id));
      return {
        personId: person.id,
        name: person.name,
        role: person.role,
        notes: person.notes,
        referencePaths: photos.map((p) =>
          path.posix.join("uploads", person.id, p.fileName),
        ),
      };
    }),
  );
}
