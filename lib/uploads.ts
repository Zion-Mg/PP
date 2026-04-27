import sharp from "sharp";

import { ApiError } from "@/lib/errors";
import {
  MAX_IMAGE_DIMENSION,
  MAX_SOURCE_IMAGE_SIZE_BYTES,
  MAX_UPLOADS_PER_SESSION,
  TARGET_COMPRESSED_IMAGE_BYTES,
} from "@/lib/upload-config";

const WEBP_QUALITIES = [82, 74, 66, 58];

const extensionByType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type SanitizedUpload = {
  buffer: Buffer<ArrayBufferLike>;
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
  if (!file.type.startsWith("image/")) {
    throw new ApiError(400, "Unsupported file type. Please upload an image file.");
  }

  if (file.size > MAX_SOURCE_IMAGE_SIZE_BYTES) {
    throw new ApiError(400, "Each original image must be 50MB or smaller before optimization.");
  }
};

export const sanitizeAndCompressImage = async (file: File): Promise<SanitizedUpload> => {
  validateImageFile(file);

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const basePipeline = sharp(inputBuffer, { failOn: "warning" })
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

  const pipeline = basePipeline.clone();
  const metadata = await pipeline.metadata();

  if (!metadata.width || !metadata.height) {
    throw new ApiError(400, "One of the uploaded files is not a valid image.");
  }

  let output: Buffer<ArrayBufferLike> = Buffer.from([]);

  for (const quality of WEBP_QUALITIES) {
    output = await basePipeline
      .clone()
      .webp({
        quality,
        effort: 6,
      })
      .toBuffer();

    if (output.byteLength <= TARGET_COMPRESSED_IMAGE_BYTES) {
      break;
    }
  }

  return {
    buffer: output,
    contentType: "image/webp",
    extension: extensionByType["image/webp"],
    size: output.byteLength,
  };
};
