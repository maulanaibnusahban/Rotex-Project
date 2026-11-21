import { z } from "zod";
import { normalizeEmail } from "./credentials.mjs";
import { maximumPasswordLength, minimumPasswordLength, minimumPasswordMessage } from "./password-policy.mjs";

const requiredName = "Masukkan nama lengkap.";
const requiredEmail = "Masukkan alamat email.";
const requiredPassword = "Masukkan kata sandi.";
const requiredConfirmation = "Masukkan konfirmasi kata sandi.";

export const name = z.string({ error: requiredName }).trim().min(1, requiredName)
  .min(2, "Nama lengkap minimal 2 karakter.").max(100, "Nama maksimal 100 karakter.");
export const email = z.string({ error: requiredEmail }).transform(normalizeEmail)
  .pipe(z.string().min(1, requiredEmail).max(254, "Alamat email maksimal 254 karakter."))
  .pipe(z.email("Format alamat email tidak valid."));
export const currentPassword = z.string({ error: requiredPassword }).min(1, requiredPassword)
  .max(maximumPasswordLength, `Kata sandi maksimal ${maximumPasswordLength} karakter.`);
export const newPassword = currentPassword.min(minimumPasswordLength, minimumPasswordMessage);

const passwordPair = z.object({
  password: newPassword,
  confirmation: z.string({ error: requiredConfirmation }).min(1, requiredConfirmation),
});

function passwordsMatch(input: { password: string; confirmation: string }) {
  return input.password === input.confirmation;
}

const mismatch = {
  path: ["confirmation"],
  message: "Konfirmasi kata sandi tidak cocok.",
  when: ({ value }: { value: unknown }) => passwordPair.safeParse(value).success,
};

export const registration = passwordPair.extend({
  name,
  email,
  privacy: z.literal("on", "Setujui pemberitahuan privasi untuk melanjutkan."),
}).refine(passwordsMatch, mismatch);

export const passwordChange = passwordPair.extend({ current: currentPassword }).refine(passwordsMatch, mismatch);

export const privacyNoticeVersion = "foundation-2";
