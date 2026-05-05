import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getCreditBalance } from "@/lib/billing-queries";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const balance = await getCreditBalance(user.id);
  return NextResponse.json({ balance });
}
