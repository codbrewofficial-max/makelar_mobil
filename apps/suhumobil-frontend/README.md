# 🚗 SuhuMobil - Platform Bursa Mobil Bekas Terkurasi

SuhuMobil adalah aplikasi web manajemen bursa mobil bekas terkurasi kelas premium. Dibangun untuk memberikan solusi atas kekhawatiran pembeli mobil bekas akan kondisi mesin yang tidak pasti ("mobil zonk"). SuhuMobil mengedepankan nilai mutlak **Kejujuran & Transparansi** melalui laporan inspeksi ketat langsung di bawah pengawasan Kurator Utama / Teknisi Senior berpengalaman.

---

## 🌟 Fitur Utama & Keunggulan Platform

### 1. Katalog Mobil Terkurasi Premium (Katalog Publik)
* **Kondisi Jujur & Transparan**: Setiap unit mobil menyertakan laporan checklist inspeksi yang detail (Mesin, Transmisi, Kaki-kaki, Eksterior, Interior) beserta catatan baret/kerusakan apa adanya.
* **Galeri Foto Unit Berkualitas**: Dilengkapi galeri gambar beresolusi tinggi dengan sistem watermark otomatis sesuai pengaturan admin bursa.
* **Filter Pintar**: Pencarian unit berdasarkan merek, model, tipe transmisi, kisaran harga, tahun rilis, dan jarak tempuh (mileage).

### 2. Manajemen Kurator Utama (Kurator Ahli)
* **Profil Tim Inspeksi Senior**: Menampilkan biografi, keahlian, dan kutipan integritas dari para ahli otomotif senior (seperti *Suhu Benny Susilo* dengan pengalaman 25 tahun).
* **Konsol Manajemen Kurator**: Admin dapat menambah, mengubah biografi, mengunggah foto profil, dan menghapus data kurator yang bernaung di bawah bursa SuhuMobil.

### 3. Integrasi & Manajemen Prospek (Leads System)
* **Tanya via WhatsApp**: Integrasi *popup* formulir interaktif di halaman detail mobil untuk mempermudah calon pembeli menghubungi agen bursa.
* **Konsol Prospek Admin**: Mencatat setiap pertanyaan masuk secara aman, lengkap dengan informasi unit yang ditanyakan, nama prospek, nomor WhatsApp, status follow-up (*New, Contacted, Sold, Cancelled*), serta pencatatan sumber referensi pelacakan (referral tracking source).

### 4. Artikel Edukasi & Pengaturan Bisnis
* **Portal Edukasi**: Media rilis artikel tips otomotif untuk membangun *trust* calon pembeli.
* **Pengaturan Fleksibel**: Admin dapat menyesuaikan Judul Situs, Nomor WhatsApp penerima prospek, profil media sosial, dan konfigurasi teks/link watermark gambar.

---

## 📈 Fitur Baru: Analitik & Pelacakan Kampanye (System Insights)

Selain pelacakan menggunakan Google Tag Manager (GTM) dan Google Analytics 4 (GA4), sistem kini dilengkapi dengan **Mesin Pelacak & Insights Mandiri Terintegrasi (Self-Hosted Web Tracking System)** untuk mengukur efektivitas kampanye pemasaran di media sosial secara akurat:

### 1. Generator Link Kampanye (Salin Link Pelacak)
* **Referral Link Generator**: Tersedia tombol khusus **"Bagikan & Salin Tautan"** baik di sisi Publik (Detail Mobil) maupun di sisi Admin Console (Daftar Mobil).
* **Multi-Kanal Sosmed**: Memungkinkan pembuatan link pelacak khusus dengan sekali klik untuk berbagai media sosial utama:
  * **WhatsApp** (`?src=whatsapp`)
  * **Instagram** (`?src=instagram`)
  * **TikTok** (`?src=tiktok`)
  * **Facebook** (`?src=facebook`)
  * **Telegram** (`?src=telegram`)
  * **Custom / Lainnya** (`?src=custom`)
* **Registrasi Kunjungan**: Saat calon pembeli membuka tautan yang dihasilkan, sistem secara otomatis merekam asal kunjungan (*landing source*) ke dalam memori sesi dan menyimpannya ke database analitik.

### 2. Menu Khusus "Insights Sistem" di Console Admin
* **Dashboard Metrik Utama**:
  * **Total Pengunjung**: Akumulasi kunjungan yang datang dari link promosi/referral kampanye.
  * **Tautan Disalin**: Jumlah klik penyalinan link promosi yang digenerasi oleh tim admin maupun pengunjung umum.
  * **Prospek Terkonversi**: Jumlah prospek (pertanyaan WA) yang berhasil dibuat setelah masuk melalui tautan kampanye.
  * **Rasio Konversi**: Persentase efektivitas kunjungan yang berakhir menjadi leads prospek riil.
* **Visualisasi Grafik Interaktif (Recharts)**:
  * **Trend Kunjungan & Konversi harian**: Grafik spline area interaktif yang memperlihatkan naik-turun trafik harian dan hubungannya dengan prospek baru dalam 15 hari terakhir.
  * **Performa Efektivitas Kanal**: Diagram batang (bar chart) komparatif untuk mengevaluasi kanal media sosial mana yang paling aktif menyumbangkan kunjungan, aktivitas copy-link, dan leads masuk.
* **Tabel Rincian Data Referrer**: Menampilkan persentase tingkat konversi presisi dari setiap media sosial.
* **Unit Terpopuler**: Menampilkan daftar unit mobil bekas yang paling banyak menarik interaksi pengunjung melalui tautan promosi.
* **Alur Log Waktu Nyata (Real-Time Activity Timeline)**: Feed log aktivitas sistem pelacakan yang masuk ke dalam sistem secara real-time, dapat difilter berdasarkan jenis aktivitas (Kunjungan, Share Link, Prospek Baru).

---

## 🛠️ Stack Teknologi

Platform dibangun dengan arsitektur modern berkecepatan tinggi:
* **Frontend**: React 18+ (dengan TypeScript)
* **Build Tool**: Vite (Super fast bundling)
* **Styling**: Tailwind CSS & Lucide Icons (Pristine, responsive utility layout)
* **Animations**: Motion (Smooth transitions)
* **Charts**: Recharts & D3 (Interactive database rendering)
* **Database State**: LocalStorage & SessionStorage Persistent Engine (Ideal untuk offline-first & demonstrasi andal tanpa dependensi server eksternal yang lambat)

---

## 🚀 Panduan Pengembangan Lokal

### Prerequisites
Pastikan Anda telah menginstal **Node.js** (versi 16 atau lebih baru) dan npm.

### Langkah Instalasi
1. Clone atau ekstrak repositori project ini.
2. Buka terminal di direktori root aplikasi, lalu instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
4. Buka aplikasi di peramban Anda melalui alamat:
   ```text
   http://localhost:3000
   ```

### Produksi & Build
Untuk mengompilasi aplikasi menjadi berkas statis siap rilis (di folder `/dist`):
```bash
npm run build
```
