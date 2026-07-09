# 05-backend-prd.md

> **Project:** SuhuMobil (Working Title)
>
> **Version:** 1.1.0
>
> **Status:** Draft — Pending Review
>
> **Document Type:** Backend Product Requirements Document
>
> **Target:** AI Assisted Development (Claude)
>
> **Referensi wajib:** `00-development-rules.md`, `01-business-overview.md`, `02-project-blueprint.md`, `03-database-design.md`, `04-api-contract.md`

---

# 1. Tujuan Dokumen

Dokumen ini adalah spesifikasi lengkap untuk membangun **backend** SuhuMobil. Dokumen ini dirancang untuk langsung dipakai sebagai prompt/context ke Claude untuk generate kode backend secara utuh.

Urutan membaca yang wajib diikuti Claude sebelum menulis kode:
1. `00-development-rules.md` — aturan mutlak, tidak boleh dilanggar
2. `03-database-design.md` — schema Prisma final
3. `04-api-contract.md` — kontrak endpoint final
4. Dokumen ini — spesifikasi implementasi & business logic detail

Jika ada konflik, `00-development-rules.md` selalu menang (lihat section 31 di dokumen tersebut).

---

# 2. Ringkasan Backend

Backend adalah REST API modular berbasis Express.js + TypeScript + Prisma + PostgreSQL, yang melayani:

- Frontend publik (katalog, detail mobil, form lead)
- Dashboard admin (CRUD mobil, kelola lead, setting)
- Integrasi pihak ketiga (Cloudflare R2 untuk gambar, Telegram Bot untuk notifikasi lead)

Backend **tidak** merender HTML — murni JSON API yang dikonsumsi Next.js frontend.

---

# 3. Tech Stack Backend (Recap)

| Layer | Teknologi |
| --- | --- |
| Runtime | Node.js 22 LTS |
| Framework | Express.js 5.x |
| Bahasa | TypeScript 5.x (Strict Mode) |
| ORM | Prisma 6.x |
| Database | PostgreSQL 16.x |
| Validasi | Zod |
| Auth | JWT + HttpOnly Cookie, bcrypt |
| Upload | Multer (terima file) + Sharp (proses) + Cloudflare R2 SDK (simpan) |
| Rich Text Sanitization | sanitize-html |
| Logging | Pino |
| Notifikasi | Telegram Bot API (fetch langsung, tanpa SDK tambahan) |

---

# 4. Module Structure

Mengikuti `00-development-rules.md` section 31 (Backend Architecture):

```
src/
  modules/
    auth/
      auth.controller.ts
      auth.service.ts
      auth.schema.ts
      auth.routes.ts
    users/
      users.service.ts        # internal only, no public routes
    cars/
      cars.controller.ts
      cars.service.ts
      cars.schema.ts
      cars.routes.ts
    car-images/
      car-images.controller.ts
      car-images.service.ts
      car-images.schema.ts
      car-images.routes.ts
    leads/
      leads.controller.ts
      leads.service.ts
      leads.schema.ts
      leads.routes.ts
    articles/
      articles.controller.ts
      articles.service.ts
      articles.schema.ts
      articles.routes.ts
    settings/
      settings.controller.ts
      settings.service.ts
      settings.schema.ts
      settings.routes.ts
    branding/
      branding.controller.ts
      branding.service.ts
      branding.routes.ts
    dashboard/
      dashboard.controller.ts
      dashboard.service.ts
      dashboard.routes.ts
  lib/
    prisma.ts
    logger.ts
    r2-client.ts
    telegram.ts
    jwt.ts
    sanitize.ts
  middleware/
    auth-guard.ts
    role-guard.ts
    error-handler.ts
    rate-limiter.ts
    validate-request.ts
  utils/
    slugify.ts
    response.ts
    image-processor.ts
    file-hash.ts
    reading-time.ts
  config/
    env.ts
  types/
  app.ts
  server.ts
```

Setiap module **tidak boleh** memanggil module lain secara langsung tanpa lewat service layer masing-masing (lihat `02-project-blueprint.md` section 14, Layer Architecture).

---

# 5. Cross-Cutting: Response Formatter

Semua controller **wajib** memakai helper response yang sama, jangan bikin object response manual berulang (DRY):

```ts
// utils/response.ts
export const success = (data: unknown, message = "Success", meta?: object) => ({
  success: true,
  message,
  data,
  ...(meta ? { meta } : {}),
});

export const failure = (message: string, errors?: object) => ({
  success: false,
  message,
  errors: errors ?? {},
});
```

Format ini **wajib** dipakai di semua endpoint, sesuai `00-development-rules.md` section 11.

---

# 6. Middleware

## 6.1 `error-handler.ts`
Global error handler (dipasang paling akhir di `app.ts`). Menangkap semua error, log via Pino, **tidak pernah** kirim stack trace ke client. Mapping error custom (misal `CAR_NOT_FOUND`) ke HTTP status dan `errors.code` sesuai tabel `04-api-contract.md` section 6.

## 6.2 `auth-guard.ts`
Membaca JWT dari cookie HttpOnly, verify signature & expiry. Jika invalid → `401`. Attach `req.user` (id, role) jika valid.

## 6.3 `role-guard.ts`
Middleware factory `roleGuard(['OWNER'])` — dipakai untuk endpoint yang hanya boleh diakses `OWNER` (belum ada di MVP ini, disiapkan untuk masa depan).

## 6.4 `rate-limiter.ts`
Implementasi sesuai `04-api-contract.md` section 15:
- `POST /auth/login` → 5/menit/IP
- `POST /leads` → 5/menit/IP
- Endpoint lain → 60/menit/IP

## 6.5 `validate-request.ts`
Middleware factory `validateBody(zodSchema)`, `validateQuery(zodSchema)`. Jika validasi gagal → response `422` format `failure()` dengan `errors` berisi field-level messages dari Zod.

---

# 7. Module: Auth

## Business Logic
- `POST /auth/login`: cari user by email → bandingkan password dengan bcrypt → jika cocok, generate JWT (payload: `{ userId, role }`, expiry 7 hari) → set cookie `HttpOnly`, `Secure` (production only), `SameSite=Strict` → return data user (tanpa password hash).
- `POST /auth/logout`: clear cookie.
- `GET /auth/me`: baca `req.user` dari `auth-guard`, ambil data lengkap dari DB, return.

## Edge Cases
- User dengan `deleted_at` terisi tidak boleh bisa login (soft-deleted).
- Salah password 5x dalam 1 menit → kena rate limiter, bukan account lockout (MVP tidak perlu lockout kompleks, sesuai YAGNI).

---

# 8. Module: Users

- **Tidak ada public route.** Module ini hanya dipakai secara internal oleh `auth` module untuk lookup user, dan oleh seed script.
- Tidak ada endpoint create/update/delete user di MVP (public registration di luar scope, lihat `00-development-rules.md` section 29). Penambahan user baru dilakukan manual lewat seed script atau langsung ke database oleh Owner.

---

# 9. Module: Cars

## Business Logic

**Create (`POST /admin/cars`):**
1. Validasi body dengan Zod (semua field wajib sesuai `03-database-design.md` section 6, kecuali `color` & `inspectionReport` yang nullable).
2. Generate `slug` dari `title` (lowercase, kebab-case). Jika sudah ada di DB, tambahkan suffix random 4 karakter (contoh: `toyota-avanza-2019-g-mt-x7f2`).
3. Set `status: DRAFT` secara default (tidak bisa langsung `PUBLISHED` saat create).
4. Set `created_by` dari `req.user.id`.

**Update (`PUT /admin/cars/:id`):** update field yang dikirim, slug **tidak berubah** meski title berubah (supaya URL lama tidak broken — kalau memang perlu ganti slug, buat mobil baru).

**Update Status (`PATCH /admin/cars/:id/status`):**
- Validasi transisi sesuai tabel di `04-api-contract.md` section 12. Transisi tidak valid → `409 INVALID_STATUS_TRANSITION`.
- Transisi ke `PUBLISHED` wajib cek jumlah `car_images` milik mobil ini ≥ 5. Jika kurang → `422 IMAGE_MINIMUM_NOT_MET`.

**Delete (`DELETE /admin/cars/:id`):**
1. Ambil semua `car_images` milik mobil ini.
2. Hapus semua file tersebut dari Cloudflare R2 **terlebih dahulu** (loop, panggil R2 delete object).
3. Baru soft-delete row `cars` (set `deleted_at`).
4. Jika gagal di step 2 (misal R2 error), **jangan lanjut** ke step 3 — return `500`, biar admin bisa retry (mencegah orphan file sebagian, atau data ke-soft-delete tapi file masih ada).

**List Public (`GET /cars`):** filter wajib `status = 'PUBLISHED'` dan `deleted_at IS NULL` — hardcode di query, tidak boleh jadi parameter yang bisa di-override dari luar.

**List Admin (`GET /admin/cars`):** semua status termasuk yang soft-deleted **tidak** ditampilkan (kecuali ada filter eksplisit `includeDeleted=true` — opsional, tidak wajib MVP).

---

# 10. Module: Car Images

## Business Logic (`POST /admin/cars/:id/images`)

Ikuti alur `04-api-contract.md` section 10 persis:

1. Terima file via Multer (memory storage, bukan disk storage — jangan simpan file mentah ke disk server).
2. Validasi MIME type: hanya `image/jpeg`, `image/png`, `image/webp`. Selain itu → `422`.
3. Validasi ukuran file ≤ 5 MB (Multer limit).
4. Cek jumlah gambar mobil ini saat ini. Jika sudah 20 → `422 IMAGE_LIMIT_EXCEEDED`, **jangan proses lebih lanjut** (hemat resource).
5. Hitung SHA-256 hash dari buffer file. Cek ke DB: apakah `file_hash` ini sudah ada untuk `car_id` yang sama? Jika ya → `409`.
6. Proses dengan **Sharp**: resize max 1920×1080 (jaga aspect ratio, tidak upscale gambar kecil), convert ke WebP, compress target ≤500 KB (coba quality 80, turunkan bertahap jika masih di atas 500 KB).
7. Generate filename UUID, tentukan path `cars/{tahun}/{bulan}/{uuid}.webp` berdasarkan tanggal upload saat ini.
8. Upload buffer hasil proses ke Cloudflare R2 menggunakan `r2-client.ts`.
9. Cek kuota storage total (lihat section 11 di bawah) sebelum atau sesudah upload — jika sudah 100%, tolak dengan `422 STORAGE_QUOTA_EXCEEDED` **sebelum** upload dilakukan (cek dulu baru upload, supaya tidak upload sia-sia).
10. Simpan metadata ke tabel `car_images` (`url`, `file_hash`, `size_bytes` dari hasil buffer final setelah Sharp, `sort_order` = jumlah gambar existing, `is_cover` dari body, default `false`).
11. Jika `isCover: true` dikirim, set seluruh gambar lain milik mobil ini ke `is_cover: false` dulu (hanya 1 cover per mobil).

## Storage Quota Check
Sumber kebenaran adalah kolom `size_bytes` di tabel `car_images` (lihat `03-database-design.md` section 8, sudah ditambahkan). Cek kuota dengan query `SUM(size_bytes)` dari seluruh `car_images` (join ke `cars` yang `deleted_at IS NULL`), bandingkan dengan batas 1 GB (`00-development-rules.md` section 28).

Cek dilakukan **sebelum** upload ke R2 (setelah Sharp selesai memproses dan tahu ukuran final file, tapi sebelum benar-benar dikirim ke R2) — supaya tidak upload sia-sia kalau ternyata kuota sudah penuh.

Untuk endpoint `GET /admin/dashboard/stats` (section 13), gunakan query `SUM(size_bytes)` yang sama — tidak perlu cache terpisah di MVP (jumlah data masih kecil, agregasi Postgres cukup cepat).

## Reorder (`PUT /admin/cars/:id/images/reorder`)
Request: array of `{ imageId, sortOrder }`. Update `sort_order` masing-masing dalam 1 transaction Prisma.

## Delete (`DELETE /admin/cars/:id/images/:imageId`)
1. Hapus file dari R2 dulu.
2. Baru hapus row dari DB (hard delete, bukan soft delete — sesuai `03-database-design.md`, `car_images` tidak punya `deleted_at`).
3. Jika gambar yang dihapus adalah cover, sistem **tidak otomatis** menetapkan cover baru — admin harus set manual (hindari kompleksitas, sesuai KISS).

---

# 11. Module: Leads

## Business Logic (`POST /leads`)

1. Validasi body sesuai `source`:
   - `source: DREAM_CAR_FORM` → wajib `name`, `phone`; optional `city`, `budget`, `carInterest`.
   - `source: WHATSAPP_CTA` → wajib `name`, `phone`, `subject`, `message`, `carId`; optional `email`.
   - `source: WHATSAPP_FAB` → wajib `name`, `phone`, `subject`, `message`; `carId` selalu `null`; optional `email`.
   - `source: CONTACT_PAGE` → wajib `name`, `phone`; optional lainnya.
2. Simpan ke DB dengan `status: NEW`.
3. Kirim notifikasi Telegram (fire-and-forget — pakai `void sendTelegramNotification(...)` tanpa `await` blocking response, atau `await` dengan try-catch yang tidak melempar error ke caller).
4. Return `201` segera setelah DB tersimpan (tidak menunggu Telegram selesai jika ingin response lebih cepat — pilihan implementasi, tapi harus konsisten).

## Format Notifikasi Telegram

Contoh pesan (Markdown):
```
🔔 *Lead Baru*
Nama: {name}
Telepon: {phone}
Sumber: {source}
{jika ada carId: Mobil: {car.title}}
{jika ada subject: Subjek: {subject}}
{jika ada message: Pesan: {message}}
```

## Admin Endpoints
- `GET /admin/leads`: filter `status`, `source`, `search` (ILIKE pada `name`/`phone`), pagination.
- `PATCH /admin/leads/:id`: hanya boleh update `status` dan `notes`. Field lain (`name`, `phone`, dll) **tidak boleh** diubah dari endpoint ini (data lead dari pengunjung harus tetap otentik).
- **Tidak ada endpoint DELETE** — hard rule dari business requirement, jangan tambahkan meski "iseng" untuk kebutuhan testing.

---

# 12. Module: Articles

## Business Logic

**Create (`POST /admin/articles`):**
1. Validasi body dengan Zod (`title`, `excerpt`, `content` wajib; `tags` optional max 5 item).
2. **Sanitasi `content`** menggunakan `sanitize-html` (whitelist tag sesuai `00-development-rules.md` section 34) sebelum disimpan — ini **wajib**, tidak boleh dilewati.
3. Hitung `readingTimeMinutes` otomatis: strip HTML tags dari `content` → hitung jumlah kata → bagi 200 (rata-rata kecepatan baca per menit) → bulatkan ke atas, minimal 1.
4. Generate `slug` dari `title` (sama pola seperti `cars.slug`, tambah suffix random jika duplikat).
5. Set `status: DRAFT`, `authorId` dari `req.user.id`.

**Update (`PUT /admin/articles/:id`):** update field yang dikirim, sanitasi ulang `content` jika berubah. `slug` tidak berubah meski title berubah (sama seperti cars, jaga URL lama).

**Update Status (`PATCH /admin/articles/:id/status`):**
- Ke `PUBLISHED` → validasi `coverImage` sudah ada (tidak `null`). Jika belum → `422` dengan pesan jelas.
- Saat pertama kali menjadi `PUBLISHED`, isi `publishedAt` dengan `now()`. Jika sudah pernah `PUBLISHED` sebelumnya (misal sempat di-`DRAFT`-kan lagi lalu `PUBLISHED` lagi), `publishedAt` **tidak** direset — biarkan tanggal publish pertama.

**Cover Upload (`POST /admin/articles/:id/cover`):** proses sama seperti upload gambar mobil (Sharp: resize max 1920×1080, convert WebP, compress), tapi hanya 1 file per artikel (replace jika sudah ada — hapus cover lama dari R2 sebelum simpan yang baru).

**Delete (`DELETE /admin/articles/:id`):** hapus cover dari R2 dulu, baru soft-delete row (pola sama seperti `cars`).

**List Public (`GET /articles`):** filter wajib `status = 'PUBLISHED'` dan `deleted_at IS NULL`. Filter `tag` menggunakan Prisma array `has` operator.

---

# 13. Module: Settings & Branding

## Settings
- `GET /settings/public`: hanya return whitelist key: `site_title`, `whatsapp_number`, `social_links`, `watermark`, `business_profile` (subset: `logoUrl`, `name`, `tagline` saja — **jangan** kirim `description` panjang kecuali memang dibutuhkan halaman About), `gtm_id`, `ga4_id`. Key `storage_quota_gb` **tidak** boleh keluar lewat endpoint ini.
- `GET /admin/settings`: return semua key apa adanya.
- `PUT /admin/settings`: terima object partial `{ key: value }`, upsert tiap key yang dikirim (tidak perlu kirim semua key sekaligus). Jika body mengandung `businessProfile.description`, **wajib disanitasi** via `sanitize-html` sebelum disimpan.

## Branding (Logo Upload)
- `POST /admin/settings/branding/logo`: terima file via Multer (memory storage) → validasi MIME → proses Sharp (resize max 512×512, convert WebP, compress) → upload ke R2 folder `branding/` dengan nama UUID → update key `business_profile` di tabel `settings` (merge `logoUrl` ke object JSON yang sudah ada, jangan overwrite field lain seperti `name`/`tagline`).
- Hapus logo lama dari R2 sebelum simpan yang baru (hindari orphan file, sama prinsipnya dengan car images).

---

# 14. Module: Dashboard

`GET /admin/dashboard/stats` — agregasi sederhana pakai Prisma `count()` dan `groupBy()`:
- `totalCars`, `publishedCars`, `soldCars` dari tabel `cars` (exclude `deleted_at`).
- `totalLeads`, `newLeads` dari tabel `leads`.
- `totalArticles`, `publishedArticles` dari tabel `articles` (exclude `deleted_at`).
- `storageUsedMb`, `storageQuotaMb` dari mekanisme tracking storage (lihat section 10).

Tidak perlu caching di MVP (traffic masih kecil, query langsung cukup cepat).

---

# 15. Environment Variables

```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=
R2_ENDPOINT=
R2_PUBLIC_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

Tidak boleh hardcode credential di manapun di source code (lihat `02-project-blueprint.md` section 15).

---

# 16. Security Checklist (Wajib Diimplementasi)

- [ ] Helmet middleware aktif
- [ ] CORS dibatasi ke `CORS_ORIGIN` frontend saja, bukan `*`
- [ ] Rate limiting per endpoint (section 6.4)
- [ ] Semua input divalidasi Zod sebelum masuk service layer
- [ ] Password di-hash bcrypt (salt rounds minimal 10)
- [ ] Cookie JWT: `HttpOnly`, `Secure` (production), `SameSite=Strict`
- [ ] Prisma parameterized query otomatis mencegah SQL Injection (jangan pakai raw query kecuali darurat)
- [ ] Tidak ada stack trace di response error
- [ ] Semua field rich text (`cars.description`, `articles.content`, `settings.business_profile.description`) disanitasi `sanitize-html` sebelum disimpan

---

# 17. Logging Rules (Implementasi)

Menggunakan Pino, log minimal untuk: Login, Logout, Create Car, Update Car, Delete Car, Create Lead, Update Lead Status, Error tak tertangani.

Format log terstruktur (JSON), contoh:
```json
{ "level": "info", "action": "CAR_CREATED", "userId": "uuid", "carId": "uuid", "timestamp": "..." }
```

Tidak pernah log: password, JWT token, isi cookie.

---

# 18. Docker Setup (Backend)

```
docker/
  Dockerfile.backend
docker-compose.yml   # services: backend, postgres
```

`Dockerfile.backend` (multi-stage): build TypeScript → production image hanya berisi `dist/` + `node_modules` production.

`docker-compose.yml` minimal punya service `backend` dan `postgres` (dengan volume persist data). R2 dan Telegram diakses via internet, tidak perlu container tambahan.

---

# 19. Development Order (Backend Only)

Mengikuti `02-project-blueprint.md` section 26 (Coding Workflow), urutan build backend:

1. Setup project (Express + TypeScript + Prisma init)
2. Apply schema dari `03-database-design.md` → `prisma migrate dev`
3. Seed data (Owner user, Admin user, default settings termasuk `watermark`, `business_profile` kosong)
4. Module `auth` (login, logout, me) + middleware `auth-guard`
5. Module `cars` (CRUD + status transition) — **prioritas tinggi, inti bisnis**
6. Module `car-images` (upload + Sharp + R2 + reorder + cover + delete) — **prioritas tinggi**
7. Module `leads` (create + list + update status + Telegram notification, termasuk source `WHATSAPP_FAB`) — **prioritas tinggi**
8. Module `settings` + `branding` (public + admin + upload logo)
9. Module `articles` (CRUD + rich text sanitization + reading time + cover upload)
10. Module `dashboard` (stats, termasuk total artikel)
11. Security hardening (Helmet, rate limiter, CORS)
12. Testing manual seluruh endpoint sesuai `04-api-contract.md`
13. Dockerize & siapkan untuk deployment

> Urutan 5–7 (`cars`, `car-images`, `leads`) adalah modul inti yang paling menentukan KPI (Section 5, `01-business-overview.md`) — dahulukan ini jika waktu Hari 1–5 mepet. Modul `articles` (poin 9) boleh dibuat versi paling sederhana dulu (tanpa tags/SEO lengkap) jika waktu tidak cukup, lalu disempurnakan di Hari 6–30 (lihat `01-business-overview.md` section 18, Risk).

---

# 20. Definition of Done (Backend)

Sesuai `00-development-rules.md` section 30, ditambah spesifik backend:

- Semua endpoint di `04-api-contract.md` terimplementasi dan response-nya sesuai format standar.
- Semua business rule di section 9–14 dokumen ini terpenuhi.
- Tidak ada error TypeScript, tidak ada error ESLint.
- `prisma migrate deploy` berhasil dijalankan tanpa error.
- Upload gambar berhasil end-to-end (file masuk R2 dalam format WebP, ukuran ≤500KB) — termasuk cover mobil, cover artikel, dan logo business profile.
- Notifikasi Telegram terkirim saat lead baru masuk (semua source, termasuk `WHATSAPP_FAB`).
- Rich text content (`description`, `content`) tersimpan dalam bentuk HTML yang sudah disanitasi, tidak ada tag berbahaya lolos.
- Build Docker image berhasil, container jalan tanpa crash.

---

# 21. Out of Scope (Backend)

Tidak dikerjakan di MVP backend:

- Refresh token / rotate token
- Multi-session management
- Email service (notifikasi hanya via Telegram)
- Webhook eksternal
- Background job queue (semua proses dilakukan synchronous dalam request)
- Full-text search engine (pakai `ILIKE` Postgres biasa dulu)
- Komentar & likes/claps pada artikel
- Multi-author article (hanya 1 penulis per artikel, dari user yang login)
- Versioning/history draft artikel

---

# Approval

| Role | Status |
| --- | --- |
| Software Architect | ✅ Approved |
| Product Owner | ⏳ Pending Review |

---

**End of Document**