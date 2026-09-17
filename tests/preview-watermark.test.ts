import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { addPreviewWatermark } from "../src/lib/watermark";

test("previews remain watermarked when Next.js blocks SVG image loading", async () => {
  const input = await sharp({
    create: { width: 768, height: 512, channels: 3, background: "#808080" },
  })
    .jpeg()
    .toBuffer();
  // Reproduce Next.js getSharp's process-wide loader restrictions.
  sharp.block({ operation: ["VipsForeignLoad"] });
  sharp.unblock({
    operation: [
      "VipsForeignLoadHeif",
      "VipsForeignLoadJpeg",
      "VipsForeignLoadNsgif",
      "VipsForeignLoadPng",
      "VipsForeignLoadTiff",
      "VipsForeignLoadWebp",
    ],
  });
  try {
    await assert.rejects(
      sharp(
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',
        ),
      )
        .png()
        .toBuffer(),
    );
    const output = await addPreviewWatermark(input);
    const meta = await sharp(output).metadata();
    assert.equal(meta.format, "jpeg");
    assert.equal(meta.width, 768);
    assert.equal(meta.height, 512);
    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    // Both the top preview badge and bottom site badge must change the pixels.
    for (const [x, y, w, h] of [
      [30, 20, 180, 40],
      [500, 450, 230, 45],
    ]) {
      let light = 0;
      let dark = 0;
      for (let row = y; row < y + h; row++)
        for (let col = x; col < x + w; col++) {
          const value = data[(row * info.width + col) * info.channels];
          if (value > 170) light++;
          if (value < 115) dark++;
        }
      assert.ok(light > 20, "watermark lettering is visible");
      assert.ok(dark > 20, "watermark badge is visible");
    }
    const rotated = await sharp(input).withMetadata({ orientation: 6 }).jpeg().toBuffer();
    const rotatedOutput = await sharp(await addPreviewWatermark(rotated)).metadata();
    assert.equal(rotatedOutput.width, 512);
    assert.equal(rotatedOutput.height, 768);
  } finally {
    sharp.unblock({ operation: ["VipsForeignLoad"] });
  }
});
