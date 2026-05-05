import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { getSignedPutUrl } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const Body = z.object({
  personId: z.string().min(1),
  contentType: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { personId, contentType } = parsed.data;

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${contentType}` },
      { status: 415 },
    );
  }

  const [person] = await db
    .select({ id: schema.people.id })
    .from(schema.people)
    .where(and(eq(schema.people.id, personId), eq(schema.people.userId, user.id)))
    .limit(1);
  if (!person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  const tempKey = `tmp/uploads/${user.id}/${nanoid(16)}`;
  const uploadUrl = await getSignedPutUrl(tempKey, contentType, 300);

  return NextResponse.json({ uploadUrl, tempKey });
}
