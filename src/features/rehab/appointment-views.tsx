import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentChangeType, AppointmentStatus, JournalStatus, Prisma, Role } from "@prisma/client";
import { database } from "@/src/lib/db";
import { requireUser } from "@/src/features/auth/session";
import { DashboardEmpty, DashboardHeading } from "@/src/features/dashboard/sections";
import {
  activeAssignment, assignedPatient, dayKey, first, formatDate, formatTime, idField, localInput, longDate,
  pageLink, pageNumber, pageSize, parseLocal, personName, type Query,
} from "./core";
import { changeAppointmentStatus, createAppointment, rescheduleAppointment } from "./appointment-actions";
import { AppointmentCalendar, appointmentHref, intervalLabel, newAppointmentHref } from "./appointment-calendar";
import { AppointmentFields } from "./appointment-fields";
import { addDays, calendarRange } from "./calendar";
import { appointmentLabels } from "./clinical-labels";
import { Field, WorkForm } from "./work-form";
import { Pagination, WorkPanel } from "./view";

const appointmentSelect = {
  id: true, startAt: true, endAt: true, status: true, doctor: { select: personName }, patient: { select: personName },
} satisfies Prisma.AppointmentSelect;
type AppointmentItem = Prisma.AppointmentGetPayload<{ select: typeof appointmentSelect }>;

function Status({ value }: { value: AppointmentStatus }) {
  return <span className="dashboard-status" data-status={value}>{appointmentLabels[value]}</span>;
}

function RowTable({ rows, audience, results, empty }: { rows: AppointmentItem[]; audience: Role; results: Map<string, string>; empty: string }) {
  if (!rows.length) return <DashboardEmpty>{empty}</DashboardEmpty>;
  return <table className="dashboard-table work-table">
    <thead><tr><th scope="col">Tanggal dan waktu</th><th scope="col">{audience === Role.PATIENT ? "Dokter" : "Pasien"}</th><th scope="col">Status</th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.id}>
      <td>{longDate(row.startAt)}<span className="dashboard-meta">{intervalLabel(row)}</span></td>
      <td><Link className="text-link" href={appointmentHref(audience, row.id)}>{audience === Role.PATIENT ? row.doctor.user.name : row.patient.user.name}</Link>
        {audience === Role.ADMIN && <span className="dashboard-meta">{row.doctor.user.name}</span>}</td>
      <td><Status value={row.status} />
        {audience === Role.PATIENT && row.status === AppointmentStatus.COMPLETED && (
          <span className="dashboard-meta">{results.has(row.id)
            ? <Link className="text-link" href={"/patient/journals/" + results.get(row.id)}>Buka jurnal</Link>
            : "Menunggu hasil"}</span>
        )}
      </td>
    </tr>)}</tbody>
  </table>;
}

export async function Schedule({ audience, query }: { audience: Role; query: Query }) {
  const user = await requireUser(audience);
  const db = database();
  const range = calendarRange(query);
  const page = pageNumber(query);
  const parsedDoctor = idField.safeParse(first(query.doctor));
  const doctor = audience === Role.ADMIN && parsedDoctor.success ? parsedDoctor.data : undefined;
  const scope: Prisma.AppointmentWhereInput = audience === Role.PATIENT ? { patientId: user.id }
    : audience === Role.DOCTOR ? { doctorId: user.id, patient: assignedPatient(user.id) }
      : { doctorId: doctor };
  const during = (start: Date, end: Date) => ({ ...scope, startAt: { lt: end }, endAt: { gt: start } });
  const agenda = during(range.anchor, addDays(range.anchor, 1));
  const history = { ...scope, OR: [{ startAt: { lt: new Date() } }, { status: { not: AppointmentStatus.SCHEDULED } }] };
  const historyPage = pageNumber({ page: query.historyPage });
  const orderBy = [{ startAt: "asc" }, { id: "asc" }] satisfies Prisma.AppointmentOrderByWithRelationInput[];
  const [rows, agendaRows, count, doctors, historyRows, historyCount] = await Promise.all([
    db.appointment.findMany({ where: during(range.start, range.end), select: appointmentSelect, orderBy }),
    db.appointment.findMany({ where: agenda, select: appointmentSelect, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    db.appointment.count({ where: agenda }),
    audience === Role.ADMIN ? db.doctorProfile.findMany({ select: personName, orderBy: { user: { name: "asc" } } }) : [],
    audience === Role.PATIENT ? db.appointment.findMany({
      where: history, select: appointmentSelect, orderBy: [{ startAt: "desc" }, { id: "desc" }],
      skip: (historyPage - 1) * pageSize, take: pageSize,
    }) : [],
    audience === Role.PATIENT ? db.appointment.count({ where: history }) : 0,
  ]);
  const done = [...new Set([...agendaRows, ...historyRows].filter(row => row.status === AppointmentStatus.COMPLETED).map(row => row.id))];
  const finalResults = audience === Role.PATIENT && done.length ? await db.therapySession.findMany({
    where: { patientId: user.id, appointmentId: { in: done }, status: JournalStatus.FINALIZED },
    select: { appointmentId: true, id: true },
  }) : [];
  const results = new Map(finalResults.flatMap(row => row.appointmentId ? [[row.appointmentId, row.id] as const] : []));
  return <div className="dashboard-overview">
    <DashboardHeading title={audience === Role.PATIENT ? "Jadwal terapi saya" : "Kalender terapi"} description="Tanggal dan jam ditampilkan dalam WIB."
      action={audience !== Role.PATIENT ? <Link className="button button-primary" href={newAppointmentHref(audience, dayKey(range.anchor), undefined, doctor)}>Buat jadwal</Link> : undefined} />
    <WorkPanel title="Kalender jadwal">
      <form className="work-filter" method="get">
        <input type="hidden" name="view" value={range.view} />
        <Field key={dayKey(range.anchor)} name="date" label="Lompat ke tanggal" type="date" defaultValue={dayKey(range.anchor)} />
        {audience === Role.ADMIN && <Field as="select" name="doctor" label="Dokter" defaultValue={doctor ?? ""}>
          <option value="">Semua dokter</option>{doctors.map(item => <option value={item.user.id} key={item.user.id}>{item.user.name}</option>)}
        </Field>}
        <button className="button button-secondary">Tampilkan</button>
      </form>
      <AppointmentCalendar rows={rows} range={range} query={query} audience={audience} doctor={doctor} />
    </WorkPanel>
    <WorkPanel title={"Agenda · " + longDate(range.anchor)}>
      <RowTable rows={agendaRows} audience={audience} results={results} empty="Belum ada janji terapi pada tanggal ini. Pilih tanggal lain di kalender." />
      <Pagination query={query} page={page} size={pageSize} total={count} />
    </WorkPanel>
    {audience === Role.PATIENT && <WorkPanel title="Riwayat jadwal">
      <RowTable rows={historyRows} audience={audience} results={results} empty="Belum ada riwayat jadwal terapi." />
      {historyCount > pageSize && <nav className="work-pagination" aria-label="Halaman riwayat">
        {historyPage > 1 && <Link className="button button-secondary" href={pageLink(query, { historyPage: String(historyPage - 1) })}>Sebelumnya</Link>}
        <span>Halaman {historyPage}</span>
        {historyPage * pageSize < historyCount && <Link className="button button-secondary" href={pageLink(query, { historyPage: String(historyPage + 1) })}>Berikutnya</Link>}
      </nav>}
    </WorkPanel>}
  </div>;
}

export async function NewAppointment({ audience, query }: { audience: "ADMIN" | "DOCTOR"; query: Query }) {
  const actor = await requireUser(audience);
  const pairs = await database().patientAssignment.findMany({
    where: {
      ...activeAssignment(), doctorId: audience === Role.DOCTOR ? actor.id : undefined,
      doctor: { user: { role: Role.DOCTOR, isActive: true } }, patient: { user: { role: Role.PATIENT, isActive: true } },
    },
    select: { doctor: { select: personName }, patient: { select: personName } },
    orderBy: { patient: { user: { name: "asc" } } },
  });
  const date = first(query.date) || dayKey(new Date());
  const anchor = parseLocal(date + "T" + (first(query.time) || "09:00")) ?? parseLocal(date + "T09:00");
  const userBase = audience === Role.ADMIN ? "/admin" : "/doctor";
  return <div className="dashboard-overview">
    <DashboardHeading title="Buat jadwal terapi" description="Pilih pasien yang ditugaskan, tanggal, dan rentang waktu WIB." />
    <WorkPanel title="Rincian jadwal">
      {!pairs.length ? <DashboardEmpty>
        Belum ada penugasan aktif untuk dijadwalkan.{" "}
        {audience === Role.ADMIN ? <Link className="text-link" href="/admin/assignments">Tugaskan dokter ke pasien</Link> : "Minta admin menugaskan pasien terlebih dahulu."}
      </DashboardEmpty> :
        <WorkForm action={createAppointment} className="work-form">
          <AppointmentFields pairs={pairs} fixedDoctor={audience === Role.DOCTOR ? actor.id : undefined}
            initialDoctor={first(query.doctor)} initialPatient={first(query.patient)} />
          <div className="work-grid">
            <Field name="startAt" type="datetime-local" label="Mulai (WIB)" required defaultValue={anchor ? localInput(anchor) : undefined} />
            <Field name="endAt" type="datetime-local" label="Selesai (WIB)" required defaultValue={anchor ? localInput(new Date(anchor.getTime() + 30 * 60_000)) : undefined} />
          </div>
          <Field as="textarea" name="notes" label="Catatan administratif" rows={3} maxLength={2000} />
          <div className="button-row"><button className="button button-primary">Simpan jadwal</button><Link className="button button-secondary" href={userBase + "/appointments"}>Kembali</Link></div>
        </WorkForm>}
    </WorkPanel>
  </div>;
}

export async function AppointmentDetails({ audience, id }: { audience: "ADMIN" | "DOCTOR"; id: string }) {
  const actor = await requireUser(audience);
  if (!idField.safeParse(id).success) notFound();
  const row = await database().appointment.findFirst({
    where: { id, ...(audience === Role.DOCTOR ? { doctorId: actor.id, patient: assignedPatient(actor.id) } : {}) },
    select: {
      ...appointmentSelect, notes: true, updatedAt: true,
      changes: { orderBy: { createdAt: "desc" }, select: { id: true, type: true, before: true, after: true, createdAt: true, actor: { select: { name: true } } } },
      ...(audience === Role.DOCTOR ? { journal: { select: { id: true, status: true } } } : {}),
    },
  });
  if (!row) notFound();
  const canEdit = row.status === AppointmentStatus.SCHEDULED;
  const base = audience === Role.ADMIN ? "/admin" : "/doctor";
  const journalLink = row.journal ? "/doctor/journals/" + row.journal.id
    : "/doctor/journals/new?patient=" + row.patient.user.id + "&appointment=" + row.id;
  const labelChange = (value: Prisma.JsonValue) => {
    if (!value || typeof value !== "object" || Array.isArray(value) || typeof value.startAt !== "string" || typeof value.endAt !== "string") return "";
    const startAt = new Date(value.startAt);
    const endAt = new Date(value.endAt);
    return formatDate(startAt) + " · " + intervalLabel({ startAt, endAt });
  };
  return <div className="dashboard-overview">
    <DashboardHeading title="Detail jadwal terapi" description={longDate(row.startAt) + " · " + intervalLabel(row)}
      action={<Link className="button button-secondary" href={base + "/appointments?date=" + dayKey(row.startAt)}>Kembali ke kalender</Link>} />
    <WorkPanel title="Informasi jadwal">
      <div className="work-form">
        <dl className="account-details work-grid">
          <div><dt>Pasien</dt><dd>{row.patient.user.name}</dd></div><div><dt>Dokter</dt><dd>{row.doctor.user.name}</dd></div>
          <div><dt>Status</dt><dd><Status value={row.status} /></dd></div>
          {row.notes && <div><dt>Catatan administratif</dt><dd className="work-copy">{row.notes}</dd></div>}
        </dl>
        {audience === Role.DOCTOR && (row.journal || canEdit || row.status === AppointmentStatus.COMPLETED) &&
          <Link className="button button-primary" href={journalLink}>{row.journal?.status === JournalStatus.FINALIZED ? "Baca jurnal final" : row.journal ? "Lanjutkan draf" : "Mulai pemeriksaan"}</Link>}
      </div>
    </WorkPanel>
    {canEdit && <div className="dashboard-columns">
      <WorkPanel title="Ubah jadwal">
        <WorkForm action={rescheduleAppointment} className="work-form">
          <input type="hidden" name="id" value={row.id} /><input type="hidden" name="stamp" value={row.updatedAt.toISOString()} />
          <Field name="startAt" type="datetime-local" label="Mulai (WIB)" defaultValue={localInput(row.startAt)} required />
          <Field name="endAt" type="datetime-local" label="Selesai (WIB)" defaultValue={localInput(row.endAt)} required />
          <Field as="textarea" name="notes" label="Catatan administratif" rows={3} defaultValue={row.notes ?? ""} maxLength={2000} />
          <button className="button button-primary">Simpan perubahan</button>
        </WorkForm>
      </WorkPanel>
      <WorkPanel title="Ubah status">
        <WorkForm action={changeAppointmentStatus} className="work-form" confirmation="Simpan perubahan status jadwal ini?">
          <input type="hidden" name="id" value={row.id} /><input type="hidden" name="stamp" value={row.updatedAt.toISOString()} />
          <Field as="select" name="status" label="Status baru" defaultValue="" required><option value="">Pilih status</option>
            <option value={AppointmentStatus.CANCELLED}>Dibatalkan</option>
            {audience === Role.DOCTOR && <><option value={AppointmentStatus.COMPLETED}>Selesai</option><option value={AppointmentStatus.NO_SHOW}>Tidak hadir</option></>}
          </Field>
          <button className="button button-secondary">Simpan status</button>
        </WorkForm>
      </WorkPanel>
    </div>}
    <WorkPanel title="Riwayat perubahan">
      {row.changes.length ? <ul className="dashboard-list">{row.changes.map(change => <li key={change.id}>
        <strong>{change.type === AppointmentChangeType.RESCHEDULED ? "Jadwal dipindah" : "Status diperbarui"}</strong>
        <span className="dashboard-meta">{change.actor.name} · {formatDate(change.createdAt)} {formatTime(change.createdAt)} WIB</span>
        {change.type === AppointmentChangeType.RESCHEDULED ? <span className="dashboard-meta">{labelChange(change.before)} → {labelChange(change.after)}</span>
          : change.after && typeof change.after === "object" && !Array.isArray(change.after) && typeof change.after.status === "string" &&
            <span className="dashboard-meta">{appointmentLabels[change.after.status as AppointmentStatus]}</span>}
      </li>)}</ul> : <DashboardEmpty>Belum ada perubahan jadwal.</DashboardEmpty>}
    </WorkPanel>
  </div>;
}

export async function PatientAppointmentDetails({ id }: { id: string }) {
  const patient = await requireUser(Role.PATIENT);
  if (!idField.safeParse(id).success) notFound();
  const db = database();
  const row = await db.appointment.findFirst({
    where: { id, patientId: patient.id },
    select: { startAt: true, endAt: true, status: true, doctor: { select: personName } },
  });
  if (!row) notFound();
  const result = await db.therapySession.findFirst({
    where: { appointmentId: id, patientId: patient.id, status: JournalStatus.FINALIZED }, select: { id: true },
  });
  return <div className="dashboard-overview">
    <DashboardHeading title="Detail jadwal terapi" description={longDate(row.startAt) + " · " + intervalLabel(row)}
      action={<Link className="button button-secondary" href={"/patient/appointments?date=" + dayKey(row.startAt)}>Kembali ke kalender</Link>} />
    <WorkPanel title="Informasi jadwal">
      <dl className="account-details work-form work-grid">
        <div><dt>Dokter</dt><dd>{row.doctor.user.name}</dd></div>
        <div><dt>Tanggal</dt><dd>{longDate(row.startAt)}</dd></div>
        <div><dt>Jam</dt><dd>{intervalLabel(row)}</dd></div>
        <div><dt>Status</dt><dd><Status value={row.status} /></dd></div>
      </dl>
      {result ? <div className="work-form"><Link className="text-link" href={"/patient/journals/" + result.id}>Buka jurnal hasil terapi</Link></div>
        : row.status === AppointmentStatus.COMPLETED && <DashboardEmpty>Hasil pemeriksaan menunggu finalisasi dokter.</DashboardEmpty>}
    </WorkPanel>
  </div>;
}
