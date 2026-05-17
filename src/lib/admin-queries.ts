import { db, schema } from "@/lib/db";
import { and, desc, eq, gte, isNull, ne, sql } from "drizzle-orm";
import { GENERATION_MODEL_IDS, type GenerationModelId } from "@/lib/replicate/models";
import { formatGiftCode } from "@/lib/gift-code";
import { PRICING_PACKS, getPricingPack } from "@/lib/pricing-packs";
import { studioCutoffDate } from "@/lib/retention";
import { THEMES } from "@/lib/themes";
import { user as userTable } from "@/../db/auth-schema";

const SETTINGS_ROW_ID = "default";
const THEME_BY_ID = new Map(THEMES.map((theme) => [theme.id, theme]));

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

export type GiftCodeSalesStats = {
  totals: {
    giftCodesSold: number;
    creditsGifted: number;
    estimatedRevenueCents: number;
    redeemed: number;
    refunded: number;
  };
  packs: {
    packId: string;
    name: string;
    giftCodesSold: number;
    creditsGifted: number;
    estimatedRevenueCents: number;
  }[];
  recent: {
    id: string;
    code: string;
    packId: string;
    packName: string;
    buyerEmail: string | null;
    recipientEmail: string | null;
    credits: number;
    status: "available" | "redeemed" | "refunded" | "voided";
    estimatedRevenueCents: number;
    stripePriceId: string;
    createdAt: Date;
    redeemedAt: Date | null;
  }[];
};

export type PreviewFunnelStats = {
  previews: {
    generations: number;
    activeGenerations: number;
    images: number;
    users: number;
    usersWithoutPurchase: number;
    last7Days: number;
    usersWithoutPurchaseLast7Days: number;
  };
  convertedPreviews: {
    generations: number;
    users: number;
  };
  recentPreviews: {
    id: string;
    email: string | null;
    themeId: string;
    status: "pending" | "done" | "error";
    imageCount: number;
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

export async function getPreviewFunnelStats(limit = 8): Promise<PreviewFunnelStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const activePreviewCutoff = studioCutoffDate(new Date(), null);
  const hasNoPurchase = sql`not exists (
    select 1 from ${schema.creditTransactions}
    where ${schema.creditTransactions.userId} = ${schema.generations.userId}
      and ${schema.creditTransactions.status} = 'completed'
  )`;

  const [
    [{ count: previewGenerations }],
    [{ count: activePreviewGenerations }],
    [{ count: previewImages }],
    [{ count: previewUsers }],
    [{ count: previewUsersWithoutPurchase }],
    [{ count: last7PreviewGenerations }],
    [{ count: last7PreviewUsersWithoutPurchase }],
    [{ count: convertedPreviewGenerations }],
    [{ count: convertedPreviewUsers }],
    recentPreviews,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.generations)
      .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(and(eq(schema.generations.freePreview, true), isNull(schema.creditUsages.id))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.generations)
      .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(
        and(
          eq(schema.generations.freePreview, true),
          isNull(schema.creditUsages.id),
          ne(schema.generations.status, "error"),
          gte(schema.generations.createdAt, activePreviewCutoff),
        ),
      ),
    db
      .select({ count: sql<number>`count(${schema.images.id})::int` })
      .from(schema.images)
      .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
      .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(and(eq(schema.generations.freePreview, true), isNull(schema.creditUsages.id))),
    db
      .select({ count: sql<number>`count(distinct ${schema.generations.userId})::int` })
      .from(schema.generations)
      .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(and(eq(schema.generations.freePreview, true), isNull(schema.creditUsages.id))),
    db
      .select({ count: sql<number>`count(distinct ${schema.generations.userId})::int` })
      .from(schema.generations)
      .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(
        and(
          eq(schema.generations.freePreview, true),
          isNull(schema.creditUsages.id),
          hasNoPurchase,
        ),
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.generations)
      .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(
        and(
          eq(schema.generations.freePreview, true),
          isNull(schema.creditUsages.id),
          gte(schema.generations.createdAt, sevenDaysAgo),
        ),
      ),
    db
      .select({ count: sql<number>`count(distinct ${schema.generations.userId})::int` })
      .from(schema.generations)
      .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(
        and(
          eq(schema.generations.freePreview, true),
          isNull(schema.creditUsages.id),
          gte(schema.generations.createdAt, sevenDaysAgo),
          hasNoPurchase,
        ),
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.creditUsages)
      .innerJoin(schema.generations, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(eq(schema.generations.freePreview, true)),
    db
      .select({ count: sql<number>`count(distinct ${schema.creditUsages.userId})::int` })
      .from(schema.creditUsages)
      .innerJoin(schema.generations, eq(schema.creditUsages.generationId, schema.generations.id))
      .where(eq(schema.generations.freePreview, true)),
    db
      .select({
        id: schema.generations.id,
        email: userTable.email,
        themeId: schema.generations.themeId,
        status: schema.generations.status,
        imageCount: sql<number>`(
          select count(*)::int from ${schema.images}
          where ${schema.images.generationId} = ${schema.generations.id}
        )`,
        createdAt: schema.generations.createdAt,
      })
      .from(schema.generations)
      .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
      .leftJoin(userTable, eq(schema.generations.userId, userTable.id))
      .where(and(eq(schema.generations.freePreview, true), isNull(schema.creditUsages.id)))
      .orderBy(desc(schema.generations.createdAt))
      .limit(limit),
  ]);

  return {
    previews: {
      generations: Number(previewGenerations ?? 0),
      activeGenerations: Number(activePreviewGenerations ?? 0),
      images: Number(previewImages ?? 0),
      users: Number(previewUsers ?? 0),
      usersWithoutPurchase: Number(previewUsersWithoutPurchase ?? 0),
      last7Days: Number(last7PreviewGenerations ?? 0),
      usersWithoutPurchaseLast7Days: Number(last7PreviewUsersWithoutPurchase ?? 0),
    },
    convertedPreviews: {
      generations: Number(convertedPreviewGenerations ?? 0),
      users: Number(convertedPreviewUsers ?? 0),
    },
    recentPreviews: recentPreviews.map((row) => ({
      ...row,
      imageCount: Number(row.imageCount ?? 0),
    })),
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

export async function getUsersPage(page = 1, pageSize = 20, search = "") {
  const safePage = Math.max(1, Math.floor(page));
  const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
  const q = search.trim().toLowerCase();
  const searchWhere = q
    ? sql`lower(${userTable.email}) like ${`%${q}%`} or lower(${userTable.name}) like ${`%${q}%`}`
    : undefined;

  const countQuery = db.select({ count: sql<number>`count(*)::int` }).from(userTable);
  const [{ count: totalUsers }] = searchWhere ? await countQuery.where(searchWhere) : await countQuery;

  const total = Number(totalUsers ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const clampedPage = Math.min(safePage, totalPages);
  const offset = (clampedPage - 1) * safePageSize;
  const users = searchWhere
    ? await db
        .select({
          id: userTable.id,
          email: userTable.email,
          name: userTable.name,
          role: userTable.role,
          createdAt: userTable.createdAt,
        })
        .from(userTable)
        .where(searchWhere)
        .orderBy(desc(userTable.createdAt))
        .limit(safePageSize)
        .offset(offset)
    : await db
        .select({
          id: userTable.id,
          email: userTable.email,
          name: userTable.name,
          role: userTable.role,
          createdAt: userTable.createdAt,
        })
        .from(userTable)
        .orderBy(desc(userTable.createdAt))
        .limit(safePageSize)
        .offset(offset);

  return {
    users,
    page: clampedPage,
    pageSize: safePageSize,
    total,
    totalPages,
  };
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
  const [completedRows, [{ count: refundedPackages }]] = await Promise.all([
    db
      .select({
        packId: schema.creditTransactions.packId,
        packagesSold: sql<number>`count(*)::int`,
        creditsSold: sql<number>`coalesce(sum(${schema.creditTransactions.credits}), 0)::int`,
      })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.status, "completed"))
      .groupBy(schema.creditTransactions.packId),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.creditTransactions)
      .where(eq(schema.creditTransactions.status, "refunded")),
  ]);

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

export async function getGiftCodeSalesStats(limit = 8): Promise<GiftCodeSalesStats> {
  const [soldRows, [{ count: redeemed }], [{ count: refunded }], recentRows] = await Promise.all([
    db
      .select({
        packId: schema.giftCodes.packId,
        giftCodesSold: sql<number>`count(*)::int`,
        creditsGifted: sql<number>`coalesce(sum(${schema.giftCodes.credits}), 0)::int`,
      })
      .from(schema.giftCodes)
      .where(sql`${schema.giftCodes.status} <> 'refunded'`)
      .groupBy(schema.giftCodes.packId),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.giftCodes)
      .where(eq(schema.giftCodes.status, "redeemed")),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.giftCodes)
      .where(eq(schema.giftCodes.status, "refunded")),
    db
      .select({
        id: schema.giftCodes.id,
        code: schema.giftCodes.code,
        packId: schema.giftCodes.packId,
        buyerEmail: userTable.email,
        recipientEmail: schema.giftCodes.recipientEmail,
        credits: schema.giftCodes.credits,
        status: schema.giftCodes.status,
        stripePriceId: schema.giftCodes.stripePriceId,
        createdAt: schema.giftCodes.createdAt,
        redeemedAt: schema.giftCodes.redeemedAt,
      })
      .from(schema.giftCodes)
      .leftJoin(userTable, eq(schema.giftCodes.buyerUserId, userTable.id))
      .orderBy(desc(schema.giftCodes.createdAt))
      .limit(limit),
  ]);

  const soldByPack = new Map(soldRows.map((row) => [row.packId, row]));
  const packs: GiftCodeSalesStats["packs"] = Object.values(PRICING_PACKS).map((pack) => {
    const row = soldByPack.get(pack.id);
    const giftCodesSold = Number(row?.giftCodesSold ?? 0);
    const creditsGifted = Number(row?.creditsGifted ?? 0);
    return {
      packId: pack.id,
      name: pack.name,
      giftCodesSold,
      creditsGifted,
      estimatedRevenueCents: giftCodesSold * pack.unitAmount,
    };
  });

  for (const row of soldRows) {
    if (getPricingPack(row.packId)) continue;
    packs.push({
      packId: row.packId,
      name: row.packId,
      giftCodesSold: Number(row.giftCodesSold ?? 0),
      creditsGifted: Number(row.creditsGifted ?? 0),
      estimatedRevenueCents: 0,
    });
  }

  return {
    totals: {
      giftCodesSold: packs.reduce((sum, pack) => sum + pack.giftCodesSold, 0),
      creditsGifted: packs.reduce((sum, pack) => sum + pack.creditsGifted, 0),
      estimatedRevenueCents: packs.reduce((sum, pack) => sum + pack.estimatedRevenueCents, 0),
      redeemed: Number(redeemed ?? 0),
      refunded: Number(refunded ?? 0),
    },
    packs,
    recent: recentRows.map((row) => {
      const pack = getPricingPack(row.packId);
      return {
        ...row,
        code: formatGiftCode(row.code),
        packName: pack?.name ?? row.packId,
        estimatedRevenueCents: pack?.unitAmount ?? 0,
      };
    }),
  };
}

export async function getCreditGrantStats(limit = 6): Promise<CreditGrantStats> {
  const [[{ totalGranted }], recent] = await Promise.all([
    db
      .select({ totalGranted: sql<number>`coalesce(sum(${schema.creditGrants.credits}), 0)::int` })
      .from(schema.creditGrants)
      .where(
        sql`${schema.creditGrants.reason} is null or ${schema.creditGrants.reason} not like 'Redeemed gift code %'`,
      ),
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
      .where(
        sql`${schema.creditGrants.reason} is null or ${schema.creditGrants.reason} not like 'Redeemed gift code %'`,
      )
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
    const theme = THEME_BY_ID.get(row.themeId);
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
