import { NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getPricingPack } from "@/lib/pricing-packs";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "webhook secret is not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await handleCheckoutCompleted(event);
  }
  if (event.type === "charge.refunded") {
    await handleChargeRefunded(event);
  }

  return NextResponse.json({ received: true });
}

async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  if (charge.amount_refunded !== charge.amount) return;

  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  await db
    .update(schema.creditTransactions)
    .set({ status: "refunded" })
    .where(eq(schema.creditTransactions.stripePaymentIntentId, paymentIntentId));
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const checkout = event.data.object as Stripe.Checkout.Session;
  if (checkout.payment_status !== "paid") return;

  const userId = checkout.metadata?.userId;
  const packId = checkout.metadata?.packId;
  const priceId = checkout.metadata?.priceId;
  const pack = packId ? getPricingPack(packId) : null;

  if (!userId || !pack || !priceId) {
    throw new Error(`Checkout session ${checkout.id} is missing fulfillment metadata`);
  }

  await db
    .insert(schema.creditTransactions)
    .values({
      userId,
      packId: pack.id,
      credits: pack.credits,
      stripeCheckoutSessionId: checkout.id,
      stripePaymentIntentId:
        typeof checkout.payment_intent === "string" ? checkout.payment_intent : null,
      stripeEventId: event.id,
      stripePriceId: priceId,
      status: "completed",
    })
    .onConflictDoNothing({ target: schema.creditTransactions.stripeCheckoutSessionId });
}
