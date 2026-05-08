import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { user as userTable } from "@/../db/auth-schema";
import { getCurrentSession } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!appUrl) {
    return NextResponse.json({ error: "app url is not configured" }, { status: 500 });
  }

  const [user] = await db
    .select({ stripeCustomerId: userTable.stripeCustomerId })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "no Stripe customer found" }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/studio/account`,
    ...(process.env.STRIPE_PORTAL_CONFIGURATION_ID
      ? { configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID }
      : {}),
  });

  return NextResponse.json({ url: portal.url });
}
