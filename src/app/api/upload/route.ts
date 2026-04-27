import { NextRequest, NextResponse } from "next/server";
import { addPhotoToPerson } from "@/actions/roster";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 415 },
    );
  }

  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "File is larger than 20MB" },
      { status: 413 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const photo = await addPhotoToPerson({ personId, buffer });
    return NextResponse.json({ photo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
