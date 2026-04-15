import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { ApiError } from "@/lib/errors";

const secret = new TextEncoder().encode(env.JWT_SECRET);

const authPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.literal("admin"),
});

export type AdminJwtPayload = z.infer<typeof authPayloadSchema>;

export const createAdminToken = async (payload: AdminJwtPayload) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);

export const verifyAdminToken = async (token: string) => {
  const { payload } = await jwtVerify(token, secret);
  return authPayloadSchema.parse(payload);
};

export const readAdminTokenFromRequest = (request: NextRequest) => {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Admin authentication is required.");
  }

  return header.replace("Bearer ", "");
};

export const requireAdmin = async (request: NextRequest) => {
  const token = readAdminTokenFromRequest(request);

  try {
    return await verifyAdminToken(token);
  } catch {
    throw new ApiError(401, "Your admin session is invalid or has expired.");
  }
};
