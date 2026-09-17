import sharp from "sharp";

const WATERMARK_TEXT = "FAMILYSHOOT";
const BADGE_TEXT = "FREE PREVIEW";
const URL_TEXT = "FAMILYSHOOT.COM";

const LETTERS: Record<string, readonly string[]> = {
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
};

function pixelTextWidth(text: string, size: number) {
  return [...text.toUpperCase()].reduce((width, char) => {
    if (char === " ") return width + size * 4;
    return width + size * 6;
  }, 0);
}

type Color = readonly [number, number, number, number];

// Next.js blocks SVG loaders in the shared Sharp instance. Draw our fixed
// pixel lettering directly into an RGBA overlay instead of decoding an SVG.
function watermarkCanvas(width: number, height: number) {
  const pixels = Buffer.alloc(width * height * 4);
  function rect(x: number, y: number, w: number, h: number, color: Color) {
    const [r, g, b, alpha] = color;
    for (let row = Math.max(0, Math.round(y)); row < Math.min(height, Math.round(y + h)); row++) {
      for (let col = Math.max(0, Math.round(x)); col < Math.min(width, Math.round(x + w)); col++) {
        const offset = (row * width + col) * 4;
        const oldAlpha = pixels[offset + 3] / 255;
        const outAlpha = alpha + oldAlpha * (1 - alpha);
        for (const [channel, value] of [r, g, b].entries()) {
          pixels[offset + channel] = Math.round(
            (value * alpha + pixels[offset + channel] * oldAlpha * (1 - alpha)) / outAlpha,
          );
        }
        pixels[offset + 3] = Math.round(outAlpha * 255);
      }
    }
  }
  function text(value: string, x: number, y: number, size: number, color: Color) {
    let cursor = x;
    for (const char of value.toUpperCase()) {
      if (char === " ") {
        cursor += size * 4;
        continue;
      }
      LETTERS[char]?.forEach((row, rowIndex) => {
        [...row].forEach((cell, colIndex) => {
          if (cell === "1") rect(cursor + colIndex * size, y + rowIndex * size, size, size, color);
        });
      });
      cursor += size * 6;
    }
  }
  return { pixels, rect, text };
}

export async function addPreviewWatermark(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const width = metadata.autoOrient.width;
  const height = metadata.autoOrient.height;
  const fontSize = Math.max(18, Math.round(Math.min(width, height) / 20));
  const watermarkPixel = Math.max(1.25, fontSize / 16);
  const badgePixel = Math.max(2, Math.round(fontSize / 16));
  const urlPixel = Math.max(2, Math.round(fontSize / 16));
  const urlWidth = pixelTextWidth(URL_TEXT, urlPixel);
  const urlInset = Math.max(fontSize * 0.8, width * 0.04);
  const urlPaddingX = fontSize * 0.32;
  const urlPaddingY = fontSize * 0.22;
  const urlBoxWidth = urlWidth + urlPaddingX * 2;
  const urlBoxHeight = urlPixel * 7 + urlPaddingY * 2;
  const urlBoxX = Math.max(width * 0.04, width - urlInset - urlBoxWidth);
  const urlBoxY = Math.max(height * 0.04, height - urlInset - urlBoxHeight);
  const urlX = urlBoxX + urlPaddingX;
  const urlY = urlBoxY + urlPaddingY;
  const badgeWidth = Math.min(width * 0.34, badgePixel * 86);
  const badgeHeight = fontSize * 1.35;

  const overlay = watermarkCanvas(width, height);
  for (let y = 0; y < height; y += fontSize * 2.6) {
    for (let x = 0; x < width; x += fontSize * 5.6) {
      overlay.text(
        WATERMARK_TEXT,
        x + fontSize * 0.5,
        y + fontSize * 0.9,
        watermarkPixel,
        [255, 255, 255, 0.2],
      );
      overlay.text(
        WATERMARK_TEXT,
        x + fontSize * 0.5 + watermarkPixel * 0.45,
        y + fontSize * 0.9 + watermarkPixel * 0.45,
        watermarkPixel,
        [31, 26, 36, 0.08],
      );
    }
  }
  overlay.rect(width * 0.04, height * 0.04, badgeWidth, badgeHeight, [31, 26, 36, 0.4]);
  overlay.text(
    BADGE_TEXT,
    width * 0.055,
    height * 0.04 + fontSize * 0.33,
    badgePixel,
    [255, 255, 255, 0.9],
  );
  overlay.rect(urlBoxX, urlBoxY, urlBoxWidth, urlBoxHeight, [31, 26, 36, 0.4]);
  overlay.text(URL_TEXT, urlX, urlY, urlPixel, [255, 255, 255, 0.9]);

  return image
    .composite([{ input: overlay.pixels, raw: { width, height, channels: 4 }, blend: "over" }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}
