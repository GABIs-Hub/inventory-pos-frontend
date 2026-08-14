import { checkDatabaseConnection } from "@/lib/db/health";

export async function GET() {
  try {
    await checkDatabaseConnection();

    return Response.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return Response.json(
      {
        status: "error",
        database: "disconnected",
      },
      { status: 503 },
    );
  }
}