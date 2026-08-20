import assert from "node:assert/strict";
import { test } from "node:test";

import { assertAllowedBusinessRole } from "@/lib/auth/authorization";
import { AppError } from "@/lib/errors/app-error";

test("allows a member with an explicitly allowed role", () => {
  assert.doesNotThrow(() =>
    assertAllowedBusinessRole("ADMIN", ["ADMIN"]),
  );
});

test("allows any role included in the allowed role list", () => {
  assert.doesNotThrow(() =>
    assertAllowedBusinessRole("SALES_REP", ["ADMIN", "SALES_REP"]),
  );
});

test("rejects a role outside the allowed role list", () => {
  assert.throws(
    () => assertAllowedBusinessRole("SALES_REP", ["ADMIN"]),
    (error: unknown) =>
      error instanceof AppError &&
      error.code === "FORBIDDEN" &&
      error.statusCode === 403,
  );
});

test("rejects an empty allowed role list", () => {
  assert.throws(
    () => assertAllowedBusinessRole("ADMIN", []),
    (error: unknown) =>
      error instanceof AppError &&
      error.code === "FORBIDDEN" &&
      error.statusCode === 403,
  );
});
