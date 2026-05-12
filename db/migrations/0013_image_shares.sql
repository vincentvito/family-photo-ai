CREATE TABLE IF NOT EXISTS "familyphotoai"."image_shares" (
  "id" text PRIMARY KEY NOT NULL,
  "image_id" text NOT NULL REFERENCES "familyphotoai"."images"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "token" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "revoked_at" timestamp
);

CREATE INDEX IF NOT EXISTS "image_shares_image_id_idx"
ON "familyphotoai"."image_shares" ("image_id");

CREATE INDEX IF NOT EXISTS "image_shares_user_id_idx"
ON "familyphotoai"."image_shares" ("user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "image_shares_token_idx"
ON "familyphotoai"."image_shares" ("token");
