import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth-helpers";
import { setDefaultGenerationMethod } from "@/lib/admin-queries";
import { GENERATION_METHODS } from "@/lib/generation-method";
import { validateAllGenerationDemos } from "@/lib/vibe-reference";

const Body = z.object({ method: z.enum(GENERATION_METHODS) });

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });
  if (parsed.data.method === "vibe-reference") {
    try {
      await validateAllGenerationDemos();
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Generation demos are unavailable." },
        { status: 409 },
      );
    }
  }
  await setDefaultGenerationMethod(parsed.data.method);
  return NextResponse.json({ ok: true });
}
