CREATE SCHEMA IF NOT EXISTS "familyphotoai";

-- Auth tables (better-auth)

CREATE TABLE "familyphotoai"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "familyphotoai"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL REFERENCES "familyphotoai"."user"("id") ON DELETE CASCADE
);
CREATE INDEX "session_userId_idx" ON "familyphotoai"."session" ("user_id");

CREATE TABLE "familyphotoai"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL REFERENCES "familyphotoai"."user"("id") ON DELETE CASCADE,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
CREATE INDEX "account_userId_idx" ON "familyphotoai"."account" ("user_id");

CREATE TABLE "familyphotoai"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX "verification_identifier_idx" ON "familyphotoai"."verification" ("identifier");

-- App tables

CREATE TABLE "familyphotoai"."people" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "familyphotoai"."photos" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL REFERENCES "familyphotoai"."people"("id") ON DELETE CASCADE,
	"file_name" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "familyphotoai"."generations" (
	"id" text PRIMARY KEY NOT NULL,
	"theme_id" text NOT NULL,
	"prompt" text NOT NULL,
	"provider_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"subject_snapshot" text NOT NULL,
	"wardrobe_note" text,
	"card_text" text,
	"aspect_ratio" text,
	"location_reference_path" text,
	"custom_vibe_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "familyphotoai"."images" (
	"id" text PRIMARY KEY NOT NULL,
	"generation_id" text NOT NULL REFERENCES "familyphotoai"."generations"("id") ON DELETE CASCADE,
	"file_name" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"aspect_ratio" text NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"parent_image_id" text,
	"root_image_id" text,
	"refine_instruction" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "familyphotoai"."refinement_history" (
	"id" text PRIMARY KEY NOT NULL,
	"root_image_id" text NOT NULL,
	"step_index" integer NOT NULL,
	"instruction" text NOT NULL,
	"result_image_id" text NOT NULL REFERENCES "familyphotoai"."images"("id") ON DELETE CASCADE,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "familyphotoai"."albums" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'My Album' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "familyphotoai"."album_images" (
	"id" text PRIMARY KEY NOT NULL,
	"album_id" text NOT NULL REFERENCES "familyphotoai"."albums"("id") ON DELETE CASCADE,
	"image_id" text NOT NULL REFERENCES "familyphotoai"."images"("id") ON DELETE CASCADE,
	"added_at" timestamp DEFAULT now() NOT NULL
);
