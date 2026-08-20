import "server-only";

import { auth } from "@/lib/auth/server";
import { AppError } from "@/lib/errors/app-error";

export type AuthSession = Awaited<ReturnType<typeof auth.getSession>>;
export type AuthenticatedUser = NonNullable<AuthSession["user"]>;

/**
 * Reads the current Neon Auth session from the request context.
 *
 * This remains a thin wrapper so API handlers and future server components
 * use one consistent session access point.
 */
export async function getCurrentSession(): Promise<AuthSession> {
  return auth.getSession();
}

/**
 * Returns the authenticated Neon Auth user, or null when no session exists.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const { user } = await getCurrentSession();

  return user ?? null;
}

/**
 * Requires an authenticated Neon Auth user for protected server operations.
 */
export async function requireCurrentUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError(
      "UNAUTHORIZED",
      "Authentication is required.",
      401,
    );
  }

  return user;
}
