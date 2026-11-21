import Link from "next/link";
import { Brand } from "@/src/components/layout/brand";
import { PublicNavigation } from "@/src/features/public/public-navigation";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="public-header">
        <div className="container nav-row">
          <Brand />
          <PublicNavigation />
        </div>
      </header>

      {children}

      <footer className="public-footer">
        <div className="container footer-wrapper">
          <div className="footer-main-grid">
            <div className="footer-brand-col">
              <Brand />
              <p className="footer-desc">
                Platform pendamping alat rehabilitasi bahu fisik dengan pencatatan Range of Motion (ROM) digital dan evaluasi dokter.
              </p>
              <span className="footer-badge">
                Teknik Biomedis &middot; UDINUS Semarang
              </span>
            </div>

            <div className="footer-links-col">
              <strong className="footer-col-heading">Navigasi</strong>
              <nav aria-label="Navigasi halaman">
                <Link href="/#tentang">Tentang ROTEX</Link>
                <Link href="/#fitur">Fitur Alat</Link>
                <Link href="/#cara-kerja">Cara Kerja</Link>
                <Link href="/#tim">Tim Pengembang</Link>
              </nav>
            </div>

            <div className="footer-links-col">
              <strong className="footer-col-heading">Portal &amp; Privasi</strong>
              <nav aria-label="Navigasi portal dan privasi">
                <Link href="/login">Masuk ke Portal</Link>
                <Link href="/register">Daftar Pasien</Link>
                <Link href="/privacy">Pemberitahuan Privasi</Link>
              </nav>
            </div>
          </div>

          <div className="footer-bottom-row">
            <p>
              &copy; {new Date().getFullYear()} ROTEX — Rotation Therapy Exercise. Seluruh hak cipta dilindungi.
            </p>
            <p className="footer-bottom-institution">
              Universitas Dian Nuswantoro
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
