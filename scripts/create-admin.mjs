import "dotenv/config";
import { stderr, stdin } from "node:process";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { Role } from "@prisma/client";
import { z } from "zod";
import { createPrismaClient } from "../src/lib/prisma-client.mjs";
import { hashPassword, normalizeEmail } from "../src/features/auth/credentials.mjs";
import { maximumPasswordLength, minimumPasswordLength } from "../src/features/auth/password-policy.mjs";

const [, , emailArg = "admin@rotex.com", nameArg = "Admin"] = process.argv;
const account = z.object({ email: z.email().max(254), name: z.string().trim().min(2).max(100) });
const parsed = account.safeParse({ email: normalizeEmail(emailArg), name: nameArg });

class SetupError extends Error {}

async function readPassword() {
  if (process.env.ROTEX_ADMIN_PASSWORD) return process.env.ROTEX_ADMIN_PASSWORD;
  if (stdin.isTTY) {
    const muted = new Writable({
      write(_chunk, _encoding, done) {
        done();
      },
    });
    const terminal = createInterface({ input: stdin, output: muted, terminal: true, historySize: 0 });
    stderr.write(`Kata sandi admin (minimal ${minimumPasswordLength} karakter): `);
    try {
      return await new Promise((resolve) => {
        terminal.once("SIGINT", () => terminal.close());
        terminal.once("close", () => resolve(null));
        terminal.question("", (answer) => resolve(answer));
      });
    } finally {
      terminal.close();
      stderr.write("\n");
    }
  }

  stdin.setEncoding("utf8");
  let input = "";
  for await (const chunk of stdin) {
    input += chunk;
    if (input.length > maximumPasswordLength + 2) break;
  }
  return input.replace(/\r?\n$/, "");
}

async function createAdministrator() {
  if (!parsed.success)
    throw new SetupError("Periksa email dan nama admin. Untuk menggantinya, gunakan npm run db:admin -- EMAIL NAMA.");
  const db = createPrismaClient();
  try {
    const existing = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { role: true, isActive: true },
    });
    if (existing) {
      if (existing.role !== Role.ADMIN) throw new SetupError("Email tersebut sudah dipakai oleh akun dengan peran lain.");
      if (!existing.isActive) throw new SetupError("Akun administrator tersebut sudah ada dan berstatus nonaktif.");
      console.log(`Akun administrator ${parsed.data.email} sudah ada.`);
      return;
    }

    const password = await readPassword();
    if (password === null) throw new SetupError("Pembuatan akun dibatalkan.");
    if (password.length < minimumPasswordLength || password.length > maximumPasswordLength) {
      throw new SetupError(`Kata sandi harus berisi ${minimumPasswordLength} hingga ${maximumPasswordLength} karakter.`);
    }
    await db.user.create({
      data: { ...parsed.data, role: Role.ADMIN, passwordHash: await hashPassword(password) },
    });
    console.log(`Akun administrator berhasil dibuat untuk ${parsed.data.email}.`);
  } finally {
    await db.$disconnect();
  }
}

try {
  await createAdministrator();
} catch (error) {
  console.error(
    error instanceof SetupError
      ? error.message
      : "Akun administrator gagal dibuat. Periksa koneksi database dan jalankan npm run db:migrate.",
  );
  process.exitCode = 1;
}
