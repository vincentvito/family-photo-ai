import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getGuestOwnerId } from "@/lib/guest-owner";
import { removePhoto } from "@/lib/roster-queries";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const ownerId = user?.id ?? (await getGuestOwnerId());
  if (!ownerId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await removePhoto(ownerId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
