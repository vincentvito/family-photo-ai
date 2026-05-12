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

function pixelText(text: string, x: number, y: number, size: number) {
  const gap = size;
  let cursor = x;
  const rects: string[] = [];

  for (const char of text.toUpperCase()) {
    if (char === " ") {
      cursor += size * 4;
      continue;
    }

    const rows = LETTERS[char];
    if (!rows) {
      cursor += size * 6;
      continue;
    }

    rows.forEach((row, rowIndex) => {
      [...row].forEach((cell, colIndex) => {
        if (cell !== "1") return;
        rects.push(
          `<rect x="${cursor + colIndex * size}" y="${y + rowIndex * size}" width="${size}" height="${size}" rx="${size * 0.18}" />`,
        );
      });
    });
    cursor += size * 5 + gap;
  }

  return rects.join("");
}

export async function addPreviewWatermark(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? 1200;
  const height = metadata.height ?? 800;
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

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="preview-watermark" patternUnits="userSpaceOnUse" width="${fontSize * 5.6}" height="${fontSize * 2.6}">
          <g fill="rgba(255,255,255,0.07)">${pixelText(WATERMARK_TEXT, fontSize * 0.5, fontSize * 0.9, watermarkPixel)}</g>
          <g fill="rgba(31,26,36,0.025)" transform="translate(${watermarkPixel * 0.45}, ${watermarkPixel * 0.45})">${pixelText(WATERMARK_TEXT, fontSize * 0.5, fontSize * 0.9, watermarkPixel)}</g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#preview-watermark)" />
      <rect x="${width * 0.04}" y="${height * 0.04}" rx="8" ry="8" width="${badgeWidth}" height="${badgeHeight}" fill="rgba(31,26,36,0.28)" />
      <g fill="rgba(255,255,255,0.78)">${pixelText(BADGE_TEXT, width * 0.055, height * 0.04 + fontSize * 0.33, badgePixel)}</g>
      <rect x="${urlBoxX}" y="${urlBoxY}" rx="8" ry="8" width="${urlBoxWidth}" height="${urlBoxHeight}" fill="rgba(31,26,36,0.26)" />
      <g fill="rgba(255,255,255,0.76)">${pixelText(URL_TEXT, urlX, urlY, urlPixel)}</g>
    </svg>
  `;

  return image
    .composite([{ input: Buffer.from(svg), blend: "over" }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}
