import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError, isApiError } from "@/lib/errors";

export const jsonError = (status: number, message: string, details?: unknown) =>
  NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status },
  );

export const handleRouteError = (error: unknown) => {
  if (isApiError(error)) {
    return jsonError(error.status, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return jsonError(400, "Request validation failed.", error.flatten());
  }

  console.error(error);
  return jsonError(500, "Something went wrong while processing your request.");
};

export const assertMethodPayload = <T>(payload: T | null | undefined, message: string): T => {
  if (!payload) {
    throw new ApiError(400, message);
  }

  return payload;
};
