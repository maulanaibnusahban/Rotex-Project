import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
const options = { N: 2 ** 15, r: 8, p: 3, maxmem: 40 * 1024 * 1024 };
const hashPattern = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await deriveKey(password, salt, 64, options);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password, encoded) {
  const match = encoded?.match(hashPattern);
  // Jalankan derivasi untuk email tanpa akun agar jalur masuk serupa.
  const salt = match?.[1] ?? "00000000000000000000000000000000";
  const expected = Buffer.from(match?.[2] ?? "00".repeat(64), "hex");
  const actual = await deriveKey(password, salt, 64, options);
  return timingSafeEqual(actual, expected) && Boolean(match);
}

export function createToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(value) {
  return createHash("sha256").update(value).digest("hex");
}
