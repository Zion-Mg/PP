import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { publishGalleryEvent } from "@/lib/ably";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { deletePhotoFromStorage } from "@/lib/storage";
import { photoDeleteSchema } from "@/lib/validators";

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = photoDeleteSchema.parse(await request.json());

    const photo = await prisma.photo.findUnique({
      where: { id: payload.photoId },
      include: {
        upload: {
          select: {
            eventId: true,
          },
        },
      },
    });

    if (!photo) {
      throw new ApiError(404, "Photo not found.");
    }

    await deletePhotoFromStorage(photo.storagePath);
    await prisma.photo.delete({
      where: { id: photo.id },
    });

    await publishGalleryEvent("photo_deleted", {
      photoId: photo.id,
      eventId: photo.upload.eventId,
    });

    return NextResponse.json({
      success: true,
      deletedPhotoId: photo.id,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
