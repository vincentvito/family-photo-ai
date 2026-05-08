import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import {
  getCreditBalance,
  getCurrentSubscription,
  isActiveSubscriptionStatus,
} from "@/lib/billing-queries";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [balance, subscription] = await Promise.all([
    getCreditBalance(user.id),
    getCurrentSubscription(user.id),
  ]);
  return NextResponse.json({
    balance,
    subscription: {
      active: isActiveSubscriptionStatus(subscription?.status),
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
    },
  });
}
