import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { createAdminToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { comparePasswordHash } from "@/lib/security";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get("x-forwarded-for") ?? "unknown";
    applyRateLimit({
      key: `admin-login:${ipAddress}`,
      limit: 5,
      windowMs: 60_000,
    });

    const payload = adminLoginSchema.parse(await request.json());
    const admin = await prisma.adminUser.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    if (!admin || !comparePasswordHash(payload.password, admin.passwordHash)) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const token = await createAdminToken({
      sub: admin.id,
      email: admin.email,
      role: "admin",
    });

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
