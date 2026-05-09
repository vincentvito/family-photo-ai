import { NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createGiftFromCheckout, markGiftRefundedByPaymentIntent } from "@/lib/gift-queries";
import { PRO_PLAN, getCheckoutCreditPack } from "@/lib/pricing-packs";
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
  } else if (event.type === "invoice.payment_succeeded") {
    await handleInvoicePaymentSucceeded(event);
  } else if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await upsertSubscription(event.data.object as Stripe.Subscription);
  } else if (event.type === "charge.refunded") {
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
  await markGiftRefundedByPaymentIntent(paymentIntentId);
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const checkout = event.data.object as Stripe.Checkout.Session;
  const userId = checkout.metadata?.userId;
  const planId = checkout.metadata?.planId;
  const packId = checkout.metadata?.packId;
  const priceId = checkout.metadata?.priceId;
  const fulfillment = checkout.metadata?.fulfillment;

  if (planId === PRO_PLAN.id) {
    if (checkout.payment_status !== "paid" && checkout.payment_status !== "no_payment_required") {
      return;
    }
    if (!userId || !priceId) {
      console.warn(`Stripe webhook: checkout session ${checkout.id} is missing Pro metadata`);
      return;
    }
    if (checkout.subscription) {
      const subscriptionId =
        typeof checkout.subscription === "string"
          ? checkout.subscription
          : checkout.subscription.id;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertSubscription(subscription);
    }
    await grantProCredits({
      userId,
      stripeFulfillmentRef: checkout.id,
      stripeFulfillmentKind: "checkout",
      stripePaymentIntentId:
        typeof checkout.payment_intent === "string" ? checkout.payment_intent : null,
      stripeEventId: event.id,
      stripePriceId: priceId,
    });
    return;
  }

  if (checkout.payment_status !== "paid") return;

  const pack = packId ? getCheckoutCreditPack(packId) : null;

  if (!userId || !pack || !priceId) {
    console.warn(`Stripe webhook: checkout session ${checkout.id} is missing pack metadata`);
    return;
  }

  if (fulfillment === "gift") {
    await createGiftFromCheckout({
      buyerUserId: userId,
      packId: pack.id,
      recipientEmail: checkout.metadata?.recipientEmail || null,
      recipientName: checkout.metadata?.recipientName || null,
      message: checkout.metadata?.giftMessage || null,
      stripeCheckoutSessionId: checkout.id,
      stripePaymentIntentId:
        typeof checkout.payment_intent === "string" ? checkout.payment_intent : null,
      stripeEventId: event.id,
      stripePriceId: priceId,
    });
    return;
  }

  await db
    .insert(schema.creditTransactions)
    .values({
      userId,
      packId: pack.id,
      credits: pack.credits,
      stripeCheckoutSessionId: checkout.id,
      stripeFulfillmentKind: "checkout",
      stripePaymentIntentId:
        typeof checkout.payment_intent === "string" ? checkout.payment_intent : null,
      stripeEventId: event.id,
      stripePriceId: priceId,
      status: "completed",
    })
    .onConflictDoNothing({ target: schema.creditTransactions.stripeCheckoutSessionId });
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
    payment_intent?: string | Stripe.PaymentIntent | null;
    billing_reason?: string | null;
  };

  if (invoice.billing_reason === "subscription_create") return;
  if (!invoice.subscription) return;

  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscription(subscription);
  if (subscription.metadata?.planId !== PRO_PLAN.id) return;

  const userId = subscription.metadata?.userId;
  const priceId = subscription.items.data[0]?.price.id;
  if (!userId || !priceId) return;

  await grantProCredits({
    userId,
    stripeFulfillmentRef: invoice.id,
    stripeFulfillmentKind: "invoice",
    stripePaymentIntentId:
      typeof invoice.payment_intent === "string" ? invoice.payment_intent : null,
    stripeEventId: event.id,
    stripePriceId: priceId,
  });
}

async function grantProCredits({
  userId,
  stripeFulfillmentRef,
  stripeFulfillmentKind,
  stripePaymentIntentId,
  stripeEventId,
  stripePriceId,
}: {
  userId: string;
  stripeFulfillmentRef: string;
  stripeFulfillmentKind: "checkout" | "invoice";
  stripePaymentIntentId: string | null;
  stripeEventId: string;
  stripePriceId: string;
}) {
  await db
    .insert(schema.creditTransactions)
    .values({
      userId,
      packId: PRO_PLAN.id,
      credits: PRO_PLAN.credits,
      stripeCheckoutSessionId: stripeFulfillmentRef,
      stripeFulfillmentKind,
      stripePaymentIntentId,
      stripeEventId,
      stripePriceId,
      status: "completed",
    })
    .onConflictDoNothing({ target: schema.creditTransactions.stripeCheckoutSessionId });
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const priceId = subscription.items.data[0]?.price.id;
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  if (!userId || !priceId) return;

  const period = getSubscriptionPeriod(subscription);

  await db
    .insert(schema.subscriptions)
    .values({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      planId: subscription.metadata?.planId ?? PRO_PLAN.id,
      status: subscription.status,
      currentPeriodStart: fromUnix(period.start),
      currentPeriodEnd: fromUnix(period.end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.subscriptions.stripeSubscriptionId,
      set: {
        stripePriceId: priceId,
        status: subscription.status,
        currentPeriodStart: fromUnix(period.start),
        currentPeriodEnd: fromUnix(period.end),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });
}

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const subscriptionWithLegacyPeriods = subscription as Stripe.Subscription & {
    current_period_start?: number | null;
    current_period_end?: number | null;
  };
  const item = subscription.items.data[0];

  return {
    start: item?.current_period_start ?? subscriptionWithLegacyPeriods.current_period_start,
    end: item?.current_period_end ?? subscriptionWithLegacyPeriods.current_period_end,
  };
}

function fromUnix(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000) : null;
}
