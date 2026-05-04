import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth-helpers";
import { setDefaultModel } from "@/lib/admin-queries";
import { GENERATION_MODEL_IDS, type GenerationModelId } from "@/lib/replicate/models";

const Body = z.object({
  modelId: z.enum(GENERATION_MODEL_IDS as [GenerationModelId, ...GenerationModelId[]]),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  await setDefaultModel(parsed.data.modelId);
  return NextResponse.json({ ok: true });
}
