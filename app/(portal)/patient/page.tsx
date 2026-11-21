import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ClipboardList, Stethoscope } from "lucide-react";
import { formatDate, getPatientOverview } from "@/src/features/dashboard/overview";
import { AppointmentPreview, DashboardEmpty, DashboardHeading, DashboardMetrics, DashboardPanel } from "@/src/features/dashboard/sections";
import { PatientChartPreview } from "@/src/features/rehab/progress-views";

export const metadata: Metadata = { title: "Dashboard Pasien" };

export default async function PatientPage() {
  const data = await getPatientOverview();
  const nextAppointment = data.upcoming[0];
  const firstDoctor = data.doctors[0];

  return (
    <div className="dashboard-overview">
      <DashboardHeading
        title={`Selamat datang, ${data.name}`}
        description="Lihat jadwal terapi, dokter pendamping, dan hasil sesi Anda."
        action={<Link className="button button-secondary" href="/patient/profile">Profil saya</Link>}
      />
      <DashboardMetrics items={[
        { label: "Terapi berikutnya", icon: CalendarDays, value: nextAppointment ? formatDate(nextAppointment.startAt) : "Belum dijadwalkan" },
        { label: "Dokter pendamping", icon: Stethoscope, value: firstDoctor ? (data.doctors.length > 1 ? "Lebih dari satu dokter" : firstDoctor.user.name) : "Belum ditugaskan" },
        { label: "Jurnal tersedia", icon: ClipboardList, value: data.journalCount },
      ]} />
      <div className="dashboard-columns">
        <DashboardPanel id="jadwal" title="Jadwal terapi mendatang">
          <AppointmentPreview rows={data.upcoming.map((row) => ({ ...row, name: row.doctor.user.name }))} nameLabel="Dokter" empty="Jadwal akan tampil setelah dokter mengatur sesi terapi Anda." />
        </DashboardPanel>
        <DashboardPanel id="dokter" title="Dokter pendamping">
          {data.doctors.length === 0 ? <DashboardEmpty>Anda belum ditugaskan kepada dokter.</DashboardEmpty> : (
            <ul className="dashboard-list">
              {data.doctors.map(({ userId, user }) => <li key={userId}>{user.name}</li>)}
            </ul>
          )}
        </DashboardPanel>
      </div>
      <DashboardPanel id="jurnal" title="Jurnal terapi terbaru">
        {data.journals.length === 0 ? <DashboardEmpty>Ringkasan sesi akan tampil setelah jurnal Anda difinalisasi oleh dokter.</DashboardEmpty> : (
          <table className="dashboard-table">
            <thead><tr><th scope="col">Tanggal sesi</th><th scope="col">Dokter</th><th scope="col">Jumlah ROM</th></tr></thead>
            <tbody>
              {data.journals.map((journal) => (
                <tr key={journal.id}>
                  <td><Link className="text-link" href={"/patient/journals/" + journal.id}><time dateTime={journal.therapyAt.toISOString()}>{formatDate(journal.therapyAt)}</time></Link></td>
                  <td>{journal.doctor.user.name}</td><td>{journal._count.measurements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashboardPanel>
      <PatientChartPreview />
    </div>
  );
}
