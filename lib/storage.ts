import { env } from "@/lib/env";
import { ApiError } from "@/lib/errors";
import { sanitizeFilename } from "@/lib/uploads";
import { supabaseAdmin } from "@/lib/supabase";

type UploadParams = {
  eventId: string;
  uploadId: string;
  originalName: string;
  contentType: string;
  body: Buffer;
  extension: string;
  featured?: boolean;
};

export const uploadPhotoToStorage = async ({
  eventId,
  uploadId,
  originalName,
  contentType,
  body,
  extension,
  featured = false,
}: UploadParams) => {
  const filenameRoot = sanitizeFilename(originalName.replace(/\.[^.]+$/, ""));
  const pathPrefix = featured ? "featured" : "uploads";
  const storagePath = `${eventId}/${pathPrefix}/${uploadId}-${crypto.randomUUID()}-${filenameRoot}.${extension}`;

  const { error } = await supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).upload(storagePath, body, {
    cacheControl: "31536000",
    contentType,
    upsert: false,
  });

  if (error) {
    throw new ApiError(502, "The image could not be stored right now.", error.message);
  }

  const { data } = supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
};

export const deletePhotoFromStorage = async (storagePath: string) => {
  const { error } = await supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).remove([storagePath]);
  if (error) {
    throw new ApiError(502, "The image could not be removed from storage.", error.message);
  }
};

export const movePhotoToFeaturedStorage = async (storagePath: string) => {
  const featuredPath = storagePath.replace("/uploads/", "/featured/");
  if (featuredPath === storagePath) {
    const { data } = supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(storagePath);
    return {
      storagePath,
      publicUrl: data.publicUrl,
    };
  }

  const bucket = supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET);
  const { error: moveError } = await bucket.move(storagePath, featuredPath);

  if (moveError) {
    throw new ApiError(502, "The image could not be marked as featured in storage.", moveError.message);
  }

  const { data } = bucket.getPublicUrl(featuredPath);

  return {
    storagePath: featuredPath,
    publicUrl: data.publicUrl,
  };
};
