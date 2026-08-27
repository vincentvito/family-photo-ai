import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("generated images support thumbs up and thumbs down feedback", () => {
  const schema = read("db/schema.ts");
  const migration = read("db/migrations/0015_image_ratings.sql");
  const control = read("src/components/studio/ImageRatingControl.tsx");
  const generationBoard = read("src/components/studio/GenerationBoard.tsx");
  const ratingRoute = read("src/app/api/images/rating/route.ts");
  const albumIntegrity = read("db/migrations/0016_album_integrity.sql");

  assert.match(schema, /rating: text\("rating", \{ enum: \["up", "down"\] \}\)/);
  assert.match(migration, /WHERE "is_favorite" = true AND "rating" IS NULL/);
  assert.match(control, /I like this image/);
  assert.match(control, /I dislike this image/);
  assert.match(generationBoard, /ImageRatingControl/);
  assert.match(ratingRoute, /z\.enum\(\["up", "down"\]\)\.nullable\(\)/);
  assert.match(albumIntegrity, /albums_user_id_unique_idx/);
  assert.match(albumIntegrity, /album_images_album_image_unique_idx/);
});

test("admin content reports disliked images by vibe and style", () => {
  const adminQueries = read("src/lib/admin-queries.ts");
  const adminPage = read("src/app/admin/page.tsx");

  assert.match(adminQueries, /getImageFeedbackStats/);
  assert.match(adminQueries, /coalesce\(\$\{schema\.images\.themeId\}/);
  assert.match(adminQueries, /artStyleId: schema\.images\.artStyleId/);
  assert.match(adminPage, /Recent disliked images/);
  assert.match(adminPage, /Dislike rate/);
  assert.match(adminPage, /refineInstruction/);
});
