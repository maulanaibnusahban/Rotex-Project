import type { PrismaClient } from "@prisma/client";
import { createPrismaClient } from "./prisma-client.mjs";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

let prisma: PrismaClient | undefined = globalForPrisma.prisma;

export function database() {
  if (!prisma) {
    prisma = createPrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  }
  return prisma;
}
