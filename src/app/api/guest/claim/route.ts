import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { claimGuestStudio, clearGuestOwnerCookie } from "@/lib/guest-owner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const user = await getCurrentUser();
  if (!user) return response;

  const result = await claimGuestStudio(user.id);
  if (result.status === "claimed") {
    clearGuestOwnerCookie(response);
  }

  return response;
}
