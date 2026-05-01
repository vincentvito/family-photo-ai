/**
 * End-to-end smoke test in mock mode:
 *   1. Seed a roster of 3 people (adult, child, pet) with generated reference photos.
 *   2. Kick off a generation via the theme route's server action path.
 *   3. Poll for completion.
 *   4. Refine once.
 *   5. Export the album as a zip.
 *
 * Run: node scripts/smoke-test.mjs
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const BASE = process.env.SMOKE_BASE ?? "http://localhost:3001";

function svg(label, hue) {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><rect width='100%' height='100%' fill='hsl(${hue},45%,70%)'/><circle cx='400' cy='320' r='140' fill='hsl(${hue},30%,55%)'/><ellipse cx='400' cy='600' rx='260' ry='120' fill='hsl(${hue},30%,55%)'/><text x='50%' y='92%' font-family='Georgia' text-anchor='middle' font-size='40' fill='#2a2824'>${label}</text></svg>`;
}

async function makeJpeg(label, hue) {
  return sharp(Buffer.from(svg(label, hue))).jpeg({ quality: 88 }).toBuffer();
}

async function main() {
  console.log("⋯ smoke test (mock mode) against", BASE);

  // --- 1. Seed people via the addPerson server action is awkward to call over HTTP,
  // so we go through the Drizzle client directly.
  const { db, schema } = await import("../src/lib/db.ts");
  // Clear prior state for a clean run.
  await db.delete(schema.albumImages);
  await db.delete(schema.albums);
  await db.delete(schema.refinementHistory);
  await db.delete(schema.images);
  await db.delete(schema.generations);
  await db.delete(schema.photos);
  await db.delete(schema.people);

  const storageRoot = path.resolve("./storage");
  await fs.rm(path.join(storageRoot, "uploads"), { recursive: true, force: true });
  await fs.rm(path.join(storageRoot, "generations"), { recursive: true, force: true });

  const { saveReferencePhoto, ensureStorageReady } = await import("../src/lib/storage.ts");
  await ensureStorageReady();

  const cast = [
    { name: "Elena", role: "adult", hue: 28 },
    { name: "Matteo", role: "adult", hue: 200 },
    { name: "Luca", role: "child", hue: 330 },
    { name: "Biscotto", role: "pet", hue: 60 },
  ];

  for (const c of cast) {
    const [person] = await db
      .insert(schema.people)
      .values({ name: c.name, role: c.role })
      .returning();
    for (let i = 0; i < 2; i++) {
      const buf = await makeJpeg(`${c.name} ref ${i + 1}`, c.hue + i * 15);
      const saved = await saveReferencePhoto(buf, person.id);
      await db.insert(schema.photos).values({
        personId: person.id,
        fileName: saved.fileName,
        width: saved.width,
        height: saved.height,
        isPrimary: i === 0,
      });
    }
    console.log(`  · seeded ${c.name} (${c.role}) with 2 reference photos`);
  }

  // --- 2. Generate
  const { startGeneration, getGenerationState } = await import(
    "../src/actions/generate.ts"
  );
  const { generationId } = await startGeneration({
    themeId: "golden-hour-beach",
    wardrobeNote: "linen in sandy tones",
  });
  console.log(`  · started generation ${generationId}`);

  // --- 3. Poll
  const started = Date.now();
  while (true) {
    const state = await getGenerationState(generationId);
    if (!state) throw new Error("Generation vanished");
    if (state.generation.status === "done") {
      console.log(`  · ${state.images.length} variants produced in ${((Date.now() - started) / 1000).toFixed(1)}s`);
      break;
    }
    if (state.generation.status === "error") {
      throw new Error(`Generation errored: ${state.generation.errorMessage}`);
    }
    if (Date.now() - started > 45000) throw new Error("Generation timed out");
    await new Promise((r) => setTimeout(r, 1000));
  }

  const state = await getGenerationState(generationId);
  const firstImage = state.images[0];
  if (!firstImage) throw new Error("No images?");

  // --- 4. Favorite two, refine one
  const { toggleFavorite } = await import("../src/actions/album.ts");
  await toggleFavorite(state.images[0].id);
  await toggleFavorite(state.images[1].id);
  console.log(`  · favorited 2 images`);

  const { refineImage } = await import("../src/actions/refine.ts");
  const refined = await refineImage({
    imageId: firstImage.id,
    instruction: "A touch warmer, and have the adults look at the camera.",
  });
  console.log(`  · refined → ${refined.imageId}`);

  // --- 5. Album
  const { getAlbum } = await import("../src/actions/album.ts");
  const album = await getAlbum();
  console.log(`  · album contains ${album.items.length} keepers`);

  // --- 6. Upscale (via mock provider)
  const { upscaleImage } = await import("../src/actions/upscale.ts");
  const upscaled = await upscaleImage({ imageId: firstImage.id, target: "8x10" });
  console.log(`  · upscaled to print file: ${upscaled.fileName}`);

  console.log("✓ smoke test complete");
}

main().catch((err) => {
  console.error("✗ smoke test failed:", err);
  process.exit(1);
});
