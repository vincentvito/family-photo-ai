-- Consolidate any duplicate albums before enforcing one album per user.
WITH album_targets AS (
  SELECT
    "id",
    FIRST_VALUE("id") OVER (
      PARTITION BY "user_id"
      ORDER BY "created_at", "id"
    ) AS "target_id"
  FROM "familyphotoai"."albums"
)
UPDATE "familyphotoai"."album_images" AS album_image
SET "album_id" = album_target."target_id"
FROM album_targets AS album_target
WHERE album_image."album_id" = album_target."id"
  AND album_target."id" <> album_target."target_id";

-- Keep the oldest membership if consolidation produced duplicate rows.
WITH duplicate_memberships AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "album_id", "image_id"
      ORDER BY "added_at", "id"
    ) AS "position"
  FROM "familyphotoai"."album_images"
)
DELETE FROM "familyphotoai"."album_images" AS album_image
USING duplicate_memberships AS duplicate
WHERE album_image."id" = duplicate."id"
  AND duplicate."position" > 1;

WITH duplicate_albums AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "user_id"
      ORDER BY "created_at", "id"
    ) AS "position"
  FROM "familyphotoai"."albums"
)
DELETE FROM "familyphotoai"."albums" AS album
USING duplicate_albums AS duplicate
WHERE album."id" = duplicate."id"
  AND duplicate."position" > 1;

DROP INDEX IF EXISTS "familyphotoai"."albums_user_id_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "albums_user_id_unique_idx"
ON "familyphotoai"."albums" ("user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "album_images_album_image_unique_idx"
ON "familyphotoai"."album_images" ("album_id", "image_id");
