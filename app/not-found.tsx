import Link from "next/link";

export default function NotFound() {
  return (
    <main id="konten" className="container section prose-page">
      <h1>Halaman tidak ditemukan</h1>
      <p>Periksa alamat halaman atau kembali ke beranda ROTEX.</p>
      <Link className="button button-primary" href="/">Kembali ke beranda</Link>
    </main>
  );
}
