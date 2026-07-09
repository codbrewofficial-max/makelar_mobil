# 03-database-design.md

> **Project:** SuhuMobil (Working Title)
>
> **Version:** 1.3.0
>
> **Status:** Draft — Pending Review
>
> **Document Type:** Database Design
>
> **Target:** AI Assisted Development
>
> **Referensi:** `00-development-rules.md`, `01-business-overview.md`, `02-project-blueprint.md`

---

# 1. Tujuan Dokumen

Dokumen ini mendefinisikan struktur database untuk MVP SuhuMobil. Seluruh tabel, kolom, relasi, dan enum di dokumen ini mengikuti aturan pada `00-development-rules.md` (UUID, snake_case, timestamp, soft delete) dan business rules pada `01-business-overview.md`.

Scope tabel dibatasi hanya untuk kebutuhan MVP (section 10, `01-business-overview.md`). Tidak ada tabel tambahan di luar itu — sesuai prinsip YAGNI.

---

# 2. Database Engine

- **Engine:** PostgreSQL 16.x
- **ORM:** Prisma 6.x
- **Akses:** Seluruh query hanya melalui Prisma. Tidak ada raw SQL kecuali benar-benar diperlukan (lihat `02-project-blueprint.md` section 17).

---

# 3. Entity Relationship Diagram (ERD)

```
users (1) ──────< (N) cars
                       │
                       │ (1)
                       │
                       ∨ (N)
                  car_images

cars (1) ──────< (N) leads   [opsional, lead bisa tanpa car spesifik]

users (1) ──────< (N) articles

settings (standalone key-value table, termasuk watermark, business_profile, gtm_id, ga4_id)
```

Penjelasan relasi:

- Satu `user` (Admin/Owner) dapat membuat banyak `cars`.
- Satu `car` memiliki banyak `car_images` (min 5, max 20 — divalidasi di aplikasi, bukan di level database).
- Satu `car` dapat memiliki banyak `leads` yang tertarik padanya. Lead juga bisa tidak terkait mobil spesifik (misal dari form "Cari Mobil Impian").
- `settings` berdiri sendiri, key-value store untuk konfigurasi website.

---

# 4. Enum Definitions

```prisma
enum UserRole {
  OWNER
  ADMIN
}

enum CarStatus {
  DRAFT
  PUBLISHED
  SOLD
  ARCHIVED
}

enum CarTransmission {
  MANUAL
  AUTOMATIC
  CVT
}

enum CarFuelType {
  GASOLINE
  DIESEL
  HYBRID
  ELECTRIC
}

enum LeadStatus {
  NEW
  CONTACTED
  NEGOTIATION
  CLOSED
  REJECTED
}

enum LeadSource {
  WHATSAPP_CTA
  WHATSAPP_FAB
  DREAM_CAR_FORM
  CONTACT_PAGE
}

enum LeadSubject {
  PRICE_INQUIRY
  NEGOTIATION
  SCHEDULE_SURVEY
  OTHER
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
}
```

> Catatan role: sesuai `00-development-rules.md` section 16, role sistem hanya `OWNER` dan `ADMIN`. Kurator login sebagai `ADMIN` — tidak ada role `KURATOR` terpisah di MVP.

> Catatan lead source: `WHATSAPP_CTA` dipakai untuk tombol WhatsApp per-mobil (di Card & Detail, `car_id` terisi). `WHATSAPP_FAB` dipakai untuk Floating Action Button general di seluruh halaman (`car_id` boleh `null`).

---

# 5. Table: `users`

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | Primary Key, default `gen_random_uuid()` |
| name | VARCHAR(100) | Not Null |
| email | VARCHAR(150) | Not Null, Unique |
| password_hash | VARCHAR(255) | Not Null |
| role | UserRole | Not Null, default `ADMIN` |
| created_at | TIMESTAMP | Not Null, default `now()` |
| updated_at | TIMESTAMP | Not Null, auto-update |
| deleted_at | TIMESTAMP | Nullable (soft delete) |

Catatan:
- Password disimpan hasil bcrypt hash (lihat `00-development-rules.md` section 15). Tidak pernah disimpan plain text.
- Tidak ada endpoint public registration — user dibuat manual/seed (lihat section 29, Out of Scope MVP).

---

# 6. Table: `cars`

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | Primary Key |
| slug | VARCHAR(180) | Not Null, Unique (untuk URL `/cars/[slug]`) |
| title | VARCHAR(150) | Not Null (contoh: "Toyota Avanza 2019 G MT") |
| brand | VARCHAR(50) | Not Null |
| model | VARCHAR(50) | Not Null |
| year | INT | Not Null |
| price | BIGINT | Not Null (dalam Rupiah, tanpa desimal) |
| mileage | INT | Not Null (dalam KM) |
| transmission | CarTransmission | Not Null |
| fuel_type | CarFuelType | Not Null |
| color | VARCHAR(30) | Nullable |
| location | VARCHAR(100) | Not Null |
| description | TEXT | Not Null |
| inspection_report | JSONB | Nullable (lihat section 7) |
| status | CarStatus | Not Null, default `DRAFT` |
| created_by | UUID | Foreign Key → `users.id` |
| created_at | TIMESTAMP | Not Null, default `now()` |
| updated_at | TIMESTAMP | Not Null, auto-update |
| deleted_at | TIMESTAMP | Nullable (soft delete) |

Business rule terkait (dari `01-business-overview.md` section 13):
- Mobil dengan status `SOLD` **tidak muncul** di katalog publik (filter di query, bukan hapus data).
- Slug harus unik dan URL-safe, digenerate otomatis dari title + short-id jika terjadi duplikat.

---

# 7. Struktur `inspection_report` (JSONB)

Disimpan sebagai JSONB agar fleksibel tanpa perlu tabel terpisah (KISS — satu mobil hanya punya satu laporan inspeksi aktif di MVP).

```json
{
  "mesin": { "status": "good", "note": "Normal, tidak ada rembesan oli" },
  "transmisi": { "status": "good", "note": "Perpindahan gigi halus" },
  "bodi": { "status": "minor", "note": "Baret halus di pintu kanan" },
  "interior": { "status": "good", "note": "Bersih, jok original" },
  "kaki_kaki": { "status": "good", "note": "Ban 80%, tidak ada bunyi" },
  "kelistrikan": { "status": "good", "note": "AC dingin, semua fitur normal" },
  "catatan_khusus": "Servis rutin, kondisi terawat",
  "inspected_by": "Nama Kurator",
  "inspected_at": "2026-07-08"
}
```

Nilai `status` yang valid: `"good"`, `"minor"`, `"bad"`. Validasi struktur ini dilakukan di layer aplikasi menggunakan Zod, bukan constraint database.

---

# 8. Table: `car_images`

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | Primary Key |
| car_id | UUID | Foreign Key → `cars.id`, On Delete Cascade |
| url | VARCHAR(500) | Not Null (URL Cloudflare R2) |
| file_hash | VARCHAR(64) | Not Null (SHA-256, untuk cek duplikat) |
| size_bytes | INT | Not Null (ukuran file setelah diproses Sharp, untuk hitung kuota storage) |
| sort_order | INT | Not Null, default `0` |
| is_cover | BOOLEAN | Not Null, default `false` |
| created_at | TIMESTAMP | Not Null, default `now()` |

Catatan:
- `On Delete Cascade` — jika `car` dihapus permanen, seluruh `car_images` ikut terhapus (selaras dengan Delete Policy di `00-development-rules.md` section 28: tidak boleh ada orphan file di R2, jadi aplikasi wajib hapus file di R2 dulu sebelum row DB dihapus).
- Validasi jumlah gambar (min 5, max 20 per mobil) dilakukan di service layer saat create/update, **bukan** database constraint.
- Hanya satu `car_images` per `car_id` yang boleh `is_cover = true` (divalidasi di aplikasi).

---

# 9. Table: `leads`

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | Primary Key |
| name | VARCHAR(100) | Not Null |
| email | VARCHAR(150) | Nullable |
| phone | VARCHAR(20) | Not Null |
| city | VARCHAR(100) | Nullable |
| budget | BIGINT | Nullable (dalam Rupiah) |
| car_interest | VARCHAR(150) | Nullable (free text, untuk form "Cari Mobil Impian") |
| subject | LeadSubject | Nullable (dipakai popup CTA WhatsApp — pilihan: tanya harga/nego/jadwal survey/lainnya) |
| message | TEXT | Nullable (pesan bebas dari pengunjung, jadi dasar teks WhatsApp yang di-redirect) |
| car_id | UUID | Foreign Key → `cars.id`, Nullable |
| source | LeadSource | Not Null |
| status | LeadStatus | Not Null, default `NEW` |
| notes | TEXT | Nullable (catatan follow-up admin) |
| created_at | TIMESTAMP | Not Null, default `now()` |
| updated_at | TIMESTAMP | Not Null, auto-update |

Business rule terkait (dari `01-business-overview.md` section 13):
- **Lead tidak boleh dihapus**, hanya dapat diperbarui statusnya. Tidak ada endpoint `DELETE` untuk leads (lihat `04-api-contract.md`), dan tidak perlu kolom `deleted_at`.
- `car_id` nullable karena lead dari CTA WhatsApp per mobil terhubung ke `car_id`, tapi lead dari form "Cari Mobil Impian" bersifat umum (tanpa mobil spesifik).
- `email`, `subject`, `message` khusus dipakai oleh popup form CTA WhatsApp (`source: WHATSAPP_CTA`). Form "Cari Mobil Impian" tetap boleh mengosongkan ketiga field ini.

---

# 10. Table: `settings`

| Column | Type | Constraint |
| --- | --- | --- |
| key | VARCHAR(100) | Primary Key |
| value | JSONB | Not Null |
| updated_at | TIMESTAMP | Not Null, auto-update |

Contoh baris data:

| key | value | Public? |
| --- | --- | --- |
| `site_title` | `"SuhuMobil - Mobil Bekas Terkurasi"` | ✅ |
| `whatsapp_number` | `"6281234567890"` | ✅ |
| `social_links` | `{"instagram": "...", "tiktok": "...", "youtube": "..."}` | ✅ |
| `storage_quota_gb` | `1` | ❌ (internal only) |
| `watermark` | `{"label": "Powered by SuhuMobil", "link": "https://suhumobil.com"}` | ✅ |
| `business_profile` | `{"logoUrl": "...", "name": "...", "tagline": "...", "description": "<p>rich text html</p>", "address": "...", "phone": "..."}` | ✅ (kecuali internal notes jika ada) |
| `gtm_id` | `"GTM-XXXXXXX"` | ✅ |
| `ga4_id` | `"G-XXXXXXX"` | ✅ |

> Kolom "Public?" menandakan apakah key ini boleh dikembalikan oleh `GET /settings/public` (lihat `04-api-contract.md` section 13). `storage_quota_gb` sengaja **tidak** publik karena bukan informasi yang perlu diketahui pengunjung.

---

# 11. Table: `articles`

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | Primary Key |
| slug | VARCHAR(200) | Not Null, Unique |
| title | VARCHAR(200) | Not Null |
| excerpt | VARCHAR(300) | Not Null (ringkasan singkat untuk card/listing) |
| content | TEXT | Not Null (rich text HTML, sanitized — lihat `00-development-rules.md` section 34) |
| cover_image | VARCHAR(500) | Not Null (URL Cloudflare R2) |
| tags | TEXT[] | Nullable (array string, contoh: `["tips", "perawatan-mobil"]`) |
| reading_time_minutes | INT | Not Null (dihitung otomatis dari jumlah kata / 200 wpm) |
| status | ArticleStatus | Not Null, default `DRAFT` |
| seo_title | VARCHAR(200) | Nullable (fallback ke `title` jika kosong) |
| seo_description | VARCHAR(300) | Nullable (fallback ke `excerpt` jika kosong) |
| author_id | UUID | Foreign Key → `users.id` |
| published_at | TIMESTAMP | Nullable (diisi otomatis saat status berubah ke `PUBLISHED`) |
| created_at | TIMESTAMP | Not Null, default `now()` |
| updated_at | TIMESTAMP | Not Null, auto-update |
| deleted_at | TIMESTAMP | Nullable (soft delete) |

Catatan:
- Tidak ada tabel `comments` atau kolom `likes_count` — fitur ini secara eksplisit **tidak** termasuk MVP (dikonfirmasi saat scoping, lihat `01-business-overview.md`).
- `tags` disimpan sebagai native Postgres array, bukan tabel relasi terpisah — cukup untuk kebutuhan filter sederhana di MVP (KISS/YAGNI).

---

# 12. Indexing Strategy

| Table | Index | Alasan |
| --- | --- | --- |
| users | `email` (unique) | Login lookup |
| cars | `slug` (unique) | URL lookup cepat |
| cars | `status` | Filter katalog publik (`WHERE status = 'PUBLISHED'`) |
| cars | `brand`, `location` | Filter & search katalog |
| car_images | `car_id` | Join cepat saat load galeri |
| car_images | `file_hash` | Cek duplikat gambar |
| leads | `status` | Filter dashboard leads |
| leads | `car_id` | Lihat leads per mobil |
| leads | `created_at` | Sort & laporan periode |
| articles | `slug` (unique) | URL lookup cepat |
| articles | `status` | Filter listing publik (`WHERE status = 'PUBLISHED'`) |
| articles | `published_at` | Sort artikel terbaru |

---

# 13. Prisma Schema (Lengkap)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  OWNER
  ADMIN
}

enum CarStatus {
  DRAFT
  PUBLISHED
  SOLD
  ARCHIVED
}

enum CarTransmission {
  MANUAL
  AUTOMATIC
  CVT
}

enum CarFuelType {
  GASOLINE
  DIESEL
  HYBRID
  ELECTRIC
}

enum LeadStatus {
  NEW
  CONTACTED
  NEGOTIATION
  CLOSED
  REJECTED
}

enum LeadSource {
  WHATSAPP_CTA
  WHATSAPP_FAB
  DREAM_CAR_FORM
  CONTACT_PAGE
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
}

model User {
  id           String    @id @default(uuid())
  name         String    @db.VarChar(100)
  email        String    @unique @db.VarChar(150)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  role         UserRole  @default(ADMIN)
  cars         Car[]
  articles     Article[]
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  @@map("users")
}

model Car {
  id                String        @id @default(uuid())
  slug              String        @unique @db.VarChar(180)
  title             String        @db.VarChar(150)
  brand             String        @db.VarChar(50)
  model             String        @db.VarChar(50)
  year              Int
  price             BigInt
  mileage           Int
  transmission      CarTransmission
  fuelType          CarFuelType   @map("fuel_type")
  color             String?       @db.VarChar(30)
  location          String        @db.VarChar(100)
  description       String
  inspectionReport  Json?         @map("inspection_report")
  status            CarStatus     @default(DRAFT)
  createdBy         String        @map("created_by")
  creator           User          @relation(fields: [createdBy], references: [id])
  images            CarImage[]
  leads             Lead[]
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")
  deletedAt         DateTime?     @map("deleted_at")

  @@index([status])
  @@index([brand])
  @@index([location])
  @@map("cars")
}

model CarImage {
  id         String   @id @default(uuid())
  carId      String   @map("car_id")
  car        Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  url        String   @db.VarChar(500)
  fileHash   String   @map("file_hash") @db.VarChar(64)
  sizeBytes  Int      @map("size_bytes")
  sortOrder  Int      @default(0) @map("sort_order")
  isCover    Boolean  @default(false) @map("is_cover")
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([carId])
  @@index([fileHash])
  @@map("car_images")
}

model Lead {
  id          String       @id @default(uuid())
  name        String       @db.VarChar(100)
  email       String?      @db.VarChar(150)
  phone       String       @db.VarChar(20)
  city        String?      @db.VarChar(100)
  budget      BigInt?
  carInterest String?      @map("car_interest") @db.VarChar(150)
  subject     LeadSubject?
  message     String?
  carId       String?      @map("car_id")
  car         Car?         @relation(fields: [carId], references: [id])
  source      LeadSource
  status      LeadStatus   @default(NEW)
  notes       String?
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  @@index([status])
  @@index([carId])
  @@index([createdAt])
  @@map("leads")
}

model Setting {
  key       String   @id @db.VarChar(100)
  value     Json
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("settings")
}

model Article {
  id                  String        @id @default(uuid())
  slug                String        @unique @db.VarChar(200)
  title               String        @db.VarChar(200)
  excerpt             String        @db.VarChar(300)
  content             String
  coverImage          String        @map("cover_image") @db.VarChar(500)
  tags                String[]
  readingTimeMinutes  Int           @map("reading_time_minutes")
  status              ArticleStatus @default(DRAFT)
  seoTitle            String?       @map("seo_title") @db.VarChar(200)
  seoDescription      String?       @map("seo_description") @db.VarChar(300)
  authorId            String        @map("author_id")
  author              User          @relation(fields: [authorId], references: [id])
  publishedAt         DateTime?     @map("published_at")
  createdAt           DateTime      @default(now()) @map("created_at")
  updatedAt           DateTime      @updatedAt @map("updated_at")
  deletedAt           DateTime?     @map("deleted_at")

  @@index([status])
  @@index([publishedAt])
  @@map("articles")
}
```

---

# 14. Seed Data (Wajib Ada Sebelum Go-Live)

| Data | Keterangan |
| --- | --- |
| 1x User `OWNER` | Akun utama, dibuat manual via seed script |
| 1x User `ADMIN` | Akun operasional harian |
| Settings default | `site_title`, `whatsapp_number`, `storage_quota_gb` |

Tidak ada public registration (lihat `00-development-rules.md` section 29, Out of Scope MVP) — seluruh user dibuat lewat seed atau input manual oleh Owner.

---

# 15. Constraint yang TIDAK Dilakukan di Level Database

Sesuai prinsip KISS/YAGNI, validasi berikut dilakukan di aplikasi (Zod), bukan di database:

- Jumlah foto per mobil (min 5, max 20)
- Struktur `inspection_report` JSONB
- Hanya satu `is_cover = true` per mobil
- Format nomor telepon lead
- Sanitasi HTML pada `content` (article), `description` (cars), dan `business_profile.description` (settings) — dilakukan via `sanitize-html` di service layer, bukan database constraint
- Jumlah `tags` per artikel (disarankan max 5, divalidasi Zod)

---

# 16. Migration Strategy

- Menggunakan `prisma migrate dev` di development.
- Menggunakan `prisma migrate deploy` di production (dijalankan via CI/CD atau manual saat deploy Docker).
- Tidak boleh menjalankan `prisma db push` di production.

---

# Approval

| Role | Status |
| --- | --- |
| Software Architect | ✅ Approved |
| Product Owner | ⏳ Pending Review |

---

**End of Document**