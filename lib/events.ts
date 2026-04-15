import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { ApiError } from "@/lib/errors";

export const resolveEventId = async (eventId?: string | null) => {
  if (eventId) {
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });

    if (!existingEvent) {
      throw new ApiError(404, "The selected event could not be found.");
    }

    return existingEvent.id;
  }

  if (env.NEXT_PUBLIC_DEFAULT_EVENT_ID) {
    const defaultEvent = await prisma.event.findUnique({
      where: { id: env.NEXT_PUBLIC_DEFAULT_EVENT_ID },
      select: { id: true },
    });

    if (defaultEvent) {
      return defaultEvent.id;
    }
  }

  const firstEvent = await prisma.event.findFirst({
    orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  if (!firstEvent) {
    throw new ApiError(404, "No event has been configured yet.");
  }

  return firstEvent.id;
};
