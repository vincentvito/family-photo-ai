import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { removePhoto } from "@/lib/roster-queries";
import { getTempRosterOwner, type RosterOwner } from "@/lib/temp-roster";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

async function getRosterOwner(req: NextRequest): Promise<RosterOwner | null> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id, temporary: false };
  return getTempRosterOwner(req);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const owner = await getRosterOwner(req);
  if (!owner) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await removePhoto(owner.userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
