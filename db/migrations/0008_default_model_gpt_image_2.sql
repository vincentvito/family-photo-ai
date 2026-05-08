ALTER TABLE "familyphotoai"."generations"
ALTER COLUMN "model" SET DEFAULT 'gpt-image-2';

ALTER TABLE "familyphotoai"."app_settings"
ALTER COLUMN "default_model" SET DEFAULT 'gpt-image-2';
