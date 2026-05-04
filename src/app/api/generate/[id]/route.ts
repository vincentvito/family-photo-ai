import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getGenerationState } from "@/lib/generate-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const state = await getGenerationState(id);
    if (!state) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(state);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
