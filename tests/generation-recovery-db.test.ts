import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import postgres from "postgres";

const testUrl = process.env.TEST_DATABASE_URL;

test(
  "stale launch recovery refunds once and cancels only saved jobs",
  { skip: !testUrl },
  async (t) => {
    const url = new URL(testUrl!);
    assert.ok(["localhost", "127.0.0.1", "::1"].includes(url.hostname));
    assert.match(url.pathname, /recovery_test/);

    process.env.DATABASE_URL = testUrl;
    process.env.REPLICATE_API_TOKEN = "test-token";
    process.env.BETTER_AUTH_URL = "http://localhost:3010";
    process.env.BETTER_AUTH_SECRET = "recovery-test-secret-with-at-least-32-characters";

    const sql = postgres(testUrl!, { max: 1, prepare: false });

    await sql`create schema if not exists familyphotoai`;
    await sql`create table if not exists familyphotoai.generations (
    id text primary key, user_id text not null, theme_id text not null,
    prompt text not null, provider_id text not null, status text not null default 'pending',
    error_message text, subject_snapshot text not null, wardrobe_note text, card_text text,
    aspect_ratio text, location_reference_path text, custom_vibe_description text,
    replicate_prediction_ids text, model text not null default 'gpt-image-2',
    generation_method text not null default 'current-prompt', reference_inputs text,
    pack_tier text, free_preview boolean not null default false,
    created_at timestamp not null default now()
  )`;
    await sql`create table if not exists familyphotoai.credit_usages (
    id text primary key, user_id text not null,
    generation_id text not null unique references familyphotoai.generations(id),
    credits integer not null default 1, created_at timestamp not null default now()
  )`;

    const { getReplicateClient } = await import("../src/lib/replicate/client");
    const { listStaleIncompleteLaunches, recoverStaleIncompleteLaunches } =
      await import("../src/lib/generate-queries");
    const client = await getReplicateClient();
    const canceled: string[] = [];
    t.mock.method(client.predictions, "cancel", async (id: string) => {
      canceled.push(id);
    });

    const userId = `recovery-test-${randomUUID()}`;
    const staleId = randomUUID();
    const completeId = randomUUID();
    const recentId = randomUUID();
    const old = new Date(Date.now() - 11 * 60 * 1000);
    const recent = new Date();
    const twoSlots = JSON.stringify([
      { id: "saved-1", retries: 0, slotIndex: 0 },
      { id: "saved-2", retries: 0, slotIndex: 1 },
    ]);
    const fourSlots = JSON.stringify(
      [0, 1, 2, 3].map((index) => ({
        id: `complete-${index}`,
        retries: 0,
        slotIndex: index,
      })),
    );
    for (const [id, createdAt, predictionIds] of [
      [staleId, old, twoSlots],
      [completeId, old, fourSlots],
      [recentId, recent, twoSlots],
    ] as const) {
      await sql`insert into familyphotoai.generations
      (id, user_id, theme_id, prompt, provider_id, subject_snapshot,
       replicate_prediction_ids, created_at)
      values (${id}, ${userId}, 'golden-hour-beach', 'test', 'gpt-image-2', '[]',
              ${predictionIds}, ${createdAt})`;
      await sql`insert into familyphotoai.credit_usages (id, user_id, generation_id)
      values (${randomUUID()}, ${userId}, ${id})`;
    }
    t.after(async () => {
      await sql`delete from familyphotoai.credit_usages where user_id = ${userId}`;
      await sql`delete from familyphotoai.generations where user_id = ${userId}`;
      await sql.end();
      if (globalThis.__sql) await globalThis.__sql.end();
      globalThis.__sql = undefined;
      globalThis.__db = undefined;
    });

    assert.deepEqual(
      (await listStaleIncompleteLaunches(userId)).map((row) => row.id),
      [staleId],
    );
    const first = await Promise.all([
      recoverStaleIncompleteLaunches(userId),
      recoverStaleIncompleteLaunches(userId),
    ]);
    assert.equal(
      first.reduce((sum, count) => sum + count, 0),
      1,
    );
    assert.deepEqual(canceled.sort(), ["saved-1", "saved-2"]);

    const rows = await sql`
    select g.id, g.status, g.error_message, count(c.id)::int as credits_used
    from familyphotoai.generations g
    left join familyphotoai.credit_usages c on c.generation_id = g.id
    where g.user_id = ${userId}
    group by g.id order by g.id`;
    const byId = new Map(rows.map((row) => [row.id as string, row]));
    assert.equal(byId.get(staleId)?.status, "error");
    assert.match(String(byId.get(staleId)?.error_message), /No photo credit was charged/);
    assert.equal(byId.get(staleId)?.credits_used, 0);
    for (const id of [completeId, recentId]) {
      assert.equal(byId.get(id)?.status, "pending");
      assert.equal(byId.get(id)?.credits_used, 1);
    }
    assert.equal(await recoverStaleIncompleteLaunches(userId), 0);
    assert.deepEqual(canceled.sort(), ["saved-1", "saved-2"]);
  },
);
