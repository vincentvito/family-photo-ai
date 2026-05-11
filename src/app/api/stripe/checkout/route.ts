import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { user as userTable } from "@/../db/auth-schema";
import { getCurrentSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import {
  PRO_PLAN,
  getPackPriceId,
  getCheckoutCreditPack,
  getProPlanPriceId,
  type PricingPackId,
} from "@/lib/pricing-packs";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const CHECKOUT_RATE_LIMIT_WINDOW_MS = 60_000;
const CHECKOUT_RATE_LIMIT_MAX = 5;
// Best-effort, single-instance throttle. Use shared KV/Redis for a real Vercel-wide limit.
const checkoutAttempts = new Map<string, number[]>();

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (isCheckoutRateLimited(session.user.id)) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Try again soon." },
      { status: 429 },
    );
  }

  const appUrl = getAppUrl();
  if (!appUrl) {
    return NextResponse.json({ error: "app url is not configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as {
    packId?: string;
    planId?: string;
    gift?: {
      recipientEmail?: string;
      recipientName?: string;
      message?: string;
    };
    unlockGenerationId?: string;
  } | null;
  const unlockGenerationId = sanitizeMetadata(body?.unlockGenerationId, 80) || undefined;
  if (body?.planId === PRO_PLAN.id) {
    return createProCheckout({
      appUrl,
      userId: session.user.id,
      email: session.user.email,
      unlockGenerationId,
    });
  }

  const pack = body?.packId ? getCheckoutCreditPack(body.packId) : null;
  if (!pack) {
    return NextResponse.json({ error: "unknown pack" }, { status: 400 });
  }

  const priceId = getPackPriceId(pack.id as PricingPackId);
  const customerId = await getOrCreateStripeCustomer({
    userId: session.user.id,
    email: session.user.email,
  });
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: body?.gift
      ? `${appUrl}/studio/gifts?gift=success`
      : unlockGenerationId
        ? `${appUrl}/studio/generate/${encodeURIComponent(unlockGenerationId)}?unlock=success`
        : `${appUrl}/studio/roster?checkout=success`,
    cancel_url: unlockGenerationId
      ? `${appUrl}/studio/generate/${encodeURIComponent(unlockGenerationId)}?unlock=cancelled`
      : `${appUrl}/?checkout=cancelled#pricing`,
    metadata: {
      userId: session.user.id,
      packId: pack.id,
      credits: String(pack.credits),
      priceId,
      ...(unlockGenerationId ? { unlockGenerationId } : {}),
      ...(body?.gift
        ? {
            fulfillment: "gift",
            recipientEmail: sanitizeMetadata(body.gift.recipientEmail, 120),
            recipientName: sanitizeMetadata(body.gift.recipientName, 80),
            giftMessage: sanitizeMetadata(body.gift.message, 400),
          }
        : {}),
    },
    payment_intent_data: {
      metadata: {
        userId: session.user.id,
        packId: pack.id,
        ...(unlockGenerationId ? { unlockGenerationId } : {}),
        ...(body?.gift ? { fulfillment: "gift" } : {}),
      },
    },
    allow_promotion_codes: true,
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "checkout session missing url" }, { status: 500 });
  }

  return NextResponse.json({ url: checkout.url });
}

function sanitizeMetadata(value: string | undefined, maxLength: number) {
  return value?.trim().slice(0, maxLength) ?? "";
}

function isCheckoutRateLimited(userId: string) {
  const now = Date.now();
  const recent = (checkoutAttempts.get(userId) ?? []).filter(
    (timestamp) => now - timestamp < CHECKOUT_RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= CHECKOUT_RATE_LIMIT_MAX) {
    checkoutAttempts.set(userId, recent);
    return true;
  }

  recent.push(now);
  checkoutAttempts.set(userId, recent);
  return false;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? null;
}

async function createProCheckout({
  appUrl,
  userId,
  email,
  unlockGenerationId,
}: {
  appUrl: string;
  userId: string;
  email: string;
  unlockGenerationId?: string;
}) {
  const priceId = getProPlanPriceId();
  const customerId = await getOrCreateStripeCustomer({ userId, email });
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: unlockGenerationId
      ? `${appUrl}/studio/generate/${encodeURIComponent(unlockGenerationId)}?unlock=pro-success`
      : `${appUrl}/studio/roster?checkout=pro-success`,
    cancel_url: unlockGenerationId
      ? `${appUrl}/studio/generate/${encodeURIComponent(unlockGenerationId)}?unlock=cancelled`
      : `${appUrl}/?checkout=cancelled#pricing`,
    metadata: {
      userId,
      planId: PRO_PLAN.id,
      credits: String(PRO_PLAN.credits),
      priceId,
      ...(unlockGenerationId ? { unlockGenerationId } : {}),
    },
    subscription_data: {
      metadata: {
        userId,
        planId: PRO_PLAN.id,
      },
    },
    allow_promotion_codes: true,
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "checkout session missing url" }, { status: 500 });
  }

  return NextResponse.json({ url: checkout.url });
}

async function getOrCreateStripeCustomer({ userId, email }: { userId: string; email: string }) {
  const [user] = await db
    .select({ stripeCustomerId: userTable.stripeCustomerId })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  const claimed = await db
    .update(userTable)
    .set({ stripeCustomerId: customer.id })
    .where(and(eq(userTable.id, userId), isNull(userTable.stripeCustomerId)))
    .returning({ id: userTable.id });

  if (claimed.length > 0) {
    return customer.id;
  }

  const [winner] = await db
    .select({ stripeCustomerId: userTable.stripeCustomerId })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (winner?.stripeCustomerId) {
    await stripe.customers.del(customer.id).catch((err) => {
      console.warn(`getOrCreateStripeCustomer: failed to delete orphan ${customer.id}`, err);
    });
    return winner.stripeCustomerId;
  }

  await stripe.customers.del(customer.id).catch((err) => {
    console.warn(`getOrCreateStripeCustomer: failed to delete unclaimed ${customer.id}`, err);
  });
  throw new Error("Unable to persist Stripe customer.");
}
