import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { and, eq, ne } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const COOKIE_NAME = "fs_guest_owner";
const GUEST_ID_PATTERN = /^guest:[A-Za-z0-9_-]{12,}$/;

export type GuestClaimResult =
  | { status: "none" }
  | { status: "claimed"; guestOwnerId: string }
  | { status: "conflict"; guestOwnerId: string; generationId: string };

export function isGuestOwnerId(ownerId: string) {
  return ownerId.startsWith("guest:");
}

export async function getGuestOwnerId() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return verifyGuestCookie(value);
}

export function createGuestOwnerId() {
  return `guest:${nanoid(18)}`;
}

export function setGuestOwnerCookie(response: NextResponse, ownerId: string) {
  response.cookies.set(COOKIE_NAME, signGuestOwnerId(ownerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearGuestOwnerCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function claimGuestStudio(userId: string): Promise<GuestClaimResult> {
  const guestOwnerId = await getGuestOwnerId();
  if (!guestOwnerId) return { status: "none" };

  const [guestPreview, userPreview] = await Promise.all([
    db
      .select({ id: schema.generations.id })
      .from(schema.generations)
      .where(
        and(
          eq(schema.generations.userId, guestOwnerId),
          eq(schema.generations.freePreview, true),
          ne(schema.generations.status, "error"),
        ),
      )
      .limit(1),
    db
      .select({ id: schema.generations.id })
      .from(schema.generations)
      .where(
        and(
          eq(schema.generations.userId, userId),
          eq(schema.generations.freePreview, true),
          ne(schema.generations.status, "error"),
        ),
      )
      .limit(1),
  ]);

  if (guestPreview[0] && userPreview[0]) {
    return { status: "conflict", guestOwnerId, generationId: guestPreview[0].id };
  }

  await db.transaction(async (tx) => {
    await tx.update(schema.people).set({ userId }).where(eq(schema.people.userId, guestOwnerId));
    await tx
      .update(schema.generations)
      .set({ userId })
      .where(eq(schema.generations.userId, guestOwnerId));
  });

  return { status: "claimed", guestOwnerId };
}

export async function getGuestGenerationConflict(userId: string, generationId: string) {
  const guestOwnerId = await getGuestOwnerId();
  if (!guestOwnerId) return null;

  const [guestGeneration, userPreview] = await Promise.all([
    db
      .select({ id: schema.generations.id })
      .from(schema.generations)
      .where(
        and(eq(schema.generations.id, generationId), eq(schema.generations.userId, guestOwnerId)),
      )
      .limit(1),
    db
      .select({ id: schema.generations.id })
      .from(schema.generations)
      .where(
        and(
          eq(schema.generations.userId, userId),
          eq(schema.generations.freePreview, true),
          ne(schema.generations.status, "error"),
        ),
      )
      .limit(1),
  ]);

  return guestGeneration[0] && userPreview[0]
    ? { guestOwnerId, userPreviewId: userPreview[0].id }
    : null;
}

function signGuestOwnerId(ownerId: string) {
  return `${ownerId}.${signatureFor(ownerId)}`;
}

function verifyGuestCookie(value: string | undefined) {
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;
  const ownerId = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!GUEST_ID_PATTERN.test(ownerId)) return null;
  const expected = signatureFor(ownerId);
  if (!timingSafeEqual(signature, expected)) return null;
  return ownerId;
}

function signatureFor(value: string) {
  return crypto.createHmac("sha256", getSigningSecret()).update(value).digest("base64url");
}

function getSigningSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required for guest studio cookies");
  }
  return secret;
}

function timingSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
