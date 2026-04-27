import { NextRequest, NextResponse } from "next/server";
import {
  ensureStorageReady,
  saveLocationReference,
} from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

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

  await ensureStorageReady();
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const saved = await saveLocationReference(buffer);
    return NextResponse.json({
      path: saved.relativePath,
      width: saved.width,
      height: saved.height,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
