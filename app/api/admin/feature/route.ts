import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { publishGalleryEvent } from "@/lib/ably";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { movePhotoToFeaturedStorage } from "@/lib/storage";
import { photoFeatureSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = photoFeatureSchema.parse(await request.json());

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

    let data = {
      isFeatured: payload.feature,
      imageUrl: photo.imageUrl,
      storagePath: photo.storagePath,
    };

    if (payload.feature && photo.storagePath.includes("/uploads/")) {
      const moved = await movePhotoToFeaturedStorage(photo.storagePath);
      data = {
        ...data,
        imageUrl: moved.publicUrl,
        storagePath: moved.storagePath,
      };
    }

    const updated = await prisma.photo.update({
      where: { id: photo.id },
      data,
    });

    if (updated.isApproved) {
      await publishGalleryEvent("photo_featured", {
        photoId: updated.id,
        eventId: photo.upload.eventId,
        imageUrl: updated.imageUrl,
        isFeatured: updated.isFeatured,
      });
    }

    return NextResponse.json({
      success: true,
      photo: updated,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
