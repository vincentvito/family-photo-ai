-- Preflight query for production:
-- SELECT user_id, count(*)
-- FROM familyphotoai.generations
-- WHERE free_preview = true AND status <> 'error'
-- GROUP BY user_id
-- HAVING count(*) > 1;

-- Preserve already-unlocked duplicate previews as paid generations. They have a
-- credit_usage row, so they no longer need to be treated as watermarked previews.
WITH ranked_previews AS (
  SELECT
    g.id,
    row_number() OVER (PARTITION BY g.user_id ORDER BY g.created_at, g.id) AS preview_rank,
    cu.id AS credit_usage_id
  FROM "familyphotoai"."generations" g
  LEFT JOIN "familyphotoai"."credit_usages" cu ON cu."generation_id" = g."id"
  WHERE g."free_preview" = true AND g."status" <> 'error'
)
UPDATE "familyphotoai"."generations" g
SET "free_preview" = false
FROM ranked_previews r
WHERE g."id" = r.id
  AND r.preview_rank > 1
  AND r.credit_usage_id IS NOT NULL;

-- Extra unpaid duplicate previews cannot remain non-error under the one-time
-- rule. Keep the earliest preview per user and retire the rest before indexing.
WITH ranked_previews AS (
  SELECT
    g.id,
    row_number() OVER (PARTITION BY g.user_id ORDER BY g.created_at, g.id) AS preview_rank
  FROM "familyphotoai"."generations" g
  WHERE g."free_preview" = true AND g."status" <> 'error'
)
UPDATE "familyphotoai"."generations" g
SET
  "status" = 'error',
  "error_message" = COALESCE(
    g."error_message",
    'Retired duplicate free preview during one-time preview migration.'
  )
FROM ranked_previews r
WHERE g."id" = r.id
  AND r.preview_rank > 1;

-- This uses the normal non-concurrent path so it can run inside the standard
-- migration transaction. It briefly blocks writes to generations while the
-- index is created; acceptable for the current small table / quiet deploy path.
CREATE UNIQUE INDEX IF NOT EXISTS "generations_user_free_preview_once_idx"
ON "familyphotoai"."generations" ("user_id")
WHERE "free_preview" = true AND "status" <> 'error';
