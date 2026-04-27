export type AspectRatio = "1:1" | "4:5" | "3:2" | "2:3" | "16:9";

export type Role = "adult" | "child" | "pet";

export type Subject = {
  personId: string;
  name: string;
  role: Role;
  notes?: string | null;
  /** Relative paths under ./storage for this person's reference photos. */
  referencePaths: string[];
};

export type ImageRef = {
  imageId: string;
  relativePath: string;
};

export type GenerateArgs = {
  themeId: string;
  themeBlurb: string;
  prompt: string;
  aspectRatio: AspectRatio;
  subjects: Subject[];
  wardrobeNote?: string | null;
  cardText?: string | null;
  /** Output destination for saving images. */
  generationId: string;
  /** Optional img2img seed (used for stylized themes to anchor composition). */
  seedImagePath?: string | null;
  /** Optional user-uploaded location / mood reference (relative to ./storage). */
  locationReferencePath?: string | null;
};

export type GenerateResult = {
  images: {
    buffer: Buffer;
    mimeType: "image/jpeg" | "image/png";
    width?: number;
    height?: number;
  }[];
};

export type RefineArgs = {
  baseImage: ImageRef;
  originalReferences: { subject: Subject }[];
  history: { instruction: string; imageId: string; imageRelativePath: string }[];
  instruction: string;
  themeBlurb: string;
  aspectRatio: AspectRatio;
  /** Carry the original location reference through every refine so the mood stays anchored. */
  locationReferencePath?: string | null;
};

export type RefineResult = GenerateResult;

export type UpscaleTarget = "8x10" | "16x20" | "web";

export type UpscaleArgs = {
  sourceRelativePath: string;
  target: UpscaleTarget;
};

export type UpscaleResult = {
  buffer: Buffer;
  mimeType: "image/jpeg" | "image/png";
  width: number;
  height: number;
};

export interface ImageProvider {
  id: "nanobanana" | "replicate" | "mock";
  label: string;
  generatePortrait(args: GenerateArgs): Promise<GenerateResult>;
  refineImage(args: RefineArgs): Promise<RefineResult>;
  upscale?(args: UpscaleArgs): Promise<UpscaleResult>;
}
