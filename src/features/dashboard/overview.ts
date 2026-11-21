import { AppointmentStatus, AuditAction, AuditScope, JournalStatus, Prisma, Role } from "@prisma/client";
import { requireUser } from "@/src/features/auth/session";
import { database } from "@/src/lib/db";

const previewLimit = 5;
const upcomingLimit = 3;
export const formatDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric",
}).format;
export const formatTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}).format;

function jakartaDay(now: Date) {
  const dayMs = 24 * 60 * 60 * 1000;
  const offsetMs = 7 * 60 * 60 * 1000;
  const start = Math.floor((now.getTime() + offsetMs) / dayMs) * dayMs - offsetMs;
  return { start: new Date(start), end: new Date(start + dayMs) };
}

function activeAssignment(now: Date) {
  return { startedAt: { lte: now }, endedAt: null };
}

const profileName = { user: { select: { name: true } } } as const;
const appointmentPreview = { id: true, startAt: true, endAt: true, status: true } as const;
const adminAppointmentSelect = {
  ...appointmentPreview,
  doctor: { select: profileName },
  patient: { select: profileName },
} satisfies Prisma.AppointmentSelect;
const doctorAppointmentSelect = { ...appointmentPreview, patient: { select: profileName } } satisfies Prisma.AppointmentSelect;
const patientAppointmentSelect = { ...appointmentPreview, doctor: { select: profileName } } satisfies Prisma.AppointmentSelect;

export const auditLabels: Record<AuditAction, string> = {
  ACCOUNT_CREATED: "Akun dibuat",
  ACCOUNT_UPDATED: "Akun diperbarui",
  ACCOUNT_STATUS_CHANGED: "Status akun diubah",
  ASSIGNMENT_STARTED: "Penugasan dibuat",
  ASSIGNMENT_ENDED: "Penugasan diakhiri",
  APPOINTMENT_CREATED: "Jadwal dibuat",
  APPOINTMENT_CHANGED: "Jadwal diubah",
  JOURNAL_FINALIZED: "Jurnal difinalisasi",
  JOURNAL_AMENDED: "Jurnal direvisi",
  REPORT_EXPORTED: "Laporan diunduh",
};

export async function getAdminOverview() {
  await requireUser(Role.ADMIN);
  const db = database();
  const now = new Date();
  const managed = { role: { in: [Role.DOCTOR, Role.PATIENT] } };
  const [accounts, recentAccounts, assignmentCount, upcoming, activity] = await Promise.all([
    db.user.groupBy({ by: ["role", "isActive"], where: managed, _count: { _all: true } }),
    db.user.findMany({
      where: managed, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: previewLimit,
      select: { id: true, name: true, role: true, isActive: true },
    }),
    db.patientAssignment.count({
      where: {
        ...activeAssignment(now),
        doctor: { user: { role: Role.DOCTOR, isActive: true } },
        patient: { user: { role: Role.PATIENT, isActive: true } },
      },
    }),
    db.appointment.findMany({
      where: { startAt: { gte: now }, status: AppointmentStatus.SCHEDULED },
      orderBy: [{ startAt: "asc" }, { id: "asc" }], take: previewLimit, select: adminAppointmentSelect,
    }),
    db.auditLog.findMany({
      where: {
        scope: AuditScope.ADMINISTRATIVE,
        action: { notIn: [AuditAction.JOURNAL_FINALIZED, AuditAction.JOURNAL_AMENDED, AuditAction.REPORT_EXPORTED] },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: previewLimit,
      select: { id: true, action: true, createdAt: true, actor: { select: { name: true } } },
    }),
  ]);

  const countRole = (role: Role) => accounts.reduce((total, account) => total + (account.role === role ? account._count._all : 0), 0);
  const activeCount = accounts.reduce((total, account) => total + (account.isActive ? account._count._all : 0), 0);
  return { doctorCount: countRole(Role.DOCTOR), patientCount: countRole(Role.PATIENT), activeCount, assignmentCount, recentAccounts, upcoming, activity };
}

export async function getDoctorOverview() {
  const doctor = await requireUser(Role.DOCTOR);
  const db = database();
  const now = new Date();
  const day = jakartaDay(now);
  const assignedPatient = {
    user: { role: Role.PATIENT, isActive: true },
    assignments: { some: { doctorId: doctor.id, ...activeAssignment(now) } },
  } satisfies Prisma.PatientProfileWhereInput;
  const today = { doctorId: doctor.id, patient: assignedPatient, startAt: { lt: day.end }, endAt: { gt: day.start } };
  const draftsForDoctor = { doctorId: doctor.id, patient: assignedPatient, status: JournalStatus.DRAFT };

  const [patientCount, todayCount, draftCount, appointments, patients, drafts] = await Promise.all([
    db.patientProfile.count({ where: assignedPatient }),
    db.appointment.count({ where: today }),
    db.therapySession.count({ where: draftsForDoctor }),
    db.appointment.findMany({ where: today, orderBy: [{ startAt: "asc" }, { id: "asc" }], take: previewLimit, select: doctorAppointmentSelect }),
    db.patientProfile.findMany({
      where: assignedPatient, orderBy: [{ user: { name: "asc" } }, { userId: "asc" }], take: previewLimit,
      select: { userId: true, ...profileName },
    }),
    db.therapySession.findMany({
      where: draftsForDoctor, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], take: previewLimit,
      select: { id: true, therapyAt: true, updatedAt: true, patient: { select: profileName } },
    }),
  ]);

  return { name: doctor.name, dateLabel: formatDate(now), patientCount, todayCount, draftCount, appointments, patients, drafts };
}

export async function getPatientOverview() {
  const patient = await requireUser(Role.PATIENT);
  const db = database();
  const now = new Date();
  const finalized = { patientId: patient.id, status: JournalStatus.FINALIZED };
  const [doctors, upcoming, journalCount, journals] = await Promise.all([
    db.doctorProfile.findMany({
      where: { user: { role: Role.DOCTOR, isActive: true }, assignments: { some: { patientId: patient.id, ...activeAssignment(now) } } },
      orderBy: [{ user: { name: "asc" } }, { userId: "asc" }], take: previewLimit,
      select: { userId: true, ...profileName },
    }),
    db.appointment.findMany({
      where: { patientId: patient.id, startAt: { gte: now }, status: AppointmentStatus.SCHEDULED },
      orderBy: [{ startAt: "asc" }, { id: "asc" }], take: upcomingLimit, select: patientAppointmentSelect,
    }),
    db.therapySession.count({ where: finalized }),
    db.therapySession.findMany({
      where: finalized, orderBy: [{ therapyAt: "desc" }, { id: "desc" }], take: previewLimit,
      select: { id: true, therapyAt: true, doctor: { select: profileName }, _count: { select: { measurements: true } } },
    }),
  ]);

  return { name: patient.name, doctors, upcoming, journalCount, journals };
}
