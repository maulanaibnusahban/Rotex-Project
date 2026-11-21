import type { Metadata } from "next";
import { BadgeCheck, Stethoscope, UserRoundCheck, UsersRound } from "lucide-react";
import { roleLabel } from "@/src/features/auth/session";
import { auditLabels, formatDate, formatTime, getAdminOverview } from "@/src/features/dashboard/overview";
import { AppointmentPreview, DashboardEmpty, DashboardHeading, DashboardMetrics, DashboardPanel } from "@/src/features/dashboard/sections";

export const metadata: Metadata = { title: "Dashboard Administrator" };

export default async function AdminPage() {
  const data = await getAdminOverview();
  return (
    <div className="dashboard-overview">
      <DashboardHeading title="Ringkasan administrasi" description="Pantau akun, penugasan dokter, dan jadwal terapi." />
      <DashboardMetrics items={[
        { label: "Akun dokter", icon: Stethoscope, value: data.doctorCount },
        { label: "Akun pasien", icon: UsersRound, value: data.patientCount },
        { label: "Akun aktif", icon: BadgeCheck, value: data.activeCount },
        { label: "Penugasan aktif", icon: UserRoundCheck, value: data.assignmentCount },
      ]} />
      <div className="dashboard-columns">
        <DashboardPanel id="jadwal" title="Jadwal mendatang">
          <AppointmentPreview
            rows={data.upcoming.map((row) => ({ ...row, name: row.patient.user.name, secondaryName: row.doctor.user.name }))}
            nameLabel="Pasien / dokter"
            empty="Belum ada jadwal terapi mendatang."
          />
        </DashboardPanel>
        <DashboardPanel id="aktivitas" title="Aktivitas administrasi">
          {data.activity.length === 0 ? <DashboardEmpty>Belum ada aktivitas administrasi yang tercatat.</DashboardEmpty> : (
            <ul className="dashboard-list">
              {data.activity.map(({ id, action, createdAt, actor }) => (
                <li key={id}>
                  <strong>{auditLabels[action]}</strong>
                  <span className="dashboard-meta">{actor.name} · {formatDate(createdAt)} · {formatTime(createdAt)} WIB</span>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>
      <DashboardPanel id="akun" title="Akun terbaru">
        {data.recentAccounts.length === 0 ? <DashboardEmpty>Belum ada akun dokter atau pasien.</DashboardEmpty> : (
          <table className="dashboard-table">
            <thead><tr><th scope="col">Nama</th><th scope="col">Peran</th><th scope="col">Status</th></tr></thead>
            <tbody>
              {data.recentAccounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.name}</td><td>{roleLabel[account.role]}</td>
                  <td><span className="dashboard-status" data-status={account.isActive ? "active" : undefined}>{account.isActive ? "Aktif" : "Nonaktif"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashboardPanel>
    </div>
  );
}
