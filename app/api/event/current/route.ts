import { NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { withPrismaRetry } from "@/lib/db";
import { resolveEventId } from "@/lib/events";

export async function GET() {
  try {
    const event = await withPrismaRetry(async (client) => {
      const eventId = await resolveEventId(undefined, client);
      return client.event.findUnique({
        where: { id: eventId },
      });
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
