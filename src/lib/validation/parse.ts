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