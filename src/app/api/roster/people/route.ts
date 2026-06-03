import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { addPerson, listRoster } from "@/lib/roster-queries";
import { rosterCreateBodySchema } from "@/lib/roster-validation";
import {
  createTempRosterOwner,
  getTempRosterOwner,
  isTempRosterUserId,
  setTempRosterCookie,
  type RosterOwner,
} from "@/lib/temp-roster";
import type { NextRequest } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { getClientIp, isRateLimited } from "@/lib/request-limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEMP_ROSTER_PERSON_CAP = 10;
const ANON_ROSTER_POSTS_PER_MINUTE = 12;

function validationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the roster details and try again.";
}

async function getRosterOwner(req: NextRequest): Promise<RosterOwner | null> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id, temporary: false };
  return getTempRosterOwner(req);
}

export async function GET(req: NextRequest) {
  const owner = await getRosterOwner(req);
  if (!owner) {
    return NextResponse.json({ roster: [] });
  }
  try {
    const roster = await listRoster(owner.userId);
    return NextResponse.json({ roster });
  } catch (err) {
    console.error("roster.list failed", err);
    return NextResponse.json(
      { error: "Could not load roster. Please try again." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const ip = getClientIp(req);
  if (!user && (await isRateLimited(`anon:roster:create:${ip}`, ANON_ROSTER_POSTS_PER_MINUTE))) {
    return NextResponse.json(
      { error: "Too many roster changes. Try again in a minute." },
      { status: 429 },
    );
  }

  const owner = user
    ? { userId: user.id, temporary: false }
    : (getTempRosterOwner(req) ?? createTempRosterOwner());
  const json = await req.json().catch(() => null);
  const parsed = rosterCreateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: validationError(parsed.error) }, { status: 400 });
  }
  try {
    if (isTempRosterUserId(owner.userId) && (await tempRosterPersonCount(owner.userId)) >= TEMP_ROSTER_PERSON_CAP) {
      return NextResponse.json(
        { error: `Temporary rosters can include up to ${TEMP_ROSTER_PERSON_CAP} people.` },
        { status: 400 },
      );
    }

    const person = await addPerson({ ...parsed.data, userId: owner.userId });
    const res = NextResponse.json({ person });
    setTempRosterCookie(res, owner);
    return res;
  } catch (err) {
    console.error("roster.create failed", err);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }
}

async function tempRosterPersonCount(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.people)
    .where(eq(schema.people.userId, userId));
  return row?.count ?? 0;
}
