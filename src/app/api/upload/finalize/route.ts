import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { addPhotoToPerson } from "@/lib/roster-queries";
import { deleteStoredImage, getStoredObjectSize, readStoredImage } from "@/lib/storage";
import { getTempRosterOwner, type RosterOwner } from "@/lib/temp-roster";
import { getClientIp, isRateLimited } from "@/lib/request-limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024;
const ANON_UPLOAD_FINALIZES_PER_MINUTE = 20;

const Body = z.object({
  personId: z.string().min(1),
  tempKey: z.string().min(1),
});

async function getRosterOwner(req: NextRequest): Promise<RosterOwner | null> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id, temporary: false };
  return getTempRosterOwner(req);
}

export async function POST(req: NextRequest) {
  const owner = await getRosterOwner(req);
  if (!owner) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (
    owner.temporary &&
    (await isRateLimited(
      `anon:upload:finalize:${owner.userId}:${getClientIp(req)}`,
      ANON_UPLOAD_FINALIZES_PER_MINUTE,
    ))
  ) {
    return NextResponse.json(
      { error: "Too many upload attempts. Try again in a minute." },
      { status: 429 },
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { personId, tempKey } = parsed.data;

  // Lock finalization to objects this roster owner uploaded under their own tmp prefix.
  if (!tempKey.startsWith(`tmp/uploads/${owner.userId}/`)) {
    return NextResponse.json({ error: "Invalid tempKey" }, { status: 400 });
  }

  let size: number;
  try {
    size = await getStoredObjectSize(tempKey);
  } catch {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }
  if (size > MAX_BYTES) {
    after(() => deleteStoredImage(tempKey).catch(() => {}));
    return NextResponse.json({ error: "File is larger than 20MB" }, { status: 413 });
  }

  try {
    const buffer = await readStoredImage(tempKey);
    const photo = await addPhotoToPerson({ userId: owner.userId, personId, buffer });
    after(() => deleteStoredImage(tempKey).catch(() => {}));
    return NextResponse.json({ photo });
  } catch (err) {
    after(() => deleteStoredImage(tempKey).catch(() => {}));
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
