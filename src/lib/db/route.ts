import { checkDatabaseConnection } from "@/lib/db/health";

export async function GET() {
  try {
    const result = await checkDatabaseConnection();

    return Response.json(result);
  } catch (error) {
    console.error("Database health check failed:", error);

    return Response.json(
      {
        connected: false,
      },
      { status: 500 },
    );
  }
}