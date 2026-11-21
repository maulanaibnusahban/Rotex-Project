import { JournalStatus, type Prisma } from "@prisma/client";
import { database } from "@/src/lib/db";
import { personName } from "./core";
import { finalJournalSelect, groupRom, patientScope, type ChartFilters, type ReportActor, type ReportPeriod } from "./progress-data";

const sessionSelect = {
  ...finalJournalSelect,
  appointmentId: true, shoulderSide: true, durationMinutes: true, repetitions: true, painScore: true, painScaleMaximum: true,
  chiefComplaint: true, initialCondition: true, observations: true, assessment: true, patientResponse: true, followUpPlan: true, postSessionNotes: true,
  version: true,
} satisfies Prisma.TherapySessionSelect;

export async function readReport(actor: ReportActor, patientId: string, period: ReportPeriod, filters: ChartFilters) {
  const scope = patientScope(actor, patientId);
  return database().$transaction(async tx => {
    const journals = await tx.therapySession.findMany({
      where: { ...scope, status: JournalStatus.FINALIZED, therapyAt: { gte: period.start, lt: period.end } },
      select: sessionSelect, orderBy: [{ therapyAt: "asc" }, { id: "asc" }],
    });
    const appointments = await tx.appointment.findMany({
      where: { ...scope, startAt: { gte: period.start, lt: period.end } },
      select: { startAt: true, endAt: true, status: true, doctor: { select: personName }, journal: { select: { status: true } } },
      orderBy: [{ startAt: "asc" }, { id: "asc" }],
    });
    return { journals, appointments, series: groupRom(journals, filters) };
  }, { isolationLevel: "RepeatableRead" });
}
export type ReportData = Awaited<ReturnType<typeof readReport>>;
