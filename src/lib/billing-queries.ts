import { and, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export async function getCreditBalance(userId: string) {
  const [[purchaseRow], [grantRow], [usageRow]] = await Promise.all([
    db
      .select({
        total: sql<number>`coalesce(sum(${schema.creditTransactions.credits}), 0)`,
      })
      .from(schema.creditTransactions)
      .where(
        and(
          eq(schema.creditTransactions.userId, userId),
          eq(schema.creditTransactions.status, "completed"),
        ),
      ),
    db
      .select({
        total: sql<number>`coalesce(sum(${schema.creditGrants.credits}), 0)`,
      })
      .from(schema.creditGrants)
      .where(eq(schema.creditGrants.userId, userId)),
    db
      .select({
        total: sql<number>`coalesce(sum(${schema.creditUsages.credits}), 0)`,
      })
      .from(schema.creditUsages)
      .where(eq(schema.creditUsages.userId, userId)),
  ]);

  return (
    Number(purchaseRow?.total ?? 0) + Number(grantRow?.total ?? 0) - Number(usageRow?.total ?? 0)
  );
}

export async function refundGenerationCreditUse(generationId: string) {
  await db.delete(schema.creditUsages).where(eq(schema.creditUsages.generationId, generationId));
}
