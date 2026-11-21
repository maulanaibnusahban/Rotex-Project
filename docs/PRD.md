# PRODUCT REQUIREMENTS DOCUMENT

ROTEX

Rotation Therapy Exercise

Website Manajemen Rehabilitasi Bahu, Jurnal Terapi, dan Monitoring Range of Motion (ROM)

| Informasi Dokumen | Detail |
| --- | --- |
| Versi | 1.0 — Final MVP Scope |
| Tanggal | 20 November 2026 |
| Status | Baseline product requirements untuk perancangan UI/UX dan pengembangan |
| Peran pengguna | Administrator, Dokter, Pasien |
| Model integrasi | Pencatatan manual; tanpa integrasi langsung ke perangkat ROTEX |
| Dasar referensi | Proposal ROTEX E100 Revisi 02, 10 November 2026; keputusan produk pengguna |

Dokumen kerja pengembangan website. Istilah “final” merujuk pada empat keputusan scope produk yang telah ditetapkan; rincian teknis masih dapat diperbaiki melalui proses change control.

## 1. Executive Summary

ROTEX Web Platform adalah aplikasi web pendamping alat rehabilitasi bahu ROTEX. Aplikasi dirancang untuk informasi produk, registrasi pasien secara mandiri, manajemen dokter-pasien, penjadwalan terapi, jurnal hasil terapi oleh dokter, evaluasi klinis, serta visualisasi progres ROM. Pengoperasian alat dan pengukuran berlangsung pada perangkat fisik; dokter memasukkan hasil secara manual ke website.

ROTEX secara fisik mendukung latihan fleksi, ekstensi, abduksi dan adduksi, beserta fitur auto height adjustment. Website tidak mengontrol motor, tidak membaca sensor secara live, dan tidak mengelola identitas alat.

## 2. Keputusan Produk Final

| Keputusan | Ketentuan v1.0 |
| --- | --- |
| Pengisi jurnal terapi | Dokter saja |
| Registrasi pasien | Pasien dapat mendaftar sendiri dan melakukan verifikasi email |
| Akses pasien ke catatan dokter | Seluruh isi catatan pada sesi yang telah difinalisasi dapat dibaca oleh pasien terkait |
| Penjadwalan | Fitur wajib MVP: dokter membuat/mengubah/membatalkan jadwal; pasien melihat jadwal |
| Input hasil ROM | Manual oleh dokter berdasarkan pengukuran pada alat/alat ukur |
| Diagnosis | Ditulis dokter; tidak dibuat otomatis oleh website |

## 3. Product Vision & Goals

Visi: “Setiap derajat gerak bahu terukur, tercatat, dan terpantau.” Website memudahkan penelusuran hasil rehabilitasi dan komunikasi hasil terapi antara dokter serta pasien dengan rekam data historis yang terstruktur.

| Tujuan | Kriteria keberhasilan |
| --- | --- |
| Pendaftaran pasien | Pasien berhasil registrasi, verifikasi email, dan login |
| Pencatatan terapi | Dokter dapat membuat, menyimpan draft, dan memfinalisasi jurnal |
| Penjadwalan | Tidak terjadi benturan waktu untuk dokter yang sama |
| Monitoring | Grafik ROM dapat ditampilkan berdasarkan sisi bahu, gerakan, dan periode |
| Transparansi hasil | Pasien dapat membaca semua catatan sesi yang sudah final |
| Kontrol akses | Hanya pihak yang memiliki otorisasi dapat membaca data kesehatan |

## 4. Product Scope

4.1 In Scope

Landing page; profil dan tim pengembang; registrasi pasien; verifikasi email; login tiga role; administrasi akun; penugasan pasien ke dokter; jadwal terapi; jurnal terapi; pengukuran ROM; diagnosis dan evaluasi oleh dokter; finalisasi dan koreksi jurnal; riwayat dan grafik ROM; dashboard pasien; audit log minimum.

4.2 Out of Scope

ID alat, pendaftaran unit hardware, koneksi ESP32/IoT, MQTT, telemetri langsung, remote control atau perubahan tinggi alat lewat website, video consultation, pembayaran, diagnosis AI, dan booking mandiri pasien pada MVP.

## 5. User Roles & Access

| Role | Tanggung jawab | Batasan |
| --- | --- | --- |
| ADMIN | Kelola akun dokter dan pasien, penugasan pasien-dokter, jadwal administratif dan operasional | Tidak menulis/mengubah diagnosis atau jurnal; data klinis tidak terbuka secara default |
| DOCTOR | Mengatur jadwal, mencatat ROM, jurnal klinis, diagnosis, evaluasi dan finalisasi | Hanya mengakses pasien dalam penugasan yang sah |
| PATIENT | Registrasi mandiri, melihat jadwal, riwayat, grafik, dan jurnal final miliknya | Tidak mengedit hasil klinis atau melihat jurnal draft |

5.1 Matriks Hak Akses

| Fitur | Admin | Dokter | Pasien |
| --- | --- | --- | --- |
| Registrasi mandiri | — | — | Ya |
| Kelola akun dokter | Ya | — | — |
| Lihat akun pasien | Ya (administratif) | Pasien terkait | Diri sendiri |
| Penugasan dokter-pasien | Ya | — | — |
| Buat/ubah jadwal | Ya (administratif) | Ya | — |
| Lihat jadwal | Operasional | Pasien terkait | Milik sendiri |
| Buat/edit jurnal draft | — | Ya | — |
| Finalisasi jurnal | — | Ya | — |
| Baca jurnal final | Tidak secara default | Pasien terkait | Milik sendiri |
| Grafik ROM | Tidak secara default | Pasien terkait | Milik sendiri |

## 6. End-to-End User Journey

Pasien mengunjungi landing page dan memilih registrasi.

Pasien memasukkan email, nama, password, menyetujui kebijakan privasi, dan memverifikasi email.

Admin memvalidasi hubungan penanganan dan menghubungkan pasien dengan dokter.

Dokter membuat jadwal terapi; pasien melihatnya di dashboard.

Pasien menjalankan sesi rehabilitasi memakai ROTEX fisik di bawah pendampingan sesuai kebutuhan.

Dokter mengisi hasil pengukuran, evaluasi, diagnosis klinis, dan rencana tindak lanjut pada draft jurnal.

Dokter memfinalisasi jurnal; seluruh isi jurnal final tersedia untuk pasien tersebut.

Pasien melihat riwayat terapi, jadwal mendatang, serta grafik perkembangan ROM.

## 7. Functional Requirements — Public & Authentication

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| PUB-01 | Landing page: hero, tentang alat, fitur, empat gerakan, tim pengembang, CTA login/registrasi | P0 |
| AUTH-01 | Registrasi publik hanya membuat akun PATIENT | P0 |
| AUTH-02 | Verifikasi email sebelum akun aktif penuh | P0 |
| AUTH-03 | Login tunggal dengan redirect sesuai role | P0 |
| AUTH-04 | Lupa password, logout dan penggantian password | P0 |
| AUTH-05 | Rate limiting dan validasi server-side untuk autentikasi | P0 |

## 8. Functional Requirements — Administrator

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| ADM-01 | Ringkasan jumlah dokter, pasien, dan status akun | P0 |
| ADM-02 | Buat/ubah/nonaktifkan akun dokter | P0 |
| ADM-03 | Lihat dan kelola status akun pasien | P0 |
| ADM-04 | Kelola penugasan dokter-pasien dan histori penugasan | P0 |
| ADM-05 | Melihat serta mengatur jadwal administratif sesuai otorisasi | P0 |
| ADM-06 | Melihat log aktivitas sistem | P1 |

## 9. Functional Requirements — Doctor

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| DOC-01 | Melihat daftar pasien dalam penugasan aktif | P0 |
| DOC-02 | Melihat detail pasien dan riwayat terapi | P0 |
| DOC-03 | Membuat, reschedule, membatalkan dan menyelesaikan jadwal | P0 |
| DOC-04 | Membuat dan mengedit jurnal draft | P0 |
| DOC-05 | Mencatat banyak pengukuran ROM per sesi | P0 |
| DOC-06 | Memasukkan pemeriksaan, diagnosis/assessment, respons pasien dan rencana lanjut | P0 |
| DOC-07 | Finalisasi jurnal; setelah itu dapat dibaca pasien | P0 |
| DOC-08 | Monitoring grafik ROM per sisi/gerakan/metode | P0 |
| DOC-09 | Koreksi jurnal final dengan versi dan alasan | P1 |

## 10. Functional Requirements — Patient

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| PAT-01 | Registrasi akun dan melengkapi profil | P0 |
| PAT-02 | Melihat status penugasan dokter; empty state bila belum ditugaskan | P0 |
| PAT-03 | Melihat jadwal mendatang dan riwayat jadwal | P0 |
| PAT-04 | Membaca semua detail jurnal yang telah difinalisasi | P0 |
| PAT-05 | Melihat grafik dan histori ROM pribadi | P0 |
| PAT-06 | Melihat evaluasi, diagnosis, serta rencana tindak lanjut dari jurnal final | P0 |
| PAT-07 | Mengelola data akun pribadi yang diizinkan | P0 |

## 11. Therapy Scheduling Specification

Pada MVP dokter membuat jadwal. Pasien melihat informasi jadwal, tanpa booking mandiri. Admin dapat membantu penyesuaian administratif. Sistem mencegah benturan interval waktu dokter pada jadwal aktif.

| Field | Tipe | Keterangan |
| --- | --- | --- |
| id | UUID | Identitas internal jadwal |
| patientId | UUID | Pasien yang terhubung |
| doctorId | UUID | Dokter bertanggung jawab |
| startAt | DateTime | Awal sesi, disimpan dalam UTC |
| endAt | DateTime | Akhir sesi; harus lebih besar dari startAt |
| status | Enum | SCHEDULED, COMPLETED, CANCELLED, NO_SHOW |
| notes | Text | Informasi administratif tambahan |
| createdAt / updatedAt | DateTime | Jejak waktu sistem |

Reschedule dicatat sebagai aksi dalam histori perubahan jadwal, bukan mengharuskan status final terpisah. Status jadwal dan status jurnal tidak saling menggantikan: jadwal dapat COMPLETED meskipun jurnal masih DRAFT.

## 12. Therapy Journaling Specification

Satu jurnal mewakili satu sesi rehabilitasi, dapat terhubung ke appointment atau dibuat mandiri untuk sesi yang tidak terjadwal. Di dalamnya terdapat beberapa ROM measurements, karena satu sesi dapat mengevaluasi lebih dari satu gerakan atau sisi bahu.

| Bagian jurnal | Data minimal |
| --- | --- |
| Identitas sesi | Pasien, dokter, tanggal/waktu, appointment opsional |
| Pra-terapi | Keluhan dan kondisi awal |
| Latihan | Mode aktif/pasif, durasi, jumlah repetisi |
| ROM | Sisi kiri/kanan, fleksi/ekstensi/abduksi/adduksi, nilai derajat, metode pengukuran |
| Klinis | Skala nyeri jika dinilai, observasi, assessment/diagnosis oleh dokter |
| Tindak lanjut | Rencana terapi dan catatan pasca-sesi |
| Status | DRAFT atau FINALIZED; perubahan setelah final masuk revisi |

12.1 Lifecycle Jurnal

DRAFT → FINALIZED. Pada status DRAFT hanya dokter berwenang yang dapat melihat/edit. Setelah FINALIZED, pasien terkait dapat membaca semua isi. Apabila ada koreksi, sistem mencatat versi sebelumnya, versi baru, alasan koreksi, author dan timestamp (AMENDMENT). Tidak ada penghapusan diam-diam terhadap jurnal final.

12.2 Aturan Pengukuran ROM

Nilai disimpan dalam derajat beserta jenis gerakan, sisi bahu, dan metode pengukuran. Perlu membedakan pembacaan sudut handle ROTEX dari estimasi sudut sendi bahu setelah kalibrasi. Pengukuran dengan metode berbeda tidak boleh secara otomatis disimpulkan setara. Validasi rentang angka membantu mencegah salah input, tetapi bukan dasar diagnosis atau keputusan keselamatan otomatis.

## 13. Progress Monitoring

Dokter dan pasien dapat memfilter grafik menurut rentang tanggal, gerakan, sisi bahu, metode pengukuran, serta mode aktif/pasif jika relevan. Tiap titik grafik merujuk ke jurnal final asalnya. Perubahan awal-ke-akhir ditampilkan dalam derajat sebagai perbandingan deskriptif, bukan diagnosis otomatis atau klaim kesembuhan.

## 14. Information Architecture & Routes

| Area | Route | Halaman |
| --- | --- | --- |
| Public | /; /about; /team | Landing, penjelasan alat, tim |
| Authentication | /login; /register; /verify-email; /forgot-password | Akses akun |
| Admin | /admin; /admin/doctors; /admin/patients; /admin/assignments; /admin/appointments | Admin dashboard dan pengelolaan |
| Doctor | /doctor; /doctor/patients; /doctor/appointments; /doctor/journals | Area dokter |
| Doctor detail | /doctor/patients/[id]; /doctor/journals/[id]; /doctor/patients/[id]/progress | Detail pasien, jurnal, ROM |
| Patient | /patient; /patient/appointments; /patient/history; /patient/progress; /patient/profile | Area pasien |
| Patient journal | /patient/journals/[id] | Baca catatan final |

## 15. Data Model — Conceptual

| Entitas | Fungsi / Relasi |
| --- | --- |
| users | Akun autentikasi; role ADMIN/DOCTOR/PATIENT |
| doctor_profiles | Profil dokter; satu-ke-satu users |
| patient_profiles | Profil pasien; satu-ke-satu users |
| patient_assignments | Relasi banyak-ke-banyak historis dokter dan pasien |
| appointments | Jadwal satu pasien dan dokter; boleh terkait jurnal |
| therapy_sessions | Satu sesi/jurnal; satu pasien dan dokter; appointment opsional |
| rom_measurements | Banyak pengukuran dalam satu sesi |
| journal_revisions | Jejak amendemen jurnal final |
| audit_logs | Jejak akses/perubahan penting dan aktornya |

UUID digunakan sebagai kunci internal entitas; tidak ada ID perangkat fisik ROTEX pada model MVP.

## 16. Non-Functional Requirements

| Area | Kebutuhan |
| --- | --- |
| Security | Hash password, sesi aman, verifikasi email, rate limiting dan server-side authorization |
| Privacy | Isolasi data pasien dan role-based access; admin tidak dapat membaca konten klinis secara default |
| Clinical integrity | Audit perubahan, immutable history untuk koreksi jurnal final, timestamp dan author |
| Validation | Validasi rentang, unit, relasi pasien-dokter, dan kelengkapan formulir |
| Accessibility | Navigasi jelas, kontras teks, desain responsif dan input mudah dibaca |
| Availability | Backup terenkripsi serta prosedur restorasi dan monitoring error |
| Performance | Dashboard dan histori menggunakan pagination serta query indeks |
| Compliance | Kebijakan privasi dan prosedur pengelolaan data kesehatan harus ditinjau terhadap aturan yang berlaku |

## 17. Recommended Technical Stack

| Layer | Rekomendasi |
| --- | --- |
| Full-stack | Next.js + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Auth.js atau solusi setara |
| Validation | Zod |
| Charts | Recharts |
| Email | Transactional email provider |
| Architecture | Modular monolith; satu aplikasi, otorisasi per resource |
| Infrastructure | Managed app hosting + managed PostgreSQL, secrets management, scheduled backups |

## 18. Development Roadmap

Phase 1 — Foundation: struktur proyek, UI framework, database, registrasi pasien, email verification, login RBAC.

Phase 2 — Administration: dashboard, manajemen dokter dan pasien, penugasan pasien-dokter.

Phase 3 — Scheduling: kalender, pembuatan jadwal, pengecekan konflik, reschedule, cancel, tampilan pasien.

Phase 4 — Journaling: formulir sesi, ROM multi-record, diagnosis/evaluasi, draft, finalisasi, koreksi.

Phase 5 — Progress Monitoring: grafik per gerakan/sisi, riwayat pasien dan keterbacaan jurnal final.

Phase 6 — QA & Deployment: security and authorization tests, backup, UAT serta deployment.

## 19. Acceptance Criteria

☐ Pasien dapat registrasi, verifikasi email dan login.

☐ Registrasi publik tidak dapat menghasilkan role admin atau dokter.

☐ Admin dapat membuat dokter dan menugaskan pasien.

☐ Dokter hanya dapat mengakses pasien yang ditugaskan.

☐ Dokter dapat membuat dan mengubah jadwal tanpa konflik waktu.

☐ Pasien dapat melihat jadwalnya sendiri.

☐ Dokter dapat mencatat banyak ROM measurement dalam satu sesi.

☐ Draft jurnal tidak dapat dilihat oleh pasien.

☐ Seluruh isi jurnal final dapat dibaca oleh pasien terkait.

☐ Grafik ROM mengelompokkan data sesuai gerakan, sisi bahu dan metode.

☐ Amendemen jurnal final dapat diaudit.

☐ Manipulasi URL atau API tidak membuka data pasien lain.

☐ Aplikasi berfungsi sepenuhnya tanpa koneksi fisik ke alat ROTEX.

## 20. Open Technical Clarifications

Detail berikut tidak mengubah empat keputusan produk yang telah difinalisasi, tetapi perlu dipastikan sebelum implementasi final: kriteria verifikasi relasi pasien-dokter; data profil klinis wajib; lokasi atau fasilitas layanan untuk jadwal; apakah konsultasi pertama harus mempunyai jurnal baseline; kebijakan retensi data dan akses admin pada keadaan darurat; standar pengukuran ROM yang digunakan dokter.

## 21. Sources & Assumptions

Referensi produk hardware: “Rancang Bangun ROTEX, Alat Rehabilitasi Bahu dengan Auto Height Adjustment dan Monitoring ROM Real Time Berbasis IoT”, proposal E100 Revisi 02 (10 November 2026), khususnya ringkasan perangkat, empat gerakan utama, dan catatan kalibrasi ROM. Dokumen website ini merupakan spesifikasi pengembangan berdasarkan keputusan pengguna dan tidak menggantikan dokumen klinis atau rencana uji perangkat.

Pengusul perangkat: Elisabet Cantika Dhana dan Malfa Liya Evana. Pembimbing: Wisnu Adi Prasetyanto, S.T., M.Eng. Program Studi Teknik Biomedis, Universitas Dian Nuswantoro.
