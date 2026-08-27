ALTER TABLE "familyphotoai"."images"
  ADD COLUMN IF NOT EXISTS "rating" text,
  ADD COLUMN IF NOT EXISTS "rated_at" timestamp,
  ADD COLUMN IF NOT EXISTS "theme_id" text,
  ADD COLUMN IF NOT EXISTS "art_style_id" text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'images_rating_check'
      AND conrelid = 'familyphotoai.images'::regclass
  ) THEN
    ALTER TABLE "familyphotoai"."images"
      ADD CONSTRAINT "images_rating_check"
      CHECK ("rating" IS NULL OR "rating" IN ('up', 'down'));
  END IF;
END $$;

-- Keep prior favorites as positive feedback. This prevents a data reset when
-- the heart control changes to explicit thumbs up and thumbs down controls.
UPDATE "familyphotoai"."images"
SET "rating" = 'up', "rated_at" = COALESCE("rated_at", "created_at")
WHERE "is_favorite" = true AND "rating" IS NULL;

CREATE INDEX IF NOT EXISTS "images_rating_rated_at_idx"
ON "familyphotoai"."images" ("rating", "rated_at" DESC);

CREATE INDEX IF NOT EXISTS "images_theme_id_idx"
ON "familyphotoai"."images" ("theme_id");
