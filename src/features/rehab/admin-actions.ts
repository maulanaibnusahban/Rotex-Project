"use server";

import { AuditAction, Prisma, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/src/features/auth/session";
import { email, name, newPassword } from "@/src/features/auth/validation";
import { hashPassword } from "@/src/features/auth/credentials.mjs";
import { database } from "@/src/lib/db";
import { activeAssignment, DomainError, idField, lockUsers, logAction, mutate, type WorkFormState } from "./core";

const doctorFields = z.object({ name, email });
const accountStatus = z.object({ id: idField, active: z.enum(["true", "false"]).transform(value => value === "true") });
const pair = z.object({ doctorId: idField, patientId: idField });

export async function createDoctor(_: WorkFormState, form: FormData) {
  const admin = await requireUser(Role.ADMIN);
  return mutate(doctorFields.extend({ password: newPassword }), form, async ({ password, ...account }) => {
    const passwordHash = await hashPassword(password);
    try {
      await database().$transaction(async tx => {
        const doctor = await tx.user.create({
          data: { ...account, passwordHash, role: Role.DOCTOR, doctorProfile: { create: {} } },
          select: { id: true },
        });
        await logAction(tx, admin.id, AuditAction.ACCOUNT_CREATED, doctor.id);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new DomainError("Alamat email sudah dipakai.");
      throw error;
    }
    revalidatePath("/admin", "layout");
    return "/admin/doctors";
  });
}

export async function editDoctor(_: WorkFormState, form: FormData) {
  const admin = await requireUser(Role.ADMIN);
  return mutate(doctorFields.extend({ id: idField }), form, async ({ id, ...fields }) => {
    try {
      await database().$transaction(async tx => {
        const result = await tx.user.updateMany({ where: { id, role: Role.DOCTOR }, data: fields });
        if (!result.count) throw new DomainError("Akun dokter tidak ditemukan.");
        await logAction(tx, admin.id, AuditAction.ACCOUNT_UPDATED, id);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new DomainError("Alamat email sudah dipakai.");
      throw error;
    }
    revalidatePath("/admin", "layout");
    return "/admin/doctors";
  });
}

export async function setAccountStatus(_: WorkFormState, form: FormData) {
  const admin = await requireUser(Role.ADMIN);
  return mutate(accountStatus, form, async ({ id, active }) => {
    await database().$transaction(async tx => {
      await lockUsers(tx, [id]);
      const result = await tx.user.updateMany({
        where: { id, role: { in: [Role.DOCTOR, Role.PATIENT] }, isActive: !active }, data: { isActive: active },
      });
      if (!result.count) throw new DomainError("Status sudah berubah atau akun tidak ditemukan.");
      if (!active) await tx.session.deleteMany({ where: { userId: id } });
      await logAction(tx, admin.id, AuditAction.ACCOUNT_STATUS_CHANGED, id);
    });
    revalidatePath("/admin", "layout");
    return undefined;
  });
}

export async function createAssignment(_: WorkFormState, form: FormData) {
  const admin = await requireUser(Role.ADMIN);
  return mutate(pair, form, async ({ doctorId, patientId }) => {
    await database().$transaction(async tx => {
      await lockUsers(tx, [doctorId, patientId]);
      const [doctor, patient, existing] = await Promise.all([
        tx.doctorProfile.findFirst({ where: { userId: doctorId, user: { role: Role.DOCTOR, isActive: true } }, select: { userId: true } }),
        tx.patientProfile.findFirst({ where: { userId: patientId, user: { role: Role.PATIENT, isActive: true } }, select: { userId: true } }),
        tx.patientAssignment.findFirst({ where: { doctorId, patientId, ...activeAssignment() }, select: { id: true } }),
      ]);
      if (!doctor || !patient) throw new DomainError("Pilih akun dokter dan pasien yang aktif.");
      if (existing) throw new DomainError("Pasangan dokter dan pasien ini sudah memiliki penugasan aktif.");
      const assignment = await tx.patientAssignment.create({ data: { doctorId, patientId, assignedById: admin.id }, select: { id: true } });
      await logAction(tx, admin.id, AuditAction.ASSIGNMENT_STARTED, assignment.id);
    });
    revalidatePath("/admin", "layout");
    revalidatePath("/doctor", "layout");
    return undefined;
  });
}

export async function endAssignment(_: WorkFormState, form: FormData) {
  const admin = await requireUser(Role.ADMIN);
  return mutate(z.object({ id: idField }), form, async ({ id }) => {
    const db = database();
    const assignment = await db.patientAssignment.findUnique({ where: { id }, select: { doctorId: true, patientId: true } });
    if (!assignment) throw new DomainError("Penugasan tidak ditemukan.");
    await db.$transaction(async tx => {
      await lockUsers(tx, [assignment.doctorId, assignment.patientId]);
      const now = new Date();
      const result = await tx.patientAssignment.updateMany({ where: { id, ...activeAssignment(now) }, data: { endedAt: now } });
      if (!result.count) throw new DomainError("Penugasan ini sudah berakhir.");
      await logAction(tx, admin.id, AuditAction.ASSIGNMENT_ENDED, id);
    });
    revalidatePath("/admin", "layout");
    revalidatePath("/doctor", "layout");
    return "/admin/assignments?patient=" + assignment.patientId;
  });
}
