ALTER TABLE "familyphotoai"."credit_transactions"
ADD COLUMN IF NOT EXISTS "stripe_fulfillment_kind" text DEFAULT 'checkout' NOT NULL;

CREATE INDEX IF NOT EXISTS "subscriptions_user_id_updated_at_idx"
ON "familyphotoai"."subscriptions" ("user_id", "updated_at" DESC);
