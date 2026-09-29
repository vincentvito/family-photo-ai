import { after, NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-helpers";
import { processPendingOpenAIShoots } from "@/lib/openai/jobs";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const cron = secret && req.headers.get("authorization") === `Bearer ${secret}`;
  if (!cron && !(await isAdmin()))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  after(async () => {
    try {
      await processPendingOpenAIShoots();
    } catch (error) {
      console.error("OpenAI queue recovery failed", error);
    }
  });
  return NextResponse.json({ accepted: true });
}

export const GET = POST;
