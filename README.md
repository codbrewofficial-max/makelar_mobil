# SuhuMobil (Working Title)

> Platform marketplace mobil bekas terkurasi — MVP fast-track, 30 hari validasi pasar.

Dokumen ini adalah **entry point utama**. Baca ini dulu sebelum membaca dokumen lain, siapa pun kamu (Claude untuk backend, atau Google AI Studio untuk frontend).

---

## 1. Ringkasan Proyek

SuhuMobil membantu masyarakat membeli/menjual mobil bekas lewat proses kurasi tenaga ahli berpengalaman 25 tahun, dibungkus platform digital yang cepat, transparan, dan mobile-first. Fokus MVP: menghasilkan **lead** dan **1-2 transaksi** dalam 30 hari pertama sejak live — bukan jadi marketplace terbesar dulu.

Detail lengkap ada di `01-business-overview.md`.

---

## 2. Tech Stack

| Layer | Teknologi |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, TanStack Query, Zustand, React Hook Form + Zod, TipTap |
| Backend | Node.js 22, Express.js 5, TypeScript, Prisma ORM 6, PostgreSQL 16, JWT + bcrypt, Multer + Sharp, sanitize-html |
| Storage | Cloudflare R2 |
| Infra | Docker, Docker Compose, Nginx, Cloudflare (DNS/CDN), VPS Ubuntu |
| Version Control | GitHub |

Prinsip pengembangan: **SOLID · DRY · KISS · YAGNI** — build fast, build clean, jangan over-engineer. Detail lengkap: `00-development-rules.md`.

---

## 3. Daftar Dokumen (Baca Sesuai Urutan)

| # | Dokumen | Isi | Wajib Dibaca Oleh |
| --- | --- | --- | --- |
| 00 | `00-development-rules.md` | Aturan mutlak: stack, naming, response format, security, storage rules, rich text rules | **Backend & Frontend** |
| 01 | `01-business-overview.md` | Konteks bisnis, KPI, user persona, user flow, scope MVP | Backend & Frontend (opsional tapi disarankan) |
| 02 | `02-project-blueprint.md` | Struktur folder, arsitektur layer, deployment flow | Backend & Frontend |
| 03 | `03-database-design.md` | Schema Prisma lengkap, ERD, semua tabel & enum | **Backend saja** |
| 04 | `04-api-contract.md` | Kontrak endpoint lengkap (request/response, error code) | **Backend & Frontend** (paling penting untuk integrasi) |
| 05 | `05-backend-prd.md` | Spesifikasi implementasi backend per modul, business logic detail | **Backend saja** |
| 06 | `06-frontend-prd.md` | Spesifikasi implementasi frontend per halaman & komponen | **Frontend saja** |

Kalau ada dokumen yang saling bertentangan, `00-development-rules.md` yang menang.

---

## 4. Instruksi untuk Backend (Claude / Claude Code)

Kamu membangun **backend saja** — REST API murni, tidak merender HTML apapun.

**Baca berurutan:**
1. `00-development-rules.md`
2. `03-database-design.md`
3. `04-api-contract.md`
4. `05-backend-prd.md` ← spesifikasi implementasi paling detail, ikuti persis

**Yang harus dihasilkan:**
- Project Node.js + Express + TypeScript + Prisma, struktur modular sesuai `05-backend-prd.md` section 4.
- Migrasi database sesuai schema di `03-database-design.md` (jangan ubah nama kolom/tabel tanpa alasan).
- Seluruh endpoint di `04-api-contract.md` — response format harus **persis** sesuai standar (section 3 di `04`).
- Middleware wajib: auth guard, rate limiter, error handler, validasi Zod (lihat `05-backend-prd.md` section 6).
- Upload gambar (mobil, artikel, logo) **wajib** lewat backend (multipart → Sharp proses → R2), **bukan** signed URL langsung ke client.
- Semua rich text (`description`, `content`) **wajib** disanitasi `sanitize-html` sebelum disimpan.
- Dockerfile + docker-compose untuk backend + PostgreSQL.
- Seed script: 1 user `OWNER`, 1 user `ADMIN`, default settings kosong/placeholder.

**Jangan:**
- Membuat halaman/komponen frontend apapun.
- Menyimpang dari format response standar atau struktur folder.
- Menambah fitur di luar `05-backend-prd.md` (termasuk section Out of Scope-nya).

**Definition of Done backend:** lihat `05-backend-prd.md` section 20.

---

## 5. Instruksi untuk Frontend (Google AI Studio)

Kamu membangun **frontend saja** — konsumsi REST API dari backend, tidak ada akses database langsung.

**Baca berurutan:**
1. `00-development-rules.md`
2. `04-api-contract.md` ← ini kontrak data yang kamu konsumsi, jangan asumsi struktur lain
3. `06-frontend-prd.md` ← spesifikasi implementasi paling detail, ikuti persis

**Yang harus dihasilkan:**
- Project Next.js 15 (App Router) + TypeScript + Tailwind, struktur sesuai `06-frontend-prd.md` section 4.
- Semua halaman public & admin di `06-frontend-prd.md` section 5 & 6.
- Komponen Popup Lead Form (WhatsApp CTA/FAB), Watermark, Rich Text Editor (TipTap) sesuai section 7 & 8.
- Integrasi API murni via `services/*.service.ts` (axios), base URL dari `NEXT_PUBLIC_API_BASE_URL`.
- SEO teknis lengkap (meta, structured data, sitemap, robots) sesuai section 10.
- Mobile-first, WCAG AA, Lighthouse >90 di semua metrik (section 11 & 16).

**Jangan:**
- Membuat logic backend/database sendiri — backend dibangun terpisah, kamu **hanya** memanggil endpoint di `04-api-contract.md`.
- Menyimpan data hasil fetch API di Zustand (itu tugas TanStack Query).
- Menambah fitur di luar `06-frontend-prd.md` (termasuk section Out of Scope-nya).

**Definition of Done frontend:** lihat `06-frontend-prd.md` section 17.

---

## 6. Struktur Repository

Backend dan frontend dibangun sebagai **dua proyek terpisah** (dua repo atau dua folder terpisah dalam satu repo), berkomunikasi murni lewat REST API — tidak ada shared code/database antara keduanya.

```
suhumobil/
  backend/          → dibangun oleh Claude, lihat 05-backend-prd.md
    src/
    prisma/
    docker/
    Dockerfile
    .env.example
  frontend/          → dibangun oleh Google AI Studio, lihat 06-frontend-prd.md
    src/
    public/
    Dockerfile
    .env.example
  docker-compose.yml  → orkestrasi backend + frontend + postgres (dibuat setelah kedua sisi selesai)
  docs/               → seluruh 00-06 + README ini
```

> Catatan: `02-project-blueprint.md` awalnya menggambarkan satu struktur `src/` tunggal (asumsi fullstack Next.js). Karena backend & frontend dikerjakan oleh dua tool AI berbeda secara independen, struktur final memisah jadi `backend/` dan `frontend/` seperti di atas — prinsip folder ownership per layer di `02` tetap berlaku **di dalam** masing-masing folder.

---

## 7. Environment Variables

### Backend (`backend/.env`)
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

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

Detail lengkap tiap variable: `05-backend-prd.md` section 15.

---

## 8. Alur Integrasi Backend ↔ Frontend

1. Backend jalan duluan di `http://localhost:4000` (atau domain API production).
2. Frontend fetch semua data lewat `NEXT_PUBLIC_API_BASE_URL` sesuai kontrak di `04-api-contract.md`.
3. Autentikasi admin pakai JWT di HttpOnly Cookie — frontend **wajib** `withCredentials: true` di axios, backend **wajib** CORS mengizinkan origin frontend + `credentials: true`.
4. Kalau backend & frontend dibangun terpisah dan ternyata ada mismatch (field hilang, nama beda, dll), sumber kebenaran adalah `04-api-contract.md` — perbaiki yang menyimpang dari kontrak, bukan sebaliknya.

---

## 9. Timeline

| Fase | Hari | Fokus |
| --- | --- | --- |
| Development | 1–5 | Setup, backend core, frontend core, admin dashboard, testing |
| Market Validation | 6–30 | Input unit mobil, konten media sosial, follow-up lead, closing, kumpulkan testimoni |

Detail & breakdown harian: `01-business-overview.md` section 17.

> Modul inti (`cars`, `car-images`, `leads`, CTA WhatsApp) prioritas nomor satu. Kalau waktu Hari 1-5 mepet, modul Article/Blog boleh dibuat versi paling sederhana dulu (judul, cover, rich text, publish/draft — tanpa tags/SEO lengkap dulu), lalu disempurnakan setelah live. Lihat `05-backend-prd.md` section 19.

---

## 10. Setelah Backend & Frontend Selesai (Checklist Kamu)

- [ ] Jalankan backend & frontend bareng secara lokal (docker-compose), test end-to-end: buka katalog → detail mobil → submit Popup WhatsApp → cek lead masuk di dashboard admin.
- [ ] Cek notifikasi Telegram benar-benar masuk saat ada lead baru.
- [ ] Cek upload gambar mobil, artikel, dan logo business profile berhasil dan muncul di R2.
- [ ] Cek watermark tampil di Footer, Card, dan Galeri — coba ganti label/link di admin, pastikan berubah di semua tempat tanpa redeploy.
- [ ] Jalankan Lighthouse audit di halaman utama & detail mobil (target di `00-development-rules.md` section 21).
- [ ] Setup domain di Cloudflare, arahkan DNS, aktifkan proxy/CDN.
- [ ] Deploy ke VPS via Docker (lihat `02-project-blueprint.md` section 23, Deployment Architecture).
- [ ] Setup backup harian database (`pg_dump` + upload ke R2).
- [ ] Isi minimal 3-5 unit mobil asli + business profile + settings (WA number, social links, watermark, GTM ID) sebelum go-live.
- [ ] Publish & mulai fase Market Validation (Hari 6-30).

---

## 11. Kalau Ada yang Tidak Jelas

Setiap dokumen (`00`–`06`) punya bagian "Approval" di paling bawah dan saling cross-reference satu sama lain. Kalau AI (Claude/Google AI Studio) menemukan sesuatu yang ambigu atau bertentangan antar dokumen saat proses build, prioritas penyelesaiannya:

1. `00-development-rules.md` menang atas semua dokumen lain.
2. `04-api-contract.md` menang untuk urusan kontrak data/endpoint.
3. `03-database-design.md` menang untuk urusan schema database.
4. Kalau masih ambigu juga — pilih opsi paling sederhana (prinsip KISS/YAGNI) dan catat asumsi yang diambil, jangan diam-diam menebak.

---

**End of Document**