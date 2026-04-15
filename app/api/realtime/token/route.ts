import { NextRequest, NextResponse } from "next/server";

import { handleRouteError } from "@/lib/api";
import { createAblyTokenRequest } from "@/lib/ably";

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId") ?? crypto.randomUUID();
    const tokenRequest = await createAblyTokenRequest(clientId);
    return NextResponse.json(tokenRequest);
  } catch (error) {
    return handleRouteError(error);
  }
}
