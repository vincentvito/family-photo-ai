import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { refineImage } from "@/lib/refine-queries";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const result = await refineImage(json);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
