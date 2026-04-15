import { z } from "zod";

export const uploadRouteSchema = z.object({
  eventId: z.string().uuid().optional(),
  guestName: z.string().trim().max(120).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(256),
});

export const photoApprovalSchema = z.object({
  photoId: z.string().uuid(),
  approve: z.boolean().default(true),
});

export const photoFeatureSchema = z.object({
  photoId: z.string().uuid(),
  feature: z.boolean().default(true),
});

export const photoDeleteSchema = z.object({
  photoId: z.string().uuid(),
});
