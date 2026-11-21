"use server";

import {
  AuditAction, AuditScope, JournalStatus, MeasurementMethod, MovementType, Prisma, Role, SessionShoulderSide, ShoulderSide, TherapyMode,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/src/features/auth/session";
import { database } from "@/src/lib/db";
import { checkAssignment, dateTimeField, DomainError, idField, lockUsers, logAction, mutate, type WorkFormState } from "./core";

const text = z.string().trim().max(4000, "Teks maksimal 4.000 karakter.");
const numeric = (max: number) => z.union([
  z.literal("").transform(() => null),
  z.string().regex(/^\d+$/, "Gunakan angka bulat yang tidak negatif.").transform(Number).pipe(z.number().int().max(max)),
]);
const optionalMode = z.union([z.literal("").transform(() => null), z.enum(TherapyMode)]);
const measurement = z.object({
  movement: z.enum(MovementType), shoulderSide: z.enum(ShoulderSide), method: z.enum(MeasurementMethod),
  degrees: z.string().regex(/^-?\d{1,3}(?:[.,]\d{1,2})?$/)
    .transform(value => Number(value.replace(",", "."))).pipe(z.number().min(-360).max(360)),
  mode: optionalMode, methodNotes: z.string().trim().max(255),
}).refine(row => row.method !== MeasurementMethod.OTHER || Boolean(row.methodNotes));

const measurements = z.string().max(26000).transform((value, ctx) => {
  try { return JSON.parse(value) as unknown; }
  catch {
    ctx.addIssue({ code: "custom", message: "Daftar pengukuran tidak dapat dibaca." });
    return z.NEVER;
  }
}).pipe(z.array(measurement).max(32)).transform(rows => rows.map(row => ({
  ...row, methodNotes: row.methodNotes || null,
})));

const journal = z.object({
  id: z.union([z.literal(""), idField]),
  stamp: z.union([z.literal(""), z.iso.datetime()]),
  intent: z.enum(["draft", "finalize", "amend"]).default("draft"),
  patientId: idField, appointmentId: z.union([z.literal("").transform(() => null), idField]),
  therapyAt: dateTimeField,
  shoulderSide: z.union([z.literal("").transform(() => null), z.enum(SessionShoulderSide)]),
  mode: optionalMode, durationMinutes: numeric(65535), repetitions: numeric(65535),
  chiefComplaint: text, initialCondition: text, painScore: numeric(255), painScaleMaximum: numeric(255),
  observations: text, assessment: text, patientResponse: text, followUpPlan: text, postSessionNotes: text,
  reason: z.string().trim().max(2000), measurements,
}).superRefine((row, ctx) => {
  if (row.painScore !== null || row.painScaleMaximum !== null) {
    if (row.painScore === null || !row.painScaleMaximum || row.painScore > row.painScaleMaximum) {
      ctx.addIssue({ code: "custom", path: ["painScore"], message: "Isi skor dan skala maksimum. Skor tidak boleh melebihi skala." });
    }
  }
  if (row.intent !== "draft") {
    const required = {
      chiefComplaint: "Isi keluhan utama pasien.", initialCondition: "Catat hasil pemeriksaan awal.",
      assessment: "Isi penilaian atau diagnosis dokter.", followUpPlan: "Isi rencana tindak lanjut.",
      shoulderSide: "Pilih sisi bahu.", mode: "Pilih mode terapi.",
    } as const;
    for (const field of Object.keys(required) as (keyof typeof required)[]) {
      if (!row[field]) ctx.addIssue({ code: "custom", path: [field], message: required[field] });
    }
  }
  if (row.intent === "amend" && !row.reason) ctx.addIssue({ code: "custom", path: ["reason"], message: "Tuliskan alasan koreksi." });
});

const clinicalSnapshot = (record: object): Prisma.InputJsonObject => JSON.parse(JSON.stringify(record)) as Prisma.InputJsonObject;
const includeMeasurements = { measurements: { orderBy: { id: "asc" as const } } };

export async function saveJournal(_: WorkFormState, form: FormData) {
  const doctor = await requireUser(Role.DOCTOR);
  return mutate(journal, form, async ({ id, stamp, intent, reason, patientId, appointmentId, measurements: rows, ...fields }) => {
    const db = database();
    try {
      const sessionId = await db.$transaction(async tx => {
        await lockUsers(tx, [doctor.id, patientId]);
        await checkAssignment(tx, doctor.id, patientId);
        const previous = id ? await tx.therapySession.findFirst({ where: { id, doctorId: doctor.id, patientId }, include: includeMeasurements }) : null;
        if (id && (!previous || previous.updatedAt.toISOString() !== stamp)) {
          throw new DomainError("Jurnal sudah berubah atau tidak tersedia. Muat ulang halaman.");
        }
        if ((intent === "amend") !== (previous?.status === JournalStatus.FINALIZED)) {
          throw new DomainError("Gunakan koreksi dengan alasan untuk mengubah jurnal final.");
        }
        if (intent === "amend" && appointmentId !== previous?.appointmentId) throw new DomainError("Jadwal jurnal final tidak dapat diganti lewat koreksi.");
        if (appointmentId) {
          const appointment = await tx.appointment.findFirst({ where: { id: appointmentId, doctorId: doctor.id, patientId }, select: { id: true } });
          if (!appointment) throw new DomainError("Jadwal yang dipilih tidak sesuai dengan dokter dan pasien.");
        }
        const now = new Date();
        const data = {
          ...fields, appointmentId,
          status: intent === "draft" ? JournalStatus.DRAFT : JournalStatus.FINALIZED,
          finalizedAt: intent === "draft" ? null : previous?.finalizedAt ?? now,
          version: (previous?.version ?? 1) + (intent === "amend" ? 1 : 0),
        };
        const current = previous
          ? await tx.therapySession.update({ where: { id: previous.id }, data, select: { id: true } })
          : await tx.therapySession.create({ data: { ...data, doctorId: doctor.id, patientId }, select: { id: true } });
        if (previous) await tx.romMeasurement.deleteMany({ where: { sessionId: current.id } });
        if (rows.length) await tx.romMeasurement.createMany({ data: rows.map(row => ({ ...row, sessionId: current.id })) });

        if (intent === "amend" && previous) {
          const after = await tx.therapySession.findUniqueOrThrow({ where: { id: current.id }, include: includeMeasurements });
          await tx.journalRevision.create({ data: {
            sessionId: current.id, authorId: doctor.id, reason, before: clinicalSnapshot(previous), after: clinicalSnapshot(after),
            previousVersion: previous.version, version: after.version,
          } });
          await logAction(tx, doctor.id, AuditAction.JOURNAL_AMENDED, current.id, AuditScope.CLINICAL);
        } else if (intent === "finalize") {
          await logAction(tx, doctor.id, AuditAction.JOURNAL_FINALIZED, current.id, AuditScope.CLINICAL);
        }
        return current.id;
      });
      revalidatePath("/doctor", "layout");
      revalidatePath("/patient", "layout");
      return "/doctor/journals/" + sessionId;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new DomainError("Jadwal ini sudah memiliki jurnal.");
      throw error;
    }
  });
}
