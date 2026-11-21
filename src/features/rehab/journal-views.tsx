import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentStatus, JournalStatus, Prisma, Role } from "@prisma/client";
import { database } from "@/src/lib/db";
import { requireUser } from "@/src/features/auth/session";
import { DashboardEmpty, DashboardHeading } from "@/src/features/dashboard/sections";
import { activeDoctorPatient, assignedPatient, dayKey, first, formatDate, formatTime, idField, localInput, longDate, pageNumber, pageSize, personName, type Query } from "./core";
import { appointmentLabels, clinicalNotes, methodLabels, modeLabels, movementLabels, sideLabels } from "./clinical-labels";
import { MeasurementFields } from "./journal-fields";
import { saveJournal } from "./journal-actions";
import { Field, WorkForm } from "./work-form";
import { Pagination, WorkPanel } from "./view";

const fullJournal = {
  doctor: { select: personName }, patient: { select: personName },
  measurements: { orderBy: [{ movement: "asc" }, { id: "asc" }] },
} satisfies Prisma.TherapySessionInclude;
export type ClinicalJournal = Prisma.TherapySessionGetPayload<{ include: typeof fullJournal }>;

export function JournalContents({ row }: { row: ClinicalJournal }) {
  return <>
    <WorkPanel title="Informasi sesi">
      <dl className="account-details work-form work-grid">
        <div><dt>Pasien</dt><dd>{row.patient.user.name}</dd></div>
        <div><dt>Dokter</dt><dd>{row.doctor.user.name}</dd></div>
        <div><dt>Tanggal sesi</dt><dd>{longDate(row.therapyAt)} · {formatTime(row.therapyAt)} WIB</dd></div>
        <div><dt>Status / versi</dt><dd>{row.status === JournalStatus.FINALIZED ? "Final" : "Draf"} · Versi {row.version}</dd></div>
        {row.finalizedAt && <div><dt>Difinalisasi</dt><dd>{formatDate(row.finalizedAt)} · {formatTime(row.finalizedAt)} WIB</dd></div>}
        {row.shoulderSide && <div><dt>Sisi bahu</dt><dd>{sideLabels[row.shoulderSide]}</dd></div>}
        {row.mode && <div><dt>Mode terapi</dt><dd>{modeLabels[row.mode]}</dd></div>}
        {row.durationMinutes !== null && <div><dt>Durasi</dt><dd>{row.durationMinutes} menit</dd></div>}
        {row.repetitions !== null && <div><dt>Repetisi</dt><dd>{row.repetitions}</dd></div>}
        {row.painScore !== null && <div><dt>Skor nyeri</dt><dd>{row.painScore} dari {row.painScaleMaximum}</dd></div>}
      </dl>
    </WorkPanel>
    <WorkPanel title="Pengukuran ROM">
      {row.measurements.length ? <table className="dashboard-table work-table">
        <thead><tr><th scope="col">Gerakan / sisi</th><th scope="col">Nilai</th><th scope="col">Metode / mode</th></tr></thead>
        <tbody>{row.measurements.map(item => <tr key={item.id}>
          <td>{movementLabels[item.movement]}<span className="dashboard-meta">{sideLabels[item.shoulderSide]}</span></td>
          <td>{Number(item.degrees).toLocaleString("id-ID")}°</td>
          <td>{methodLabels[item.method]}{item.methodNotes && <span className="dashboard-meta">{item.methodNotes}</span>}
            {(item.mode ?? row.mode) && <span className="dashboard-meta">{modeLabels[(item.mode ?? row.mode)!]}</span>}</td>
        </tr>)}</tbody>
      </table> : <DashboardEmpty>Pengukuran ROM belum tercatat untuk sesi ini.</DashboardEmpty>}
    </WorkPanel>
    <WorkPanel title="Catatan dokter">
      <dl className="account-details work-form">
        {clinicalNotes.filter(([field]) => row[field]).map(([field, label]) => <div key={field}><dt>{label}</dt><dd className="work-copy">{row[field]}</dd></div>)}
        {!clinicalNotes.some(([field]) => row[field]) && <div><dd>Belum ada catatan yang diisi.</dd></div>}
      </dl>
    </WorkPanel>
  </>;
}

type Choice = { id: string; name: string };
type AppointmentOption = { id: string; startAt: Date };

function Editor({ row, patients, appointments, defaultPatient, defaultAppointment }: {
  row?: ClinicalJournal; patients: Choice[]; appointments: AppointmentOption[]; defaultPatient?: string; defaultAppointment?: string;
}) {
  const final = row?.status === JournalStatus.FINALIZED;
  const linked = appointments.find(item => item.id === defaultAppointment);
  const selectedPatient = patients.find(item => item.id === defaultPatient);
  return <WorkForm action={saveJournal} className="work-form" key={row?.updatedAt.toISOString() ?? "new"}>
    <input type="hidden" name="id" value={row?.id ?? ""} /><input type="hidden" name="stamp" value={row?.updatedAt.toISOString() ?? ""} />
    <section className="work-subsection">
      <h3>Informasi sesi</h3>
      <div className="work-grid">
        {row ? <input type="hidden" name="patientId" value={row.patientId} />
          : selectedPatient ? <>
            <input type="hidden" name="patientId" value={selectedPatient.id} />
            <Field name="patientName" label="Pasien" value={selectedPatient.name} readOnly />
          </> : <Field as="select" name="patientId" label="Pasien" required defaultValue="">
            <option value="">Pilih pasien</option>{patients.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Field>}
        {final ? <input type="hidden" name="appointmentId" value={row.appointmentId ?? ""} />
          : linked ? <>
            <input type="hidden" name="appointmentId" value={linked.id} />
            <Field name="appointmentSummary" label="Jadwal terkait" value={longDate(linked.startAt) + " · " + formatTime(linked.startAt) + " WIB"} readOnly />
          </> : <Field as="select" name="appointmentId" label="Jadwal terkait" defaultValue={row?.appointmentId ?? ""}>
            <option value="">Sesi tanpa jadwal</option>{appointments.map(item => <option key={item.id} value={item.id}>{longDate(item.startAt)} · {formatTime(item.startAt)} WIB</option>)}
          </Field>}
        <Field name="therapyAt" label="Tanggal dan jam sesi (WIB)" type="datetime-local" required defaultValue={localInput(row?.therapyAt ?? linked?.startAt ?? new Date())} />
        <Field as="select" name="shoulderSide" label="Sisi bahu" defaultValue={row?.shoulderSide ?? ""}>
          <option value="">Pilih sisi</option>{Object.entries(sideLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
        </Field>
        <Field as="select" name="mode" label="Mode terapi" defaultValue={row?.mode ?? ""}>
          <option value="">Pilih mode</option>{Object.entries(modeLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
        </Field>
        <Field name="durationMinutes" label="Durasi (menit)" type="number" min={0} defaultValue={row?.durationMinutes ?? ""} />
        <Field name="repetitions" label="Jumlah repetisi" type="number" min={0} defaultValue={row?.repetitions ?? ""} />
      </div>
    </section>
    <section className="work-subsection">
      <h3>Keluhan dan pemeriksaan awal</h3>
      <Field as="textarea" name="chiefComplaint" label="Keluhan utama pasien" rows={3} maxLength={4000} defaultValue={row?.chiefComplaint ?? ""} />
      <Field as="textarea" name="initialCondition" label="Kondisi awal dan hasil pemeriksaan" rows={3} maxLength={4000} defaultValue={row?.initialCondition ?? ""} />
      <div className="work-grid">
        <Field name="painScore" label="Skor nyeri (opsional)" type="number" min={0} max={255} defaultValue={row?.painScore ?? ""} />
        <Field name="painScaleMaximum" label="Skala maksimum" type="number" min={1} max={255} defaultValue={row?.painScaleMaximum ?? ""} />
      </div>
    </section>
    <section className="work-subsection">
      <h3>Pengukuran ROM</h3>
      <MeasurementFields initial={row?.measurements.map(item => ({
        movement: item.movement, shoulderSide: item.shoulderSide, method: item.method,
        degrees: item.degrees.toString(), mode: item.mode ?? "", methodNotes: item.methodNotes ?? "",
      })) ?? []} />
    </section>
    <section className="work-subsection">
      <h3>Penilaian atau diagnosis</h3>
      {clinicalNotes.slice(2, 5).map(([field, label]) => <Field as="textarea" key={field} name={field} label={label} rows={3} maxLength={4000} defaultValue={row?.[field] ?? ""} />)}
    </section>
    <section className="work-subsection">
      <h3>Tindak lanjut</h3>
      {clinicalNotes.slice(5).map(([field, label]) => <Field as="textarea" key={field} name={field} label={label} rows={3} maxLength={4000} defaultValue={row?.[field] ?? ""} />)}
      {final ? <Field as="textarea" name="reason" label="Alasan koreksi" required rows={3} maxLength={2000} /> : <input type="hidden" name="reason" value="" />}
    </section>
    {final
      ? <button type="submit" name="intent" value="amend" className="button button-primary" data-confirm="Simpan koreksi? Isi sebelumnya akan tersimpan dalam riwayat versi.">Simpan koreksi</button>
      : <div className="button-row">
        <button type="submit" name="intent" value="draft" className="button button-secondary">Simpan draf</button>
        <button type="submit" name="intent" value="finalize" className="button button-primary" data-confirm="Finalisasi jurnal? Pasien akan dapat membaca seluruh catatan sesi ini.">Finalisasi jurnal</button>
      </div>}
  </WorkForm>;
}

async function availableAppointments(doctorId: string, patientId: string, current?: string | null) {
  return database().appointment.findMany({
    where: { doctorId, patientId, OR: [{ journal: null }, ...(current ? [{ id: current }] : [])] },
    orderBy: [{ startAt: "desc" }, { id: "desc" }], select: { id: true, startAt: true },
  });
}

export async function NewJournal({ query }: { query: Query }) {
  const doctor = await requireUser(Role.DOCTOR);
  const profiles = await database().patientProfile.findMany({ where: assignedPatient(doctor.id), select: personName, orderBy: { user: { name: "asc" } } });
  const patients = profiles.map(profile => profile.user);
  const patient = patients.find(item => item.id === first(query.patient));
  if (first(query.patient) && !patient) notFound();
  const appointments = patient ? await availableAppointments(doctor.id, patient.id) : [];
  const appointment = appointments.find(item => item.id === first(query.appointment));
  if (first(query.appointment) && !appointment) notFound();
  return <div className="dashboard-overview">
    <DashboardHeading title={patient ? "Pemeriksaan pasien" : "Jurnal terapi baru"} description="Catat keluhan, pemeriksaan awal, dan hasil sesi. Anda dapat menyimpannya sebagai draf."
      action={patient && <Link className="button button-secondary" href={appointment ? "/doctor/appointments/" + appointment.id : "/doctor/patients/" + patient.id}>{appointment ? "Kembali ke jadwal" : "Kembali ke pasien"}</Link>} />
    <WorkPanel title={patient ? "Catatan sesi · " + patient.name : "Catatan sesi"}>
      {patients.length ? <Editor patients={patients} appointments={appointments} defaultPatient={patient?.id} defaultAppointment={appointment?.id} />
        : <DashboardEmpty>Administrator perlu membuat penugasan aktif terlebih dahulu.</DashboardEmpty>}
    </WorkPanel>
  </div>;
}

export async function JournalDetails({ id, audience }: { id: string; audience: "DOCTOR" | "PATIENT" }) {
  const actor = await requireUser(audience);
  if (!idField.safeParse(id).success) notFound();
  const row = await database().therapySession.findFirst({
    where: { id, ...(audience === Role.PATIENT ? { patientId: actor.id, status: JournalStatus.FINALIZED }
      : { patient: assignedPatient(actor.id), OR: [{ doctorId: actor.id }, { status: JournalStatus.FINALIZED }] }) },
    include: fullJournal,
  });
  if (!row) notFound();
  const own = audience === Role.DOCTOR && row.doctorId === actor.id;
  const editableDraft = own && row.status === JournalStatus.DRAFT;
  const revisions = own && row.status === JournalStatus.FINALIZED ? await database().journalRevision.findMany({
    where: { sessionId: id, session: { doctorId: actor.id, patient: assignedPatient(actor.id) } },
    orderBy: { version: "desc" }, select: { id: true, previousVersion: true, version: true, reason: true, createdAt: true, author: { select: personName } },
  }) : [];
  return <div className="dashboard-overview">
    <DashboardHeading title={editableDraft ? "Draf jurnal terapi" : "Jurnal terapi"} description={row.patient.user.name + " · " + longDate(row.therapyAt)}
      action={<Link className="button button-secondary" href={audience === Role.PATIENT ? "/patient/history" : "/doctor/patients/" + row.patientId}>Kembali</Link>} />
    {editableDraft
      ? <WorkPanel title="Lanjutkan draf"><Editor row={row} patients={[]} appointments={await availableAppointments(actor.id, row.patientId, row.appointmentId)} /></WorkPanel>
      : <JournalContents row={row} />}
    {own && !editableDraft && <WorkPanel title="Koreksi dan riwayat versi">
      <details className="work-form"><summary className="text-link">Koreksi jurnal final</summary><Editor row={row} patients={[]} appointments={[]} /></details>
      {revisions.length > 0 && <ul className="dashboard-list">{revisions.map(item => <li key={item.id}>
        <strong>Versi {item.previousVersion} → {item.version}</strong>
        <span className="dashboard-meta">{item.author.user.name} · {formatDate(item.createdAt)} {formatTime(item.createdAt)} WIB</span>
        <p className="work-copy">{item.reason}</p>
      </li>)}</ul>}
    </WorkPanel>}
  </div>;
}

export async function DoctorJournals({ query }: { query: Query }) {
  const doctor = await requireUser(Role.DOCTOR);
  const db = database();
  const page = pageNumber(query);
  const filter = first(query.status);
  const where = { doctorId: doctor.id, patient: assignedPatient(doctor.id),
    status: filter === JournalStatus.DRAFT || filter === JournalStatus.FINALIZED ? filter : undefined };
  const [count, rows] = await Promise.all([
    db.therapySession.count({ where }),
    db.therapySession.findMany({
      where, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, therapyAt: true, status: true, patient: { select: personName } },
    }),
  ]);
  return <div className="dashboard-overview">
    <DashboardHeading title="Jurnal terapi" description="Kelola draf dan jurnal final pasien yang ditugaskan."
      action={<Link className="button button-primary" href="/doctor/journals/new">Jurnal baru</Link>} />
    <WorkPanel title="Daftar jurnal">
      <form className="work-filter" method="get">
        <Field as="select" name="status" label="Status" defaultValue={filter}><option value="">Semua</option><option value="DRAFT">Draf</option><option value="FINALIZED">Final</option></Field>
        <button className="button button-secondary">Terapkan</button>
      </form>
      {!rows.length ? <DashboardEmpty>Belum ada jurnal dalam daftar ini.</DashboardEmpty> : <table className="dashboard-table">
        <thead><tr><th scope="col">Pasien</th><th scope="col">Tanggal sesi</th><th scope="col">Status</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.id}>
          <td><Link className="text-link" href={"/doctor/journals/" + row.id}>{row.patient.user.name}</Link></td>
          <td>{formatDate(row.therapyAt)}</td><td>{row.status === JournalStatus.DRAFT ? "Draf" : "Final"}</td>
        </tr>)}</tbody>
      </table>}
      <Pagination query={query} total={count} page={page} size={pageSize} />
    </WorkPanel>
  </div>;
}

export async function DoctorPatients({ query }: { query: Query }) {
  const doctor = await requireUser(Role.DOCTOR);
  const db = database();
  const page = pageNumber(query);
  const q = first(query.q).trim().slice(0, 100);
  const scope = assignedPatient(doctor.id);
  const where = { ...scope, user: { ...scope.user, name: q ? { contains: q } : undefined } };
  const [count, rows] = await Promise.all([
    db.patientProfile.count({ where }),
    db.patientProfile.findMany({
      where, orderBy: [{ user: { name: "asc" } }, { userId: "asc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: { ...personName, _count: { select: { therapySessions: { where: { status: JournalStatus.FINALIZED } } } } },
    }),
  ]);
  return <div className="dashboard-overview">
    <DashboardHeading title="Pasien saya" description="Buka detail pasien untuk meninjau penugasan, jadwal, dan catatan terapi." />
    <WorkPanel title="Penugasan aktif">
      <form className="work-filter" method="get"><Field name="q" label="Cari nama pasien" defaultValue={q} /><button className="button button-secondary">Cari</button></form>
      {!rows.length ? <DashboardEmpty>Belum ada pasien dengan penugasan aktif yang cocok.</DashboardEmpty> : <table className="dashboard-table">
        <thead><tr><th scope="col">Pasien</th><th scope="col">Jurnal final</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.user.id}>
          <td><Link className="text-link" href={"/doctor/patients/" + row.user.id}>{row.user.name}</Link></td>
          <td>{row._count.therapySessions || "Belum ada"}</td>
        </tr>)}</tbody>
      </table>}
      <Pagination query={query} total={count} page={page} size={pageSize} />
    </WorkPanel>
  </div>;
}

export async function DoctorPatientDetails({ id, query }: { id: string; query: Query }) {
  const doctor = await requireUser(Role.DOCTOR);
  if (!idField.safeParse(id).success) notFound();
  const patient = await activeDoctorPatient(doctor.id, id);
  if (!patient) notFound();
  const db = database();
  const page = pageNumber(query);
  const where = { patientId: id, patient: assignedPatient(doctor.id), OR: [{ doctorId: doctor.id }, { status: JournalStatus.FINALIZED }] };
  const [count, sessions, appointments] = await Promise.all([
    db.therapySession.count({ where }),
    db.therapySession.findMany({
      where, orderBy: [{ therapyAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, therapyAt: true, status: true, doctor: { select: personName } },
    }),
    db.appointment.findMany({
      where: { doctorId: doctor.id, patientId: id, patient: assignedPatient(doctor.id) }, orderBy: [{ startAt: "desc" }, { id: "desc" }], take: 5,
      select: { id: true, startAt: true, status: true, journal: { select: { id: true, status: true } } },
    }),
  ]);
  const base = "/doctor/patients/" + id;
  return <div className="dashboard-overview">
    <DashboardHeading title={patient.user.name} description="Pasien dalam penugasan aktif." action={<Link className="button button-primary" href={"/doctor/journals/new?patient=" + id}>Mulai pemeriksaan</Link>} />
    <div className="button-row">
      <Link className="button button-secondary" href={"/doctor/appointments/new?patient=" + id + "&date=" + dayKey(new Date())}>Buat jadwal</Link>
      <Link className="button button-secondary" href={base + "/progress"}>Perkembangan ROM</Link>
    </div>
    <div className="dashboard-columns">
      <WorkPanel title="Riwayat sesi">
        {!sessions.length ? <DashboardEmpty>Belum ada riwayat. Catat keluhan utama dan pemeriksaan awal pada jurnal kontrol pertama.</DashboardEmpty>
          : <ul className="dashboard-list">{sessions.map(item => <li key={item.id}>
            <Link className="text-link" href={"/doctor/journals/" + item.id}>{longDate(item.therapyAt)}</Link>
            <span className="dashboard-meta">{item.doctor.user.name} · {item.status === JournalStatus.FINALIZED ? "Final" : "Draf"}</span>
          </li>)}</ul>}
        <Pagination query={query} page={page} size={pageSize} total={count} />
      </WorkPanel>
      <WorkPanel title="Jadwal terbaru">
        {!appointments.length ? <DashboardEmpty>Belum ada jadwal untuk pasien ini.</DashboardEmpty>
          : <ul className="dashboard-list">{appointments.map(item => <li key={item.id}>
            <Link className="text-link" href={"/doctor/appointments/" + item.id}>{longDate(item.startAt)}</Link>
            <span className="dashboard-meta">{formatTime(item.startAt)} WIB · {appointmentLabels[item.status]}</span>
            {item.journal ? <Link className="text-link" href={"/doctor/journals/" + item.journal.id}>{item.journal.status === JournalStatus.DRAFT ? "Lanjutkan draf" : "Baca jurnal final"}</Link>
              : (item.status === AppointmentStatus.SCHEDULED || item.status === AppointmentStatus.COMPLETED) &&
              <Link className="text-link" href={"/doctor/journals/new?patient=" + id + "&appointment=" + item.id}>Mulai pemeriksaan dari jadwal</Link>}
          </li>)}</ul>}
      </WorkPanel>
    </div>
  </div>;
}
