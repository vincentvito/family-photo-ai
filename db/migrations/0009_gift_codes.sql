CREATE TABLE IF NOT EXISTS "familyphotoai"."gift_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"buyer_user_id" text NOT NULL,
	"pack_id" text NOT NULL,
	"credits" integer NOT NULL,
	"code" text NOT NULL,
	"recipient_email" text,
	"recipient_name" text,
	"message" text,
	"stripe_checkout_session_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_event_id" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"redeemed_by_user_id" text,
	"redeemed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gift_codes_code_unique" UNIQUE("code"),
	CONSTRAINT "gift_codes_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id"),
	CONSTRAINT "gift_codes_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gift_codes_buyer_created_at_idx"
ON "familyphotoai"."gift_codes" ("buyer_user_id", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gift_codes_redeemed_by_idx"
ON "familyphotoai"."gift_codes" ("redeemed_by_user_id");
