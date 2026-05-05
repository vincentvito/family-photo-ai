import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
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
  const { contentType } = parsed.data;

  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${contentType}` },
      { status: 415 },
    );
  }

  const tempKey = `tmp/locations/${user.id}/${nanoid(16)}`;
  const uploadUrl = await getSignedPutUrl(tempKey, contentType, 300);

  return NextResponse.json({ uploadUrl, tempKey });
}
