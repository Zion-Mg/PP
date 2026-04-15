import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { resolveEventId } from "@/lib/events";
import { applyRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") ?? "unknown";
    applyRateLimit({
      key: `gallery:${ipAddress}`,
      limit: 120,
      windowMs: 60_000,
    });

    const eventId = await resolveEventId(request.nextUrl.searchParams.get("eventId"));

    const photos = await prisma.photo.findMany({
      where: {
        isApproved: true,
        upload: {
          eventId,
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        upload: {
          select: {
            guestName: true,
            eventId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      photos: photos.map((photo) => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        isApproved: photo.isApproved,
        isFeatured: photo.isFeatured,
        createdAt: photo.createdAt,
        guestName: photo.upload.guestName,
        eventId: photo.upload.eventId,
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
