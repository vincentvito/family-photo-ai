import { after } from "next/server";
import { and, asc, eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { db, schema } from "@/lib/db";
import {
  copyStoredImage,
  isStoredImageMissingError,
  readStoredImage,
  saveBuffer,
} from "@/lib/storage";
import { toPublicGenerationFailure } from "@/lib/generation-errors";
import { generateOpenAIImage, OpenAIImageError } from "./images";
import { OpenAIImageInput } from "./image-input";

type Job = typeof schema.imageJobs.$inferSelect;
const STALE_MS = 10 * 60 * 1000;
class InvalidImageError extends Error {}

export async function assertOpenAIJobsReady() {
  // Check the migration before consuming a credit or changing the global default.
  await db.select({ id: schema.imageJobs.id }).from(schema.imageJobs).limit(1);
}

export async function enqueueOpenAIJobs(
  generationId: string,
  inputs: { input: OpenAIImageInput; themeId: string; artStyleId?: string | null }[],
) {
  if (inputs.length !== 4) throw new Error("A shoot must have four output jobs.");
  const parsed = inputs.map((entry) => ({ ...entry, input: OpenAIImageInput.parse(entry.input) }));
  const keys = [...new Set(parsed.flatMap((entry) => entry.input.imageKeys))];
  const copies = new Map<string, string>();
  await Promise.all(
    keys.map(async (key, index) => {
      const extension = key.match(/\.(png|jpe?g|webp)$/i)?.[0] ?? ".jpg";
      const destination = `generations/${generationId}/references/openai-${index}${extension}`;
      await copyStoredImage(key, destination);
      copies.set(key, destination);
    }),
  );
  // One insert publishes all four jobs only after every reference is preserved.
  await db.insert(schema.imageJobs).values(
    parsed.map((entry, slotIndex) => ({
      generationId,
      slotIndex,
      themeId: entry.themeId,
      artStyleId: entry.artStyleId ?? null,
      input: JSON.stringify({
        ...entry.input,
        imageKeys: entry.input.imageKeys.map((key) => copies.get(key)!),
      }),
    })),
  );
}

function outputKey(job: Job) {
  return `generations/${job.generationId}/openai-${job.id}.png`;
}

async function imageMetadata(buffer: Buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    if (metadata.format !== "png" || !metadata.width || !metadata.height)
      throw new Error("Invalid image");
    return metadata;
  } catch {
    throw new InvalidImageError("Invalid OpenAI image output.");
  }
}

async function saveResult(job: Job, buffer: Buffer) {
  const metadata = await imageMetadata(buffer);
  await db.transaction(async (tx) => {
    const [generation] = await tx
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, job.generationId))
      .for("update");
    if (!generation || generation.status !== "pending") return;
    const [updated] = await tx
      .update(schema.imageJobs)
      .set({ status: "succeeded", error: null })
      .where(and(eq(schema.imageJobs.id, job.id), eq(schema.imageJobs.status, "running")))
      .returning();
    if (!updated) return;
    await tx
      .insert(schema.images)
      .values({
        id: job.id,
        generationId: job.generationId,
        fileName: `openai-${job.id}.png`,
        width: metadata.width!,
        height: metadata.height!,
        aspectRatio: generation.aspectRatio ?? "3:2",
        themeId: job.themeId,
        artStyleId: job.artStyleId,
      })
      .onConflictDoNothing({ target: schema.images.id });
  });
}

async function failJob(job: Job, message: string, requestId?: string | null) {
  await db
    .update(schema.imageJobs)
    .set({ status: "failed", error: message, ...(requestId ? { requestId } : {}) })
    .where(and(eq(schema.imageJobs.id, job.id), eq(schema.imageJobs.status, "running")));
}

export async function settleOpenAIGeneration(generationId: string) {
  await db.transaction(async (tx) => {
    const [generation] = await tx
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.id, generationId))
      .for("update");
    if (!generation || generation.status !== "pending" || generation.providerId !== "openai")
      return;
    const jobs = await tx
      .select()
      .from(schema.imageJobs)
      .where(eq(schema.imageJobs.generationId, generationId));
    if (jobs.some((job) => job.status === "queued" || job.status === "running")) return;
    if (jobs.length < 4 && Date.now() - generation.createdAt.getTime() < STALE_MS) return;
    const succeeded = jobs.some((job) => job.status === "succeeded");
    await tx
      .update(schema.generations)
      .set({
        status: succeeded ? "done" : "error",
        errorMessage: succeeded
          ? null
          : toPublicGenerationFailure(new Error("All OpenAI outputs failed.")),
      })
      .where(eq(schema.generations.id, generationId));
    // A shoot credit buys all four images. Keep partial results and refund once.
    if (jobs.filter((job) => job.status === "succeeded").length < 4)
      await tx
        .delete(schema.creditUsages)
        .where(eq(schema.creditUsages.generationId, generationId));
  });
}

export async function processOpenAIJobs(
  generationId: string,
  dependencies = {
    generate: generateOpenAIImage,
    readImage: readStoredImage,
    saveImage: saveBuffer,
  },
) {
  const [generation] = await db
    .select()
    .from(schema.generations)
    .where(eq(schema.generations.id, generationId));
  if (!generation || generation.providerId !== "openai" || generation.status !== "pending") return;
  const jobs = await db
    .select()
    .from(schema.imageJobs)
    .where(eq(schema.imageJobs.generationId, generationId))
    .orderBy(asc(schema.imageJobs.slotIndex));
  const results = await Promise.allSettled(
    jobs.map(async (job) => {
      if (job.status === "running") {
        if (Date.now() - (job.startedAt ?? job.createdAt).getTime() < STALE_MS) return;
        // A worker can stop after writing R2 but before committing the image row.
        // Recover those bytes. Never repeat an uncertain paid request.
        try {
          await saveResult(job, await dependencies.readImage(outputKey(job)));
        } catch (error) {
          if (isStoredImageMissingError(error) || error instanceof InvalidImageError)
            await failJob(job, "Request interrupted; no automatic paid retry.");
          else throw error;
        }
        return;
      }
      if (job.status !== "queued") return;
      const [claimed] = await db
        .update(schema.imageJobs)
        .set({ status: "running", startedAt: new Date() })
        .where(and(eq(schema.imageJobs.id, job.id), eq(schema.imageJobs.status, "queued")))
        .returning();
      if (!claimed) return;
      let result;
      try {
        result = await dependencies.generate(OpenAIImageInput.parse(JSON.parse(job.input)));
        await imageMetadata(result.buffer);
      } catch (error) {
        await failJob(
          job,
          error instanceof OpenAIImageError
            ? error.message
            : "Image request failed or timed out; no automatic paid retry.",
          error instanceof OpenAIImageError ? error.requestId : null,
        );
        return;
      }
      // Keep running on storage/DB failure so stale recovery can find the saved file.
      await dependencies.saveImage(outputKey(job), result.buffer, "image/png");
      await db
        .update(schema.imageJobs)
        .set({ requestId: result.requestId, usage: JSON.stringify(result.usage) })
        .where(eq(schema.imageJobs.id, job.id));
      await saveResult(job, result.buffer);
    }),
  );
  await settleOpenAIGeneration(generationId);
  const failure = results.find((result) => result.status === "rejected");
  if (failure?.status === "rejected") throw failure.reason;
}

export function scheduleOpenAIJobs(generationId: string) {
  after(async () => {
    try {
      await processOpenAIJobs(generationId);
    } catch (error) {
      console.error(`OpenAI worker failed for ${generationId}`, error);
    }
  });
}

export async function processPendingOpenAIShoots(processGeneration = processOpenAIJobs) {
  const cutoff = new Date(Date.now() - STALE_MS).toISOString();
  const pending = await db
    .select({ id: schema.generations.id })
    .from(schema.generations)
    .where(
      and(
        eq(schema.generations.providerId, "openai"),
        eq(schema.generations.status, "pending"),
        // Active workers must not occupy both recovery slots and block queued work.
        sql`(
          exists (
            select 1 from ${schema.imageJobs}
            where ${schema.imageJobs.generationId} = ${schema.generations.id}
              and (${schema.imageJobs.status} = 'queued'
                or (${schema.imageJobs.status} = 'running'
                  and coalesce(${schema.imageJobs.startedAt}, ${schema.imageJobs.createdAt}) <= ${cutoff}::timestamp))
          )
          or (${schema.generations.createdAt} <= ${cutoff}::timestamp and not exists (
            select 1 from ${schema.imageJobs}
            where ${schema.imageJobs.generationId} = ${schema.generations.id}
              and ${schema.imageJobs.status} in ('queued', 'running')
          ))
        )`,
      ),
    )
    .orderBy(asc(schema.generations.createdAt))
    .limit(2);
  const results = await Promise.allSettled(
    pending.map((generation) => processGeneration(generation.id)),
  );
  const failure = results.find((result) => result.status === "rejected");
  if (failure?.status === "rejected") throw failure.reason;
  return pending.length;
}
