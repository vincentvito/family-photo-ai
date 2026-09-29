CREATE TABLE IF NOT EXISTS "familyphotoai"."image_jobs" (
  "id" text PRIMARY KEY,
  "generation_id" text NOT NULL REFERENCES "familyphotoai"."generations"("id") ON DELETE CASCADE,
  "slot_index" integer NOT NULL,
  "input" text NOT NULL,
  "theme_id" text NOT NULL,
  "art_style_id" text,
  "status" text NOT NULL DEFAULT 'queued' CONSTRAINT "image_jobs_status_check" CHECK ("status" IN ('queued', 'running', 'succeeded', 'failed')),
  "started_at" timestamp,
  "request_id" text,
  "usage" text,
  "error" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "image_jobs_slot_check" CHECK ("slot_index" BETWEEN 0 AND 3)
);
CREATE UNIQUE INDEX IF NOT EXISTS "image_jobs_generation_slot_idx" ON "familyphotoai"."image_jobs" ("generation_id", "slot_index");
CREATE INDEX IF NOT EXISTS "image_jobs_status_idx" ON "familyphotoai"."image_jobs" ("status");
