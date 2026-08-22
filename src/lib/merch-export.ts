import sharp from "sharp";

export const MERCH_MAX_DIMENSION = 3000;
export const MERCH_MAX_BYTES = 15 * 1024 * 1024;
const JPEG_QUALITIES = [90, 82, 74] as const;

export type MerchExport = {
  buffer: Buffer;
  mimeType: "image/jpeg";
  width: number;
  height: number;
  byteSize: number;
};

export class MerchExportTooLargeError extends Error {
  constructor() {
    super("We could not prepare this portrait for the shop. Try another image.");
    this.name = "MerchExportTooLargeError";
  }
}

export async function prepareMerchExport(
  source: Buffer,
  options: { maxDimension?: number; maxBytes?: number } = {},
): Promise<MerchExport> {
  const maxDimension = options.maxDimension ?? MERCH_MAX_DIMENSION;
  const maxBytes = options.maxBytes ?? MERCH_MAX_BYTES;

  if (!Number.isInteger(maxDimension) || maxDimension < 1) {
    throw new Error("maxDimension must be a positive integer");
  }
  if (!Number.isInteger(maxBytes) || maxBytes < 1) {
    throw new Error("maxBytes must be a positive integer");
  }

  for (const quality of JPEG_QUALITIES) {
    const { data, info } = await sharp(source, { failOn: "error" })
      .rotate()
      .resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
      })
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toColourspace("srgb")
      .jpeg({ quality, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    if (data.byteLength <= maxBytes) {
      return {
        buffer: data,
        mimeType: "image/jpeg",
        width: info.width,
        height: info.height,
        byteSize: data.byteLength,
      };
    }
  }

  throw new MerchExportTooLargeError();
}
