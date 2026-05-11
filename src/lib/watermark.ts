import sharp from "sharp";

const WATERMARK_TEXT = "FamilyShoot preview";
const AMP_RE = /&/g;
const LT_RE = /</g;
const GT_RE = />/g;
const QUOTE_RE = /"/g;

function escapeXml(value: string) {
  return value
    .replace(AMP_RE, "&amp;")
    .replace(LT_RE, "&lt;")
    .replace(GT_RE, "&gt;")
    .replace(QUOTE_RE, "&quot;");
}

export async function addPreviewWatermark(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? 1200;
  const height = metadata.height ?? 800;
  const fontSize = Math.max(18, Math.round(Math.min(width, height) / 20));
  const escaped = escapeXml(WATERMARK_TEXT);
  const badgeWidth = Math.min(width * 0.34, fontSize * 7.6);
  const badgeHeight = fontSize * 1.35;

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="preview-watermark" patternUnits="userSpaceOnUse" width="${fontSize * 12}" height="${fontSize * 7}" patternTransform="rotate(-28)">
          <text x="${fontSize * 0.5}" y="${fontSize * 3.3}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="1.2" fill="rgba(255,255,255,0.22)" stroke="rgba(31,26,36,0.10)" stroke-width="0.7">${escaped}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#preview-watermark)" />
      <rect x="${width * 0.04}" y="${height * 0.04}" rx="8" ry="8" width="${badgeWidth}" height="${badgeHeight}" fill="rgba(31,26,36,0.28)" />
      <text x="${width * 0.055}" y="${height * 0.04 + fontSize * 0.88}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize * 0.46}" font-weight="700" letter-spacing="1" fill="rgba(255,255,255,0.78)">FREE PREVIEW</text>
    </svg>
  `;

  return image
    .composite([{ input: Buffer.from(svg), blend: "over" }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}
