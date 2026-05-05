import { db, schema } from "@/lib/db";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { GENERATION_MODEL_IDS, type GenerationModelId } from "@/lib/replicate/models";
import { PRICING_PACKS, getPricingPack } from "@/lib/pricing-packs";
import { THEMES } from "@/lib/themes";
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
  return "gpt-image-2";
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

export type PackageSalesStats = {
  totals: {
    packagesSold: number;
    creditsSold: number;
    estimatedRevenueCents: number;
    refundedPackages: number;
  };
  packs: {
    packId: string;
    name: string;
    packagesSold: number;
    creditsSold: number;
    estimatedRevenueCents: number;
  }[];
};

export type ThemeRankingRow = {
  themeId: string;
  name: string;
  category: "photoreal" | "stylized" | "card" | "custom" | "unknown";
  count: number;
  lastUsedAt: Date | null;
};

export type CustomVibeSample = {
  id: string;
  description: string;
  status: "pending" | "done" | "error";
  createdAt: Date;
};

export type CreditGrantStats = {
  totalGranted: number;
  recent: {
    id: string;
    email: string | null;
    credits: number;
    reason: string | null;
    createdAt: Date;
  }[];
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

export async function getPackageSalesStats(): Promise<PackageSalesStats> {
  const completedRows = await db
    .select({
      packId: schema.creditTransactions.packId,
      packagesSold: sql<number>`count(*)::int`,
      creditsSold: sql<number>`coalesce(sum(${schema.creditTransactions.credits}), 0)::int`,
    })
    .from(schema.creditTransactions)
    .where(eq(schema.creditTransactions.status, "completed"))
    .groupBy(schema.creditTransactions.packId);

  const [{ count: refundedPackages }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.creditTransactions)
    .where(eq(schema.creditTransactions.status, "refunded"));

  const completedByPack = new Map(completedRows.map((row) => [row.packId, row]));
  const packs: PackageSalesStats["packs"] = Object.values(PRICING_PACKS).map((pack) => {
    const row = completedByPack.get(pack.id);
    const packagesSold = Number(row?.packagesSold ?? 0);
    const creditsSold = Number(row?.creditsSold ?? 0);
    return {
      packId: pack.id,
      name: pack.name,
      packagesSold,
      creditsSold,
      estimatedRevenueCents: packagesSold * pack.unitAmount,
    };
  });

  for (const row of completedRows) {
    if (getPricingPack(row.packId)) continue;
    packs.push({
      packId: row.packId,
      name: row.packId,
      packagesSold: Number(row.packagesSold ?? 0),
      creditsSold: Number(row.creditsSold ?? 0),
      estimatedRevenueCents: 0,
    });
  }

  return {
    totals: {
      packagesSold: packs.reduce((sum, pack) => sum + pack.packagesSold, 0),
      creditsSold: packs.reduce((sum, pack) => sum + pack.creditsSold, 0),
      estimatedRevenueCents: packs.reduce((sum, pack) => sum + pack.estimatedRevenueCents, 0),
      refundedPackages: Number(refundedPackages ?? 0),
    },
    packs,
  };
}

export async function getCreditGrantStats(limit = 6): Promise<CreditGrantStats> {
  const [[{ totalGranted }], recent] = await Promise.all([
    db
      .select({ totalGranted: sql<number>`coalesce(sum(${schema.creditGrants.credits}), 0)::int` })
      .from(schema.creditGrants),
    db
      .select({
        id: schema.creditGrants.id,
        email: userTable.email,
        credits: schema.creditGrants.credits,
        reason: schema.creditGrants.reason,
        createdAt: schema.creditGrants.createdAt,
      })
      .from(schema.creditGrants)
      .leftJoin(userTable, eq(schema.creditGrants.userId, userTable.id))
      .orderBy(desc(schema.creditGrants.createdAt))
      .limit(limit),
  ]);

  return {
    totalGranted: Number(totalGranted ?? 0),
    recent,
  };
}

export async function getThemeRanking(limit = 20): Promise<ThemeRankingRow[]> {
  const rows = await db
    .select({
      themeId: schema.generations.themeId,
      count: sql<number>`count(*)::int`,
      lastUsedAt: sql<Date>`max(${schema.generations.createdAt})`,
    })
    .from(schema.generations)
    .groupBy(schema.generations.themeId)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  const themeMap = new Map(THEMES.map((t) => [t.id, t]));
  return rows.map((row) => {
    if (row.themeId === "custom") {
      return {
        themeId: row.themeId,
        name: "Custom (user-described)",
        category: "custom" as const,
        count: Number(row.count),
        lastUsedAt: row.lastUsedAt ? new Date(row.lastUsedAt) : null,
      };
    }
    const theme = themeMap.get(row.themeId);
    return {
      themeId: row.themeId,
      name: theme?.name ?? row.themeId,
      category: theme?.category ?? ("unknown" as const),
      count: Number(row.count),
      lastUsedAt: row.lastUsedAt ? new Date(row.lastUsedAt) : null,
    };
  });
}

export async function getCustomVibeSamples(limit = 25): Promise<CustomVibeSample[]> {
  const rows = await db
    .select({
      id: schema.generations.id,
      description: schema.generations.customVibeDescription,
      status: schema.generations.status,
      createdAt: schema.generations.createdAt,
    })
    .from(schema.generations)
    .where(
      and(
        eq(schema.generations.themeId, "custom"),
        sql`${schema.generations.customVibeDescription} is not null`,
        sql`length(trim(${schema.generations.customVibeDescription})) > 0`,
      ),
    )
    .orderBy(desc(schema.generations.createdAt))
    .limit(limit);

  return rows
    .filter((row): row is typeof row & { description: string } => Boolean(row.description))
    .map((row) => ({
      id: row.id,
      description: row.description.trim(),
      status: row.status,
      createdAt: row.createdAt,
    }));
}
