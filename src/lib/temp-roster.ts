import crypto from "node:crypto";
import { nanoid } from "nanoid";
import type { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { safeRevalidatePath as revalidatePath } from "@/lib/revalidate";
import { eq } from "drizzle-orm";

export const TEMP_ROSTER_COOKIE = "fs_temp_roster";

const TEMP_ROSTER_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const TEMP_ROSTER_ID_LENGTH = 21;
const TEMP_ROSTER_ID_PATTERN = /^[A-Za-z0-9_-]{21}$/;

export type RosterOwner = {
  userId: string;
  temporary: boolean;
  cookieValue?: string;
};

export function createTempRosterOwner(): RosterOwner {
  const id = nanoid(TEMP_ROSTER_ID_LENGTH);
  const expiresAt = Math.floor(Date.now() / 1000) + TEMP_ROSTER_MAX_AGE_SECONDS;
  const cookieValue = signTempRosterCookie(id, expiresAt);
  return {
    userId: tempRosterUserId(id),
    temporary: true,
    cookieValue,
  };
}

export function getTempRosterOwner(req: NextRequest): RosterOwner | null {
  return getTempRosterOwnerFromCookieValue(req.cookies.get(TEMP_ROSTER_COOKIE)?.value);
}

export function getTempRosterOwnerFromCookieValue(value: string | undefined): RosterOwner | null {
  const id = verifyTempRosterCookie(value);
  if (!id) return null;
  return {
    userId: tempRosterUserId(id),
    temporary: true,
  };
}

export function setTempRosterCookie(res: NextResponse, owner: RosterOwner) {
  if (!owner.cookieValue) return;
  res.cookies.set(TEMP_ROSTER_COOKIE, owner.cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TEMP_ROSTER_MAX_AGE_SECONDS,
  });
}

export function clearTempRosterCookie(res: NextResponse) {
  res.cookies.set(TEMP_ROSTER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function claimTempRosterForUser(req: NextRequest, userId: string) {
  const owner = getTempRosterOwner(req);
  if (!owner) return { claimed: 0 };

  const claimed = await db
    .update(schema.people)
    .set({ userId })
    .where(eq(schema.people.userId, owner.userId))
    .returning({ id: schema.people.id });

  if (claimed.length > 0) {
    revalidatePath("/studio/roster");
    revalidatePath("/studio/theme");
  }

  return { claimed: claimed.length };
}

export function isTempRosterUserId(userId: string) {
  return userId.startsWith("temp:");
}

function tempRosterUserId(id: string) {
  return `temp:${id}`;
}

function signTempRosterCookie(id: string, expiresAt: number) {
  const payload = `${id}.${expiresAt}`;
  return `${payload}.${signature(payload)}`;
}

function verifyTempRosterCookie(value: string | undefined) {
  if (!value) return null;
  const [id, expiresAtRaw, sig] = value.split(".");
  if (!id || !expiresAtRaw || !sig || !TEMP_ROSTER_ID_PATTERN.test(id)) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return null;

  const payload = `${id}.${expiresAt}`;
  const expected = signature(payload);
  if (!timingSafeEqual(sig, expected)) return null;
  return id;
}

function signature(payload: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required for temp roster cookies");
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}
