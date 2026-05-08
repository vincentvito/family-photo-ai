CREATE TABLE IF NOT EXISTS "familyphotoai"."subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"plan_id" text DEFAULT 'familyshoot_pro_monthly' NOT NULL,
	"status" text NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);

CREATE INDEX IF NOT EXISTS "subscriptions_user_id_updated_at_idx"
ON "familyphotoai"."subscriptions" ("user_id", "updated_at" DESC);
