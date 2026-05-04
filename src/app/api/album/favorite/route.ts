import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { toggleFavorite } from "@/lib/album-queries";

export const runtime = "nodejs";

const Body = z.object({ imageId: z.string().min(1) });

export async function POST(req: Request) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  try {
    const isFavorite = await toggleFavorite(parsed.data.imageId);
    return NextResponse.json({ isFavorite });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
