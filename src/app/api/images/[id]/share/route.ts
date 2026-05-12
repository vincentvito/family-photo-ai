import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { createImageShare } from "@/lib/share-queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const share = await createImageShare(user.id, id);
    const shareUrl = new URL(`/share/${share.token}`, req.url).toString();
    return NextResponse.json({ token: share.token, shareUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create share link.";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
