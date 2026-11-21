# ROTEX Web Platform

Pendamping alat rehabilitasi bahu ROTEX. Dokter memasukkan hasil terapi secara manual.

## Menjalankan proyek

Gunakan Node.js 22 (minimal 22.12) atau 24 dan MySQL 8. Buat database `rotex` dengan `CREATE DATABASE rotex CHARACTER SET utf8mb4;`. Berikan izin migrasi dan akses tabel kepada akun MySQL yang dipakai proyek. Untuk Laragon dengan `root` tanpa kata sandi di komputer lokal, gunakan `mysql://root@127.0.0.1:3306/rotex` di `.env`.

1. Salin `.env.example` ke `.env` dan isi `DATABASE_URL` untuk database `rotex`.
2. Jalankan perintah berikut dari direktori proyek.

   ```text
   npm ci
   npm run db:migrate
   npm run dev
   ```

3. Buka `http://localhost:3000`. Registrasi publik membuat akun pasien dan langsung membuka dashboard. Alamat email dipakai sebagai identitas saat masuk.

## Administrator pertama

Setelah migrasi, jalankan perintah berikut di terminal. Masukkan kata sandi minimal 8 karakter saat diminta. Ketikan kata sandi disembunyikan.

```text
npm run db:admin
```

Perintah ini membuat akun **Admin** dengan email `rotex@admin.com`. Jika akun admin itu sudah tersedia, perintah menampilkan statusnya dan mempertahankan kata sandinya. Untuk memakai email dan nama lain, jalankan `npm run db:admin -- admin@example.com "Nama Administrator"`.

Untuk deployment tanpa prompt, sediakan `ROTEX_ADMIN_PASSWORD` sebagai secret di lingkungan proses yang menjalankan perintah tersebut.

## Pemeriksaan

```text
npm run lint
npm run typecheck
npm test
npm run build
```

`AUTH_CLIENT_IP_HEADER` opsional. Atur hanya jika proxy tepercaya selalu mengganti nilai header dengan satu alamat IP klien. Pembatasan percobaan per akun tetap berlaku. Tanpa IP tepercaya, sistem memakai batas bersama untuk tiap jenis aksi autentikasi.

## Cakupan tahap awal

Landing page satu halaman, MySQL, registrasi pasien dengan sesi langsung, manajemen akun dokter dan pasien, penugasan, kalender dan histori jadwal, jurnal terapi beserta draf dan koreksi, grafik ROM, serta unduhan laporan PDF. Agenda dan laporan menggunakan WIB. Pemberitahuan privasi perlu ditinjau sebelum penggunaan produksi.

Verifikasi email dan pemulihan kata sandi melalui email ditunda pada alur saat ini. Aplikasi dapat dijalankan tanpa konfigurasi SMTP.

Spesifikasi produk ada di [PRD](docs/PRD.md) dan arahan visual di [Design Brief](docs/DESIGN_BRIEF.md).

## Fondasi dashboard rehabilitasi

| Tabel | Relasi dan fungsi |
| --- | --- |
| DoctorProfile, PatientProfile | Profil satu-ke-satu untuk akun dokter dan pasien. Migrasi membuat profil untuk akun yang sudah ada. |
| PatientAssignment | Riwayat hubungan dokter dan pasien, dengan waktu mulai dan berakhir serta akun yang menugaskan. |
| Appointment, AppointmentChange | Jadwal dokter dan pasien beserta histori perubahan waktu atau status. |
| TherapySession, RomMeasurement | Jurnal terapi dengan jadwal opsional, serta beberapa pengukuran ROM per sesi. Jurnal berstatus draft atau final. |
| JournalRevision, AuditLog | Versi rekam klinis dan jejak tindakan sistem. Dashboard admin membaca aktivitas administratif. |

Dashboard menampilkan data sesuai peran. Dokter dan pasien yang berhak melihat jurnal final dapat mengunduh laporan periode dan filter terpilih. Grafik dan PDF memakai pengelompokan pengukuran yang sama.

Langkah awal untuk menguji fitur adalah membuat akun dokter, mendaftarkan pasien, dan menautkan keduanya melalui Penugasan. [Simulasi pasien baru dan kontrol terapi](docs/SIMULASI_ALUR_PASIEN.md) merinci langkah setiap peran dan contoh isian jurnal.
