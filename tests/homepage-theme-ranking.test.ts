import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { PgDialect } from "drizzle-orm/pg-core";
import { buildHomepageThemeRankingQuery } from "../src/lib/homepage-theme-ranking";
import { THEMES } from "../src/lib/themes";

// Execute the actual bound query over synthetic records. Its relational SQL is
// portable to SQLite; a production PostgreSQL connection is deliberately not used.
const dialect = new PgDialect();
const firstTheme = THEMES.find((theme) => theme.category === "photoreal")!.id;
const secondTheme = THEMES.find((theme) => theme.category === "stylized")!.id;
const cardTheme = THEMES.find((theme) => theme.category === "card")!.id;

function fixture() {
  const database = new DatabaseSync(":memory:");
  database.exec(`
    attach database ':memory:' as familyphotoai;
    create table familyphotoai.user (id text primary key, role text);
    create table familyphotoai.generations (
      id text primary key, user_id text, theme_id text, status text,
      free_preview integer default 0, created_at text
    );
    create table familyphotoai.images (
      id text primary key, generation_id text, theme_id text, parent_image_id text
    );
    insert into familyphotoai.user values ('customer', 'user'), ('legacy-customer', null);
  `);
  const insertGeneration = database.prepare(
    "insert into familyphotoai.generations (id, user_id, theme_id, status, free_preview, created_at) values (?, ?, ?, ?, ?, ?)",
  );
  const insertImage = database.prepare(
    "insert into familyphotoai.images (id, generation_id, theme_id, parent_image_id) values (?, ?, ?, ?)",
  );
  let imageNumber = 0;
  return {
    database,
    shoot(
      id: string,
      themeId: string,
      { userId = "customer", status = "done", preview = false, createdAt = "2020-01-01" } = {},
    ) {
      insertGeneration.run(id, userId, themeId, status, preview ? 1 : 0, createdAt);
    },
    image(generationId: string, themeId: string | null, parentImageId: string | null = null) {
      insertImage.run(`image-${++imageNumber}`, generationId, themeId, parentImageId);
    },
    ranking(limit = 12) {
      const query = dialect.sqlToQuery(buildHomepageThemeRankingQuery(limit));
      const parameters = Object.fromEntries(
        query.params.map((value, index) => {
          assert.ok(typeof value === "string" || typeof value === "number");
          return [`$${index + 1}`, value] as const;
        }),
      );
      return database
        .prepare(query.sql)
        .all(parameters)
        .map((row) => ({
          themeId: String(row.themeId),
          count: Number(row.count),
        }));
    },
  };
}

test("each completed shoot counts once per actual output look, including secondary looks and legacy image attribution", () => {
  const f = fixture();
  try {
    f.shoot("mixed", firstTheme);
    f.image("mixed", firstTheme);
    f.image("mixed", firstTheme);
    f.image("mixed", secondTheme);
    f.image("mixed", secondTheme, "image-3"); // Refinement cannot inflate the count.
    f.shoot("legacy", firstTheme, { userId: "legacy-customer" });
    f.image("legacy", null);
    f.image("legacy", null);
    assert.deepEqual(f.ranking(), [
      { themeId: firstTheme, count: 2 },
      { themeId: secondTheme, count: 1 },
    ]);
  } finally {
    f.database.close();
  }
});

test("pending, failed, imageless and admin shoots cannot enter the ranking or consume its limit", () => {
  const f = fixture();
  try {
    f.database.exec(
      "insert into familyphotoai.user values ('staff', 'user, Admin '), ('staff-only', 'admin')",
    );
    f.shoot("pending", firstTheme, { status: "pending" });
    f.shoot("failed", firstTheme, { status: "error" });
    f.shoot("imageless", firstTheme);
    f.shoot("admin", firstTheme, { userId: "staff" });
    f.shoot("admin-only", firstTheme, { userId: "staff-only" });
    for (const id of ["pending", "failed", "admin", "admin-only"]) {
      f.image(id, firstTheme);
    }
    f.shoot("real", secondTheme);
    f.image("real", secondTheme);
    assert.deepEqual(f.ranking(1), [{ themeId: secondTheme, count: 1 }]);
  } finally {
    f.database.close();
  }
});

test("retained completed usage survives a deleted or missing account record", () => {
  const f = fixture();
  try {
    f.shoot("deleted-account", firstTheme, { userId: "missing-user" });
    f.image("deleted-account", firstTheme);
    assert.deepEqual(f.ranking(), [{ themeId: firstTheme, count: 1 }]);
  } finally {
    f.database.close();
  }
});

test("known catalog filtering precedes limit and unknown image looks do not fall back to the lead look", () => {
  const f = fixture();
  try {
    for (let index = 0; index < 4; index += 1) {
      f.shoot(`custom-${index}`, "custom");
      f.image(`custom-${index}`, null);
      f.shoot(`removed-${index}`, firstTheme);
      f.image(`removed-${index}`, "removed-from-catalog");
    }
    f.shoot("real-card", cardTheme);
    f.image("real-card", cardTheme);
    assert.deepEqual(f.ranking(1), [{ themeId: cardTheme, count: 1 }]);
  } finally {
    f.database.close();
  }
});

test("the ranking spans all recorded time, includes successful previews, and breaks ties deterministically", () => {
  const f = fixture();
  try {
    f.shoot("old-preview", firstTheme, { preview: true, createdAt: "2000-01-01" });
    f.image("old-preview", firstTheme);
    f.shoot("new-shoot", secondTheme, { createdAt: "2099-01-01" });
    f.image("new-shoot", secondTheme);
    const expected = [firstTheme, secondTheme].sort().map((themeId) => ({ themeId, count: 1 }));
    assert.deepEqual(f.ranking(), expected);
    assert.deepEqual(f.ranking(1), expected.slice(0, 1));
    assert.deepEqual(f.ranking(1.9), expected.slice(0, 1));
    assert.deepEqual(f.ranking(0), expected.slice(0, 1));
    assert.deepEqual(f.ranking(Number.NaN), expected);
  } finally {
    f.database.close();
  }
});

test("no successful output data returns an empty ranking", () => {
  const f = fixture();
  try {
    assert.deepEqual(f.ranking(), []);
  } finally {
    f.database.close();
  }
});
