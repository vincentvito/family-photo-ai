import { NextResponse } from "next/server";
import archiver from "archiver";
import { PassThrough, Readable } from "node:stream";
import { db, schema } from "@/lib/db";
import { and, desc, eq, gte } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { studioCutoffDate } from "@/lib/retention";
import { readStoredImage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [album] = await db
    .select()
    .from(schema.albums)
    .where(eq(schema.albums.userId, user.id))
    .limit(1);
  if (!album) {
    return NextResponse.json({ error: "No album yet" }, { status: 404 });
  }

  const rows = await db
    .select({ image: schema.images })
    .from(schema.albumImages)
    .innerJoin(schema.images, eq(schema.albumImages.imageId, schema.images.id))
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .where(
      and(
        eq(schema.albumImages.albumId, album.id),
        eq(schema.generations.userId, user.id),
        gte(schema.generations.createdAt, studioCutoffDate()),
      ),
    )
    .orderBy(desc(schema.albumImages.addedAt));

  if (rows.length === 0) {
    return NextResponse.json({ error: "Album is empty" }, { status: 404 });
  }

  const archive = archiver("zip", { zlib: { level: 6 } });
  const pass = new PassThrough();
  archive.pipe(pass);

  (async () => {
    try {
      for (const { image } of rows) {
        const key = `generations/${image.generationId}/${image.fileName}`;
        try {
          const buf = await readStoredImage(key);
          archive.append(buf, { name: image.fileName });
        } catch (err) {
          console.warn(`album export: missing R2 object ${key}`, err);
        }
      }
    } finally {
      archive.finalize();
    }
  })();

  const webStream = Readable.toWeb(pass) as unknown as ReadableStream;
  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="family-album.zip"`,
    },
  });
}
