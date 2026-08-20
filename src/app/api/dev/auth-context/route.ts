// TODO: DELETE BEFORE DEPLOYMENT

import { getCurrentUserMemberships } from "@/lib/auth/membership";
import { requireCurrentUser } from "@/lib/auth/user";
import { handleApiRequest } from "@/lib/api/handler";
import { successResponse } from "@/lib/api/response";

export async function GET() {
  return handleApiRequest(async () => {
    const user = await requireCurrentUser();
    const memberships = await getCurrentUserMemberships();

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
      memberships,
    });
  });
}
