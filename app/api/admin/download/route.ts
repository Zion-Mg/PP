import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { getSupabaseEnv } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const photoId = request.nextUrl.searchParams.get("photoId");

    if (!photoId) {
      throw new ApiError(400, "photoId is required.");
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new ApiError(404, "Photo not found.");
    }

    const supabaseEnv = getSupabaseEnv();
    const { data, error } = await supabaseAdmin.storage.from(supabaseEnv.bucket).download(photo.storagePath);

    if (error || !data) {
      throw new ApiError(502, "The image could not be downloaded right now.", error?.message);
    }

    const bytes = await data.arrayBuffer();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": data.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${photo.id}.${photo.storagePath.split(".").pop() ?? "jpg"}"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
