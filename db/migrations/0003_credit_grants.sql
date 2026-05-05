CREATE TABLE IF NOT EXISTS "familyphotoai"."credit_grants" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"credits" integer NOT NULL,
	"reason" text,
	"granted_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
