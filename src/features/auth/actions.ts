"use server";

import { Prisma, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AuthFormState } from "./form-state";
import { hashPassword, verifyPassword } from "./credentials.mjs";
import { acceptAuthAttempt, authRateLimitWindowMinutes } from "./rate-limit";
import { database } from "@/src/lib/db";
import {
  clearSessionCookie, prepareSession, requestSessionHash, requireUser, roleHome, writeSessionCookie,
} from "./session";
import { currentPassword, email, name, passwordChange, privacyNoticeVersion, registration } from "./validation";

const busy = { message: "Layanan akun sedang tidak tersedia. Silakan coba lagi." };
const limited = { message: `Terlalu banyak percobaan. Coba lagi dalam ${authRateLimitWindowMinutes} menit.` };
const badLogin = { errors: { password: ["Email atau kata sandi tidak sesuai."] } };

function formValues(formData: FormData): NonNullable<AuthFormState["values"]> {
  return {
    email: String(formData.get("email") ?? "").slice(0, 254),
    name: String(formData.get("name") ?? "").slice(0, 100),
    privacy: formData.get("privacy") === "on",
  };
}

export async function registerPatient(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = formValues(formData);
  const parsed = registration.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  const { name, email, password } = parsed.data;
  try {
    if (!(await acceptAuthAttempt("register", email))) return { ...limited, values };
    const session = prepareSession();
    await database().user.create({
      data: {
        name, email, passwordHash: await hashPassword(password), role: Role.PATIENT,
        privacyAcceptedAt: new Date(), privacyNoticeVersion,
        patientProfile: { create: {} },
        sessions: { create: session.record },
      },
      select: { id: true },
    });
    await writeSessionCookie(session.token, session.record.expiresAt);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { email: ["Gunakan email lain atau masuk jika Anda sudah memiliki akun."] }, values };
    }
    return { ...busy, values };
  }

  redirect(roleHome[Role.PATIENT]);
}

const loginSchema = z.object({ email, password: currentPassword });

export async function login(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = formValues(formData);
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors, values };

  let destination: string;
  try {
    if (!(await acceptAuthAttempt("login", parsed.data.email))) return { ...limited, values };
    const db = database();
    const account = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, isActive: true, passwordHash: true, role: true },
    });
    const matches = await verifyPassword(parsed.data.password, account?.passwordHash);
    if (!matches || !account?.isActive) return { ...badLogin, values };

    const session = prepareSession();
    const previousHash = await requestSessionHash();
    const created = await db.$transaction(async (tx) => {
      // Kunci akun yang sama dengan transaksi penggantian kata sandi.
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM \`User\` WHERE id = ${account.id} AND isActive = TRUE
          AND passwordHash = ${account.passwordHash} FOR UPDATE
      `;
      if (rows.length === 0) return false;
      if (previousHash) await tx.session.deleteMany({ where: { tokenHash: previousHash, userId: account.id } });
      await tx.session.create({ data: { ...session.record, userId: account.id } });
      return true;
    });
    if (!created) return { ...badLogin, values };

    await writeSessionCookie(session.token, session.record.expiresAt);
    destination = roleHome[account.role];
  } catch {
    return { ...busy, values };
  }
  redirect(destination);
}

export async function logout() {
  const tokenHash = await requestSessionHash();
  if (tokenHash) await database().session.deleteMany({ where: { tokenHash } });
  await clearSessionCookie();
  redirect("/login");
}

export async function changePassword(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const user = await requireUser();
  const parsed = passwordChange.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };

  try {
    if (!(await acceptAuthAttempt("password-change", user.id))) return limited;
    const db = database();
    const account = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
    if (!account || !(await verifyPassword(parsed.data.current, account.passwordHash))) {
      return { errors: { current: ["Kata sandi saat ini tidak sesuai."] } };
    }
    if (parsed.data.current === parsed.data.password) {
      return { errors: { password: ["Gunakan kata sandi yang berbeda dari sebelumnya."] } };
    }
    const passwordHash = await hashPassword(parsed.data.password);
    const changed = await db.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: { id: user.id, isActive: true, passwordHash: account.passwordHash },
        data: { passwordHash },
      });
      if (!result.count) return false;
      await tx.session.deleteMany({ where: { userId: user.id } });
      return true;
    });
    if (!changed) return { message: "Kata sandi tidak dapat diganti. Silakan masuk kembali." };
    await clearSessionCookie();
  } catch {
    return busy;
  }
  redirect("/login?notice=password");
}

export async function updatePatientProfile(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const account = await requireUser(Role.PATIENT);
  const parsed = name.safeParse(formData.get("name"));
  const values = formValues(formData);
  if (!parsed.success) return { errors: { name: [parsed.error.issues[0].message] }, values };

  try {
    await database().user.update({
      where: { id: account.id, role: Role.PATIENT, isActive: true },
      data: { name: parsed.data },
    });
    revalidatePath("/patient", "layout");
    return { success: true, message: "Profil tersimpan.", values: { name: parsed.data } };
  } catch {
    return { ...busy, values };
  }
}
