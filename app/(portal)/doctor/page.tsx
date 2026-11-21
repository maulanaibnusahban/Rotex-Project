import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ClipboardList, UsersRound } from "lucide-react";
import { formatDate, getDoctorOverview } from "@/src/features/dashboard/overview";
import { AppointmentPreview, DashboardEmpty, DashboardHeading, DashboardMetrics, DashboardPanel } from "@/src/features/dashboard/sections";

export const metadata: Metadata = { title: "Dashboard Dokter" };

export default async function DoctorPage() {
  const data = await getDoctorOverview();
  return (
    <div className="dashboard-overview">
      <DashboardHeading title="Ringkasan praktik" description={`Selamat datang, ${data.name}.`} />
      <DashboardMetrics items={[
        { label: "Pasien ditugaskan", icon: UsersRound, value: data.patientCount },
        { label: "Jadwal hari ini", icon: CalendarDays, value: data.todayCount },
        { label: "Draft jurnal", icon: ClipboardList, value: data.draftCount },
      ]} />
      <div className="dashboard-columns">
        <DashboardPanel id="jadwal" title={`Agenda hari ini · ${data.dateLabel}`}>
          <AppointmentPreview
            rows={data.appointments.map((row) => ({ ...row, name: row.patient.user.name }))}
            nameLabel="Pasien"
            empty="Belum ada jadwal terapi hari ini untuk pasien yang ditugaskan kepada Anda."
          />
        </DashboardPanel>
        <DashboardPanel id="pasien" title="Pasien ditugaskan">
          {data.patients.length === 0 ? <DashboardEmpty>Pasien akan tampil setelah administrator membuat penugasan.</DashboardEmpty> : (
            <ul className="dashboard-list">
              {data.patients.map(({ userId, user }) => <li key={userId}><Link className="text-link" href={"/doctor/patients/" + userId}>{user.name}</Link></li>)}
            </ul>
          )}
        </DashboardPanel>
      </div>
      <DashboardPanel id="draft" title="Draft jurnal terbaru">
        {data.drafts.length === 0 ? <DashboardEmpty>Belum ada draft jurnal untuk pasien yang ditugaskan kepada Anda.</DashboardEmpty> : (
          <table className="dashboard-table">
            <thead><tr><th scope="col">Pasien</th><th scope="col">Tanggal sesi</th><th scope="col">Diperbarui</th></tr></thead>
            <tbody>
              {data.drafts.map((draft) => (
                <tr key={draft.id}>
                  <td><Link className="text-link" href={"/doctor/journals/" + draft.id}>{draft.patient.user.name}</Link></td><td><time dateTime={draft.therapyAt.toISOString()}>{formatDate(draft.therapyAt)}</time></td>
                  <td><time dateTime={draft.updatedAt.toISOString()}>{formatDate(draft.updatedAt)}</time></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashboardPanel>
    </div>
  );
}
