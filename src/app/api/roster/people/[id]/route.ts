import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { removePerson } from "@/lib/roster-queries";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const photoCount = await removePerson(user.id, id);
    return NextResponse.json({ photoCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
