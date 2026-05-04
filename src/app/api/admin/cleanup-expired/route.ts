import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { isAdmin } from "@/lib/auth-helpers";
import { cleanupExpiredStudio } from "@/lib/cleanup-expired";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function canRunCleanup(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true;
  return isAdmin();
}

async function runCleanup(req: NextRequest) {
  if (!(await canRunCleanup(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Cron doesn't need the result body — return immediately and run cleanup in
  // the background so the request doesn't sit open through R2 deletes.
  after(async () => {
    try {
      await cleanupExpiredStudio();
    } catch (err) {
      console.error("cleanupExpiredStudio failed", err);
    }
  });

  return NextResponse.json({ accepted: true });
}

export async function GET(req: NextRequest) {
  return runCleanup(req);
}

export async function POST(req: NextRequest) {
  return runCleanup(req);
}
