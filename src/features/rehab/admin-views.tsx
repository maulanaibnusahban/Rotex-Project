import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentStatus, AuditScope, Prisma, Role } from "@prisma/client";
import { database } from "@/src/lib/db";
import { requireUser } from "@/src/features/auth/session";
import { DashboardEmpty, DashboardHeading } from "@/src/features/dashboard/sections";
import { auditLabels } from "@/src/features/dashboard/overview";
import { createAssignment, createDoctor, editDoctor, endAssignment, setAccountStatus } from "./admin-actions";
import { activeAssignment, first, formatDate, formatTime, idField, longDate, pageNumber, pageSize, personName, type Query } from "./core";
import { intervalLabel } from "./appointment-calendar";
import { Field, WorkForm } from "./work-form";
import { Pagination, WorkPanel } from "./view";

export async function AccountList({ role, query }: { role: "DOCTOR" | "PATIENT"; query: Query }) {
  await requireUser(Role.ADMIN);
  const db = database();
  const doctors = role === Role.DOCTOR;
  const page = pageNumber(query);
  const q = first(query.q).trim().slice(0, 100);
  const status = first(query.status);
  const where: Prisma.UserWhereInput = {
    role,
    isActive: status === "active" ? true : status === "inactive" ? false : undefined,
    OR: q ? [{ name: { contains: q } }, { email: { contains: q } }] : undefined,
  };
  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where, orderBy: [{ name: "asc" }, { id: "asc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: {
        id: true, name: true, email: true, isActive: true,
        doctorProfile: { select: { _count: { select: { assignments: { where: { ...activeAssignment(), patient: { user: { isActive: true } } } } } } } },
        patientProfile: { select: { assignments: { where: { ...activeAssignment(), doctor: { user: { isActive: true } } }, select: { doctor: { select: personName } } } } },
      },
    }),
  ]);
  return <div className="dashboard-overview">
    <DashboardHeading title={doctors ? "Manajemen dokter" : "Manajemen pasien"}
      description={doctors ? "Kelola akun yang menangani terapi." : "Kelola akun pasien yang sudah terdaftar."}
      action={doctors ? <Link className="button button-primary" href="/admin/doctors/new">Tambah Dokter</Link> : undefined} />
    <WorkPanel title={doctors ? "Daftar dokter" : "Daftar pasien"}>
      <form className="work-filter" method="get">
        <Field name="q" label="Cari nama atau email" defaultValue={q} />
        <Field as="select" name="status" label="Status" defaultValue={status}>
          <option value="">Semua</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option>
        </Field>
        <button className="button button-secondary">Terapkan</button>
      </form>
      {users.length === 0 ? <DashboardEmpty>Tidak ada akun yang cocok.</DashboardEmpty> :
        <table className="dashboard-table work-table">
          <thead><tr><th scope="col">Akun</th><th scope="col">{doctors ? "Pasien aktif" : "Dokter pendamping"}</th><th scope="col">Status</th><th scope="col">Aksi</th></tr></thead>
          <tbody>{users.map(user => <tr key={user.id}>
            <td>{user.name}<span className="dashboard-meta">{user.email}</span></td>
            <td>{doctors ? user.doctorProfile?._count.assignments ?? 0
              : user.patientProfile?.assignments.map(item => item.doctor.user.name).join(", ") || "Belum ditugaskan"}</td>
            <td><span className="dashboard-status" data-status={user.isActive ? "active" : undefined}>{user.isActive ? "Aktif" : "Nonaktif"}</span></td>
            <td className="work-row-actions">
              {doctors ? <Link className="text-link" href={"/admin/doctors/" + user.id}>Ubah</Link>
                : user.isActive && <Link className="text-link" href={"/admin/assignments?patient=" + user.id}>
                  {user.patientProfile?.assignments.length ? "Lihat penugasan" : "Tugaskan dokter"}
                </Link>}
              <WorkForm action={setAccountStatus} confirmation={user.isActive ? "Nonaktifkan akun ini? Sesi masuknya akan ditutup." : undefined}>
                <input type="hidden" name="id" value={user.id} /><input type="hidden" name="active" value={String(!user.isActive)} />
                <button className="text-link" type="submit">{user.isActive ? "Nonaktifkan" : "Aktifkan"}</button>
              </WorkForm>
            </td>
          </tr>)}</tbody>
        </table>}
      <Pagination query={query} page={page} size={pageSize} total={total} />
    </WorkPanel>
  </div>;
}

export async function DoctorEditor({ id }: { id?: string }) {
  await requireUser(Role.ADMIN);
  const doctor = id && idField.safeParse(id).success
    ? await database().user.findFirst({ where: { id, role: Role.DOCTOR }, select: { id: true, name: true, email: true } }) : null;
  if (id && !doctor) notFound();
  return <div className="dashboard-overview">
    <DashboardHeading title={doctor ? "Ubah akun dokter" : "Tambah dokter"} description="Akun ini memiliki akses ke pasien dalam penugasan aktif." />
    <WorkPanel title="Informasi akun">
      <WorkForm action={doctor ? editDoctor : createDoctor} className="work-form">
        {doctor && <input type="hidden" name="id" value={doctor.id} />}
        <Field name="name" label="Nama lengkap" defaultValue={doctor?.name} required maxLength={100} />
        <Field name="email" label="Alamat email" type="email" defaultValue={doctor?.email} required maxLength={254} />
        {!doctor && <Field name="password" label="Kata sandi awal (minimal 8 karakter)" type="password" autoComplete="new-password" required maxLength={128} />}
        <div className="button-row"><button className="button button-primary">Simpan akun</button><Link className="button button-secondary" href="/admin/doctors">Kembali</Link></div>
      </WorkForm>
    </WorkPanel>
  </div>;
}

export async function AssignmentList({ query }: { query: Query }) {
  await requireUser(Role.ADMIN);
  const db = database();
  const page = pageNumber(query);
  const checked = idField.safeParse(first(query.patient));
  const patientId = checked.success ? checked.data : undefined;
  const where = { patientId };
  const [doctors, patients, total, rows] = await Promise.all([
    db.doctorProfile.findMany({ where: { user: { role: Role.DOCTOR, isActive: true } }, select: personName, orderBy: { user: { name: "asc" } } }),
    db.patientProfile.findMany({ where: { user: { role: Role.PATIENT, isActive: true } }, select: personName, orderBy: { user: { name: "asc" } } }),
    db.patientAssignment.count({ where }),
    db.patientAssignment.findMany({
      where, orderBy: [{ startedAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, startedAt: true, endedAt: true, doctor: { select: personName }, patient: { select: personName }, assignedBy: { select: { name: true } } },
    }),
  ]);
  return <div className="dashboard-overview">
    <DashboardHeading title="Penugasan dokter dan pasien" description="Tautkan pasien dengan dokter yang bertanggung jawab dan tinjau riwayatnya." />
    <WorkPanel title="Buat penugasan">
      {!doctors.length ? <DashboardEmpty>Belum ada dokter aktif. <Link className="text-link" href="/admin/doctors/new">Tambah dokter</Link></DashboardEmpty>
        : !patients.length ? <DashboardEmpty>Belum ada akun pasien aktif yang bisa ditugaskan.</DashboardEmpty> :
        <WorkForm className="work-form" action={createAssignment}>
          <div className="work-grid">
            <Field as="select" name="patientId" label="Pasien" required defaultValue={patients.some(row => row.user.id === patientId) ? patientId : ""}>
              <option value="">Pilih pasien</option>{patients.map(row => <option key={row.user.id} value={row.user.id}>{row.user.name}</option>)}
            </Field>
            <Field as="select" name="doctorId" label="Dokter" required defaultValue="">
              <option value="">Pilih dokter</option>{doctors.map(row => <option key={row.user.id} value={row.user.id}>{row.user.name}</option>)}
            </Field>
          </div>
          <button className="button button-primary">Buat penugasan</button>
        </WorkForm>}
    </WorkPanel>
    <WorkPanel title="Riwayat penugasan">
      {patientId && <div className="work-filter"><Link className="text-link" href="/admin/assignments">Tampilkan semua pasien</Link></div>}
      {rows.length === 0 ? <DashboardEmpty>Belum ada penugasan yang tercatat.</DashboardEmpty> :
        <table className="dashboard-table work-table">
          <thead><tr><th scope="col">Pasien / dokter</th><th scope="col">Periode (WIB)</th><th scope="col">Ditugaskan oleh</th><th scope="col">Aksi</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.id}>
            <td>{row.patient.user.name}<span className="dashboard-meta">{row.doctor.user.name}</span></td>
            <td>{formatDate(row.startedAt)}<span className="dashboard-meta">{row.endedAt ? "Berakhir " + formatDate(row.endedAt) : "Aktif"}</span></td>
            <td>{row.assignedBy.name}</td>
            <td>{!row.endedAt && <Link className="text-link" href={"/admin/assignments/" + row.id}>Tinjau untuk akhiri</Link>}</td>
          </tr>)}</tbody>
        </table>}
      <Pagination query={query} page={page} size={pageSize} total={total} />
    </WorkPanel>
  </div>;
}

export async function ReviewAssignmentEnd({ id, query }: { id: string; query: Query }) {
  await requireUser(Role.ADMIN);
  if (!idField.safeParse(id).success) notFound();
  const db = database();
  const assignment = await db.patientAssignment.findUnique({
    where: { id }, select: { doctorId: true, patientId: true, endedAt: true, doctor: { select: personName }, patient: { select: personName } },
  });
  if (!assignment) notFound();
  const back = "/admin/assignments?patient=" + assignment.patientId;
  const page = pageNumber(query);
  const where = {
    doctorId: assignment.doctorId, patientId: assignment.patientId, endAt: { gt: new Date() }, status: AppointmentStatus.SCHEDULED,
  };
  const [total, rows] = await Promise.all([
    db.appointment.count({ where }),
    db.appointment.findMany({
      where, orderBy: [{ startAt: "asc" }, { id: "asc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, startAt: true, endAt: true },
    }),
  ]);
  return <div className="dashboard-overview">
    <DashboardHeading title="Tinjau akhir penugasan" description={assignment.patient.user.name + " · " + assignment.doctor.user.name}
      action={<Link className="button button-secondary" href={back}>Kembali ke penugasan</Link>} />
    <WorkPanel title="Janji terapi yang terdampak">
      {!total ? <DashboardEmpty>Pasangan ini tidak mempunyai janji aktif yang akan datang atau sedang berlangsung.</DashboardEmpty>
        : <>
          <p className="work-panel-note">{total} janji masih aktif. Setelah penugasan berakhir, pasien tetap melihat jadwalnya. Tinjau atau batalkan janji dari detail jadwal jika perlu.</p>
          <ul className="dashboard-list">{rows.map(row => <li key={row.id}>
            <Link className="text-link" href={"/admin/appointments/" + row.id}>{longDate(row.startAt)}</Link>
            <span className="dashboard-meta">{intervalLabel(row)}</span>
          </li>)}</ul>
          <Pagination query={query} page={page} size={pageSize} total={total} />
        </>}
    </WorkPanel>
    <WorkPanel title="Konfirmasi penugasan">
      {assignment.endedAt ? <DashboardEmpty>Penugasan ini sudah berakhir.</DashboardEmpty>
        : <WorkForm action={endAssignment} className="work-form" confirmation="Akhiri penugasan dokter untuk pasien ini?">
          <input type="hidden" name="id" value={id} />
          <button className="button button-secondary">Akhiri penugasan</button>
        </WorkForm>}
    </WorkPanel>
  </div>;
}

export async function AuditList({ query }: { query: Query }) {
  await requireUser(Role.ADMIN);
  const db = database();
  const page = pageNumber(query);
  const where = { scope: AuditScope.ADMINISTRATIVE };
  const [total, rows] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, action: true, createdAt: true, actor: { select: { name: true } } } }),
  ]);
  return <div className="dashboard-overview">
    <DashboardHeading title="Aktivitas administratif" description="Tinjau perubahan akun, penugasan, dan jadwal." />
    <WorkPanel title="Audit">
      {!rows.length ? <DashboardEmpty>Belum ada aktivitas administratif.</DashboardEmpty> :
        <table className="dashboard-table"><thead><tr><th scope="col">Tindakan</th><th scope="col">Pelaku</th><th scope="col">Waktu (WIB)</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.id}>
            <td>{auditLabels[row.action]}</td><td>{row.actor.name}</td><td>{formatDate(row.createdAt)} {formatTime(row.createdAt)}</td>
          </tr>)}</tbody>
        </table>}
      <Pagination query={query} page={page} size={pageSize} total={total} />
    </WorkPanel>
  </div>;
}
