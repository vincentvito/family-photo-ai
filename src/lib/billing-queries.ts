import { cache } from "react";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type CreditBalanceReader = typeof db | DbTransaction;

export const getCreditBalance = cache(async function getCreditBalance(userId: string) {
  return getCreditBalanceWithReader(db, userId);
});

export async function getCreditBalanceWithReader(reader: CreditBalanceReader, userId: string) {
  const [purchaseRow] = await reader
    .select({
      total: sql<number>`coalesce(sum(${schema.creditTransactions.credits}), 0)`,
    })
    .from(schema.creditTransactions)
    .where(
      and(
        eq(schema.creditTransactions.userId, userId),
        eq(schema.creditTransactions.status, "completed"),
      ),
    );

  const [grantRow] = await reader
    .select({
      total: sql<number>`coalesce(sum(${schema.creditGrants.credits}), 0)`,
    })
    .from(schema.creditGrants)
    .where(eq(schema.creditGrants.userId, userId));

  const [usageRow] = await reader
    .select({
      total: sql<number>`coalesce(sum(${schema.creditUsages.credits}), 0)`,
    })
    .from(schema.creditUsages)
    .where(eq(schema.creditUsages.userId, userId));

  return (
    Number(purchaseRow?.total ?? 0) + Number(grantRow?.total ?? 0) - Number(usageRow?.total ?? 0)
  );
}

export async function refundGenerationCreditUse(generationId: string) {
  await db.delete(schema.creditUsages).where(eq(schema.creditUsages.generationId, generationId));
}

export function isActiveSubscriptionStatus(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

export const getCurrentSubscription = cache(async function getCurrentSubscription(userId: string) {
  const [subscription] = await db
    .select()
    .from(schema.subscriptions)
    .where(eq(schema.subscriptions.userId, userId))
    .orderBy(desc(schema.subscriptions.updatedAt))
    .limit(1);

  return subscription ?? null;
});

export const getCreditsUsedInCurrentPeriod = cache(async function getCreditsUsedInCurrentPeriod(
  userId: string,
  subscription: schema.Subscription | null,
) {
  if (!subscription?.currentPeriodStart || !subscription.currentPeriodEnd) return 0;

  const [usageRow] = await db
    .select({
      total: sql<number>`coalesce(sum(${schema.creditUsages.credits}), 0)`,
    })
    .from(schema.creditUsages)
    .where(
      and(
        eq(schema.creditUsages.userId, userId),
        gte(schema.creditUsages.createdAt, subscription.currentPeriodStart),
        lt(schema.creditUsages.createdAt, subscription.currentPeriodEnd),
      ),
    );

  return Number(usageRow?.total ?? 0);
});
