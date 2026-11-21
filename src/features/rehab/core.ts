import { AuditAction, AuditScope, Prisma, Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { database } from "@/src/lib/db";
import { requireUser } from "@/src/features/auth/session";

export type Query = Record<string, string | string[] | undefined>;
export const idField = z.uuid("Pilih data yang valid.");
export const dayMs = 86_400_000;
const offsetMs = 7 * 3_600_000;
export const formatDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric",
}).format;
export const longDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric",
}).format;
export const formatTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}).format;

export function dayKey(date: Date) {
  return new Date(date.getTime() + offsetMs).toISOString().slice(0, 10);
}

export function localInput(date: Date) {
  return new Date(date.getTime() + offsetMs).toISOString().slice(0, 16);
}

export function parseLocal(value: string) {
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(value)) return null;
  const date = new Date(value + ":00+07:00");
  return Number.isFinite(date.getTime()) && localInput(date) === value ? date : null;
}

export const dateTimeField = z.string().transform((value, ctx) => {
  const date = parseLocal(value);
  if (date) return date;
  ctx.addIssue({ code: "custom", message: "Masukkan tanggal dan jam yang valid." });
  return z.NEVER;
});

export function first(value: Query[string]) {
  return typeof value === "string" ? value : "";
}

export function pageNumber(query: Query) {
  const value = Number(first(query.page));
  return Number.isInteger(value) && value > 0 ? Math.min(value, 10_000) : 1;
}

export function pageLink(query: Query, overrides: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (typeof value === "string") params.set(key, value);
  for (const [key, value] of Object.entries(overrides)) params.set(key, value);
  return "?" + params.toString();
}

export const pageSize = 15;
export const personName = { user: { select: { id: true, name: true } } } as const;

export function activeAssignment(now = new Date()) {
  return { startedAt: { lte: now }, endedAt: null };
}

export function assignedPatient(doctorId: string) {
  return {
    user: { role: Role.PATIENT, isActive: true },
    assignments: { some: { doctorId, ...activeAssignment() } },
  } satisfies Prisma.PatientProfileWhereInput;
}

export async function activeDoctorPatient(doctorId: string, patientId: string) {
  return database().patientProfile.findFirst({
    where: { userId: patientId, ...assignedPatient(doctorId) }, select: personName,
  });
}

export async function lockUsers(tx: Prisma.TransactionClient, ids: string[]) {
  for (const id of [...new Set(ids)].sort()) {
    await tx.$queryRawUnsafe("SELECT id FROM User WHERE id = ? FOR UPDATE", id);
  }
}

export async function checkAssignment(tx: Prisma.TransactionClient, doctorId: string, patientId: string) {
  const assignment = await tx.patientAssignment.findFirst({
    where: {
      doctorId, patientId, ...activeAssignment(),
      doctor: { user: { role: Role.DOCTOR, isActive: true } },
      patient: { user: { role: Role.PATIENT, isActive: true } },
    },
    select: { id: true },
  });
  if (!assignment) throw new DomainError("Pasien dan dokter harus memiliki penugasan aktif.");
}

export function logAction(tx: Prisma.TransactionClient, actorId: string, action: AuditAction, subjectId: string, scope: AuditScope = AuditScope.ADMINISTRATIVE) {
  return tx.auditLog.create({ data: { actorId, action, subjectId, scope }, select: { id: true } });
}

export class DomainError extends Error {}
export type WorkFormState = { message?: string; errors?: Record<string, string[] | undefined>; success?: boolean };

export async function mutate<T>(schema: z.ZodType<T>, form: FormData, execute: (data: T) => Promise<string | undefined>): Promise<WorkFormState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };
  let location;
  try {
    location = await execute(parsed.data);
  } catch (error) {
    return { message: error instanceof DomainError ? error.message : "Perubahan belum tersimpan. Silakan coba lagi." };
  }
  if (location) redirect(location);
  return { success: true, message: "Perubahan tersimpan." };
}

export async function requireScheduler() {
  const user = await requireUser();
  if (user.role === Role.PATIENT) redirect("/patient/appointments");
  return user;
}
