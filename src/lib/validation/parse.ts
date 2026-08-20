import { z } from "zod";
import { AppError } from "@/lib/errors/app-error";

export function parseBody<T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.output<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      "The request contains invalid data.",
      422,
    );
  }

  return result.data;
}

/**
 * Parses and validates URL query parameters using the same error contract as
 * JSON request bodies.
 */
export function parseQuery<T extends z.ZodType>(
  schema: T,
  searchParams: URLSearchParams,
): z.output<T> {
  const result = schema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!result.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      "The request contains invalid query parameters.",
      422,
    );
  }

  return result.data;
}