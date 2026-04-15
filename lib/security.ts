import { createHash, timingSafeEqual } from "node:crypto";

export const hashPassword = (value: string) => createHash("sha256").update(value).digest("hex");

export const comparePasswordHash = (plainTextValue: string, storedHash: string) => {
  const incoming = Buffer.from(hashPassword(plainTextValue));
  const existing = Buffer.from(storedHash);

  if (incoming.length !== existing.length) {
    return false;
  }

  return timingSafeEqual(incoming, existing);
};
