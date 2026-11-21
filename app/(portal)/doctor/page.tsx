import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  FileEdit,
  Plus,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { formatDate, getDoctorOverview } from "@/src/features/dashboard/overview";
import {
  AppointmentPreview,
  DashboardEmpty,
  DashboardHeading,
  DashboardMetrics,
  DashboardPanel,
} from "@/src/features/dashboard/sections";

export const metadata: Metadata = { title: "Dashboard Dokter" };

export default async function DoctorPage() {
  const data = await getDoctorOverview();

  return (
    <div className="dashboard-overview">
      <DashboardHeading
        title="Ikhtisar Praktik & Pasien"
        description={`Selamat datang, dr. ${data.name}. Pantau jadwal sesi dan kelola jurnal hasil terapi.`}
        action={
          <div className="heading-quick-actions">
            <Link className="button button-primary" href="/doctor/journals/new">
              <Plus size={15} aria-hidden="true" />
              <span>Catat Jurnal Baru</span>
            </Link>
            <Link className="button button-secondary" href="/doctor/appointments/new">
              <CalendarPlus size={15} aria-hidden="true" />
              <span>Jadwalkan Sesi</span>
            </Link>
          </div>
        }
      />

      <DashboardMetrics
        items={[
          {
            label: "Pasien Ditugaskan",
            icon: UsersRound,
            value: data.patientCount,
            hint: "Penanganan aktif",
          },
          {
            label: "Jadwal Hari Ini",
            icon: CalendarDays,
            value: data.todayCount,
            hint: data.dateLabel,
          },
          {
            label: "Draft Jurnal Pending",
            icon: ClipboardList,
            value: data.draftCount,
            hint: "Perlu finalisasi",
          },
        ]}
      />

      <div className="dashboard-columns">
        <DashboardPanel
          id="jadwal"
          title={`Agenda Hari Ini · ${data.dateLabel}`}
          badge={data.todayCount}
          action={
            <Link className="panel-action-link" href="/doctor/appointments">
              Semua Jadwal &rarr;
            </Link>
          }
        >
          <AppointmentPreview
            rows={data.appointments.map((row) => ({
              ...row,
              name: row.patient.user.name,
            }))}
            nameLabel="Pasien Rehabilitasi"
            empty="Tidak ada agenda sesi terapi untuk hari ini."
          />
        </DashboardPanel>

        <DashboardPanel
          id="pasien"
          title="Pasien dalam Penanganan"
          badge={data.patients.length}
          action={
            <Link className="panel-action-link" href="/doctor/patients">
              Daftar Lengkap &rarr;
            </Link>
          }
        >
          {data.patients.length === 0 ? (
            <DashboardEmpty>
              Pasien akan tampil setelah Administrator klinik membuat penugasan.
            </DashboardEmpty>
          ) : (
            <ul className="dashboard-assigned-patients">
              {data.patients.map(({ userId, user }) => (
                <li key={userId} className="patient-list-item">
                  <div className="patient-info-row">
                    <span className="patient-avatar-mini">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <strong className="patient-name">{user.name}</strong>
                  </div>
                  <div className="patient-quick-links">
                    <Link
                      className="button-link-secondary"
                      href={`/doctor/patients/${userId}/progress`}
                    >
                      <TrendingUp size={14} aria-hidden="true" />
                      <span>ROM</span>
                    </Link>
                    <Link
                      className="button-link-primary"
                      href={`/doctor/patients/${userId}`}
                    >
                      Detail
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>

      <DashboardPanel
        id="draft"
        title="Draft Jurnal Menunggu Finalisasi"
        badge={data.drafts.length}
        action={
          <Link className="panel-action-link" href="/doctor/journals">
            Semua Jurnal &rarr;
          </Link>
        }
      >
        {data.drafts.length === 0 ? (
          <DashboardEmpty>
            Seluruh jurnal terapi telah difinalisasi. Tidak ada draft yang tertunda.
          </DashboardEmpty>
        ) : (
          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th scope="col">Nama Pasien</th>
                  <th scope="col">Tanggal Sesi</th>
                  <th scope="col">Terakhir Diperbarui</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {data.drafts.map((draft) => (
                  <tr key={draft.id}>
                    <td>
                      <strong className="table-person-name">
                        {draft.patient.user.name}
                      </strong>
                    </td>
                    <td>
                      <time dateTime={draft.therapyAt.toISOString()}>
                        {formatDate(draft.therapyAt)}
                      </time>
                    </td>
                    <td>
                      <time dateTime={draft.updatedAt.toISOString()} className="text-muted text-sm">
                        {formatDate(draft.updatedAt)}
                      </time>
                    </td>
                    <td>
                      <span className="status-pill status-draft">
                        <span className="status-dot" />
                        DRAFT
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        className="button button-sm button-secondary"
                        href={`/doctor/journals/${draft.id}`}
                      >
                        <FileEdit size={14} aria-hidden="true" />
                        <span>Lanjutkan</span>
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
