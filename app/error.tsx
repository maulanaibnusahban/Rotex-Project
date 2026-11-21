"use client";

import Link from "next/link";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main id="konten" className="container section prose-page">
      <h1>Halaman belum dapat dimuat</h1>
      <p>Coba muat halaman kembali.</p>
      <div className="button-row">
        <button className="button button-primary" onClick={reset}>Coba lagi</button>
        <Link className="button button-secondary" href="/">Kembali ke beranda</Link>
      </div>
    </main>
  );
}
