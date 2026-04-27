import { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getDefaultEventId } from "@/lib/env";
import { ApiError } from "@/lib/errors";

export const resolveEventId = async (eventId?: string | null, client: PrismaClient = prisma) => {
  if (eventId) {
    const existingEvent = await client.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!existingEvent) {
      throw new ApiError(404, "The selected event could not be found.");
    }

    return existingEvent.id;
  }

  const defaultEventId = getDefaultEventId();

  if (defaultEventId) {
    const defaultEvent = await client.event.findUnique({
      where: { id: defaultEventId },
      select: { id: true },
    });

    if (defaultEvent) {
      return defaultEvent.id;
    }
  }

  const firstEvent = await client.event.findFirst({
    orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  if (!firstEvent) {
    throw new ApiError(404, "No event has been configured yet.");
  }

  return firstEvent.id;
};
