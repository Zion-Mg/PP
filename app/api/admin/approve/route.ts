import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { publishGalleryEvent } from "@/lib/ably";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { photoApprovalSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const payload = photoApprovalSchema.parse(await request.json());

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

    const updated = await prisma.photo.update({
      where: { id: photo.id },
      data: {
        isApproved: payload.approve,
      },
    });

    if (payload.approve) {
      await publishGalleryEvent("photo_approved", {
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
