# 02-project-blueprint.md

> Project : SuhuMobil (Working Title)
>
> Version : 1.3.0
>
> Status : Approved
>
> Document Type : Project Blueprint
>
> Target : AI Assisted Development

---

# 1. Tujuan Dokumen

Dokumen ini menjelaskan bagaimana proyek dibangun dari sisi teknis.

Seluruh developer maupun AI Assistant wajib mengikuti struktur yang dijelaskan pada dokumen ini.

Dokumen ini menjadi acuan utama dalam:

- Struktur Repository
- Struktur Folder
- Arsitektur Sistem
- Teknologi
- Deployment
- Development Workflow

---

# 2. Prinsip Arsitektur

Project dibangun menggunakan prinsip berikut:

- Simple First
- Feature First
- Clean Code
- Modular
- Scalable
- Easy Maintenance
- Production Ready

Target utama bukan membuat sistem paling kompleks, tetapi membuat sistem yang mudah dikembangkan dalam jangka panjang.

---

# 3. Technology Stack

## Frontend
Next.js 15+, React 19+, TypeScript, Tailwind CSS, React Hook Form, Zod, TanStack Query, Zustand, TipTap (Rich Text Editor)

## Backend
Node.js, Prisma ORM, PostgreSQL

## Infrastructure
Docker, Nginx, VPS Ubuntu, Cloudflare

## Storage
Cloudflare R2

## Tools
Git, GitHub, VS Code, Cursor / Claude Code / ChatGPT

---

# 4. Repository Structure

Project menggunakan single repository.

```
suhumobil/
  docs/
  prisma/
  public/
  scripts/
  src/
  docker/
  .env.example
  Dockerfile
  docker-compose.yml
  package.json
  README.md
```

---

# 5. Source Structure

```
src/
  app/
  components/
  features/
  hooks/
  lib/
  services/
  types/
  utils/
  config/
  constants/
  middleware/
  styles/
```

Setiap folder memiliki satu tanggung jawab.

---

# 6. Feature Structure

Seluruh business logic dikelompokkan berdasarkan fitur.

```
features/
  cars/
  leads/
  dashboard/
  auth/
  settings/
  home/
  articles/
  branding/
```

Contoh isi folder:

```
cars/
  components/
  services/
  hooks/
  schemas/
  types/
  utils/
  actions/
```

Dengan pendekatan ini setiap fitur berdiri sendiri dan mudah dipindahkan.

---

# 7. App Router Structure

```
app/
  (page)/
    about/
    cars/
    cars/[slug]/
    contact/
    articles/
    articles/[slug]/
  admin/
    admin/dashboard/
    admin/cars/
    admin/leads/
    admin/articles/
    admin/business-profile/
    admin/settings/
  api/
```

---

# 8. Component Structure

Komponen dibagi menjadi dua jenis.

## Shared Component
Digunakan oleh banyak halaman. Contoh: `Button`, `Card`, `Input`, `Modal`, `Table`, `Badge`, `Loading`

## Feature Component
Digunakan hanya pada satu fitur. Contoh: `CarCard`, `CarGallery`, `LeadForm`, `DashboardStat`

---

# 9. Request Flow

```
Browser → Next.js → Route Handler → Service → Prisma → PostgreSQL → Response → Browser
```

Business logic tidak boleh langsung ditulis pada halaman.

---

# 10. Upload Image Flow

```
Admin → Pilih File → Upload ke Backend (multipart/form-data)
→ Backend Proses via Sharp (validasi MIME, resize, convert WebP, compress)
→ Backend Upload ke Cloudflare R2 → Simpan URL ke Database → Selesai
```

Server **tidak menyimpan file asli secara permanen** — file hanya diproses sementara (in-memory/temp) sebelum diteruskan ke Cloudflare R2 (lihat `00-development-rules.md` section 32–33, Image Processing Rules). Ini berbeda dari pola signed-URL/direct-upload karena Sharp wajib memproses file di sisi server terlebih dahulu.

---

# 11. Lead Flow

```
Visitor → Form Lead → API → Validation → Database
→ Telegram Notification → Dashboard Admin
```

---

# 12. Authentication Flow

```
Login → Validate User → JWT → HttpOnly Cookie → Dashboard
```

Seluruh halaman admin wajib login.

---

# 13. Public Flow

```
Landing → Catalog → Detail Mobil → WhatsApp → Closing
```

Target utama website adalah menghasilkan klik WhatsApp.

---

# 14. Layer Architecture

```
UI Layer → Feature Layer → Service Layer → Database Layer
```

Masing-masing layer tidak boleh saling melompati.

---

# 15. Configuration Management

Seluruh konfigurasi disimpan menggunakan Environment Variable.

Contoh:
```
DATABASE_URL
JWT_SECRET
R2_ACCESS_KEY
R2_SECRET_KEY
R2_BUCKET
R2_ENDPOINT
NEXT_PUBLIC_BASE_URL
WHATSAPP_NUMBER
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

Tidak boleh hardcode credential.

---

# 16. Environment

Project memiliki tiga environment:

| Environment | File |
| --- | --- |
| Development | `.env.local` |
| Testing | `.env.test` |
| Production | `.env.production` |

---

# 17. Database Access

Seluruh query database hanya melalui Prisma. Tidak diperbolehkan menggunakan raw SQL kecuali benar-benar diperlukan.

---

# 18. State Management

**Local State** — React State
**Global State** — Zustand
**Server State** — TanStack Query

Jangan menyimpan data API di Zustand.

---

# 19. Form Management

Seluruh form menggunakan React Hook Form + Zod Validation. Tidak menggunakan controlled form secara manual kecuali diperlukan.

---

# 20. Error Handling

Semua API harus mengembalikan format response yang sama (lihat `00-development-rules.md` section 11).
Semua error dicatat ke logger. Tidak menampilkan stack trace ke user.

---

# 21. Logging Strategy

Log yang disimpan: Login, Logout, Create, Update, Delete, Error.
Tidak menyimpan password maupun token.

---

# 22. Security Strategy

Minimal keamanan: JWT, HttpOnly Cookie, Rate Limiting, Input Validation, SQL Injection Protection, XSS Protection, CSRF Protection.

---

# 23. Deployment Architecture

```
GitHub → VPS → Docker → Nginx → Next.js → PostgreSQL → Cloudflare → Internet
```

Deployment menggunakan Docker agar konsisten di semua environment.

---

# 24. Backup Strategy

**Database** — Backup harian.
**Upload** — Cloudflare R2.
**Source Code** — GitHub Repository.

---

# 25. Development Workflow

```
Business Overview → Database Design → API Contract → Backend
→ Frontend → Testing → Deployment → Production
```

---

# 26. Coding Workflow

Setiap fitur mengikuti urutan berikut:

1. Database
2. Prisma Model
3. API
4. Validation
5. Service
6. UI
7. Testing

Tidak diperbolehkan membuat UI terlebih dahulu tanpa API yang jelas.

---

# 27. MVP Modules

## Public
Landing, Catalog, Detail Mobil, About, Contact, Articles (Blog)

## Admin
Login, Dashboard, Mobil, Lead, Article, Business Profile, Setting

## System
Upload, Authentication, Database, Logging, Analytics (GTM/GA4)

---

# 28. Folder Ownership

| Folder | Tanggung Jawab |
| --- | --- |
| app | Routing |
| features | Business Feature |
| services | API Communication |
| components | UI |
| hooks | Custom Hook |
| lib | Konfigurasi Library |
| utils | Helper |
| types | TypeScript |
| prisma | Database |

---

# 29. Definition of Ready

Sebelum coding dimulai, harus tersedia:

- Development Rules
- Business Overview
- Database Design
- API Contract

---

# 30. Definition of Done

Sebuah modul dianggap selesai apabila:

- Struktur sesuai blueprint.
- Tidak ada error TypeScript.
- Tidak ada error ESLint.
- Build berhasil.
- Responsive.
- API berjalan normal.
- Terhubung ke database.
- Siap di-deploy.

---

# Approval

| Role | Status |
| --- | --- |
| Software Architect | ✅ Approved |
| Product Owner | ⏳ Pending Review |

---

**End of Document**