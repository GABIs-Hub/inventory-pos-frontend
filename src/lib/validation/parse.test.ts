import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";

import { AppError } from "@/lib/errors/app-error";
import { parseBody, parseQuery } from "@/lib/validation/parse";

const requestSchema = z.object({
  businessId: z.string().min(1),
});

test("parseBody returns validated body data", () => {
  const result = parseBody(requestSchema, {
    businessId: "business_123",
  });

  assert.deepEqual(result, {
    businessId: "business_123",
  });
});

test("parseBody throws a validation AppError for invalid data", () => {
  assert.throws(
    () => parseBody(requestSchema, { businessId: "" }),
    (error: unknown) =>
      error instanceof AppError &&
      error.code === "VALIDATION_ERROR" &&
      error.statusCode === 422,
  );
});

test("parseQuery returns validated query parameters", () => {
  const searchParams = new URLSearchParams("businessId=business_123");

  const result = parseQuery(requestSchema, searchParams);

  assert.deepEqual(result, {
    businessId: "business_123",
  });
});

test("parseQuery throws a validation AppError for invalid parameters", () => {
  const searchParams = new URLSearchParams("businessId=");

  assert.throws(
    () => parseQuery(requestSchema, searchParams),
    (error: unknown) =>
      error instanceof AppError &&
      error.code === "VALIDATION_ERROR" &&
      error.statusCode === 422,
  );
});
