import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { formatDate, getPatientOverview } from "@/src/features/dashboard/overview";
import {
  AppointmentPreview,
  DashboardEmpty,
  DashboardHeading,
  DashboardMetrics,
  DashboardPanel,
} from "@/src/features/dashboard/sections";
import { PatientChartPreview } from "@/src/features/rehab/progress-views";

export const metadata: Metadata = { title: "Dashboard Pasien" };

export default async function PatientPage() {
  const data = await getPatientOverview();
  const nextAppointment = data.upcoming[0];
  const firstDoctor = data.doctors[0];

  return (
    <div className="dashboard-overview">
      <DashboardHeading
        title={`Selamat Datang, ${data.name}`}
        description="Pantau jadwal sesi rehabilitasi, evaluasi dokter spesialis, dan riwayat perkembangan rentang gerak Anda."
        action={
          <div className="heading-quick-actions">
            <Link className="button button-secondary" href="/patient/profile">
              <UserRound size={16} aria-hidden="true" />
              <span>Profil Saya</span>
            </Link>
          </div>
        }
      />

      <DashboardMetrics
        items={[
          {
            label: "Sesi Terapi Terdekat",
            icon: CalendarDays,
            value: nextAppointment ? formatDate(nextAppointment.startAt) : "Belum dijadwalkan",
            hint: nextAppointment ? "Terjadwal" : "Menunggu jadwal",
          },
          {
            label: "Dokter Pendamping",
            icon: Stethoscope,
            value: firstDoctor
              ? data.doctors.length > 1
                ? `${firstDoctor.user.name} (+${data.doctors.length - 1})`
                : firstDoctor.user.name
              : "Menunggu Penugasan",
            hint: firstDoctor ? "Dokter aktif" : "Admin klinik",
          },
          {
            label: "Jurnal Sesi Tersedia",
            icon: ClipboardList,
            value: data.journalCount,
            hint: "Dapat dibaca penuh",
          },
        ]}
      />

      {data.doctors.length === 0 && (
        <div className="patient-notice-banner">
          <Info size={20} className="notice-icon" aria-hidden="true" />
          <div className="notice-content">
            <strong>Penugasan Dokter Sedang Diproses</strong>
            <p>
              Akun Anda telah aktif. Administrator klinik akan segera menghubungkan dokter penanggung jawab untuk menyusun jadwal dan program terapi rehabilitasi bahu Anda.
            </p>
          </div>
        </div>
      )}

      <div className="dashboard-columns">
        <DashboardPanel
          id="jadwal"
          title="Jadwal Terapi Mendatang"
          badge={data.upcoming.length}
          action={
            <Link className="panel-action-link" href="/patient/appointments">
              Semua Jadwal &rarr;
            </Link>
          }
        >
          <AppointmentPreview
            rows={data.upcoming.map((row) => ({
              ...row,
              name: `dr. ${row.doctor.user.name}`,
            }))}
            nameLabel="Dokter Pendamping"
            empty="Belum ada jadwal sesi terapi mendatang yang diagendakan dokter."
          />
        </DashboardPanel>

        <DashboardPanel
          id="dokter"
          title="Dokter Pendamping Anda"
          badge={data.doctors.length}
        >
          {data.doctors.length === 0 ? (
            <DashboardEmpty>
              Anda belum ditugaskan kepada dokter. Hubungi administrator klinik jika memerlukan bantuan.
            </DashboardEmpty>
          ) : (
            <ul className="dashboard-doctor-list">
              {data.doctors.map(({ userId, user }) => (
                <li key={userId} className="doctor-card-item">
                  <div className="doctor-avatar-badge">
                    <Stethoscope size={18} aria-hidden="true" />
                  </div>
                  <div className="doctor-meta">
                    <strong>dr. {user.name}</strong>
                    <span>Dokter Penanggung Jawab Sesi</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>

      <DashboardPanel
        id="jurnal"
        title="Catatan Jurnal Sesi Terbaru (Finalized)"
        badge={data.journals.length}
        action={
          <Link className="panel-action-link" href="/patient/history">
            Riwayat Lengkap &rarr;
          </Link>
        }
      >
        {data.journals.length === 0 ? (
          <DashboardEmpty>
            Catatan sesi terapi akan tampil di sini setelah dokter memfinalisasi jurnal pemeriksaan Anda.
          </DashboardEmpty>
        ) : (
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th scope="col">Tanggal Sesi Terapi</th>
                  <th scope="col">Dokter Pemeriksa</th>
                  <th scope="col">Pengukuran ROM</th>
                  <th scope="col">Status Catatan</th>
                  <th scope="col" className="text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {data.journals.map((journal) => (
                  <tr key={journal.id}>
                    <td>
                      <strong className="table-time-primary">
                        {formatDate(journal.therapyAt)}
                      </strong>
                    </td>
                    <td>dr. {journal.doctor.user.name}</td>
                    <td>
                      <span className="measurement-count-badge">
                        <Activity size={13} aria-hidden="true" />
                        {journal._count.measurements} Gerakan
                      </span>
                    </td>
                    <td>
                      <span className="status-pill status-finalized">
                        <CheckCircle2 size={12} aria-hidden="true" />
                        FINAL
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        className="button button-sm button-secondary"
                        href={`/patient/journals/${journal.id}`}
                      >
                        <FileText size={14} aria-hidden="true" />
                        <span>Baca Catatan</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardPanel>

      <PatientChartPreview />
    </div>
  );
}
