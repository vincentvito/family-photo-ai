import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { user as userTable } from "@/../db/auth-schema";
import { getCurrentSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getPackPriceId, getPricingPack, type PricingPackId } from "@/lib/pricing-packs";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { packId?: string } | null;
  const pack = body?.packId ? getPricingPack(body.packId) : null;
  if (!pack) {
    return NextResponse.json({ error: "unknown pack" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!appUrl) {
    return NextResponse.json({ error: "app url is not configured" }, { status: 500 });
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
    success_url: `${appUrl}/studio/roster?checkout=success`,
    cancel_url: `${appUrl}/?checkout=cancelled#pricing`,
    metadata: {
      userId: session.user.id,
      packId: pack.id,
      credits: String(pack.credits),
      priceId,
    },
    payment_intent_data: {
      metadata: {
        userId: session.user.id,
        packId: pack.id,
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

  await db.update(userTable).set({ stripeCustomerId: customer.id }).where(eq(userTable.id, userId));

  return customer.id;
}
