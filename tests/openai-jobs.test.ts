import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { db, schema } from "../src/lib/db";
import {
  processOpenAIJobs,
  processPendingOpenAIShoots,
  settleOpenAIGeneration,
} from "../src/lib/openai/jobs";
import type { OpenAIImageInput } from "../src/lib/openai/image-input";

test("persistent OpenAI jobs claim once, recover saved files, and refund total failure once", async () => {
  const pg = new PGlite();
  const previous = globalThis.__db;
  globalThis.__db = drizzle(pg, { schema }) as unknown as NonNullable<typeof globalThis.__db>;
  try {
    await pg.exec(`
      create schema familyphotoai;
      create table familyphotoai.generations (
        id text primary key, user_id text not null, theme_id text not null,
        prompt text not null, provider_id text not null, status text not null default 'pending',
        error_message text, subject_snapshot text not null, wardrobe_note text, card_text text,
        aspect_ratio text, location_reference_path text, custom_vibe_description text,
        replicate_prediction_ids text, model text not null, generation_method text not null default 'current-prompt',
        reference_inputs text, pack_tier text, free_preview boolean not null default false,
        created_at timestamp not null default now()
      );
      create table familyphotoai.images (
        id text primary key, generation_id text not null references familyphotoai.generations(id),
        file_name text not null, width integer not null, height integer not null, aspect_ratio text not null,
        is_favorite boolean not null default false, rating text, rated_at timestamp,
        theme_id text, art_style_id text, parent_image_id text, root_image_id text, refine_instruction text,
        replicate_prediction_id text unique, created_at timestamp not null default now()
      );
      create table familyphotoai.credit_usages (id text primary key, user_id text not null, generation_id text not null unique, credits integer not null default 1, created_at timestamp not null default now());
    `);
    await pg.exec(
      await readFile(
        new URL("../db/migrations/0018_openai_image_jobs.sql", import.meta.url),
        "utf8",
      ),
    );
    const input: OpenAIImageInput = {
      version: 1,
      model: "gpt-image-2.5-flare",
      quality: "medium",
      size: "1024x1024",
      outputFormat: "png",
      moderation: "low",
      prompt: "Saved prompt",
      imageKeys: ["saved.jpg"],
    };
    const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: "red" } })
      .png()
      .toBuffer();
    async function seed(id: string, state: "queued" | "running" = "queued") {
      await db.insert(schema.generations).values({
        id,
        userId: "test-user",
        themeId: "test-theme",
        prompt: input.prompt,
        providerId: "openai",
        subjectSnapshot: "[]",
        model: "openai-flare-medium",
        aspectRatio: "1:1",
      });
      await db
        .insert(schema.creditUsages)
        .values({ id: `credit-${id}`, generationId: id, userId: "test-user", credits: 1 });
      await db.insert(schema.imageJobs).values(
        [0, 1, 2, 3].map((slotIndex) => ({
          id: `${id}-${slotIndex}`,
          generationId: id,
          slotIndex,
          input: JSON.stringify(input),
          themeId: `theme-${slotIndex}`,
          status: state,
          startedAt: state === "running" ? new Date(Date.now() - 11 * 60000) : null,
        })),
      );
    }
    let calls = 0;
    const stored = new Map<string, Buffer>();
    const dependencies = {
      generate: async (saved: OpenAIImageInput) => {
        calls++;
        assert.deepEqual(saved, input);
        return {
          buffer: png,
          mimeType: "image/png" as const,
          requestId: `request-${calls}`,
          usage: { total_tokens: 42 },
        };
      },
      saveImage: async (key: string, buffer: Buffer) => {
        stored.set(key, buffer);
      },
      readImage: async (key: string) => {
        const buffer = stored.get(key);
        if (!buffer) throw new Error("R2 object missing");
        return buffer;
      },
    };
    await seed("success");
    await Promise.all([
      processOpenAIJobs("success", dependencies),
      processOpenAIJobs("success", dependencies),
    ]);
    assert.equal(calls, 4);
    assert.equal((await db.select().from(schema.images)).length, 4);
    assert.equal(
      (await db.select().from(schema.generations).where(eq(schema.generations.id, "success")))[0]
        .status,
      "done",
    );
    assert.equal((await db.select().from(schema.creditUsages)).length, 1);
    await processOpenAIJobs("success", dependencies);
    assert.equal(calls, 4);

    await seed("interrupted", "running");
    stored.set("generations/interrupted/openai-interrupted-0.png", png);
    await processOpenAIJobs("interrupted", dependencies);
    assert.equal(calls, 4, "recovery must not make another paid request");
    assert.equal(
      (
        await db.select().from(schema.generations).where(eq(schema.generations.id, "interrupted"))
      )[0].status,
      "done",
    );
    const recovered = await db
      .select()
      .from(schema.images)
      .where(eq(schema.images.generationId, "interrupted"));
    assert.equal(recovered.length, 1);
    assert.equal(recovered[0].themeId, "theme-0");

    for (const successes of [1, 2, 3]) {
      const id = `partial-${successes}`;
      await seed(id);
      let attempts = 0;
      await processOpenAIJobs(id, {
        ...dependencies,
        generate: async () => {
          if (attempts++ >= successes) throw new Error("Provider failure");
          return { buffer: png, mimeType: "image/png", requestId: null, usage: null };
        },
      });
      await Promise.all([settleOpenAIGeneration(id), settleOpenAIGeneration(id)]);
      assert.equal(
        (await db.select().from(schema.images).where(eq(schema.images.generationId, id))).length,
        successes,
      );
      assert.equal(
        (
          await db
            .select()
            .from(schema.creditUsages)
            .where(eq(schema.creditUsages.generationId, id))
        ).length,
        0,
        "partial shoots refund the full credit once",
      );
      await processOpenAIJobs(id, dependencies);
      assert.equal(attempts, 4);
    }
    assert.equal(
      (
        await db
          .select()
          .from(schema.creditUsages)
          .where(eq(schema.creditUsages.generationId, "interrupted"))
      ).length,
      0,
      "interrupted partial shoot is refunded",
    );

    await seed("failure");
    await processOpenAIJobs("failure", {
      ...dependencies,
      generate: async () => {
        throw new Error("Timeout");
      },
    });
    await Promise.all([settleOpenAIGeneration("failure"), settleOpenAIGeneration("failure")]);
    assert.equal(
      (await db.select().from(schema.generations).where(eq(schema.generations.id, "failure")))[0]
        .status,
      "error",
    );
    assert.equal(
      (
        await db
          .select()
          .from(schema.creditUsages)
          .where(eq(schema.creditUsages.generationId, "failure"))
      ).length,
      0,
    );

    await seed("storage-failure");
    await assert.rejects(
      processOpenAIJobs("storage-failure", {
        ...dependencies,
        saveImage: async (key, buffer) => {
          stored.set(key, buffer);
          if (key.endsWith("storage-failure-0.png")) throw new Error("Storage reply lost");
          await new Promise((resolve) => setTimeout(resolve, 20));
        },
      }),
      /Storage reply lost/,
    );
    assert.equal(
      (
        await db
          .select()
          .from(schema.images)
          .where(eq(schema.images.generationId, "storage-failure"))
      ).length,
      3,
      "a storage failure must not abandon other running jobs",
    );
    const paidCalls = calls;
    await db
      .update(schema.imageJobs)
      .set({ startedAt: new Date(Date.now() - 11 * 60000) })
      .where(eq(schema.imageJobs.id, "storage-failure-0"));
    await processOpenAIJobs("storage-failure", dependencies);
    assert.equal(calls, paidCalls);
    assert.equal(
      (
        await db
          .select()
          .from(schema.images)
          .where(eq(schema.images.generationId, "storage-failure"))
      ).length,
      4,
    );

    await seed("invalid-output");
    await processOpenAIJobs("invalid-output", {
      ...dependencies,
      generate: async () => ({
        buffer: Buffer.from("invalid"),
        mimeType: "image/png",
        requestId: "bad-image",
        usage: null,
      }),
    });
    assert.equal(
      (
        await db
          .select()
          .from(schema.generations)
          .where(eq(schema.generations.id, "invalid-output"))
      )[0].status,
      "error",
    );

    await db.insert(schema.generations).values({
      id: "launch-gap",
      userId: "test-user",
      themeId: "theme",
      prompt: "prompt",
      providerId: "openai",
      subjectSnapshot: "[]",
      model: "openai-flare-medium",
      createdAt: new Date(Date.now() - 11 * 60000),
    });
    await settleOpenAIGeneration("launch-gap");
    assert.equal(
      (await db.select().from(schema.generations).where(eq(schema.generations.id, "launch-gap")))[0]
        .status,
      "error",
    );
    for (const id of ["active-first", "active-second"]) {
      await seed(id, "running");
      await db
        .update(schema.imageJobs)
        .set({ startedAt: new Date() })
        .where(eq(schema.imageJobs.generationId, id));
    }
    await seed("queued-third");
    const selected: string[] = [];
    await processPendingOpenAIShoots(async (id) => {
      selected.push(id);
    });
    assert.deepEqual(selected, ["queued-third"], "active workers must not block queued recovery");
    await db
      .update(schema.imageJobs)
      .set({ startedAt: null, createdAt: new Date(Date.now() - 11 * 60000) })
      .where(eq(schema.imageJobs.generationId, "active-first"));
    await processOpenAIJobs("active-first", dependencies);
    assert.equal(
      (
        await db.select().from(schema.generations).where(eq(schema.generations.id, "active-first"))
      )[0].status,
      "error",
      "a running job with no start timestamp must still settle",
    );
  } finally {
    globalThis.__db = previous;
    await pg.close();
  }
});
