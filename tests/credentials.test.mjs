import assert from "node:assert/strict";
import test from "node:test";
import { createToken, hashPassword, hashToken, normalizeEmail, verifyPassword } from "../src/features/auth/credentials.mjs";

test("email akun selalu dinormalisasi", () => {
  assert.equal(normalizeEmail("  Pasien@EXAMPLE.COM "), "pasien@example.com");
});

test("kata sandi diacak dengan salt dan hanya hash yang cocok diterima", async () => {
  const password = "Contoh kata sandi dengan spasi 123";
  const firstHash = await hashPassword(password);
  const secondHash = await hashPassword(password);
  assert.notEqual(firstHash, secondHash);
  assert.equal(firstHash.includes(password), false);
  assert.equal(await verifyPassword(password, firstHash), true);
  assert.equal(await verifyPassword(password + " ", firstHash), false);
  assert.equal(await verifyPassword(password, "hash-rusak"), false);
});

test("token sesi acak dapat disimpan sebagai hash stabil", () => {
  const token = createToken();
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(token, createToken());
  assert.match(hashToken(token), /^[a-f0-9]{64}$/);
  assert.equal(hashToken(token), hashToken(token));
});
