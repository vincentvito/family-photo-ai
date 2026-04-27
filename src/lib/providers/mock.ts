import sharp from "sharp";
import type {
  ImageProvider,
  GenerateArgs,
  GenerateResult,
  RefineArgs,
  UpscaleArgs,
  UpscaleResult,
} from "./types";
import { readStoredImage } from "../storage";

/**
 * Deterministic placeholder provider. No network calls.
 * Creates soft, warm-tinted cards that communicate "a portrait would be here"
 * so the whole flow is testable without API keys.
 */
export class MockProvider implements ImageProvider {
  id = "mock" as const;
  label = "Mock (no API calls)";

  async generatePortrait(args: GenerateArgs): Promise<GenerateResult> {
    const { width, height } = aspectToSize(args.aspectRatio);
    const images = await Promise.all(
      [0, 1, 2, 3].map((variant) =>
        makePlaceholder({
          width,
          height,
          seed: `${args.generationId}-${variant}`,
          title: args.themeBlurb,
          subtitle: args.subjects.map((s) => s.name).join(" · ") || "Your family",
          tag: `variation ${variant + 1} of 4`,
        }),
      ),
    );
    return { images };
  }

  async refineImage(args: RefineArgs): Promise<GenerateResult> {
    const source = await readStoredImage(args.baseImage.relativePath);
    const buffer = await sharp(source)
      .modulate({ saturation: 1.05, brightness: 1.02 })
      .tint({ r: 255, g: 248, b: 235 })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();
    return {
      images: [{ buffer, mimeType: "image/jpeg" }],
    };
  }

  async upscale(args: UpscaleArgs): Promise<UpscaleResult> {
    const source = await readStoredImage(args.sourceRelativePath);
    const target = printSizePx(args.target);
    const out = await sharp(source)
      .resize({ width: target.width, height: target.height, fit: "cover" })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    return {
      buffer: out.data,
      mimeType: "image/jpeg",
      width: out.info.width,
      height: out.info.height,
    };
  }
}

function aspectToSize(ratio: GenerateArgs["aspectRatio"]) {
  switch (ratio) {
    case "1:1":
      return { width: 1024, height: 1024 };
    case "4:5":
      return { width: 1024, height: 1280 };
    case "3:2":
      return { width: 1536, height: 1024 };
    case "2:3":
      return { width: 1024, height: 1536 };
    case "16:9":
      return { width: 1792, height: 1024 };
  }
}

function printSizePx(target: UpscaleArgs["target"]) {
  switch (target) {
    case "8x10":
      return { width: 2400, height: 3000 };
    case "16x20":
      return { width: 4800, height: 6000 };
    case "web":
      return { width: 2048, height: 2048 };
  }
}

async function makePlaceholder(opts: {
  width: number;
  height: number;
  seed: string;
  title: string;
  subtitle: string;
  tag: string;
}) {
  const hue = hashToHue(opts.seed);
  const svg = `
    <svg width="${opts.width}" height="${opts.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="44%" r="70%">
          <stop offset="0%" stop-color="hsl(${hue}, 40%, 86%)"/>
          <stop offset="100%" stop-color="hsl(${hue}, 30%, 62%)"/>
        </radialGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
          <feColorMatrix values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0.08 0"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect width="100%" height="100%" filter="url(#noise)" opacity="0.4"/>
      <g font-family="Georgia, serif" text-anchor="middle" fill="rgba(27,26,23,0.78)">
        <text x="50%" y="${opts.height * 0.48}" font-size="${Math.round(opts.width * 0.048)}">${escapeXml(opts.title)}</text>
        <text x="50%" y="${opts.height * 0.54}" font-size="${Math.round(opts.width * 0.028)}" fill="rgba(27,26,23,0.5)">${escapeXml(opts.subtitle)}</text>
        <text x="50%" y="${opts.height * 0.92}" font-size="${Math.round(opts.width * 0.018)}" fill="rgba(27,26,23,0.45)" letter-spacing="4">${escapeXml(opts.tag.toUpperCase())}</text>
      </g>
    </svg>
  `;
  const { data, info } = await sharp(Buffer.from(svg))
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  return {
    buffer: data,
    mimeType: "image/jpeg" as const,
    width: info.width,
    height: info.height,
  };
}

function hashToHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 360;
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
