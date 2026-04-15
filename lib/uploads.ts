import sharp from "sharp";

import { ApiError } from "@/lib/errors";

export const MAX_UPLOADS_PER_SESSION = 5;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type SanitizedUpload = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  size: number;
};

export const sanitizeFilename = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "image";

export const validateImageFile = (file: File) => {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ApiError(400, "Unsupported file type. Please upload JPEG, PNG, or WEBP images only.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ApiError(400, "Each image must be 10MB or smaller.");
  }
};

export const sanitizeAndCompressImage = async (file: File): Promise<SanitizedUpload> => {
  validateImageFile(file);

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(inputBuffer, { failOn: "warning" }).rotate();
  const metadata = await pipeline.metadata();

  if (!metadata.width || !metadata.height) {
    throw new ApiError(400, "One of the uploaded files is not a valid image.");
  }

  let output: Buffer;

  switch (file.type) {
    case "image/png":
      output = await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
      break;
    case "image/webp":
      output = await pipeline.webp({ quality: 82 }).toBuffer();
      break;
    case "image/jpeg":
    default:
      output = await pipeline.jpeg({ quality: 84, mozjpeg: true }).toBuffer();
      break;
  }

  return {
    buffer: output,
    contentType: file.type,
    extension: extensionByType[file.type],
    size: output.byteLength,
  };
};
