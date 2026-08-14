import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const businessCount = await prisma.business.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      businessCount,
    });
  } catch (error) {
    console.error("DATABASE HEALTH CHECK ERROR:", error);

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    );
  }
}