import { NextResponse } from "next/server";

/**
 * Authentication protection is intentionally not enabled yet.
 *
 * Protected application routes do not exist in the foundation phase. Keeping
 * this proxy as a no-op prevents the Edge proxy bundle from importing the
 * server-only Neon Auth instance prematurely.
 */
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
  ],
};
