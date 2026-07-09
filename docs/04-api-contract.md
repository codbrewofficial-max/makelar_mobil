# 04-api-contract.md

> **Project:** SuhuMobil (Working Title)
>
> **Version:** 1.4.0
>
> **Status:** Draft — Pending Review
>
> **Document Type:** API Contract
>
> **Target:** AI Assisted Development
>
> **Referensi:** `00-development-rules.md`, `01-business-overview.md`, `03-database-design.md`

---

# 1. Tujuan Dokumen

Dokumen ini mendefinisikan seluruh kontrak API (endpoint, request, response, error) untuk MVP SuhuMobil. Backend (dibangun via Claude) dan Frontend (dibangun via Google AI Studio) **wajib** mengikuti kontrak ini persis agar integrasi tidak meleset.

---

# 2. Base URL & Versioning

```
Development : http://localhost:4000/api/v1
Production  : https://api.suhumobil.com/api/v1
```

Semua endpoint menggunakan prefix `/api/v1` (lihat `00-development-rules.md` section 10).

---

# 3. Response Format Standard

Format ini **wajib** dan tidak boleh diubah (lihat `00-development-rules.md` section 11).

**Success:**
```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": {}
}
```

**Pagination `meta` (khusus endpoint list):**
```json
{
  "page": 1,
  "limit": 10,
  "total": 42,
  "totalPages": 5
}
```

> Catatan tipe data: kolom `price`, `mileage`, dan `budget` disimpan sebagai `BigInt`/`Int` di database, tetapi **wajib dikonversi ke `number`** di response API (service layer) agar aman diserialisasi ke JSON dan mudah dipakai frontend.

---

# 4. HTTP Status Code

Mengikuti `00-development-rules.md` section 12: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500.

---

# 5. Authentication

- Autentikasi menggunakan **JWT** disimpan dalam **HttpOnly Cookie** (bukan Bearer token di header, bukan localStorage).
- Endpoint yang butuh login ditandai dengan 🔒 di tabel endpoint.
- Jika token tidak valid/expired → response `401 Unauthorized`.
- Jika role tidak memenuhi (misal endpoint khusus `OWNER`) → response `403 Forbidden`.

```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": { "auth": "Token tidak valid atau kedaluwarsa" }
}
```

---

# 6. Error Code Reference

| Code | HTTP Status | Keterangan |
| --- | --- | --- |
| `VALIDATION_ERROR` | 422 | Input tidak lolos validasi Zod |
| `UNAUTHORIZED` | 401 | Belum login / token invalid |
| `FORBIDDEN` | 403 | Role tidak diizinkan |
| `CAR_NOT_FOUND` | 404 | Mobil tidak ditemukan |
| `LEAD_NOT_FOUND` | 404 | Lead tidak ditemukan |
| `ARTICLE_NOT_FOUND` | 404 | Artikel tidak ditemukan |
| `SLUG_ALREADY_EXISTS` | 409 | Slug mobil/artikel duplikat |
| `INVALID_STATUS_TRANSITION` | 409 | Perubahan status tidak diizinkan (lihat section 12) |
| `IMAGE_LIMIT_EXCEEDED` | 422 | Melebihi 20 foto per mobil |
| `IMAGE_MINIMUM_NOT_MET` | 422 | Kurang dari 5 foto saat publish |
| `STORAGE_QUOTA_EXCEEDED` | 422 | Kuota storage R2 sudah 100% |
| `INTERNAL_ERROR` | 500 | Error tak terduga (dicatat ke logger, tidak expose stack trace) |

---

# 7. Endpoint Group: Auth

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | Login admin/owner |
| POST | `/auth/logout` | 🔒 | Logout, hapus cookie |
| GET | `/auth/me` | 🔒 | Ambil data user yang sedang login |

### POST `/auth/login`

Request:
```json
{
  "email": "admin@suhumobil.com",
  "password": "secret123"
}
```

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "Admin SuhuMobil",
    "email": "admin@suhumobil.com",
    "role": "ADMIN"
  }
}
```
> JWT dikirim via `Set-Cookie` (HttpOnly, Secure, SameSite=Strict), tidak dikembalikan di body.

Error `401`:
```json
{
  "success": false,
  "message": "Email atau password salah",
  "errors": { "credentials": "Invalid email or password" }
}
```

---

# 8. Endpoint Group: Cars (Public)

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/cars` | Public | List mobil dengan status `PUBLISHED` saja |
| GET | `/cars/:slug` | Public | Detail mobil by slug |

### GET `/cars`

Query params:

| Param | Tipe | Default | Keterangan |
| --- | --- | --- | --- |
| `page` | number | 1 | Halaman |
| `limit` | number | 12 | Jumlah per halaman |
| `brand` | string | - | Filter merek |
| `location` | string | - | Filter lokasi |
| `minPrice` | number | - | Filter harga minimum |
| `maxPrice` | number | - | Filter harga maksimum |
| `transmission` | string | - | `MANUAL` \| `AUTOMATIC` \| `CVT` |
| `search` | string | - | Cari di title/brand/model |

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "slug": "toyota-avanza-2019-g-mt",
      "title": "Toyota Avanza 2019 G MT",
      "brand": "Toyota",
      "model": "Avanza",
      "year": 2019,
      "price": 150000000,
      "mileage": 45000,
      "transmission": "MANUAL",
      "location": "Bandung",
      "coverImage": "https://cdn.suhumobil.com/cars/2026/07/uuid.webp",
      "status": "PUBLISHED"
    }
  ],
  "meta": { "page": 1, "limit": 12, "total": 8, "totalPages": 1 }
}
```

Mobil berstatus selain `PUBLISHED` **tidak pernah** muncul di endpoint ini (business rule, lihat `01-business-overview.md` section 13).

### GET `/cars/:slug`

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid",
    "slug": "toyota-avanza-2019-g-mt",
    "title": "Toyota Avanza 2019 G MT",
    "brand": "Toyota",
    "model": "Avanza",
    "year": 2019,
    "price": 150000000,
    "mileage": 45000,
    "transmission": "MANUAL",
    "fuelType": "GASOLINE",
    "color": "Silver",
    "location": "Bandung",
    "description": "Kondisi terawat, servis rutin...",
    "inspectionReport": {
      "mesin": { "status": "good", "note": "Normal" },
      "transmisi": { "status": "good", "note": "Halus" },
      "bodi": { "status": "minor", "note": "Baret halus pintu kanan" },
      "interior": { "status": "good", "note": "Bersih" },
      "kakiKaki": { "status": "good", "note": "Ban 80%" },
      "kelistrikan": { "status": "good", "note": "Normal" },
      "catatanKhusus": "Servis rutin, kondisi terawat"
    },
    "images": [
      { "id": "uuid", "url": "https://cdn.../1.webp", "isCover": true, "sortOrder": 0 },
      { "id": "uuid", "url": "https://cdn.../2.webp", "isCover": false, "sortOrder": 1 }
    ],
    "status": "PUBLISHED"
  }
}
```

Error `404`:
```json
{
  "success": false,
  "message": "Mobil tidak ditemukan",
  "errors": { "code": "CAR_NOT_FOUND" }
}
```

> **Catatan CTA WhatsApp:** Tombol "Tanya via WhatsApp" **membuka popup form** terlebih dahulu (Nama, Email, No. WhatsApp, Subjek, Pesan). Setelah submit, frontend memanggil `POST /leads` (lihat section 11, `source: "WHATSAPP_CTA"`, `carId` diisi id mobil yang sedang dilihat), lalu setelah response `201` sukses, baru redirect ke `https://wa.me/<whatsapp_number>?text=<pesan>` — dengan `<pesan>` digabung dari nama pengunjung + subjek + isi pesan. `whatsapp_number` diambil dari `/settings/public` (section 13).
>
> Jika `POST /leads` gagal (misal network error), frontend tetap boleh melanjutkan redirect ke WhatsApp (jangan blokir user cuma karena gagal simpan lead), tapi tampilkan pesan singkat bahwa data tidak tersimpan agar admin bisa follow-up manual dari chat WA langsung.
>
> **Catatan FAB WhatsApp (Floating Action Button):** Tombol WA general yang tampil di semua halaman (bukan hanya halaman mobil) memakai popup form yang sama, tapi mengirim `source: "WHATSAPP_FAB"` dan `carId: null` (karena tidak terkait mobil spesifik). Perilaku redirect & fallback error sama seperti CTA WhatsApp di atas.

---

# 9. Endpoint Group: Cars (Admin)

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/admin/cars` | 🔒 | List semua mobil (semua status) |
| GET | `/admin/cars/:id` | 🔒 | Detail mobil by id |
| POST | `/admin/cars` | 🔒 | Tambah mobil baru (default status `DRAFT`) |
| PUT | `/admin/cars/:id` | 🔒 | Update data mobil |
| PATCH | `/admin/cars/:id/status` | 🔒 | Update status mobil |
| DELETE | `/admin/cars/:id` | 🔒 | Soft delete mobil |

### POST `/admin/cars`

Request:
```json
{
  "title": "Toyota Avanza 2019 G MT",
  "brand": "Toyota",
  "model": "Avanza",
  "year": 2019,
  "price": 150000000,
  "mileage": 45000,
  "transmission": "MANUAL",
  "fuelType": "GASOLINE",
  "color": "Silver",
  "location": "Bandung",
  "description": "Kondisi terawat, servis rutin...",
  "inspectionReport": {
    "mesin": { "status": "good", "note": "Normal" },
    "transmisi": { "status": "good", "note": "Halus" },
    "bodi": { "status": "minor", "note": "Baret halus pintu kanan" },
    "interior": { "status": "good", "note": "Bersih" },
    "kakiKaki": { "status": "good", "note": "Ban 80%" },
    "kelistrikan": { "status": "good", "note": "Normal" },
    "catatanKhusus": "Servis rutin, kondisi terawat"
  }
}
```

Response `201`: sama seperti detail mobil (section 8), dengan `status: "DRAFT"` dan `images: []`.

> `slug` digenerate otomatis dari `title` di backend. Jika duplikat, tambahkan suffix random 4 karakter.

### PATCH `/admin/cars/:id/status`

Request:
```json
{ "status": "PUBLISHED" }
```

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": { "id": "uuid", "status": "PUBLISHED" }
}
```

Validasi transisi status (lihat section 12). Jika mobil punya foto < 5 saat mencoba `PUBLISHED` → error `422`:
```json
{
  "success": false,
  "message": "Mobil membutuhkan minimal 5 foto sebelum dipublikasikan",
  "errors": { "code": "IMAGE_MINIMUM_NOT_MET" }
}
```

### DELETE `/admin/cars/:id`

Soft delete (`deleted_at` diisi). Sebelum soft delete, backend **wajib** menghapus seluruh `car_images` terkait dari Cloudflare R2 terlebih dahulu (lihat `00-development-rules.md` section 28, Delete Policy — tidak boleh ada orphan file).

Response `200`:
```json
{ "success": true, "message": "Success", "data": null }
```

---

# 10. Endpoint Group: Car Images

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| POST | `/admin/cars/:id/images` | 🔒 | Upload 1 gambar (multipart/form-data). Backend proses via Sharp lalu simpan ke R2 + DB |
| PATCH | `/admin/cars/:id/images/:imageId/cover` | 🔒 | Set gambar sebagai cover |
| PUT | `/admin/cars/:id/images/reorder` | 🔒 | Update urutan galeri |
| DELETE | `/admin/cars/:id/images/:imageId` | 🔒 | Hapus 1 gambar (dari R2 + DB) |

### POST `/admin/cars/:id/images`

Request: `multipart/form-data`

| Field | Tipe | Keterangan |
| --- | --- | --- |
| `file` | File | JPG/PNG/WebP, max 5 MB (divalidasi sebelum diproses) |
| `isCover` | boolean | Optional, default `false` |

Alur di backend (lihat `02-project-blueprint.md` section 10 & `00-development-rules.md` section 32–33):
1. Validasi MIME type (`image/jpeg`, `image/png`, `image/webp` saja).
2. Hitung SHA-256 hash file → cek duplikat terhadap `car_images.file_hash` milik mobil yang sama.
3. Proses via **Sharp**: resize max 1920×1080, convert ke WebP, compress target ≤500 KB.
4. Generate nama file UUID → upload ke R2 path `cars/YYYY/MM/uuid.webp`.
5. Simpan metadata (`url`, `fileHash`, `sortOrder`, `isCover`) ke tabel `car_images`.
6. File asli **tidak pernah disimpan** ke disk permanen di server.

Response `201`:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid",
    "url": "https://cdn.suhumobil.com/cars/2026/07/uuid.webp",
    "sortOrder": 4,
    "isCover": false
  }
}
```

Error `422` jika sudah 20 gambar:
```json
{
  "success": false,
  "message": "Maksimal 20 foto per mobil",
  "errors": { "code": "IMAGE_LIMIT_EXCEEDED" }
}
```

Error `409` jika `file_hash` sudah ada untuk mobil yang sama (duplikat gambar).

Error `422` jika kuota storage penuh:
```json
{
  "success": false,
  "message": "Kapasitas storage sudah penuh",
  "errors": { "code": "STORAGE_QUOTA_EXCEEDED" }
}
```

---

# 11. Endpoint Group: Leads

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| POST | `/leads` | Public | Simpan lead baru (form publik) |
| GET | `/admin/leads` | 🔒 | List semua lead |
| GET | `/admin/leads/:id` | 🔒 | Detail 1 lead |
| PATCH | `/admin/leads/:id` | 🔒 | Update status/notes lead |

### POST `/leads`

Dipakai oleh 4 sumber: form "Cari Mobil Impian" (`DREAM_CAR_FORM`), halaman Kontak (`CONTACT_PAGE`), popup CTA WhatsApp di halaman detail/card mobil (`WHATSAPP_CTA`), dan popup Floating Action Button WhatsApp general (`WHATSAPP_FAB`).

**Contoh 1 — Form "Cari Mobil Impian":**
```json
{
  "name": "Budi Santoso",
  "phone": "081234567890",
  "city": "Bandung",
  "budget": 150000000,
  "carInterest": "SUV budget 150 juta",
  "carId": null,
  "source": "DREAM_CAR_FORM"
}
```

**Contoh 2 — Popup CTA WhatsApp (di Card atau Detail mobil):**
```json
{
  "name": "Budi Santoso",
  "email": "budi@email.com",
  "phone": "081234567890",
  "subject": "PRICE_INQUIRY",
  "message": "Apakah harga masih bisa nego? Saya minat unit ini.",
  "carId": "uuid-mobil",
  "source": "WHATSAPP_CTA"
}
```

**Contoh 3 — Popup FAB WhatsApp (general, semua halaman):**
```json
{
  "name": "Budi Santoso",
  "email": "budi@email.com",
  "phone": "081234567890",
  "subject": "OTHER",
  "message": "Halo, saya mau tanya-tanya soal mobil bekas.",
  "carId": null,
  "source": "WHATSAPP_FAB"
}
```

Response `201`:
```json
{
  "success": true,
  "message": "Success",
  "data": { "id": "uuid", "status": "NEW" }
}
```

Nilai `subject` yang valid: `"PRICE_INQUIRY"` (Tanya Detail Mobil), `"NEGOTIATION"` (Nego Harga), `"SCHEDULE_SURVEY"` (Jadwal Survey/Test Drive), `"OTHER"` (Lainnya). Field ini wajib diisi jika `source: "WHATSAPP_CTA"` atau `"WHATSAPP_FAB"`, tapi tidak wajib untuk source lain.

> Setelah tersimpan, backend mengirim notifikasi ke Telegram Bot (lihat `02-project-blueprint.md` section 11, Lead Flow). Kegagalan kirim notifikasi Telegram **tidak boleh** membuat request gagal (fire-and-forget, dicatat ke logger jika error).

Error `422`:
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": { "phone": "Nomor telepon wajib diisi" }
}
```

### GET `/admin/leads`

Query params: `page`, `limit`, `status`, `source`, `search` (nama/telepon).

Response `200`: list lead + `meta` pagination (format sama seperti section 8).

### PATCH `/admin/leads/:id`

Request:
```json
{ "status": "CONTACTED", "notes": "Sudah dihubungi, akan survey Sabtu" }
```

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": { "id": "uuid", "status": "CONTACTED" }
}
```

> **Tidak ada endpoint DELETE untuk leads** — sesuai business rule di `01-business-overview.md` section 13, lead hanya bisa diperbarui statusnya, tidak boleh dihapus.

---

# 12. Status Transition Rules

## Car Status

```
DRAFT ──────> PUBLISHED ──────> SOLD
  │                │
  └──────> ARCHIVED <──────────┘
```

| Dari | Ke | Diizinkan? | Syarat |
| --- | --- | --- | --- |
| DRAFT | PUBLISHED | ✅ | Minimal 5 foto sudah terupload |
| PUBLISHED | SOLD | ✅ | - |
| PUBLISHED | ARCHIVED | ✅ | - |
| SOLD | PUBLISHED | ✅ | Untuk kasus batal transaksi |
| ARCHIVED | PUBLISHED | ✅ | Untuk re-publish |
| DRAFT | SOLD | ❌ | Harus lewat PUBLISHED dulu |

Transisi di luar tabel ini → response `409` dengan `code: "INVALID_STATUS_TRANSITION"`.

## Lead Status

```
NEW ──> CONTACTED ──> NEGOTIATION ──> CLOSED
  │           │              │
  └───────────┴──────────────┴──────> REJECTED
```

Semua transisi antar status lead **diizinkan bebas** (tidak ada urutan kaku) — admin bisa langsung set `REJECTED` dari status manapun, karena keputusan bisnis (misal calon pembeli batal) bisa terjadi kapan saja.

---

# 13. Endpoint Group: Settings

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/settings/public` | Public | Ambil setting yang aman diakses publik |
| GET | `/admin/settings` | 🔒 | Ambil semua setting |
| PUT | `/admin/settings` | 🔒 | Update setting (bulk key-value) |
| POST | `/admin/settings/branding/logo` | 🔒 | Upload logo business profile (multipart) |

### GET `/settings/public`

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "siteTitle": "SuhuMobil - Mobil Bekas Terkurasi",
    "whatsappNumber": "6281234567890",
    "socialLinks": { "instagram": "...", "tiktok": "...", "youtube": "..." },
    "watermark": { "label": "Powered by SuhuMobil", "link": "https://suhumobil.com" },
    "businessProfile": {
      "logoUrl": "https://cdn.suhumobil.com/branding/logo.webp",
      "name": "SuhuMobil",
      "tagline": "Mobil Bekas Terkurasi & Terpercaya"
    },
    "gtmId": "GTM-XXXXXXX",
    "ga4Id": "G-XXXXXXX"
  }
}
```

> Hanya key yang ditandai "Public? ✅" di `03-database-design.md` section 10 yang boleh dikembalikan endpoint ini — jangan expose seluruh isi tabel `settings` mentah-mentah ke publik. `businessProfile.description` (rich text lengkap) **tidak** perlu dikirim di endpoint ini kecuali dibutuhkan halaman About — jika dibutuhkan, tambahkan di response.

### PUT `/admin/settings`

Request (partial, hanya kirim key yang mau diubah):
```json
{
  "watermark": { "label": "Powered by SuhuMobil", "link": "https://suhumobil.com" },
  "gtmId": "GTM-XXXXXXX",
  "businessProfile": {
    "name": "SuhuMobil",
    "tagline": "Mobil Bekas Terkurasi & Terpercaya",
    "description": "<p>Cerita 25 tahun pengalaman...</p>",
    "address": "Bandung, Jawa Barat",
    "phone": "6281234567890"
  }
}
```

> `businessProfile.description` wajib disanitasi backend (`sanitize-html`) sebelum disimpan — lihat `00-development-rules.md` section 34. `businessProfile.logoUrl` **tidak** diisi lewat endpoint ini, melainkan lewat `POST /admin/settings/branding/logo` di bawah.

### POST `/admin/settings/branding/logo`

Request: `multipart/form-data`, field `file` (image/jpeg, image/png, image/webp, max 5 MB).

Alur backend: sama seperti upload gambar mobil (validasi MIME → proses Sharp resize max 512×512 & convert WebP → upload ke R2 folder `branding/` → simpan URL ke `settings.business_profile.logoUrl`).

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": { "logoUrl": "https://cdn.suhumobil.com/branding/logo-uuid.webp" }
}
```

---

# 14. Endpoint Group: Articles

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/articles` | Public | List artikel `PUBLISHED` |
| GET | `/articles/:slug` | Public | Detail artikel by slug |
| GET | `/admin/articles` | 🔒 | List semua artikel (semua status) |
| GET | `/admin/articles/:id` | 🔒 | Detail artikel by id |
| POST | `/admin/articles` | 🔒 | Buat artikel baru (default `DRAFT`) |
| PUT | `/admin/articles/:id` | 🔒 | Update artikel |
| PATCH | `/admin/articles/:id/status` | 🔒 | Ubah status (Draft/Published) |
| POST | `/admin/articles/:id/cover` | 🔒 | Upload/ganti cover artikel (multipart) |
| DELETE | `/admin/articles/:id` | 🔒 | Soft delete artikel |

### GET `/articles`

Query params: `page`, `limit` (default 10), `tag` (filter by tag), `search` (title/excerpt).

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "slug": "tips-merawat-mesin-mobil-matic",
      "title": "5 Tips Merawat Mesin Mobil Matic Biar Awet",
      "excerpt": "Mobil matic butuh perawatan berbeda dari manual...",
      "coverImage": "https://cdn.suhumobil.com/articles/cover-uuid.webp",
      "tags": ["tips", "perawatan-mobil"],
      "readingTimeMinutes": 4,
      "publishedAt": "2026-07-10T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

### GET `/articles/:slug`

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid",
    "slug": "tips-merawat-mesin-mobil-matic",
    "title": "5 Tips Merawat Mesin Mobil Matic Biar Awet",
    "excerpt": "Mobil matic butuh perawatan berbeda dari manual...",
    "content": "<p>Rich text HTML sudah disanitasi...</p>",
    "coverImage": "https://cdn.suhumobil.com/articles/cover-uuid.webp",
    "tags": ["tips", "perawatan-mobil"],
    "readingTimeMinutes": 4,
    "seoTitle": null,
    "seoDescription": null,
    "publishedAt": "2026-07-10T08:00:00Z"
  }
}
```

Error `404`:
```json
{
  "success": false,
  "message": "Artikel tidak ditemukan",
  "errors": { "code": "ARTICLE_NOT_FOUND" }
}
```

### POST `/admin/articles`

Request:
```json
{
  "title": "5 Tips Merawat Mesin Mobil Matic Biar Awet",
  "excerpt": "Mobil matic butuh perawatan berbeda dari manual...",
  "content": "<p>Isi artikel lengkap dalam HTML dari rich text editor...</p>",
  "tags": ["tips", "perawatan-mobil"],
  "seoTitle": null,
  "seoDescription": null
}
```

Response `201`: sama seperti detail artikel, dengan `status: "DRAFT"`, `coverImage: null`, `readingTimeMinutes` dihitung otomatis dari jumlah kata di `content` (lihat `05-backend-prd.md`).

> `slug` digenerate otomatis dari `title`, sama seperti mobil. `content` wajib disanitasi backend sebelum disimpan.

### PATCH `/admin/articles/:id/status`

Request:
```json
{ "status": "PUBLISHED" }
```

Saat berubah ke `PUBLISHED`, backend otomatis mengisi `publishedAt` dengan waktu saat ini (jika sebelumnya `null`). Mobil butuh minimal 5 foto untuk publish (section 9), tapi **artikel tidak punya syarat foto minimum** — cukup pastikan `coverImage` sudah diisi sebelum publish (validasi sederhana, error `422` jika `coverImage` masih kosong).

### POST `/admin/articles/:id/cover`

Sama seperti upload logo/gambar mobil: multipart, diproses Sharp (resize max 1920×1080, WebP, compress), upload ke R2 folder `articles/YYYY/MM/`.

---

# 15. Endpoint Group: Dashboard (Admin)

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/admin/dashboard/stats` | 🔒 | Ringkasan angka untuk halaman dashboard |

Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalCars": 12,
    "publishedCars": 8,
    "soldCars": 2,
    "totalLeads": 24,
    "newLeads": 5,
    "totalArticles": 6,
    "publishedArticles": 4,
    "storageUsedMb": 642,
    "storageQuotaMb": 1024
  }
}
```

> `storageUsedMb` dihitung dari `SUM(size_bytes)` tabel `car_images` (lihat `03-database-design.md` section 8 & `05-backend-prd.md` section 10).

---

# 16. Rate Limiting

| Endpoint Group | Limit |
| --- | --- |
| `POST /leads` | 5 request / menit / IP |
| `POST /auth/login` | 5 request / menit / IP |
| Endpoint lain | 60 request / menit / IP |

Response `429` (jika terlampaui, di luar tabel status standar tapi tetap format response standar):
```json
{
  "success": false,
  "message": "Terlalu banyak permintaan, coba lagi nanti",
  "errors": { "code": "RATE_LIMIT_EXCEEDED" }
}
```

---

# 17. Validation Rules Summary

| Field | Rule |
| --- | --- |
| `email` | Format email valid |
| `password` | Min 8 karakter |
| `phone` (lead) | Min 10, max 15 digit |
| `email` (lead) | Format email valid jika diisi (nullable) |
| `subject` (lead) | Wajib diisi jika `source = WHATSAPP_CTA` atau `WHATSAPP_FAB`, harus salah satu enum `LeadSubject` |
| `price`, `mileage`, `budget` | Angka positif |
| `year` | 4 digit, antara 1990–tahun berjalan |
| `images` per car | Min 5 (saat publish), Max 20 (selalu) |
| `status` (car/lead/article) | Harus sesuai enum & aturan transisi (section 12) |
| `title` (article) | Wajib, max 200 karakter |
| `excerpt` (article) | Wajib, max 300 karakter |
| `content` (article) | Wajib, disanitasi HTML, max ~50.000 karakter |
| `tags` (article) | Optional, max 5 item per artikel |
| `coverImage` (article) | Wajib diisi sebelum status bisa `PUBLISHED` |

Seluruh validasi menggunakan **Zod** (lihat `00-development-rules.md` section 13), skema validasi disimpan di `features/<nama-fitur>/schemas/`.

---

# 18. Endpoint Summary (Quick Reference)

| Method | Endpoint | Auth |
| --- | --- | --- |
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | 🔒 |
| GET | `/auth/me` | 🔒 |
| GET | `/cars` | Public |
| GET | `/cars/:slug` | Public |
| GET | `/admin/cars` | 🔒 |
| GET | `/admin/cars/:id` | 🔒 |
| POST | `/admin/cars` | 🔒 |
| PUT | `/admin/cars/:id` | 🔒 |
| PATCH | `/admin/cars/:id/status` | 🔒 |
| DELETE | `/admin/cars/:id` | 🔒 |
| POST | `/admin/cars/:id/images` | 🔒 |
| PATCH | `/admin/cars/:id/images/:imageId/cover` | 🔒 |
| PUT | `/admin/cars/:id/images/reorder` | 🔒 |
| DELETE | `/admin/cars/:id/images/:imageId` | 🔒 |
| POST | `/leads` | Public |
| GET | `/admin/leads` | 🔒 |
| GET | `/admin/leads/:id` | 🔒 |
| PATCH | `/admin/leads/:id` | 🔒 |
| GET | `/settings/public` | Public |
| GET | `/admin/settings` | 🔒 |
| PUT | `/admin/settings` | 🔒 |
| POST | `/admin/settings/branding/logo` | 🔒 |
| GET | `/articles` | Public |
| GET | `/articles/:slug` | Public |
| GET | `/admin/articles` | 🔒 |
| GET | `/admin/articles/:id` | 🔒 |
| POST | `/admin/articles` | 🔒 |
| PUT | `/admin/articles/:id` | 🔒 |
| PATCH | `/admin/articles/:id/status` | 🔒 |
| POST | `/admin/articles/:id/cover` | 🔒 |
| DELETE | `/admin/articles/:id` | 🔒 |
| GET | `/admin/dashboard/stats` | 🔒 |

---

# Approval

| Role | Status |
| --- | --- |
| Software Architect | ✅ Approved |
| Product Owner | ⏳ Pending Review |

---

**End of Document**