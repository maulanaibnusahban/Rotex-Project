import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ClipboardList,
  FileText,
  MoveVertical,
  Ruler,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: MoveVertical,
    title: "Penyesuaian Tinggi Otomatis",
    desc: "Ketinggian poros alat dapat diatur secara elektrik pada perangkat fisik untuk mengakomodasi postur duduk atau berdiri pasien secara ergonomis.",
  },
  {
    icon: Ruler,
    title: "Pengukuran Rentang Gerak",
    desc: "Sudut mobilitas bahu dicatat dalam satuan derajat (°), lengkap dengan rujukan sisi bahu dan metode pengukuran klinis.",
  },
  {
    icon: ClipboardList,
    title: "Jurnal Terapi Digital",
    desc: "Dokter memasukkan hasil pemeriksaan, evaluasi kondisi, dan arahan terapi lanjutan langsung ke catatan sesi pasien.",
  },
  {
    icon: TrendingUp,
    title: "Pemantauan Perkembangan",
    desc: "Riwayat data antarsesi memudahkan dokter dan pasien meninjau perubahan mobilitas bahu secara objektif dan terstruktur.",
  },
];

const movements = [
  {
    icon: ArrowUpRight,
    title: "Fleksi",
    degree: "0° – 180°",
    plane: "Bidang Sagital",
    desc: "Lengan bergerak ke depan dan ke atas melewati kepala.",
  },
  {
    icon: ArrowLeft,
    title: "Ekstensi",
    degree: "0° – 60°",
    plane: "Bidang Sagital",
    desc: "Lengan bergerak lurus ke arah belakang tubuh.",
  },
  {
    icon: ArrowRight,
    title: "Abduksi",
    degree: "0° – 180°",
    plane: "Bidang Frontal",
    desc: "Lengan bergerak ke arah samping menjauhi tubuh.",
  },
  {
    icon: ArrowDownToLine,
    title: "Adduksi",
    degree: "0° – 50°",
    plane: "Bidang Frontal",
    desc: "Lengan bergerak merapat kembali mendekati tubuh.",
  },
];

const steps = [
  {
    step: "01",
    title: "Pemeriksaan Awal",
    desc: "Dokter memeriksa kondisi sendi bahu dan menyusun target latihan.",
  },
  {
    step: "02",
    title: "Latihan dengan ROTEX",
    desc: "Pasien melakukan latihan pada alat fisik dengan tinggi yang disesuaikan.",
  },
  {
    step: "03",
    title: "Pencatatan Hasil",
    desc: "Dokter mengukur sudut gerak dan mencatat hasilnya secara manual.",
  },
  {
    step: "04",
    title: "Evaluasi Dokter",
    desc: "Dokter menuliskan analisis sesi klinis lalu memfinalisasi jurnal terapi.",
  },
  {
    step: "05",
    title: "Tinjauan Pasien",
    desc: "Pasien mengakses catatan resmi dan meninjau grafik perkembangannya.",
  },
];

export function AboutSection() {
  return (
    <section className="container section split-section" id="tentang" aria-labelledby="tentang-heading" tabIndex={-1}>
      <div>
        <p className="eyebrow">Tentang ROTEX</p>
        <h2 id="tentang-heading">Dari latihan bahu ke catatan terapi yang terstruktur</h2>
      </div>
      <div className="section-copy">
        <p>
          ROTEX adalah alat rehabilitasi bahu yang dikembangkan di Program Studi Teknik Biomedis Universitas Dian Nuswantoro. Alat ini dirancang untuk memfasilitasi latihan mobilitas sendi sekaligus mendukung pengukuran <i>Range of Motion</i> (ROM).
        </p>
        <p>
          Platform digital pendamping berfungsi menyatukan jadwal terapi, dokumentasi hasil pengukuran, dan catatan evaluasi medis. Pengukuran diinput secara manual oleh dokter penanggung jawab untuk menjamin keabsahan klinis.
        </p>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="section surface-tint" id="fitur" aria-labelledby="fitur-heading" tabIndex={-1}>
      <div className="container">
        <div className="section-header-compact">
          <p className="eyebrow">Fitur Utama</p>
          <h2 id="fitur-heading">Mendukung latihan fisik dan dokumentasi klinis</h2>
          <p className="intro-copy">
            Kombinasi rancang bangun ergonomis pada unit fisik dan sistem pencatatan terstruktur pada platform digital.
          </p>
        </div>

        <div className="features-grid-refined">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-card-clean">
              <span className="icon-tile">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MovementsSection() {
  return (
    <section className="container section" id="gerakan" aria-labelledby="gerakan-heading">
      <div className="section-header-compact">
        <p className="eyebrow">Gerakan Rehabilitasi</p>
        <h2 id="gerakan-heading">Empat sumbu gerak bahu terarah</h2>
        <p className="intro-copy">
          Mendukung latihan pemulihan mobilitas fungsional sendi bahu dengan acuan sudut gerak standar.
        </p>
      </div>

      <div className="movement-grid-refined">
        {movements.map(({ icon: Icon, title, degree, plane, desc }) => (
          <div key={title} className="movement-item-card">
            <div className="movement-item-top">
              <span className="icon-tile">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="plane-chip">{plane}</span>
            </div>
            <div className="movement-item-title-row">
              <h3>{title}</h3>
              <span className="degree-tag">{degree}</span>
            </div>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WorkflowSection() {
  return (
    <section className="section surface-tint" id="cara-kerja" aria-labelledby="kerja-heading" tabIndex={-1}>
      <div className="container">
        <div className="section-header-compact">
          <p className="eyebrow">Cara Kerja</p>
          <h2 id="kerja-heading">Alur terintegrasi dari sesi ke portal</h2>
          <p className="intro-copy">
            Proses pendampingan terstruktur dari kedatangan pasien hingga rekam riwayat tersimpan aman.
          </p>
        </div>

        <div className="workflow-timeline">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="workflow-timeline-item">
              <span className="step-num">{step}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MonitoringSection() {
  return (
    <section className="container section split-section items-center" id="monitoring" aria-labelledby="monitoring-heading">
      <div>
        <p className="eyebrow">Monitoring &amp; Jurnal</p>
        <h2 id="monitoring-heading">Catatan dokter mendampingi riwayat gerak bahu</h2>
        <p className="intro-copy">
          Portal pasien memberi akses langsung terhadap jadwal yang diagendakan, catatan evaluasi dokter, serta histori pengukuran rentang gerak yang telah difinalisasi.
        </p>
        <div className="pt-2">
          <Link className="button button-primary" href="/register">
            Buat akun pasien
          </Link>
        </div>
      </div>

      <div className="preview-card-clean">
        <div className="preview-card-header">
          <div className="preview-card-title">
            <FileText size={16} className="text-primary" aria-hidden="true" />
            <span>Sesi Terapi #04 — Terfinalisasi</span>
          </div>
          <span className="preview-badge-status">FINALIZED</span>
        </div>

        <div className="preview-card-body">
          <div className="preview-mini-grid">
            <div>
              <span className="preview-label">Pasien</span>
              <strong>Budi Santoso</strong>
            </div>
            <div>
              <span className="preview-label">Dokter</span>
              <strong>dr. Hendra W., Sp.KFR</strong>
            </div>
          </div>

          <div className="preview-progress-block">
            <div className="progress-row">
              <span>Fleksi Bahu Kanan</span>
              <strong>145°</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "80%" }} />
            </div>
          </div>

          <div className="preview-progress-block">
            <div className="progress-row">
              <span>Abduksi Bahu Kanan</span>
              <strong>130°</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "72%" }} />
            </div>
          </div>

          <p className="preview-clinical-quote">
            &ldquo;Mobilitas fleksi meningkat, kompensasi berkurang, toleransi beban latihan baik.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}

const teamMembers = [
  {
    role: "Pengusul Perangkat",
    name: "Elisabet Cantika Dhana",
  },
  {
    role: "Pengusul Perangkat",
    name: "Malfa Liya Evana",
  },
  {
    role: "Dosen Pembimbing",
    name: "Wisnu Adi Prasetyanto, S.T., M.Eng.",
  },
];

export function TeamSection() {
  return (
    <section className="section surface-tint" id="tim" aria-labelledby="tim-heading" tabIndex={-1}>
      <div className="container">
        <div className="section-header-compact">
          <p className="eyebrow">Tim Pengembang</p>
          <h2 id="tim-heading">Inovasi Rekayasa Biomedis</h2>
          <p className="intro-copy">
            Program Studi S1 Teknik Biomedis, Fakultas Teknik, Universitas Dian Nuswantoro Semarang.
          </p>
        </div>

        <div className="team-cards-grid">
          {teamMembers.map(({ name, role }) => (
            <div key={name} className="team-member-card">
              <h3 className="team-member-name">{name}</h3>
              <p className="team-role-tag">{role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
