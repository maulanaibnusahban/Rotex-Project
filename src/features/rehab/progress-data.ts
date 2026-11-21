import { JournalStatus, MeasurementMethod, MovementType, Role, ShoulderSide, TherapyMode, type Prisma } from "@prisma/client";
import { z } from "zod";
import { database } from "@/src/lib/db";
import { assignedPatient, dayKey, dayMs, first, idField, parseLocal, personName, type Query } from "./core";
import { methodLabels, modeLabels, movementLabels, sideLabels } from "./clinical-labels";

export type ReportActor = { id: string; role: Role };
export const chartFilters = z.object({
  movement: z.enum(MovementType).optional(), side: z.enum(ShoulderSide).optional(),
  method: z.enum(MeasurementMethod).optional(), mode: z.enum(TherapyMode).optional(),
});
export type ChartFilters = z.infer<typeof chartFilters>;

export function getFilters(query: Query): ChartFilters {
  return {
    movement: chartFilters.shape.movement.safeParse(first(query.movement)).data,
    side: chartFilters.shape.side.safeParse(first(query.side)).data,
    method: chartFilters.shape.method.safeParse(first(query.method)).data,
    mode: chartFilters.shape.mode.safeParse(first(query.mode)).data,
  };
}

export function getPeriod(query: Query, now = new Date()) {
  const from = first(query.from) || dayKey(new Date(now.getTime() - 90 * dayMs));
  const to = first(query.to) || dayKey(now);
  const start = parseLocal(from + "T00:00");
  const endDay = parseLocal(to + "T00:00");
  if (!start || !endDay || endDay < start) return null;
  return { from, to, start, end: new Date(endDay.getTime() + dayMs) };
}
export type ReportPeriod = NonNullable<ReturnType<typeof getPeriod>>;

export async function reportSubject(actor: ReportActor, patientId: string) {
  if (!idField.safeParse(patientId).success || actor.role === Role.ADMIN || (actor.role === Role.PATIENT && actor.id !== patientId)) return null;
  return database().patientProfile.findFirst({
    where: { userId: patientId, ...(actor.role === Role.DOCTOR ? assignedPatient(actor.id) : {}) }, select: personName,
  });
}

export function patientScope(actor: ReportActor, patientId: string) {
  return {
    patientId: actor.role === Role.PATIENT ? actor.id : patientId,
    patient: actor.role === Role.DOCTOR ? assignedPatient(actor.id) : undefined,
  };
}

export function reportLink(patientId: string, period: ReportPeriod, filters: ChartFilters = {}) {
  const params = new URLSearchParams({ from: period.from, to: period.to });
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  return "/reports/" + patientId + "?" + params.toString();
}

export const finalJournalSelect = {
  id: true, therapyAt: true, mode: true, doctor: { select: personName },
  measurements: {
    orderBy: [{ movement: "asc" }, { id: "asc" }],
    select: { id: true, movement: true, shoulderSide: true, degrees: true, method: true, methodNotes: true, mode: true },
  },
} satisfies Prisma.TherapySessionSelect;
type MeasuredJournal = Prisma.TherapySessionGetPayload<{ select: typeof finalJournalSelect }>;
export type RomPoint = { id: string; journalId: string; timestamp: number; degrees: number; doctor: string };
export type RomSeries = { key: string; label: string; points: RomPoint[] };

export function groupRom(journals: MeasuredJournal[], filters: ChartFilters): RomSeries[] {
  const grouped = new Map<string, RomSeries>();
  for (const journal of journals) for (const row of journal.measurements) {
    const mode = row.mode ?? journal.mode;
    if ((filters.movement && row.movement !== filters.movement) || (filters.side && row.shoulderSide !== filters.side) ||
      (filters.method && row.method !== filters.method) || (filters.mode && mode !== filters.mode)) continue;
    // Metode "lain" hanya sebanding jika rincian pengukurannya sama.
    const methodDetail = row.method === MeasurementMethod.OTHER ? row.methodNotes ?? "" : "";
    const key = JSON.stringify([row.movement, row.shoulderSide, row.method, methodDetail.trim().toLowerCase(), mode]);
    const label = [
      movementLabels[row.movement], sideLabels[row.shoulderSide], methodLabels[row.method],
      methodDetail, mode ? modeLabels[mode] : "Mode belum dicatat",
    ].filter(Boolean).join(" · ");
    const series = grouped.get(key) ?? { key, label, points: [] };
    series.points.push({
      id: row.id, journalId: journal.id, timestamp: journal.therapyAt.getTime(), degrees: Number(row.degrees), doctor: journal.doctor.user.name,
    });
    grouped.set(key, series);
  }
  return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label, "id"));
}

export async function readProgress(actor: ReportActor, patientId: string, period: ReportPeriod, filters: ChartFilters) {
  const rows = await database().therapySession.findMany({
    where: { ...patientScope(actor, patientId), status: JournalStatus.FINALIZED, therapyAt: { gte: period.start, lt: period.end } },
    select: finalJournalSelect, orderBy: [{ therapyAt: "asc" }, { id: "asc" }],
  });
  return groupRom(rows, filters);
}
