import "server-only";

import type { BusinessMemberRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireCurrentUser } from "@/lib/auth/user";
import { AppError } from "@/lib/errors/app-error";
import { assertAllowedBusinessRole } from "@/lib/auth/authorization";

/**
 * Returns every business membership for the authenticated Neon Auth user.
 *
 * A user may belong to more than one business, so callers must not infer a
 * current business from array order or from the first membership returned.
 */
export async function getCurrentUserMemberships() {
  const user = await requireCurrentUser();

  return prisma.businessMember.findMany({
    where: { userId: user.id },
    include: { business: true },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Requires the authenticated user to belong to the requested business.
 */
export async function requireBusinessMembership(businessId: string) {
  const user = await requireCurrentUser();

  const membership = await prisma.businessMember.findUnique({
    where: {
      businessId_userId: {
        businessId,
        userId: user.id,
      },
    },
    include: { business: true },
  });

  if (!membership) {
    throw new AppError(
      "FORBIDDEN",
      "You do not have access to this business.",
      403,
    );
  }

  return membership;
}

/**
 * Requires membership in a business and one of the explicitly allowed roles.
 * This is a permission primitive; feature-specific permissions must be
 * decided before callers use it for a business operation.
 */
export async function requireBusinessRole(
  businessId: string,
  allowedRoles: readonly BusinessMemberRole[],
) {
  const membership = await requireBusinessMembership(businessId);

  assertAllowedBusinessRole(membership.role, allowedRoles);

  return membership;
}
