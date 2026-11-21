import Image from "next/image";
import Link from "next/link";
import {
  AboutSection,
  FeaturesSection,
  MonitoringSection,
  MovementsSection,
  TeamSection,
  WorkflowSection,
} from "@/src/features/public/sections";

export default function Home() {
  return (
    <main id="konten">
      <section id="beranda" className="hero" tabIndex={-1}>
        <div className="container hero-layout">
          <div>
            <p className="eyebrow">Rotation Therapy Exercise</p>
            <h1>
              Setiap derajat gerak bahu <em>terukur, tercatat, dan terpantau.</em>
            </h1>
            <p className="hero-copy">
              Alat rehabilitasi bahu dengan penyesuaian tinggi otomatis dan pengukuran rentang gerak, didukung platform digital untuk pencatatan terapi dan pemantauan perkembangan pasien.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/login">
                Masuk ke Dashboard
              </Link>
              <a className="button button-secondary" href="#tentang">
                Kenali ROTEX
              </a>
            </div>
          </div>
          <figure className="hero-visual">
            <Image
              src="/ilustrasi-rehabilitasi-bahu.webp"
              alt="Pemeriksaan dan pendampingan rehabilitasi rentang gerak bahu."
              width={1440}
              height={1080}
              priority
              sizes="(max-width: 750px) calc(100vw - 3rem), (max-width: 1220px) 45vw, 550px"
            />
            <figcaption>Ilustrasi pemeriksaan rentang gerak bahu</figcaption>
          </figure>
        </div>
      </section>

      <div className="hero-meta">
        <div className="container hero-meta-layout">
          <div className="hero-meta-item">
            <strong>4 gerakan bahu</strong>
            <span>Fleksi, ekstensi, abduksi, dan adduksi</span>
          </div>
          <div className="hero-meta-item">
            <strong>Rentang gerak</strong>
            <span>Pengukuran dalam derajat (°)</span>
          </div>
          <div className="hero-meta-item">
            <strong>Catatan terapi</strong>
            <span>Dicatat secara manual oleh dokter</span>
          </div>
        </div>
      </div>

      <AboutSection />
      <FeaturesSection />
      <MovementsSection />
      <WorkflowSection />
      <MonitoringSection />
      <TeamSection />
    </main>
  );
}
