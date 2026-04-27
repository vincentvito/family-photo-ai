import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => nanoid(14));

const createdAt = () =>
  integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now());

export const people = sqliteTable("people", {
  id: id(),
  name: text("name").notNull(),
  role: text("role", { enum: ["adult", "child", "pet"] }).notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const photos = sqliteTable("photos", {
  id: id(),
  personId: text("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const generations = sqliteTable("generations", {
  id: id(),
  themeId: text("theme_id").notNull(),
  prompt: text("prompt").notNull(),
  providerId: text("provider_id").notNull(),
  status: text("status", { enum: ["pending", "done", "error"] })
    .notNull()
    .default("pending"),
  errorMessage: text("error_message"),
  subjectSnapshot: text("subject_snapshot").notNull(),
  wardrobeNote: text("wardrobe_note"),
  cardText: text("card_text"),
  /** Aspect ratio used for this shoot. For canned themes this mirrors theme.aspectRatio; for custom vibes it's the user's choice. */
  aspectRatio: text("aspect_ratio"),
  /** Optional user-uploaded location / mood reference photo (relative to ./storage). */
  locationReferencePath: text("location_reference_path"),
  /** Raw user-supplied description when themeId === "custom". */
  customVibeDescription: text("custom_vibe_description"),
  createdAt: createdAt(),
});

export const images = sqliteTable("images", {
  id: id(),
  generationId: text("generation_id")
    .notNull()
    .references(() => generations.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  aspectRatio: text("aspect_ratio").notNull(),
  isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),
  parentImageId: text("parent_image_id"),
  rootImageId: text("root_image_id"),
  refineInstruction: text("refine_instruction"),
  createdAt: createdAt(),
});

export const refinementHistory = sqliteTable("refinement_history", {
  id: id(),
  rootImageId: text("root_image_id").notNull(),
  stepIndex: integer("step_index").notNull(),
  instruction: text("instruction").notNull(),
  resultImageId: text("result_image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

export const albums = sqliteTable("albums", {
  id: id(),
  name: text("name").notNull().default("My Album"),
  createdAt: createdAt(),
});

export const albumImages = sqliteTable("album_images", {
  id: id(),
  albumId: text("album_id")
    .notNull()
    .references(() => albums.id, { onDelete: "cascade" }),
  imageId: text("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  addedAt: integer("added_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export type Person = typeof people.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type Image = typeof images.$inferSelect;
export type RefinementStep = typeof refinementHistory.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type AlbumImage = typeof albumImages.$inferSelect;
