# 00-development-rules.md

> **Project:** SuhuMobil (Working Title)
>
> **Version:** 1.2.0
>
> **Status:** Approved
>
> **Document Type:** Development Rules
>
> **Target:** AI Assisted Development (ChatGPT, Claude Code, Cursor, Gemini CLI, Codex, dll)

---

# 1. Tujuan Dokumen

Dokumen ini merupakan **aturan utama (Single Source of Truth)** yang wajib menjadi acuan selama proses pengembangan.

Seluruh AI maupun developer **harus mengikuti aturan ini terlebih dahulu** sebelum membaca dokumen lain.

Dokumen ini dibuat untuk menjaga:

- Konsistensi kode
- Konsistensi struktur project
- Konsistensi API
- Konsistensi Database
- Konsistensi UI
- Build Fast
- Publish Fast
- Production Ready

---

# 2. Filosofi Pengembangan

Project ini memiliki prinsip utama:

> **Build Fast. Build Clean. Publish Fast. Improve Continuously.**

Artinya:

- Jangan membuat fitur yang belum dibutuhkan.
- Jangan melakukan over engineering.
- Jangan membuat abstraksi yang tidak memiliki manfaat.
- Fokus pada MVP berkualitas.
- Seluruh fitur harus mudah dikembangkan kembali.

---

# 3. Prinsip MVP

MVP hanya memiliki tujuan:

- Membuktikan produk dapat digunakan.
- Menghasilkan leads.
- Membantu closing penjualan.
- Menjadi fondasi pengembangan berikutnya.

Jika sebuah fitur tidak membantu tujuan tersebut maka **tidak termasuk MVP.**

---

# 4. Technology Stack

## Frontend

| Technology | Version |
| --- | --- |
| Next.js | 15.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| TanStack Query | Latest |
| Zustand | Latest |
| React Hook Form | Latest |
| Zod | Latest |
| Axios | Latest |
| Lucide React | Latest |
| TipTap (Rich Text Editor) | Latest |

## Backend

| Technology | Version |
| --- | --- |
| Node.js | 22 LTS |
| Express.js | 5.x |
| TypeScript | 5.x |
| Prisma ORM | 6.x |
| PostgreSQL | 16.x |
| JWT | Latest |
| bcrypt | Latest |
| Multer | Latest |
| Sharp | Latest |
| Pino | Latest |
| Zod | Latest |
| sanitize-html | Latest |

## Infrastructure

- Docker
- Docker Compose
- Nginx
- Ubuntu Server
- Cloudflare
- Cloudflare R2

## Development Tools

- Git
- GitHub
- VS Code
- Cursor
- ChatGPT
- Claude Code
- Gemini CLI

---

# 5. Development Principle

Seluruh source code harus memenuhi prinsip berikut.

## SOLID
Gunakan prinsip SOLID secukupnya. Jangan membuat abstraksi berlebihan.

## DRY
Don't Repeat Yourself. Jika terdapat logic yang digunakan lebih dari satu tempat maka pindahkan menjadi helper.

## KISS
Keep It Simple. Lebih baik sederhana tetapi mudah dipahami dibanding kompleks.

## YAGNI
You Aren't Gonna Need It. Jangan membuat fitur yang belum dibutuhkan.

---

# 6. Project Structure Rules

Project harus menggunakan struktur yang konsisten.

```
src/
  app/
  components/
  features/
  services/
  hooks/
  lib/
  types/
  utils/
  constants/
  config/
  middleware/
```

Setiap folder hanya memiliki satu tanggung jawab.

---

# 7. Folder Responsibility

## app
Routing. Tidak boleh menyimpan business logic.

## features
Seluruh logic berdasarkan fitur.

```
features/
  cars/
  leads/
  dashboard/
  settings/
  auth/
```

## services
Berisi komunikasi API. Tidak boleh ada UI.

## lib
Konfigurasi library. Contoh: prisma, logger, storage, auth.

## utils
Pure Function. Tidak boleh memanggil API.

## components
Reusable UI. Tidak boleh mengetahui database.

---

# 8. Naming Convention

## Folder
`kebab-case` — contoh: `car-detail`, `lead-form`, `dashboard-layout`

## File
`kebab-case` — contoh: `car-card.tsx`, `api-client.ts`, `upload-image.ts`

## Component
`PascalCase` — contoh: `CarCard`, `Navbar`, `Footer`

## Variable
`camelCase` — contoh: `carPrice`, `userProfile`, `leadStatus`

## Constant
`UPPER_SNAKE_CASE` — contoh: `MAX_UPLOAD_SIZE`, `DEFAULT_LIMIT`, `JWT_SECRET`

---

# 9. Database Rules

Gunakan:

- UUID
- snake_case
- timestamp
- soft delete

Contoh: `created_at`, `updated_at`, `deleted_at`

Primary Key: `id UUID` — **tidak** menggunakan integer auto increment.

---

# 10. API Rules

Semua endpoint menggunakan prefix `/api/v1`

Contoh:
```
GET  /api/v1/cars
POST /api/v1/leads
```

---

# 11. API Response Standard

Semua endpoint WAJIB menggunakan format berikut.

Success:
```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

Error:
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": {}
}
```

Tidak diperbolehkan mengubah struktur response.

---

# 12. HTTP Status

| Code | Keterangan |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

# 13. Validation Rules

Semua request wajib divalidasi menggunakan Zod. Tidak boleh mempercayai input user.

---

# 14. Error Handling

Jangan pernah mengembalikan stack trace kepada frontend. Seluruh error harus dicatat ke logger.

---

# 15. Authentication Rules

- Menggunakan JWT Authentication.
- Password menggunakan bcrypt.
- Session menggunakan HttpOnly Cookie.
- Tidak menyimpan password dalam bentuk plain text.

---

# 16. Authorization

Role sistem awal (MVP):

```
Owner
Admin
```

Tidak membuat RBAC kompleks pada MVP.

> **Catatan Peran Kurator:** Kurator (teknisi/inspector) adalah **peran fungsional/bisnis**, bukan role sistem yang terpisah. Secara teknis, Kurator login menggunakan akun **Admin** yang sama untuk melakukan input inspeksi, CRUD mobil, dan update status. Ini konsisten dengan prinsip YAGNI — role terpisah untuk Kurator bisa ditambahkan di Phase 2 jika memang dibutuhkan pemisahan akses.

---

# 17. Upload Rules

- Semua gambar disimpan di Cloudflare R2.
- Format wajib: WebP.
- Ukuran maksimum per file: 5 MB.
- Multiple upload didukung.

---

# 18. Image Rules

Semua gambar harus:

- Lazy Loading
- Responsive
- Optimized
- CDN

Tidak menyimpan gambar di VPS.

---

# 19. UI Rules

Seluruh halaman wajib memiliki:

- Loading State
- Empty State
- Error State
- Success State

Tidak boleh ada halaman kosong.

---

# 20. Responsive Rules

Minimal support: Mobile, Tablet, Desktop.
Pendekatan: Mobile First.

---

# 21. Performance Rules

Target Lighthouse:

- Performance > 90
- Accessibility > 90
- SEO > 95
- Best Practice > 90

---

# 22. SEO Rules

Semua halaman publik wajib memiliki:

- Title
- Description
- Open Graph
- Canonical URL
- Structured Data
- Sitemap
- Robots

---

# 23. Security Rules

Minimal keamanan:

- Helmet Header
- Rate Limit
- Input Validation
- SQL Injection Protection
- XSS Protection
- CSRF Protection
- Secure Cookie

---

# 24. Logging Rules

Seluruh aktivitas berikut dicatat: Login, Logout, Create, Update, Delete, Error.
Tidak mencatat password.

---

# 25. Git Rules

Branch: `main`, `develop`, `feature/*`

Commit menggunakan Conventional Commit:
```
feat:
fix:
refactor:
docs:
style:
test:
chore:
```

---

# 26. Coding Rules

Seluruh kode wajib: ESLint, Prettier, TypeScript Strict Mode.
Tidak boleh menggunakan `any` kecuali benar-benar diperlukan.

---

# 27. Third Party Rules

Prioritaskan:

- Official SDK
- Library populer
- Library aktif dikembangkan

Hindari dependency yang tidak memiliki maintenance.

---

# 28. Storage Rules

## Tujuan
Storage digunakan hanya untuk menyimpan gambar kendaraan yang ditampilkan pada website. Storage **bukan** digunakan sebagai file hosting umum.

## Storage Provider
Cloudflare R2

## Kapasitas & Kuota
| Item | Batas |
| --- | --- |
| Total Storage | 1 GB |
| Maksimal Unit Mobil | 200 Unit |
| Gambar per Kendaraan | Min 5 — Max 20 |
| Upload per File | Max 5 MB |
| Target Kompresi | ≤ 500 KB |

Jika kapasitas mencapai 90%, sistem harus memberikan peringatan kepada admin.
Jika kapasitas mencapai 100%, upload gambar baru ditolak sampai admin menghapus data yang tidak digunakan atau meningkatkan kapasitas.

## Image Format
Seluruh gambar wajib dikonversi menjadi **WebP**.

Tidak diperbolehkan menyimpan format: PNG, BMP, TIFF, RAW, HEIC.

Frontend boleh menerima JPG/JPEG saat upload, tetapi backend wajib mengonversinya ke WebP sebelum disimpan ke Cloudflare R2.

## Image Resolution
Maksimal 1920 × 1080. Jika gambar lebih besar, backend wajib melakukan resize otomatis.

## Duplicate Image
Backend harus melakukan pemeriksaan hash file untuk mencegah penyimpanan gambar yang sama lebih dari satu kali apabila memungkinkan.

## File Naming
Gunakan UUID. Contoh: `c8c26c0d-4b18-41c7.webp`
Tidak menggunakan nama file asli dari pengguna.

## Folder Structure (Cloudflare R2)
```
cars/
  2026/
    07/
      uuid.webp
```

## Delete Policy
Jika data kendaraan dihapus permanen, seluruh gambar yang terkait wajib ikut dihapus dari Cloudflare R2. Tidak boleh ada orphan file.

## Security Rules
Upload hanya diperbolehkan untuk: `image/jpeg`, `image/png`, `image/webp`. Selain itu harus ditolak.

## Monitoring
Dashboard admin harus menampilkan:

- Total Storage Digunakan
- Persentase Penggunaan
- Jumlah File
- Rata-rata Ukuran File

Contoh:
```
Storage: 642 MB / 1 GB (64%)
120 Files — Average 320 KB
```

---

# 29. Out of Scope MVP

Fitur berikut **tidak dikerjakan** pada MVP:

- Multi Vendor
- Multi Showroom
- Marketplace
- Live Chat
- Payment Gateway
- Kredit Online
- Multi Language
- Mobile Apps
- Push Notification
- AI Recommendation
- Wishlist
- Compare Car
- Public Registration

---

# 30. Definition of Done (DoD)

Sebuah fitur dianggap selesai apabila:

- Business Rule selesai
- API selesai
- Validation selesai
- UI selesai
- Responsive
- Error Handling tersedia
- Loading tersedia
- Empty State tersedia
- Tidak ada error TypeScript
- Tidak ada error ESLint
- Build berhasil
- Berjalan di production

---

# 31. Prinsip Pengembangan AI

Seluruh AI Assistant yang digunakan pada project ini wajib mengikuti aturan berikut:

1. Jangan mengubah struktur project tanpa alasan yang jelas.
2. Jangan menambahkan library baru jika fungsi yang sama sudah tersedia.
3. Jangan membuat kode yang terlalu kompleks.
4. Selalu mengutamakan readability dibanding clever code.
5. Selalu mengikuti standar folder, API, database, dan response yang telah ditetapkan.
6. Jika terdapat konflik antara dokumen lain dengan dokumen ini, maka **`00-development-rules.md` menjadi acuan utama**.

---

# 32. Backend Architecture

Backend menggunakan Node.js + Express.js dengan pendekatan Modular Architecture.

Setiap module memiliki struktur yang sama sehingga mudah dikembangkan dan dipelihara.

```
src/
  modules/
    auth/
    users/
    cars/
    leads/
    dashboard/
    settings/
    uploads/
```

Tidak diperbolehkan mencampurkan business logic antar module.

---

# 33. Image Processing Rules

Seluruh gambar wajib diproses oleh backend sebelum dikirim ke Cloudflare R2.

Proses yang dilakukan:

1. Validasi MIME Type
2. Resize maksimal 1920x1080
3. Convert ke WebP
4. Compress
5. Generate UUID Filename
6. Upload ke Cloudflare R2

Library yang digunakan: **Sharp**

Backend tidak diperbolehkan menyimpan file asli.

---

# 34. Rich Text Content Rules

Field yang menggunakan Rich Text Editor: `cars.description`, `articles.content`, `settings.business_profile.description`.

- Editor frontend: **TipTap**, dengan toolbar dibatasi (Heading, Bold, Italic, List, Blockquote, Link, Image embed, Code block). Tidak perlu fitur di luar itu (KISS).
- Konten disimpan sebagai **HTML string** di database (bukan JSON block terstruktur) — lebih sederhana untuk MVP.
- **Wajib disanitasi di backend** menggunakan `sanitize-html` sebelum disimpan ke database, dengan whitelist tag: `p, h1, h2, h3, strong, em, ul, ol, li, blockquote, a, img, code, pre, br`. Tag/attribute di luar whitelist ini (termasuk `<script>`, event handler seperti `onclick`) **wajib dihapus**.
- Sanitasi dilakukan **server-side**, tidak boleh hanya mengandalkan sanitasi di frontend (frontend bisa dilewati langsung via API call).
- Panjang maksimal konten: tidak dibatasi ketat di database (`TEXT` unlimited), tapi disarankan validasi Zod max ~50.000 karakter untuk `articles.content` guna mencegah abuse.

---

# 35. Analytics & Tracking Rules

- Google Tag Manager (`gtm_id`) dan/atau Google Analytics 4 (`ga4_id`) disimpan sebagai key di tabel `settings`, **bukan** hardcode di environment variable — supaya admin bisa ganti tanpa perlu deploy ulang.
- ID ini **tidak sensitif** (bukan secret), sehingga boleh diekspos lewat endpoint `GET /settings/public`.
- Script GTM di-inject di root layout frontend, hanya jika `gtmId` terisi (tidak boleh render script kosong/`undefined`).

---

# Approval

| Role | Status |
| --- | --- |
| Software Architect | ✅ Approved |
| Product Owner | ⏳ Pending Review |

---

**End of Document**