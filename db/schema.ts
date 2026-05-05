import { pgSchema, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const familyphotoai = pgSchema("familyphotoai");

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => nanoid(14));

const createdAt = () => timestamp("created_at").notNull().defaultNow();

export const people = familyphotoai.table("people", {
  id: id(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["adult", "child", "pet"] }).notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const photos = familyphotoai.table("photos", {
  id: id(),
  personId: text("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: createdAt(),
});

export const generations = familyphotoai.table("generations", {
  id: id(),
  userId: text("user_id").notNull(),
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
  aspectRatio: text("aspect_ratio"),
  locationReferencePath: text("location_reference_path"),
  customVibeDescription: text("custom_vibe_description"),
  /** JSON-encoded slot[] of Replicate prediction IDs + retry count, one per variant. */
  replicatePredictionIds: text("replicate_prediction_ids"),
  /** Model id from MODEL_CATALOG (e.g. "nanobanana", "gpt-image-2"). */
  model: text("model").notNull().default("nanobanana"),
  /**
   * Pack tier this shoot's credit was funded by. Drives per-shoot refine cap.
   * Null on legacy shoots created before tier tracking — treated as the most
   * generous tier so we don't retroactively penalize existing users.
   */
  packTier: text("pack_tier", { enum: ["single", "three", "eight"] }),
  createdAt: createdAt(),
});

export const images = familyphotoai.table("images", {
  id: id(),
  generationId: text("generation_id")
    .notNull()
    .references(() => generations.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  aspectRatio: text("aspect_ratio").notNull(),
  isFavorite: boolean("is_favorite").notNull().default(false),
  parentImageId: text("parent_image_id"),
  rootImageId: text("root_image_id"),
  refineInstruction: text("refine_instruction"),
  /** Source Replicate prediction ID for variants from the initial fan-out. */
  replicatePredictionId: text("replicate_prediction_id").unique(),
  createdAt: createdAt(),
});

export const refinementHistory = familyphotoai.table("refinement_history", {
  id: id(),
  rootImageId: text("root_image_id").notNull(),
  stepIndex: integer("step_index").notNull(),
  instruction: text("instruction").notNull(),
  resultImageId: text("result_image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

export const albums = familyphotoai.table("albums", {
  id: id(),
  userId: text("user_id").notNull(),
  name: text("name").notNull().default("My Album"),
  createdAt: createdAt(),
});

/**
 * Singleton row keyed by id="default" holding admin-tunable runtime settings.
 * Avoids hauling a full settings table; one row, one source of truth.
 */
export const appSettings = familyphotoai.table("app_settings", {
  id: text("id").primaryKey().default("default"),
  defaultModel: text("default_model").notNull().default("nanobanana"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const albumImages = familyphotoai.table("album_images", {
  id: id(),
  albumId: text("album_id")
    .notNull()
    .references(() => albums.id, { onDelete: "cascade" }),
  imageId: text("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const creditTransactions = familyphotoai.table("credit_transactions", {
  id: id(),
  userId: text("user_id").notNull(),
  packId: text("pack_id").notNull(),
  credits: integer("credits").notNull(),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeEventId: text("stripe_event_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  status: text("status", { enum: ["completed", "refunded"] })
    .notNull()
    .default("completed"),
  createdAt: createdAt(),
});

export const creditUsages = familyphotoai.table("credit_usages", {
  id: id(),
  userId: text("user_id").notNull(),
  generationId: text("generation_id")
    .notNull()
    .references(() => generations.id)
    .unique(),
  credits: integer("credits").notNull().default(1),
  createdAt: createdAt(),
});

export const creditGrants = familyphotoai.table("credit_grants", {
  id: id(),
  userId: text("user_id").notNull(),
  credits: integer("credits").notNull(),
  reason: text("reason"),
  grantedByUserId: text("granted_by_user_id").notNull(),
  createdAt: createdAt(),
});

export type Person = typeof people.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type Image = typeof images.$inferSelect;
export type RefinementStep = typeof refinementHistory.$inferSelect;
export type Album = typeof albums.$inferSelect;
export type AlbumImage = typeof albumImages.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type CreditUsage = typeof creditUsages.$inferSelect;
export type CreditGrant = typeof creditGrants.$inferSelect;
