ALTER TABLE "familyphotoai"."user" ADD COLUMN IF NOT EXISTS "stripe_customer_id" text;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "familyphotoai"."user" ADD CONSTRAINT "user_stripe_customer_id_unique" UNIQUE("stripe_customer_id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "familyphotoai"."credit_usages" DROP CONSTRAINT IF EXISTS "credit_usages_generation_id_generations_id_fk";
--> statement-breakpoint
ALTER TABLE "familyphotoai"."credit_usages" ADD CONSTRAINT "credit_usages_generation_id_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "familyphotoai"."generations"("id") ON DELETE no action ON UPDATE no action;
