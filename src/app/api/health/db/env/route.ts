import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const businessCount = await prisma.business.count();
    return NextResponse.json({
      status: "ok",
      database: "available",
      businessCount,
    });
  } catch (error) {
    console.error("Database environment health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
      },
      { status: 503 },
    );
  }
}
