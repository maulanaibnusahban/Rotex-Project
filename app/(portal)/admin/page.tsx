import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Plus,
  Stethoscope,
  UserCheck,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { roleLabel } from "@/src/features/auth/session";
import {
  auditLabels,
  formatDate,
  formatTime,
  getAdminOverview,
} from "@/src/features/dashboard/overview";
import {
  AppointmentPreview,
  DashboardEmpty,
  DashboardHeading,
  DashboardMetrics,
  DashboardPanel,
} from "@/src/features/dashboard/sections";

export const metadata: Metadata = { title: "Dashboard Administrator" };

export default async function AdminPage() {
  const data = await getAdminOverview();

  return (
    <div className="dashboard-overview">
      <DashboardHeading
        title="Ikhtisar Administrasi & Operasional"
        description="Pantau alokasi penugasan dokter-pasien, status akun aktif, dan jadwal terapi klinik."
        action={
          <div className="heading-quick-actions">
            <Link className="button button-primary" href="/admin/doctors/new">
              <Plus size={15} aria-hidden="true" />
              <span>Tambah Dokter</span>
            </Link>
            <Link className="button button-secondary" href="/admin/assignments">
              <UserCheck size={15} aria-hidden="true" />
              <span>Kelola Penugasan</span>
            </Link>
          </div>
        }
      />

      <DashboardMetrics
        items={[
          {
            label: "Dokter Terdaftar",
            icon: Stethoscope,
            value: data.doctorCount,
            hint: "Tenaga medis",
          },
          {
            label: "Pasien Terdaftar",
            icon: UsersRound,
            value: data.patientCount,
            hint: "Subjek rehabilitasi",
          },
          {
            label: "Akun Aktif",
            icon: BadgeCheck,
            value: data.activeCount,
            hint: "Dapat masuk",
          },
          {
            label: "Penugasan Berjalan",
            icon: UserRoundCheck,
            value: data.assignmentCount,
            hint: "Relasi aktif",
          },
        ]}
      />

      <div className="dashboard-columns">
        <DashboardPanel
          id="jadwal"
          title="Jadwal Terapi Mendatang"
          badge={data.upcoming.length}
          action={
            <Link className="panel-action-link" href="/admin/appointments">
              Lihat Kalender &rarr;
            </Link>
          }
        >
          <AppointmentPreview
            rows={data.upcoming.map((row) => ({
              ...row,
              name: row.patient.user.name,
              secondaryName: `Dokter: ${row.doctor.user.name}`,
            }))}
            nameLabel="Pasien / Dokter Pendamping"
            empty="Belum ada jadwal terapi mendatang yang diagendakan."
          />
        </DashboardPanel>

        <DashboardPanel
          id="aktivitas"
          title="Log Aktivitas Sistem"
          badge={data.activity.length}
          action={
            <Link className="panel-action-link" href="/admin/audit">
              Semua Log &rarr;
            </Link>
          }
        >
          {data.activity.length === 0 ? (
            <DashboardEmpty>Belum ada aktivitas administrasi yang tercatat.</DashboardEmpty>
          ) : (
            <ul className="dashboard-activity-list">
              {data.activity.map(({ id, action, createdAt, actor }) => (
                <li key={id} className="activity-item">
                  <div className="activity-main">
                    <strong className="activity-action">{auditLabels[action]}</strong>
                    <span className="activity-meta">
                      Oleh <strong>{actor.name}</strong> &middot; {formatDate(createdAt)} &middot;{" "}
                      {formatTime(createdAt)} WIB
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>

      <DashboardPanel
        id="akun"
        title="Daftar Akun Pengguna Terbaru"
        badge={data.recentAccounts.length}
        action={
          <div className="panel-btn-group">
            <Link className="text-link text-sm" href="/admin/doctors">
              Daftar Dokter
            </Link>
            <span className="text-muted" aria-hidden="true">&middot;</span>
            <Link className="text-link text-sm" href="/admin/patients">
              Daftar Pasien
            </Link>
          </div>
        }
      >
        {data.recentAccounts.length === 0 ? (
          <DashboardEmpty>Belum ada akun dokter atau pasien yang terdaftar.</DashboardEmpty>
        ) : (
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th scope="col">Nama Lengkap</th>
                  <th scope="col">Peran Sistem</th>
                  <th scope="col">Status Akun</th>
                  <th scope="col" className="text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <strong className="table-person-name">{account.name}</strong>
                    </td>
                    <td>
                      <span className={`role-badge role-badge-${account.role.toLowerCase()}`}>
                        {roleLabel[account.role]}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-pill"
                        data-status={account.isActive ? "active" : "inactive"}
                      >
                        <span className="status-dot" />
                        {account.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        className="text-link text-sm"
                        href={account.role === "DOCTOR" ? `/admin/doctors/${account.id}` : `/admin/assignments`}
                      >
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}
