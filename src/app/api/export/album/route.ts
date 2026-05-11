import { NextResponse } from "next/server";
import archiver from "archiver";
import { PassThrough, Readable } from "node:stream";
import { db, schema } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { retainedGenerationCondition } from "@/lib/retention-queries";
import { readStoredImage } from "@/lib/storage";
import { addPreviewWatermark } from "@/lib/watermark";

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
    .select({
      image: schema.images,
      freePreview: schema.generations.freePreview,
      creditUsageId: schema.creditUsages.id,
    })
    .from(schema.albumImages)
    .innerJoin(schema.images, eq(schema.albumImages.imageId, schema.images.id))
    .innerJoin(schema.generations, eq(schema.images.generationId, schema.generations.id))
    .leftJoin(schema.creditUsages, eq(schema.creditUsages.generationId, schema.generations.id))
    .where(
      and(
        eq(schema.albumImages.albumId, album.id),
        eq(schema.generations.userId, user.id),
        retainedGenerationCondition(),
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
      for (const { image, freePreview, creditUsageId } of rows) {
        const key = `generations/${image.generationId}/${image.fileName}`;
        try {
          const buf = await readStoredImage(key);
          const shouldWatermark = freePreview && !creditUsageId;
          const output = shouldWatermark ? await addPreviewWatermark(buf) : buf;
          const name = shouldWatermark
            ? image.fileName.replace(/\.[^.]+$/, "-preview.jpg")
            : image.fileName;
          archive.append(output, { name });
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
