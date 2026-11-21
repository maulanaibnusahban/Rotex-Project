import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { database } from "@/src/lib/db";
import { createToken, hashToken } from "./credentials.mjs";

const production = process.env.NODE_ENV === "production";
const sessionCookie = production ? "__Host-rotex-session" : "rotex-session";
const sessionDurationMs = 12 * 60 * 60 * 1000;
const cookieOptions = { path: "/", httpOnly: true, secure: production, sameSite: "lax" } as const;
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

export const roleHome = {
  [Role.ADMIN]: "/admin",
  [Role.DOCTOR]: "/doctor",
  [Role.PATIENT]: "/patient",
} satisfies Record<Role, string>;

export const roleLabel = {
  [Role.ADMIN]: "Administrator",
  [Role.DOCTOR]: "Dokter",
  [Role.PATIENT]: "Pasien",
} satisfies Record<Role, string>;

export async function requestSessionHash() {
  const token = (await cookies()).get(sessionCookie)?.value;
  return token && tokenPattern.test(token) ? hashToken(token) : null;
}

export function prepareSession() {
  const token = createToken();
  const expiresAt = new Date(Date.now() + sessionDurationMs);
  return { token, record: { tokenHash: hashToken(token), expiresAt } };
}

export async function writeSessionCookie(token: string, expires: Date) {
  (await cookies()).set(sessionCookie, token, { ...cookieOptions, expires });
}

export async function clearSessionCookie() {
  (await cookies()).set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
}

const publicAccount = { id: true, name: true, email: true, role: true } as const;

export const getSession = cache(async () => {
  const tokenHash = await requestSessionHash();
  if (!tokenHash) return null;

  const session = await database().session.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() }, user: { isActive: true } },
    select: { user: { select: publicAccount } },
  });
  return session?.user ?? null;
});

export async function requireUser(role?: Role) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(roleHome[user.role]);
  return user;
}
