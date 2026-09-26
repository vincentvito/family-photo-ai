import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth-helpers";
import { previewGenerationPrompts } from "@/lib/generate-queries";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const input = await req.json().catch(() => null);
  if (!input) return NextResponse.json({ error: "bad request" }, { status: 400 });
  try {
    return NextResponse.json(await previewGenerationPrompts(input, { userId: user.id }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load prompts." },
      { status: 400 },
    );
  }
}
