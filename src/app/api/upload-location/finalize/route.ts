import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getGuestOwnerId } from "@/lib/guest-owner";
import {
  deleteStoredImage,
  getStoredObjectSize,
  readStoredImage,
  saveLocationReference,
} from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024;

const Body = z.object({
  tempKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const ownerId = user?.id ?? (await getGuestOwnerId());
  if (!ownerId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { tempKey } = parsed.data;

  if (!tempKey.startsWith(`tmp/locations/${ownerId}/`)) {
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
    const saved = await saveLocationReference(buffer, ownerId);
    after(() => deleteStoredImage(tempKey).catch(() => {}));
    return NextResponse.json({
      path: saved.relativePath,
      width: saved.width,
      height: saved.height,
    });
  } catch (err) {
    after(() => deleteStoredImage(tempKey).catch(() => {}));
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
