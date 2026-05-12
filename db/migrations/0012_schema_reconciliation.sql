-- Captures replicate prediction tracking columns that were added directly to
-- production and never recorded in 0000–0011. Idempotent so it no-ops on
-- environments where the columns already exist.

ALTER TABLE "familyphotoai"."generations"
  ADD COLUMN IF NOT EXISTS "replicate_prediction_ids" text;

ALTER TABLE "familyphotoai"."images"
  ADD COLUMN IF NOT EXISTS "replicate_prediction_id" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'images_replicate_prediction_id_key'
      AND conrelid = 'familyphotoai.images'::regclass
  ) THEN
    ALTER TABLE "familyphotoai"."images"
      ADD CONSTRAINT "images_replicate_prediction_id_key" UNIQUE ("replicate_prediction_id");
  END IF;
END $$;
