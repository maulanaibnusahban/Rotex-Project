"use server";

import { AppointmentChangeType, AppointmentStatus, AuditAction, Role, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { database } from "@/src/lib/db";
import {
  checkAssignment, dateTimeField, DomainError, idField, lockUsers, logAction, mutate, requireScheduler, type WorkFormState,
} from "./core";

const interval = z.object({
  startAt: dateTimeField, endAt: dateTimeField,
  notes: z.string().trim().max(2000, "Catatan maksimal 2.000 karakter."),
});
const ordered = (fields: { startAt: Date; endAt: Date }) => fields.endAt > fields.startAt;
const orderError = { path: ["endAt"], message: "Jam selesai harus sesudah jam mulai." };

async function checkConflict(tx: Prisma.TransactionClient, doctorId: string, startAt: Date, endAt: Date, exclude?: string) {
  const conflict = await tx.appointment.findFirst({
    where: { doctorId, id: exclude ? { not: exclude } : undefined, status: AppointmentStatus.SCHEDULED, startAt: { lt: endAt }, endAt: { gt: startAt } },
    select: { id: true },
  });
  if (conflict) throw new DomainError("Waktu ini bertabrakan dengan jadwal dokter. Pilih waktu lain.");
}

function revalidateSchedules() {
  for (const route of ["/admin", "/doctor", "/patient"]) revalidatePath(route, "layout");
}

const changeKey = z.object({ id: idField, stamp: z.iso.datetime() });

export async function createAppointment(_: WorkFormState, form: FormData) {
  const actor = await requireScheduler();
  const schema = interval.extend({ doctorId: idField, patientId: idField }).refine(ordered, orderError);
  return mutate(schema, form, async input => {
    const doctorId = actor.role === Role.DOCTOR ? actor.id : input.doctorId;
    const row = await database().$transaction(async tx => {
      await lockUsers(tx, [doctorId, input.patientId]);
      await checkAssignment(tx, doctorId, input.patientId);
      await checkConflict(tx, doctorId, input.startAt, input.endAt);
      const created = await tx.appointment.create({ data: { ...input, doctorId, notes: input.notes || null }, select: { id: true } });
      await logAction(tx, actor.id, AuditAction.APPOINTMENT_CREATED, created.id);
      return created;
    });
    revalidateSchedules();
    return (actor.role === Role.ADMIN ? "/admin" : "/doctor") + "/appointments/" + row.id;
  });
}

async function updateScheduled(
  actor: { id: string; role: Role },
  key: { id: string; stamp: string },
  edit: (tx: Prisma.TransactionClient, row: { id: string; startAt: Date; endAt: Date; doctorId: string }) => Promise<{
    type: AppointmentChangeType; data: Prisma.AppointmentUpdateInput;
  }>,
) {
  const db = database();
  const owner = await db.appointment.findFirst({
    where: { id: key.id, doctorId: actor.role === Role.DOCTOR ? actor.id : undefined },
    select: { doctorId: true, patientId: true },
  });
  if (!owner) throw new DomainError("Jadwal tidak ditemukan.");
  await db.$transaction(async tx => {
    await lockUsers(tx, [owner.doctorId, owner.patientId]);
    const row = await tx.appointment.findUniqueOrThrow({ where: { id: key.id } });
    if (actor.role === Role.DOCTOR) await checkAssignment(tx, owner.doctorId, owner.patientId);
    if (row.updatedAt.toISOString() !== key.stamp || row.status !== AppointmentStatus.SCHEDULED) {
      throw new DomainError("Jadwal sudah berubah. Muat ulang halaman sebelum melanjutkan.");
    }
    const { type, data } = await edit(tx, row);
    const next = await tx.appointment.update({ where: { id: row.id }, data });
    const snapshot = (item: typeof row) => ({
      startAt: item.startAt.toISOString(), endAt: item.endAt.toISOString(), status: item.status, notes: item.notes,
    });
    await tx.appointmentChange.create({
      data: { appointmentId: row.id, actorId: actor.id, type, before: snapshot(row), after: snapshot(next) },
    });
    await logAction(tx, actor.id, AuditAction.APPOINTMENT_CHANGED, row.id);
  });
  revalidateSchedules();
}

export async function rescheduleAppointment(_: WorkFormState, form: FormData) {
  const actor = await requireScheduler();
  return mutate(interval.extend(changeKey.shape).refine(ordered, orderError), form, async input => {
    await updateScheduled(actor, input, async (tx, row) => {
      await checkConflict(tx, row.doctorId, input.startAt, input.endAt, row.id);
      return { type: AppointmentChangeType.RESCHEDULED, data: { startAt: input.startAt, endAt: input.endAt, notes: input.notes || null } };
    });
    return undefined;
  });
}

export async function changeAppointmentStatus(_: WorkFormState, form: FormData) {
  const actor = await requireScheduler();
  const schema = changeKey.extend({ status: z.enum([AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW]) });
  return mutate(schema, form, async input => {
    if (actor.role === Role.ADMIN && input.status !== AppointmentStatus.CANCELLED) throw new DomainError("Status hasil kunjungan dicatat oleh dokter.");
    await updateScheduled(actor, input, async () => ({ type: AppointmentChangeType.STATUS_CHANGED, data: { status: input.status } }));
    return undefined;
  });
}
