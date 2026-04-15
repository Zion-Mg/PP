import { ApiError } from "@/lib/errors";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

const sweepExpiredEntries = () => {
  const now = Date.now();
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export const applyRateLimit = ({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) => {
  sweepExpiredEntries();

  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new ApiError(429, "Too many requests. Please wait a moment and try again.");
  }

  current.count += 1;
  buckets.set(key, current);
};
