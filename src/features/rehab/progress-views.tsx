import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalStatus, Role } from "@prisma/client";
import { database } from "@/src/lib/db";
import { requireUser } from "@/src/features/auth/session";
import { DashboardEmpty, DashboardHeading } from "@/src/features/dashboard/sections";
import { first, formatDate, formatTime, longDate, pageNumber, pageSize, personName, type Query } from "./core";
import { methodLabels, modeLabels, movementLabels, sideLabels } from "./clinical-labels";
import { getFilters, getPeriod, patientScope, readProgress, reportLink, reportSubject, type ChartFilters, type RomSeries } from "./progress-data";
import { RomChart } from "./rom-chart";
import { Field } from "./work-form";
import { Pagination, WorkPanel } from "./view";

function PeriodFields({ query }: { query: Query }) {
  const period = getPeriod(query);
  return <>
    <Field name="from" label="Dari tanggal" type="date" defaultValue={period?.from ?? first(query.from)} />
    <Field name="to" label="Sampai tanggal" type="date" defaultValue={period?.to ?? first(query.to)} />
  </>;
}

function ChoiceField({ name, label, items, value }: { name: string; label: string; items: Record<string, string>; value?: string }) {
  return <Field as="select" name={name} label={label} defaultValue={value ?? ""}><option value="">Semua</option>
    {Object.entries(items).map(([key, text]) => <option key={key} value={key}>{text}</option>)}
  </Field>;
}

function ChartFiltersForm({ query, filters }: { query: Query; filters: ChartFilters }) {
  return <form className="work-filter" method="get">
    <PeriodFields query={query} />
    <ChoiceField name="movement" label="Gerakan" items={movementLabels} value={filters.movement} />
    <ChoiceField name="side" label="Sisi bahu" items={{ LEFT: sideLabels.LEFT, RIGHT: sideLabels.RIGHT }} value={filters.side} />
    <ChoiceField name="method" label="Metode" items={methodLabels} value={filters.method} />
    <ChoiceField name="mode" label="Mode" items={modeLabels} value={filters.mode} />
    <button className="button button-secondary">Terapkan filter</button>
  </form>;
}

function SeriesPanel({ series, journalBase }: { series: RomSeries; journalBase: string }) {
  const points = series.points;
  const delta = points[points.length - 1].degrees - points[0].degrees;
  return <WorkPanel title={series.label}>
    <RomChart points={points} journalBase={journalBase} />
    {points.length > 1 && <p className="work-chart-note">Selisih pengukuran awal dan terakhir {delta > 0 ? "+" : ""}{delta.toLocaleString("id-ID", { maximumFractionDigits: 2 })}°.</p>}
    <details className="work-chart-data" open>
      <summary className="text-link">Tabel pengukuran</summary>
      <table className="dashboard-table"><thead><tr><th scope="col">Tanggal sesi</th><th scope="col">Nilai</th><th scope="col">Dokter</th></tr></thead>
        <tbody>{points.map(point => <tr key={point.id}>
          <td><Link className="text-link" href={journalBase + point.journalId}>{formatDate(new Date(point.timestamp))}</Link><span className="dashboard-meta">{formatTime(new Date(point.timestamp))} WIB</span></td>
          <td>{point.degrees.toLocaleString("id-ID")}°</td><td>{point.doctor}</td>
        </tr>)}</tbody>
      </table>
    </details>
  </WorkPanel>;
}

export async function ProgressPage({ audience, id, query }: { audience: "DOCTOR" | "PATIENT"; id?: string; query: Query }) {
  const actor = await requireUser(audience);
  const patientId = id ?? actor.id;
  const patient = await reportSubject(actor, patientId);
  if (!patient) notFound();
  const period = getPeriod(query);
  const filters = getFilters(query);
  const groups = period ? await readProgress(actor, patientId, period, filters) : [];
  const journalBase = audience === Role.DOCTOR ? "/doctor/journals/" : "/patient/journals/";
  return <div className="dashboard-overview">
    <DashboardHeading title="Perkembangan ROM" description={patient.user.name + " · Hasil ukur dari jurnal terapi final."}
      action={period ? <a className="button button-primary" href={reportLink(patientId, period, filters)}>Unduh PDF</a> : undefined} />
    <WorkPanel title="Pilih pengukuran"><ChartFiltersForm query={query} filters={filters} /></WorkPanel>
    {!period ? <p className="feedback feedback-error" role="alert">Pilih rentang tanggal yang valid.</p>
      : !groups.length ? <WorkPanel title="Riwayat pengukuran"><DashboardEmpty>Belum ada pengukuran final yang sesuai dengan filter.</DashboardEmpty></WorkPanel>
        : groups.map(series => <SeriesPanel key={series.key} series={series} journalBase={journalBase} />)}
  </div>;
}

export async function PatientHistory({ query }: { query: Query }) {
  const actor = await requireUser(Role.PATIENT);
  const period = getPeriod(query);
  const page = pageNumber(query);
  const db = database();
  const where = { ...patientScope(actor, actor.id), status: JournalStatus.FINALIZED, therapyAt: period ? { gte: period.start, lt: period.end } : undefined };
  const [count, rows] = period ? await Promise.all([
    db.therapySession.count({ where }),
    db.therapySession.findMany({ where, orderBy: [{ therapyAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, therapyAt: true, doctor: { select: personName }, _count: { select: { measurements: true } } } }),
  ]) : [0, []] as const;
  return <div className="dashboard-overview">
    <DashboardHeading title="Riwayat terapi saya" description="Buka jurnal yang telah difinalisasi oleh dokter."
      action={period ? <a className="button button-primary" href={reportLink(actor.id, period)}>Unduh PDF</a> : undefined} />
    <WorkPanel title="Jurnal final">
      <form className="work-filter" method="get"><PeriodFields query={query} /><button className="button button-secondary">Tampilkan</button></form>
      {!period ? <DashboardEmpty>Pilih rentang tanggal yang valid.</DashboardEmpty>
        : !rows.length ? <DashboardEmpty>Belum ada jurnal final untuk periode ini.</DashboardEmpty>
          : <table className="dashboard-table work-table">
            <thead><tr><th scope="col">Tanggal sesi</th><th scope="col">Dokter</th><th scope="col">Jumlah ROM</th></tr></thead>
            <tbody>{rows.map(item => <tr key={item.id}>
              <td><Link className="text-link" href={"/patient/journals/" + item.id}>{longDate(item.therapyAt)}</Link><span className="dashboard-meta">{formatTime(item.therapyAt)} WIB</span></td>
              <td>{item.doctor.user.name}</td><td>{item._count.measurements}</td>
            </tr>)}</tbody>
          </table>}
      <Pagination query={query} total={count} page={page} size={pageSize} />
    </WorkPanel>
  </div>;
}

export async function PatientChartPreview() {
  const actor = await requireUser(Role.PATIENT);
  const period = getPeriod({})!;
  const groups = await readProgress(actor, actor.id, period, {});
  const recent = groups.reduce<RomSeries | undefined>((last, group) => !last || group.points.at(-1)!.timestamp > last.points.at(-1)!.timestamp ? group : last, undefined);
  return <WorkPanel title="Perkembangan ROM">
    {recent ? <>
      <p className="work-chart-note">{recent.label}</p>
      <RomChart points={recent.points} journalBase="/patient/journals/" />
      <div className="work-chart-note"><Link className="text-link" href="/patient/progress">Lihat grafik dan tabel</Link></div>
    </> : <DashboardEmpty>Grafik akan tampil setelah jurnal final memuat pengukuran ROM.</DashboardEmpty>}
  </WorkPanel>;
}
