import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { user as userTable } from "@/../db/auth-schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { claimTempRosterForUser, clearTempRosterCookie } from "@/lib/temp-roster";

const SOURCE_MAX_LENGTH = 64;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    optIn?: unknown;
    source?: unknown;
  } | null;

  const claim = await claimTempRosterForUser(req, user.id);

  if (body?.optIn !== true) {
    const res = NextResponse.json({ ok: true, updated: false, rosterClaimed: claim.claimed });
    clearTempRosterCookie(res);
    return res;
  }

  await saveMarketingOptIn(user.id, normalizeSource(body.source));
  const res = NextResponse.json({ ok: true, updated: true, rosterClaimed: claim.claimed });
  clearTempRosterCookie(res);
  return res;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const next = safeNextPath(req.nextUrl.searchParams.get("next"));
  const optIn = req.nextUrl.searchParams.get("optIn") === "1";
  const source = normalizeSource(req.nextUrl.searchParams.get("source"));

  if (user && optIn) {
    await saveMarketingOptIn(user.id, source);
  }
  if (user) {
    await claimTempRosterForUser(req, user.id);
  }

  const res = NextResponse.redirect(new URL(next, req.url));
  if (user) clearTempRosterCookie(res);
  return res;
}

async function saveMarketingOptIn(userId: string, source: string) {
  await db
    .update(userTable)
    .set({
      marketingOptIn: true,
      marketingOptInAt: new Date(),
      marketingOptInSource: source,
    })
    .where(eq(userTable.id, userId));
}

function normalizeSource(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, SOURCE_MAX_LENGTH)
    : "sign_in";
}

function safeNextPath(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/studio/album";
  return value;
}
