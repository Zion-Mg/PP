import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveEventId } from "@/lib/events";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const eventId = await resolveEventId(request.nextUrl.searchParams.get("eventId"));

    const photos = await prisma.photo.findMany({
      where: {
        upload: {
          eventId,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        upload: {
          select: {
            guestName: true,
            eventId: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      photos: photos.map((photo) => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        storagePath: photo.storagePath,
        createdAt: photo.createdAt,
        isApproved: photo.isApproved,
        isFeatured: photo.isFeatured,
        guestName: photo.upload.guestName,
        uploadedAt: photo.upload.createdAt,
        eventId: photo.upload.eventId,
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
