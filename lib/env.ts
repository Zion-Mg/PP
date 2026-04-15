import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("event-photos"),
  ABLY_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_DEFAULT_EVENT_ID: z.string().optional(),
});

export const env = serverSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
  ABLY_API_KEY: process.env.ABLY_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  NEXT_PUBLIC_DEFAULT_EVENT_ID: process.env.NEXT_PUBLIC_DEFAULT_EVENT_ID,
});
