import { errorResponse } from "@/lib/errors/error-response";

export async function handleApiRequest<T>(
  handler: () => Promise<T>,
) {
  try {
    return await handler();
  } catch (error) {
    return errorResponse(error);
  }
}