import { cache } from "react";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createGiftCode, formatGiftCode, normalizeGiftCode } from "@/lib/gift-code";
import { getCheckoutCreditPack } from "@/lib/pricing-packs";

export const getGiftCodesForBuyer = cache(async function getGiftCodesForBuyer(userId: string) {
  return db
    .select({
      id: schema.giftCodes.id,
      code: schema.giftCodes.code,
      status: schema.giftCodes.status,
      credits: schema.giftCodes.credits,
      recipientEmail: schema.giftCodes.recipientEmail,
      message: schema.giftCodes.message,
      createdAt: schema.giftCodes.createdAt,
      redeemedAt: schema.giftCodes.redeemedAt,
    })
    .from(schema.giftCodes)
    .where(eq(schema.giftCodes.buyerUserId, userId))
    .orderBy(desc(schema.giftCodes.createdAt))
    .limit(24);
});

export const getGiftCodePreview = cache(async function getGiftCodePreview(code: string) {
  const normalized = normalizeGiftCode(code);
  if (!normalized) return null;

  const [gift] = await db
    .select({
      id: schema.giftCodes.id,
      code: schema.giftCodes.code,
      packId: schema.giftCodes.packId,
      credits: schema.giftCodes.credits,
      recipientName: schema.giftCodes.recipientName,
      message: schema.giftCodes.message,
      status: schema.giftCodes.status,
      redeemedAt: schema.giftCodes.redeemedAt,
    })
    .from(schema.giftCodes)
    .where(eq(schema.giftCodes.code, normalized))
    .limit(1);

  return gift ?? null;
});

export async function redeemGiftCode({ code, userId }: { code: string; userId: string }) {
  const normalized = normalizeGiftCode(code);
  if (!normalized) {
    return { ok: false as const, error: "Enter a gift code." };
  }

  return db.transaction(async (tx) => {
    const [gift] = await tx
      .update(schema.giftCodes)
      .set({
        status: "redeemed",
        redeemedByUserId: userId,
        redeemedAt: new Date(),
      })
      .where(and(eq(schema.giftCodes.code, normalized), eq(schema.giftCodes.status, "available")))
      .returning();

    if (!gift) {
      return { ok: false as const, error: "Invalid or already redeemed gift code." };
    }

    await tx.insert(schema.creditGrants).values({
      userId,
      credits: gift.credits,
      reason: `Redeemed gift code ${formatGiftCode(gift.code)}`,
      grantedByUserId: gift.buyerUserId,
    });

    return { ok: true as const, gift };
  });
}

export async function createGiftFromCheckout({
  buyerUserId,
  packId,
  recipientEmail,
  recipientName,
  message,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
  stripeEventId,
  stripePriceId,
}: {
  buyerUserId: string;
  packId: string;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  stripeEventId: string;
  stripePriceId: string;
}) {
  const pack = getCheckoutCreditPack(packId);
  if (!pack) return;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inserted = await db
      .insert(schema.giftCodes)
      .values({
        buyerUserId,
        packId: pack.id,
        credits: pack.credits,
        code: createGiftCode(),
        recipientEmail,
        recipientName,
        message,
        stripeCheckoutSessionId,
        stripePaymentIntentId,
        stripeEventId,
        stripePriceId,
        status: "available",
      })
      .onConflictDoNothing({ target: schema.giftCodes.stripeCheckoutSessionId })
      .returning({ id: schema.giftCodes.id });

    if (inserted.length > 0) return;

    const [existing] = await db
      .select({ id: schema.giftCodes.id })
      .from(schema.giftCodes)
      .where(eq(schema.giftCodes.stripeCheckoutSessionId, stripeCheckoutSessionId))
      .limit(1);

    if (existing) return;
  }

  throw new Error("Unable to create unique gift code.");
}

export async function markGiftRefundedByPaymentIntent(stripePaymentIntentId: string) {
  await db
    .update(schema.giftCodes)
    .set({ status: "refunded" })
    .where(
      and(
        eq(schema.giftCodes.stripePaymentIntentId, stripePaymentIntentId),
        eq(schema.giftCodes.status, "available"),
      ),
    );
}
