import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { addPhotoToPerson } from "@/lib/roster-queries";
import { deleteStoredImage, getStoredObjectSize, readStoredImage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024;

const Body = z.object({
  personId: z.string().min(1),
  tempKey: z.string().min(1),
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
  const { personId, tempKey } = parsed.data;

  // Lock finalization to objects this user uploaded under their own tmp prefix.
  if (!tempKey.startsWith(`tmp/uploads/${user.id}/`)) {
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
    const photo = await addPhotoToPerson({ userId: user.id, personId, buffer });
    after(() => deleteStoredImage(tempKey).catch(() => {}));
    return NextResponse.json({ photo });
  } catch (err) {
    after(() => deleteStoredImage(tempKey).catch(() => {}));
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
