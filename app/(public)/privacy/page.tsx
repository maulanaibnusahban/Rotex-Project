import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pemberitahuan Privasi" };

export default function PrivacyPage() {
  return (
    <main id="konten" className="container section prose-page">
      <h1>Pemberitahuan Privasi</h1>
      <p>Pemberitahuan ini menjelaskan penggunaan data akun pada tahap awal platform ROTEX.</p>
      <h2>Data akun</h2>
      <p>
        ROTEX menyimpan nama, alamat email, waktu dan versi persetujuan privasi, serta kata sandi. Nama digunakan pada profil, dan
        alamat email digunakan untuk masuk ke akun.
      </p>
      <h2>Keamanan akses</h2>
      <p>
        ROTEX memakai cookie sesi untuk menjaga Anda tetap masuk. Sistem menyimpan catatan jumlah percobaan autentikasi untuk
        membatasi aktivitas berulang. Akses akun ditentukan oleh peran pengguna.
      </p>
      <h2>Perubahan data akun</h2>
      <p>Pasien dapat memperbarui nama melalui Profil Saya. Kata sandi dapat diperbarui melalui Keamanan Akun setelah masuk.</p>
    </main>
  );
}
