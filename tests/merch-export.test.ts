import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { MerchExportTooLargeError, prepareMerchExport } from "../src/lib/merch-export";

async function solidImage(width: number, height: number) {
  return sharp({
    create: { width, height, channels: 3, background: { r: 111, g: 78, b: 62 } },
  })
    .png()
    .toBuffer();
}

test("merchandise export preserves square, landscape, and portrait shapes", async () => {
  for (const [width, height] of [
    [1000, 1000],
    [1500, 1000],
    [1000, 1500],
  ]) {
    const result = await prepareMerchExport(await solidImage(width, height));
    const sourceRatio = width / height;
    const outputRatio = result.width / result.height;

    assert.ok(Math.abs(sourceRatio - outputRatio) < 0.002);
    assert.equal(Math.max(result.width, result.height), 3000);
    assert.equal(result.mimeType, "image/jpeg");
    assert.ok(result.byteSize < 15 * 1024 * 1024);
  }
});

test("merchandise export applies EXIF orientation before resizing", async () => {
  const oriented = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "#a35f4f" },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();

  const result = await prepareMerchExport(oriented);
  assert.ok(result.height > result.width);
  assert.equal(result.height, 3000);
  assert.equal(result.width, 2000);
});

test("merchandise export fails clearly when no quality fits the byte limit", async () => {
  const source = await solidImage(200, 200);
  await assert.rejects(() => prepareMerchExport(source, { maxBytes: 1 }), MerchExportTooLargeError);
});
