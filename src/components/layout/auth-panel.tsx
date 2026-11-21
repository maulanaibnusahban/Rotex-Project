import type { ReactNode } from "react";
import Link from "next/link";
import { Brand } from "./brand";

export function AuthPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <main className="auth-layout" id="konten">
      <aside className="auth-aside">
        <Brand />
        <div>
          <p className="eyebrow">Rotation Therapy Exercise</p>
          <p className="auth-aside-heading">Platform pendamping rehabilitasi bahu</p>
          <p>Untuk pencatatan terapi dan pemantauan rentang gerak.</p>
        </div>
        <p className="auth-affiliation">
          Teknik Biomedis
          <br />
          Universitas Dian Nuswantoro
        </p>
      </aside>
      <section className="auth-main" aria-labelledby="auth-title">
        <div className="auth-panel">
          <div className="auth-panel-nav">
            <div className="auth-mobile-brand">
              <Brand />
            </div>
            <Link className="text-link" href="/">
              Kembali ke beranda
            </Link>
          </div>
          <h1 id="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
