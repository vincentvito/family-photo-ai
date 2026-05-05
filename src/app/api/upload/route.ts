import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { addPhotoToPerson } from "@/lib/roster-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const formData = await req.formData();
  const personId = formData.get("personId");
  const file = formData.get("file");

  if (typeof personId !== "string" || !personId) {
    return NextResponse.json({ error: "Missing personId" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (file.type && !allowed.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 });
  }

  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File is larger than 20MB" }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const photo = await addPhotoToPerson({ userId: user.id, personId, buffer });
    return NextResponse.json({ photo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
