import "dotenv/config";
import { stdin } from "node:process";
import { Role } from "@prisma/client";
import { z } from "zod";
import { createPrismaClient } from "../src/lib/prisma-client.mjs";
import { hashPassword, normalizeEmail } from "../src/features/auth/credentials.mjs";
import { maximumPasswordLength, minimumPasswordLength } from "../src/features/auth/password-policy.mjs";

const [, , emailArg, nameArg] = process.argv;
const account = z.object({ email: z.email().max(254), name: z.string().trim().min(2).max(100) });
const parsed = account.safeParse({ email: normalizeEmail(emailArg ?? ""), name: nameArg });

if (!parsed.success || stdin.isTTY) {
  console.error("Gunakan npm run db:admin -- EMAIL NAMA. Masukkan kata sandi melalui stdin.");
  process.exitCode = 1;
} else {
  try {
    stdin.setEncoding("utf8");
    let input = "";
    for await (const chunk of stdin) {
      input += chunk;
      if (input.length > maximumPasswordLength + 2) throw new Error("INVALID_PASSWORD");
    }
    const password = input.replace(/\r?\n$/, "");
    if (password.length < minimumPasswordLength || password.length > maximumPasswordLength) throw new Error("INVALID_PASSWORD");

    const db = createPrismaClient();
    try {
      await db.user.create({
        data: {
          ...parsed.data, role: Role.ADMIN, passwordHash: await hashPassword(password),
        },
      });
      console.log("Akun administrator berhasil dibuat.");
    } finally {
      await db.$disconnect();
    }
  } catch (error) {
    console.error(error instanceof Error && error.message === "INVALID_PASSWORD"
      ? `Kata sandi harus berisi ${minimumPasswordLength} hingga ${maximumPasswordLength} karakter.`
      : "Akun administrator gagal dibuat. Periksa konfigurasi database dan pastikan email belum dipakai.");
    process.exitCode = 1;
  }
}
