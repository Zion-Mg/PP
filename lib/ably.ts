import Ably from "ably";

import { env } from "@/lib/env";

const ably = new Ably.Rest(env.ABLY_API_KEY);

export const GALLERY_CHANNEL = "gallery-updates";

export const publishGalleryEvent = async (
  eventName: "photo_uploaded" | "photo_approved" | "photo_deleted" | "photo_featured",
  data: Record<string, unknown>,
) => {
  const channel = ably.channels.get(GALLERY_CHANNEL);
  await channel.publish(eventName, {
    ...data,
    occurredAt: new Date().toISOString(),
  });
};

export const createAblyTokenRequest = async (clientId: string) =>
  ably.auth.createTokenRequest({
    clientId,
  });
