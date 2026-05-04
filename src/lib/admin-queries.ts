import { db, schema } from "@/lib/db";
import { desc, eq, gte, sql } from "drizzle-orm";
import { GENERATION_MODEL_IDS, type GenerationModelId } from "@/lib/replicate/models";
import { user as userTable } from "@/../db/auth-schema";

const SETTINGS_ROW_ID = "default";

export async function getDefaultModel(): Promise<GenerationModelId> {
  const [row] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.id, SETTINGS_ROW_ID))
    .limit(1);
  const value = row?.defaultModel;
  if (value && GENERATION_MODEL_IDS.includes(value as GenerationModelId)) {
    return value as GenerationModelId;
  }
  return "nanobanana";
}

export async function setDefaultModel(modelId: GenerationModelId) {
  await db
    .insert(schema.appSettings)
    .values({ id: SETTINGS_ROW_ID, defaultModel: modelId })
    .onConflictDoUpdate({
      target: schema.appSettings.id,
      set: { defaultModel: modelId, updatedAt: new Date() },
    });
}

export type PlatformStats = {
  users: { total: number; today: number; last7Days: number };
  generations: {
    total: number;
    today: number;
    last7Days: number;
    pending: number;
    error: number;
  };
  images: { total: number };
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    [{ count: totalUsers }],
    [{ count: usersToday }],
    [{ count: usersLast7 }],
    [{ count: totalGens }],
    [{ count: gensToday }],
    [{ count: gensLast7 }],
    [{ count: gensPending }],
    [{ count: gensError }],
    [{ count: totalImages }],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(userTable),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userTable)
      .where(gte(userTable.createdAt, startOfToday)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(userTable)
      .where(gte(userTable.createdAt, sevenDaysAgo)),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.generations),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.generations)
      .where(gte(schema.generations.createdAt, startOfToday)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.generations)
      .where(gte(schema.generations.createdAt, sevenDaysAgo)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.generations)
      .where(eq(schema.generations.status, "pending")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.generations)
      .where(eq(schema.generations.status, "error")),
    db.select({ count: sql<number>`count(*)::int` }).from(schema.images),
  ]);

  return {
    users: { total: totalUsers, today: usersToday, last7Days: usersLast7 },
    generations: {
      total: totalGens,
      today: gensToday,
      last7Days: gensLast7,
      pending: gensPending,
      error: gensError,
    },
    images: { total: totalImages },
  };
}

export async function getRecentSignups(limit = 10) {
  return db
    .select({
      id: userTable.id,
      email: userTable.email,
      name: userTable.name,
      role: userTable.role,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .orderBy(desc(userTable.createdAt))
    .limit(limit);
}

export async function getRecentGenerations(limit = 10) {
  return db
    .select({
      id: schema.generations.id,
      themeId: schema.generations.themeId,
      status: schema.generations.status,
      model: schema.generations.model,
      errorMessage: schema.generations.errorMessage,
      createdAt: schema.generations.createdAt,
    })
    .from(schema.generations)
    .orderBy(desc(schema.generations.createdAt))
    .limit(limit);
}
