# Simulasi pasien baru dan kontrol terapi

Contoh ini menggunakan pasien, dokter, catatan, dan angka fiktif untuk memeriksa alur aplikasi.

## 1. Pasien mendaftar

1. Pasien mengisi nama, email, kata sandi, dan persetujuan privasi.
2. Setelah pendaftaran berhasil, dashboard langsung terbuka. Profil pasien sudah dibuat.
3. Panel **Dokter pendamping** menampilkan keterangan bahwa penugasan belum tersedia. Jadwal, jurnal, dan grafik akan terisi ketika datanya tercatat.

## 2. Admin mengatur penugasan

1. Buka **Manajemen Pasien** dan cari pasien yang baru mendaftar. Periksa detail administratif dan status akun.
2. Jika dokter penanggung jawab belum memiliki akun, buat akun melalui **Manajemen Dokter**. Administrator memberikan kata sandi awal melalui saluran komunikasi yang digunakan organisasi.
3. Pilih **Tugaskan dokter** pada baris pasien. Pasien sudah terpilih. Pilih dokter aktif lalu tekan **Buat penugasan**. Riwayat menyimpan tanggal mulai dan administrator yang menugaskan.
4. Pasien muncul di **Pasien Saya** pada akun dokter. Dashboard pasien menampilkan nama dokter pendamping.
5. Untuk mengakhiri penugasan, buka **Penugasan → Tinjau untuk akhiri**. Periksa janji yang masih aktif sebelum memilih **Akhiri penugasan**. Pasien tetap dapat melihat jadwal yang tercatat dan membaca jurnal final miliknya.

## 3. Dokter menjadwalkan kontrol pertama

1. Buka detail pasien dari **Pasien Saya**. Panel riwayat akan menunjukkan apakah sesi pernah dicatat.
2. Pilih **Buat jadwal** dari detail pasien, atau tekan slot jam pada kalender **Hari** atau **Minggu**. Periksa tanggal, jam mulai, jam selesai, dan tambahkan catatan administratif bila diperlukan.
3. Buka kalender **Hari**, **Minggu**, atau **Bulan** untuk memilih tanggal. Di ponsel, pilih tanggal pada kalender untuk melihat agendanya. Pasien dapat membuka detail janji sendiri dari **Jadwal terapi**.
4. Jika dokter memiliki jadwal aktif yang bertabrakan, server meminta waktu lain. Dokter atau admin yang berwenang dapat memindahkan jadwal. Jam lama dan baru tercatat di riwayat perubahan.
5. Di detail janji, dokter memilih **Mulai pemeriksaan**. Formulir membawa pasien, jadwal, tanggal, dan jam yang dipilih. Untuk kunjungan tanpa janji, gunakan **Mulai pemeriksaan** dari detail pasien. Setelah kunjungan berlangsung, dokter dapat menandai jadwal **Selesai**.

## 4. Dokter mencatat keluhan, pemeriksaan, dan penilaian

| Bagian jurnal | Yang dicatat dokter | Contoh isian fiktif |
| --- | --- | --- |
| Keluhan utama | Keluhan dengan kata-kata pasien, kegiatan yang terpengaruh, dan informasi awal yang disampaikan. | Pasien melaporkan bahu kiri terasa kaku ketika meraih rak. |
| Kondisi awal dan hasil pemeriksaan | Riwayat yang relevan dan temuan pemeriksaan dokter. | Keluhan saat menjangkau benda dicatat. Dokter mendokumentasikan gerak yang diperiksa saat kunjungan. |
| Skor nyeri | Skor dan skala bila penilaian dilakukan. | 4 dari 10, sebagai data contoh. |
| Pengukuran ROM | Gerakan, sisi, sudut, metode, dan mode. Tambahkan baris hanya untuk gerakan yang diperiksa. | Fleksi kiri, 70,25°, sudut handle ROTEX, mode aktif. |
| Observasi dan respons | Hal yang diamati dokter dan respons pasien selama atau setelah sesi. | Pasien menyampaikan perubahan rasa kaku selama sesi. |
| Penilaian atau diagnosis | Penilaian klinis dokter berdasarkan pemeriksaan dan riwayat pasien. Bila belum dapat ditegakkan, dokter dapat mencatat hasil penilaian serta evaluasi lanjutan yang dibutuhkan. | Dokter mencatat temuan awal dan kebutuhan evaluasi pada kunjungan berikutnya. |
| Rencana tindak lanjut | Hal yang akan ditinjau kembali pada kontrol berikutnya. | Tinjau kembali keluhan dan catat hasil ukur dengan metode yang sama agar dapat dibandingkan. |

Dokter dapat menyimpan draf, memperbaiki isian, dan meninjau data sebelum **Finalisasi jurnal**. Finalisasi memerlukan keluhan, hasil pemeriksaan awal, penilaian atau diagnosis, rencana tindak lanjut, sisi bahu, dan mode terapi. Status jadwal selesai dikelola terpisah dari finalisasi. Jika jurnal final perlu diperbaiki, dokter mengisi alasan koreksi. Catatan versi menyimpan isi sebelum dan sesudah perubahan, penulis, dan waktu.

## 5. Pasien melihat hasil dan mengunduh PDF

1. Pada **Riwayat Terapi**, pasien membuka jurnal yang sudah final dan melihat seluruh isinya.
2. Pada kontrol kedua, misalkan dokter mencatat 82,5° dengan gerakan, sisi, metode, dan mode yang sama. Grafik menunjukkan tanggal kedua sesi dan selisih deskriptif +12,25°. Pengukuran dengan metode lain tampil pada grafik terpisah.
3. Di **Perkembangan ROM**, pasien memilih periode dan filter pengukuran. Tabel angka memberi jalan ke jurnal sumber.
4. **Unduh PDF** membuat laporan periode terpilih. Isinya rekap jadwal, kontrol yang ditulis dalam jurnal final, catatan dokter, grafik, dan angka pengukuran. Jadwal selesai yang belum memiliki hasil final ditandai **Menunggu hasil**. Setiap unduhan dicatat di audit log.
