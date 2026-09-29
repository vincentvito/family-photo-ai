import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth-helpers";
import { setDefaultModel } from "@/lib/admin-queries";
import {
  GENERATION_MODEL_IDS,
  isOpenAIModel,
  type GenerationModelId,
} from "@/lib/replicate/models";
import { assertOpenAIConfigured } from "@/lib/openai/images";
import { assertOpenAIJobsReady } from "@/lib/openai/jobs";

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
  if (isOpenAIModel(parsed.data.modelId)) {
    try {
      assertOpenAIConfigured();
      await assertOpenAIJobsReady();
    } catch {
      return NextResponse.json(
        {
          error:
            "Set OPENAI_API_KEY and apply the OpenAI jobs migration before choosing this default.",
        },
        { status: 400 },
      );
    }
  }
  await setDefaultModel(parsed.data.modelId);
  return NextResponse.json({ ok: true });
}
