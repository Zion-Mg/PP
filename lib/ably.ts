import Ably from "ably";

import { getAblyApiKey } from "@/lib/env";

const getAblyClient = () => new Ably.Rest(getAblyApiKey());

export const GALLERY_CHANNEL = "gallery-updates";

export const publishGalleryEvent = async (
  eventName: "photo_uploaded" | "photo_approved" | "photo_deleted" | "photo_featured",
  data: Record<string, unknown>,
) => {
  const ably = getAblyClient();
  const channel = ably.channels.get(GALLERY_CHANNEL);
  await channel.publish(eventName, {
    ...data,
    occurredAt: new Date().toISOString(),
  });
};

export const createAblyTokenRequest = async (clientId: string) =>
  getAblyClient().auth.createTokenRequest({
    clientId,
  });
