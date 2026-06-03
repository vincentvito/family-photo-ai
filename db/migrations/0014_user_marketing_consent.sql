ALTER TABLE "familyphotoai"."user"
ADD COLUMN IF NOT EXISTS "marketing_opt_in" boolean DEFAULT false NOT NULL;

ALTER TABLE "familyphotoai"."user"
ADD COLUMN IF NOT EXISTS "marketing_opt_in_at" timestamp;

ALTER TABLE "familyphotoai"."user"
ADD COLUMN IF NOT EXISTS "marketing_opt_in_source" text;
