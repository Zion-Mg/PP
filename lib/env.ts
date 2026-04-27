import { z } from "zod";

import { ApiError } from "@/lib/errors";

const rawEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
  ABLY_API_KEY: process.env.ABLY_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  NEXT_PUBLIC_DEFAULT_EVENT_ID: process.env.NEXT_PUBLIC_DEFAULT_EVENT_ID,
};

const optionalEnvSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).optional(),
  ABLY_API_KEY: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(32).optional(),
  NEXT_PUBLIC_DEFAULT_EVENT_ID: z.string().optional(),
});

export const env = optionalEnvSchema.parse(rawEnv);

const requireValue = (value: string | undefined, name: string) => {
  if (!value) {
    throw new ApiError(500, `Missing required environment variable: ${name}.`);
  }

  return value;
};

export const getSupabaseEnv = () => ({
  url: requireValue(env.SUPABASE_URL, "SUPABASE_URL"),
  key: requireValue(env.SUPABASE_KEY, "SUPABASE_KEY"),
  bucket: env.SUPABASE_STORAGE_BUCKET || "event-photos",
});

export const getAblyApiKey = () => requireValue(env.ABLY_API_KEY, "ABLY_API_KEY");

export const getJwtSecret = () => requireValue(env.JWT_SECRET, "JWT_SECRET");

export const getDefaultEventId = () => env.NEXT_PUBLIC_DEFAULT_EVENT_ID;
