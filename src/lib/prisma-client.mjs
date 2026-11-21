import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

export function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL belum dikonfigurasi.");

  const url = new URL(connectionString);
  url.searchParams.set("timezone", "+00:00");
  return new PrismaClient({ adapter: new PrismaMariaDb(url.toString()), errorFormat: "minimal" });
}
