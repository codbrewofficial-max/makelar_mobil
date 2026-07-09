# SuhuMobil Backend

REST API backend untuk SuhuMobil (Node.js 22 + Express 5 + TypeScript + Prisma 6 + PostgreSQL 16),
dibangun sesuai `05-backend-prd.md`, `04-api-contract.md`, `03-database-design.md`, dan
`00-development-rules.md`.

## Menjalankan Secara Lokal (tanpa Docker)

```bash
npm install
cp .env.example .env
# isi DATABASE_URL, JWT_SECRET, kredensial R2, Telegram di .env

npx prisma migrate dev --name init
npm run prisma:seed

npm run dev
```

Server berjalan di `http://localhost:4000`, seluruh endpoint di bawah prefix `/api/v1`.

## Menjalankan dengan Docker

```bash
cp .env.example .env
# isi .env

docker compose up --build
```

Ini akan menjalankan service `backend` (port 4000) dan `postgres` (port 5432).
Setelah container backend jalan pertama kali, jalankan migrasi & seed dari dalam container:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx tsx prisma/seed.ts
```

## Akun Default (dari Seed)

| Role  | Email                  | Password    |
| ----- | ----------------------- | ----------- |
| OWNER | owner@suhumobil.com     | owner12345  |
| ADMIN | admin@suhumobil.com     | admin12345  |

**Wajib ganti password ini sebelum go-live.**

## Struktur Project

Lihat `05-backend-prd.md` section 4 untuk penjelasan lengkap arsitektur modular
(`src/modules/*`, `src/lib/*`, `src/middleware/*`, `src/utils/*`).

## Modul Sinkronisasi Frontend (`07-frontend-reconciliation-addendum.md` & `08-instruksi-sinkronisasi-backend.md`)

Dua modul baru ditambahkan setelah backend awal selesai, plus 1 perubahan kontrak kecil:

- **`curators/`** — CRUD profil kurator/tim inspeksi. Ini **entitas konten publik** (bio yang
  tampil di Landing/About page), **bukan** role login — jangan tertukar dengan `UserRole`
  (`OWNER`/`ADMIN`). Hard delete (tabel `curators` tidak punya `deletedAt`). Upload foto
  memakai alur yang sama seperti logo bisnis: Sharp resize 512×512 → WebP → upload R2 folder
  `curators/` → hapus foto lama dulu (no orphan file).
- **`tracking/`** — analitik referral link per kanal (`whatsapp/instagram/tiktok/facebook/telegram/custom`
  + kanal bebas lain dari `utm_source` eksternal).
  - `POST /tracking/visit` & `POST /tracking/click`: publik, **rate limit khusus 30/menit/IP**
    (`trackingRateLimiter`), terpisah dari limit umum 60/menit karena dipanggil otomatis tiap
    pageview/copy-link, bukan aksi sadar user.
  - `GET /admin/insights/system`: agregasi `bySource` (selalu 6 kanal standar + kanal lain
    yang pernah tercatat), `byCar` (top 10 berdasar visits+clicks, pakai snapshot `carTitle`
    supaya tetap valid meski mobil sudah dihapus/judul berubah), `recentLogs` (100 terakhir).
- **`leads` — field baru `landingSource`** (opsional, tidak disimpan sebagai kolom di tabel
  `leads`). Setelah lead berhasil dibuat, jika field ini dikirim, backend mencatat 1 baris
  `TrackingLog(type: LEAD)` yang terhubung ke lead tsb — fire-and-forget seperti notifikasi
  Telegram, kegagalannya tidak pernah menggagalkan `POST /leads`. Ini menutup gap yang
  dijelaskan di addendum Section 7 (di prototipe frontend, konversi lead dibaca dari
  `sessionStorage` browser — cara itu tidak bisa jalan di backend nyata, jadi frontend
  sekarang wajib kirim `landingSource` eksplisit di body request).

## Catatan Implementasi & Asumsi

Beberapa titik ambigu antar dokumen diselesaikan mengikuti prinsip KISS/YAGNI
(README.md section 11, prioritas resolusi konflik):

1. **`articles.coverImage` nullable.** `03-database-design.md` mendefinisikan kolom ini
   `Not Null`, tetapi `04-api-contract.md` & `05-backend-prd.md` mengharuskan artikel
   baru dibuat dengan `coverImage: null` (upload cover terjadi di step terpisah setelah
   artikel disimpan). Schema Prisma di project ini membuat `coverImage` **nullable**
   agar alur "create draft dulu, upload cover kemudian" bisa berjalan — ini krusial untuk
   fungsionalitas, bukan sekadar preferensi gaya.
2. **Storage R2 client** memakai `@aws-sdk/client-s3` (S3-compatible), sesuai rekomendasi
   umum untuk Cloudflare R2 karena tidak ada SDK resmi Cloudflare untuk R2 storage object
   operations. Ini adalah "Official/populer SDK" terdekat (00-development-rules.md section 27).
3. **Reorder gambar** (`PUT /admin/cars/:id/images/reorder`) menerima **array mentah**
   `[{ imageId, sortOrder }, ...]` sebagai body, sesuai spesifikasi persis di
   `05-backend-prd.md` section 10.
4. **Rate limiting** memakai `express-rate-limit` in-memory (per proses). Cukup untuk
   MVP single-instance; jika nanti di-scale horizontal, ganti store ke Redis.
5. **Transaksi Telegram** bersifat fire-and-forget (`void` + `.catch`) — kegagalan kirim
   notifikasi tidak pernah menggagalkan `POST /leads`.
6. Express 5 menangani promise rejection dari async route handler secara otomatis
   (diteruskan ke `errorHandler`), sehingga controller tidak perlu try/catch manual.
7. `@types/express-serve-static-core` mengetik `req.params[key]` sebagai `string | string[]`
   (mengantisipasi wildcard route berulang). Tidak ada satupun route di project ini yang pakai
   wildcard, jadi dibuat helper kecil `src/utils/http.ts#getParam()` supaya seluruh controller
   tetap type-safe tanpa `as string` bertebaran di mana-mana.

## Definition of Done

Lihat `05-backend-prd.md` section 20. Checklist konfigurasi produksi (R2 credentials,
Telegram bot token, JWT secret yang kuat, `NODE_ENV=production`, `CORS_ORIGIN` sesuai
domain frontend) wajib diisi sebelum deploy.
