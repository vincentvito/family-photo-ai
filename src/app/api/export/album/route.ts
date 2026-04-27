import { NextResponse } from "next/server";
import archiver from "archiver";
import path from "node:path";
import fs from "node:fs";
import { PassThrough, Readable } from "node:stream";
import { db, schema } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { storagePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [album] = await db.select().from(schema.albums).limit(1);
  if (!album) {
    return NextResponse.json({ error: "No album yet" }, { status: 404 });
  }

  const rows = await db
    .select({
      image: schema.images,
    })
    .from(schema.albumImages)
    .innerJoin(schema.images, eq(schema.albumImages.imageId, schema.images.id))
    .where(eq(schema.albumImages.albumId, album.id))
    .orderBy(desc(schema.albumImages.addedAt));

  if (rows.length === 0) {
    return NextResponse.json({ error: "Album is empty" }, { status: 404 });
  }

  const archive = archiver("zip", { zlib: { level: 6 } });
  const pass = new PassThrough();
  archive.pipe(pass);

  for (const { image } of rows) {
    const src = path.join(
      storagePath("generations", image.generationId),
      image.fileName,
    );
    if (fs.existsSync(src)) {
      archive.file(src, { name: image.fileName });
    }
  }
  archive.finalize();

  const webStream = Readable.toWeb(pass) as unknown as ReadableStream;
  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="family-album.zip"`,
    },
  });
}
