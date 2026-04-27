import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { publishGalleryEvent } from "@/lib/ably";
import { prisma } from "@/lib/db";
import { resolveEventId } from "@/lib/events";
import { ApiError } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { uploadPhotoToStorage } from "@/lib/storage";
import { MAX_UPLOADS_PER_SESSION } from "@/lib/upload-config";
import { sanitizeAndCompressImage } from "@/lib/uploads";
import { uploadRouteSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") ?? "unknown";
    applyRateLimit({
      key: `upload:${ipAddress}`,
      limit: 10,
      windowMs: 60_000,
    });

    const formData = await request.formData();
    const payload = uploadRouteSchema.parse({
      eventId: formData.get("eventId")?.toString() || undefined,
      guestName: formData.get("guestName")?.toString() || undefined,
    });

    const files = formData.getAll("photos").filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      throw new ApiError(400, "Please select at least one photo to upload.");
    }

    if (files.length > MAX_UPLOADS_PER_SESSION) {
      throw new ApiError(400, `You can upload up to ${MAX_UPLOADS_PER_SESSION} photos per session.`);
    }

    const eventId = await resolveEventId(payload.eventId);
    const upload = await prisma.guestUpload.create({
      data: {
        eventId,
        guestName: payload.guestName,
      },
    });

    const uploadedPhotos = [];

    for (const file of files) {
      const sanitized = await sanitizeAndCompressImage(file);
      const stored = await uploadPhotoToStorage({
        eventId,
        uploadId: upload.id,
        originalName: file.name,
        contentType: sanitized.contentType,
        body: sanitized.buffer,
        extension: sanitized.extension,
      });

      const photo = await prisma.photo.create({
        data: {
          uploadId: upload.id,
          imageUrl: stored.publicUrl,
          storagePath: stored.storagePath,
        },
      });

      uploadedPhotos.push({
        id: photo.id,
        imageUrl: photo.imageUrl,
        isApproved: photo.isApproved,
        isFeatured: photo.isFeatured,
        createdAt: photo.createdAt,
      });
    }

    await publishGalleryEvent("photo_uploaded", {
      eventId,
      uploadId: upload.id,
      photoCount: uploadedPhotos.length,
    });

    return NextResponse.json({
      success: true,
      message: `${uploadedPhotos.length} photo${uploadedPhotos.length === 1 ? "" : "s"} uploaded successfully and queued for approval.`,
      upload: {
        id: upload.id,
        guestName: upload.guestName,
        createdAt: upload.createdAt,
      },
      photos: uploadedPhotos,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
