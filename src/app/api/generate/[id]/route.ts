import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getGenerationState } from "@/lib/generate-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const state = await getGenerationState(id, user.id);
    if (!state) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(state);
  } catch (err) {
    console.error(`Failed to refresh generation ${id}`, err);
    return NextResponse.json({ error: "Could not refresh this shoot." }, { status: 500 });
  }
}
