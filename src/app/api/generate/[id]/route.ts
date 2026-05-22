import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getGuestOwnerId } from "@/lib/guest-owner";
import { getGenerationState } from "@/lib/generate-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const guestOwnerId = user ? null : await getGuestOwnerId();
  const ownerId = user?.id ?? guestOwnerId;
  if (!ownerId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const state = await getGenerationState(id, ownerId, { guest: Boolean(guestOwnerId) });
    if (!state) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(state);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
