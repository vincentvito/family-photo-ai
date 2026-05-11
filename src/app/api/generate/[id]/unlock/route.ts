import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { unlockPreviewGeneration } from "@/lib/generate-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const result = await unlockPreviewGeneration(id, user.id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not unlock preview.";
    const needsCredits = message.includes("Buy a photo pack");
    return NextResponse.json(
      { error: needsCredits ? "Add credits to unlock this preview." : message, needsCredits },
      { status: needsCredits ? 402 : 500 },
    );
  }
}
