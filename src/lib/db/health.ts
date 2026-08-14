import { prisma } from "@/lib/db/prisma";

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;

  return {
    connected: true,
  };
}