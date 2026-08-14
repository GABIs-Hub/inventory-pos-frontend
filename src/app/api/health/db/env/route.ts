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
    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}