import type { BusinessMemberRole } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors/app-error";

/**
 * Applies a role decision without performing I/O. Keeping this rule pure
 * makes it straightforward to test independently from Neon Auth and Prisma.
 */
export function assertAllowedBusinessRole(
  role: BusinessMemberRole,
  allowedRoles: readonly BusinessMemberRole[],
): void {
  if (allowedRoles.includes(role)) {
    return;
  }

  throw new AppError(
    "FORBIDDEN",
    "You do not have permission to perform this action.",
    403,
  );
}
