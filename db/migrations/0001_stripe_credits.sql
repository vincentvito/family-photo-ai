CREATE TABLE IF NOT EXISTS "familyphotoai"."credit_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"pack_id" text NOT NULL,
	"credits" integer NOT NULL,
	"stripe_checkout_session_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_event_id" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_transactions_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id"),
	CONSTRAINT "credit_transactions_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "familyphotoai"."credit_usages" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"generation_id" text NOT NULL,
	"credits" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_usages_generation_id_unique" UNIQUE("generation_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "familyphotoai"."credit_usages" ADD CONSTRAINT "credit_usages_generation_id_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "familyphotoai"."generations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
