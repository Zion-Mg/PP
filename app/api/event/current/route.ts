import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { resolveEventId } from "@/lib/events";

export async function GET() {
  try {
    const eventId = await resolveEventId();
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
