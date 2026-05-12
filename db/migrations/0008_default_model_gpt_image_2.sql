-- Introduces the gpt-image-2 default for the generations.model column and the
-- app_settings.default_model column. Both objects were originally created
-- out-of-band (drizzle-kit push) and never captured in 0000–0007, so this
-- migration creates them defensively before setting the default. Idempotent.

ALTER TABLE "familyphotoai"."generations"
  ADD COLUMN IF NOT EXISTS "model" text NOT NULL DEFAULT 'gpt-image-2';

ALTER TABLE "familyphotoai"."generations"
  ALTER COLUMN "model" SET DEFAULT 'gpt-image-2';

CREATE TABLE IF NOT EXISTS "familyphotoai"."app_settings" (
  "id" text PRIMARY KEY DEFAULT 'default',
  "default_model" text NOT NULL DEFAULT 'gpt-image-2',
  "updated_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "familyphotoai"."app_settings"
  ALTER COLUMN "default_model" SET DEFAULT 'gpt-image-2';
