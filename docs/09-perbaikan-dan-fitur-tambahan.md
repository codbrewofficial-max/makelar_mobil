# 09-perbaikan-dan-fitur-tambahan.md

> **Project:** SuhuMobil (Working Title)
>
> **Version:** 1.0.0
>
> **Status:** Draft — Pending Review
>
> **Document Type:** Addendum (Bug Fix & New Feature Spec)
>
> **Referensi:** `00-development-rules.md`, `03-database-design.md`, `04-api-contract.md`, `05-backend-prd.md`, `07-frontend-reconciliation-addendum.md`, `08-instruksi-sinkronisasi-backend.md`

---

# 1. Tujuan Dokumen

Dokumen ini adalah addendum lanjutan setelah `07` dan `08`, mencakup 3 kategori perubahan yang diminta LabKerKom:

1. **Bug Fix** — 3 item
2. **Perbaikan Tambahan** — ditemukan Claude saat audit kode (bukan diminta eksplisit, tapi terkait langsung)
3. **Fitur Baru** — 4 item, dengan keputusan scope yang sudah dikonfirmasi LabKerKom

Pola dokumen mengikuti `07`/`08`: setiap section berisi perubahan schema Prisma (jika ada), endpoint baru/berubah, business logic, dan asumsi yang dibuat Claude untuk direview.

---

# 2. Ringkasan Perubahan

| # | Item | Kategori | Dampak |
| --- | --- | --- | --- |
| 1 | Upload foto kurator tidak tersambung ke endpoint R2 | Bug Fix | Frontend only |
| 2 | CMS full — semua section (Landing, About, Footer, dll) jadi editable | Bug Fix (scope: fitur besar) | Backend + Frontend |
| 3 | Hilangkan mode sandbox/mock, langsung ke API asli | Bug Fix | Frontend only |
| 4 | Pagination `GET /admin/cars` belum ada | Perbaikan Tambahan (temuan Claude) | Backend + Frontend |
| 5 | Daftar kurator di public page + dropdown pilih kurator di form inspeksi admin | Fitur Baru | Backend + Frontend |
| 6 | Menu Media Library (upload / generate AI / link custom) | Fitur Baru | Backend + Frontend |
| 7 | Backup & Restore dari admin console | Fitur Baru | Backend + Frontend |
| 8 | Log & Audit Log | Fitur Baru | Backend + Frontend |

Verifikasi pertanyaan sebelumnya (tidak butuh perubahan, dicatat sebagai konfirmasi):

- **GTM/GA4**: `gtmId` & `ga4Id` sudah ada penuh di backend (`settings.service.ts`, whitelist `GET /settings/public`). LabKerKom tinggal isi Container ID via `PUT /admin/settings`. **Aksi**: pastikan form Settings di frontend punya field input untuk `gtmId` (saat ini belum terlihat di `BusinessProfilePage.tsx` — akan ditambahkan sebagai bagian dari fix CMS di Section 4).
- **Tracking Insight**: backend sudah sesuai spec `07`/`08` (bySource pivot, byCar top-10, recentLogs). Tidak ada perubahan di dokumen ini kecuali LabKerKom menemukan bug spesifik.

---

# 3. Bug Fix #1 — Upload Foto Kurator

## Root Cause
`CuratorsList.tsx` (frontend) tidak memanggil `curatorsService.uploadPhoto()` yang sudah benar. Alur saat ini: `FileReader` → base64 → dikirim sebagai field `photoUrl` di body JSON `POST/PUT /admin/curators`. Backend tidak pernah menerima file lewat endpoint multipart `POST /admin/curators/:id/photo`, sehingga foto tidak diproses Sharp dan tidak masuk R2 — kolom `photo_url` berisi string base64 mentah (berpotensi sangat besar, merusak payload DB).

## Perbaikan (Frontend Only — Backend Tidak Berubah)
1. Hapus logic `handlePhotoUpload` yang convert ke base64 dan hapus `photoUrl` dari body `createCurator`/`updateCurator`.
2. Alur baru:
   - Curator baru: `createCurator()` dulu (tanpa foto) → dapat `id` → jika user memilih file, langsung panggil `curatorsService.uploadPhoto(id, file)`.
   - Curator existing (edit): jika user memilih file baru → langsung panggil `uploadPhoto(editingCurator.id, file)` on-change (tidak perlu menunggu submit form), tampilkan preview dari response `photoUrl` yang dikembalikan backend (URL R2 asli, bukan base64).
3. Hapus fallback URL Unsplash hardcode (`https://images.unsplash.com/...`) di `handleSubmit` — kalau foto belum diupload, `photoUrl` biarkan `null` sesuai kontrak API (`POST /admin/curators` memang mengembalikan `photoUrl: null` by design).

**Tidak ada perubahan API/skema.**

---

# 4. Bug Fix #2 — CMS Full untuk Semua Section

## Konteks
Saat ini konten seperti Hero Landing Page, Trust Section, CTA Footer, halaman About, dll bersifat **statis** (hardcode di komponen frontend, per `06-frontend-prd.md` section 5.1: kolom "Sumber Data" bertuliskan "Statis"). LabKerKom minta semua ini jadi editable dari admin console.

## Desain: Generic Key-Value Content Sections (bukan tabel terpisah per section)

Mengikuti prinsip SOLID/DRY/KISS/YAGNI — daripada bikin tabel Prisma baru untuk tiap section (`hero_content`, `trust_content`, `footer_content`, dst, yang akan terus bertambah tiap kali ada section baru), dipakai pola **generic content block** mirip tabel `settings` yang sudah ada.

### Prisma Schema Baru

```prisma
model ContentSection {
  id        String   @id @default(uuid())
  page      String   @db.VarChar(50)   // "landing" | "about" | "footer" | "contact"
  sectionKey String  @map("section_key") @db.VarChar(50) // "hero" | "trust" | "featured_cars" | "cta_footer" | dst
  content   Json     // struktur bebas sesuai kebutuhan section, divalidasi per-sectionKey via Zod discriminated union
  updatedBy String   @map("updated_by")
  updater   User     @relation(fields: [updatedBy], references: [id])
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([page, sectionKey])
  @@index([page])
  @@map("content_sections")
}
```

> **Asumsi Claude (mohon dikonfirmasi):** `content` disimpan sebagai `Json` bebas struktur, bukan kolom-kolom rigid. Setiap `sectionKey` punya schema Zod sendiri di backend (mis. `hero` wajib `{ headline, subheadline, ctaLabel }`, `trust` wajib `{ items: [{icon, title, description}] }`). Ini artinya menambah section baru di masa depan **tidak perlu migrasi database**, cukup tambah Zod schema baru + render component baru di frontend. Field rich-text (kalau ada, misal deskripsi About) tetap disanitasi `sanitize-html` sebelum simpan.

### Endpoint Baru — Tambahan ke `04-api-contract.md`

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/content/:page` | Public | Ambil semua section untuk 1 halaman (mis. `/content/landing`) |
| GET | `/admin/content/:page` | 🔒 | Sama seperti public, tapi untuk keperluan edit di admin (data identik, dipisah agar konsisten pola 🔒 admin vs public) |
| PUT | `/admin/content/:page/:sectionKey` | 🔒 | Upsert 1 section tertentu |

### GET `/content/landing`
Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "hero": { "headline": "...", "subheadline": "...", "ctaLabel": "Lihat Katalog" },
    "trust": { "items": [ { "icon": "shield", "title": "Kurasi Mutlak", "description": "..." } ] },
    "cta_footer": { "headline": "Cari Mobil Impian", "ctaLabel": "..." }
  }
}
```
> Jika sebuah `sectionKey` belum pernah diisi admin (row belum ada), backend mengembalikan **default value hardcode** (fallback dari nilai yang sekarang ada di frontend) supaya halaman tidak pernah kosong/error saat pertama kali fitur ini dirilis.

### PUT `/admin/content/:page/:sectionKey`
Request: `{ "content": { ...sesuai schema Zod sectionKey terkait... } }`
Response `200`: section yang baru diupdate.

## Business Logic
- Module baru `content-sections/` mengikuti struktur module standar.
- Validasi Zod **per `sectionKey`**, bukan generic — daftar `sectionKey` yang valid untuk tiap `page` didefinisikan whitelist di backend (tolak `sectionKey` yang tidak dikenal dengan `422`).
- Rate limit: kategori umum (60 req/menit/IP) untuk `GET /content/:page`; endpoint admin ikut aturan auth standar.
- Frontend: setiap section statis di Landing/About/Footer diganti fetch dari `GET /content/:page`, dengan fallback default value di frontend juga (defense in depth) kalau API gagal.
- Admin console: 1 halaman baru `/admin/content` dengan tab per `page` (Landing / About / Footer / Contact), tiap tab menampilkan form per `sectionKey` sesuai struktur field-nya.

## Error Code Baru
| Code | HTTP Status | Keterangan |
| --- | --- | --- |
| `INVALID_SECTION_KEY` | 422 | `sectionKey` tidak dikenal untuk `page` terkait |

---

# 5. Bug Fix #3 — Hilangkan Mode Sandbox/Mock

## Root Cause
`api-client.ts` punya `getApiMode()` yang default ke `'mock'`, dipakai sebagai branch `if (getApiMode() === 'mock') { ...pakai mockDb... } else { ...pakai apiClient asli... }` di **semua** service (`auth`, `cars`, `curators`, `settings`, `tracking`, dll). Ditambah panel "Konfigurasi API" di `Login.tsx` untuk toggle mode + ubah base URL dari UI.

## Perbaikan
1. Hapus seluruh branch `if (getApiMode() === 'mock') {...}` di semua file `src/services/*.service.ts` — sisakan hanya jalur `apiClient` asli.
2. Hapus `mockDb` import dan file `mock-db.ts` itu sendiri (tidak dipakai lagi di manapun).
3. Hapus `getApiMode`, `setApiMode` dari `api-client.ts`; `getApiUrl`/`setApiUrl` tetap dipertahankan **tapi** sumber base URL default cukup dari env var (`VITE_API_BASE_URL`), tidak perlu lagi override manual dari UI kalau tidak dibutuhkan produksi.
4. Hapus panel "Konfigurasi API" (tombol gear + modal) dan blok "💡 Akses Sandbox Demo" di `Login.tsx`.

> **Asumsi Claude (mohon dikonfirmasi):** Saya asumsikan `setApiUrl`/env var tetap dipertahankan (tanpa toggle mock) supaya LabKerKom masih bisa arahkan frontend ke backend local vs production lewat `.env`, bukan hardcode base URL. Kalau LabKerKom mau base URL benar-benar fix per environment build (tanpa runtime override sama sekali), saya bisa sederhanakan lebih jauh.

**Tidak ada perubahan API/skema backend.**

---

# 6. Perbaikan Tambahan (Temuan Claude) — Pagination Admin Cars

## Root Cause
`listAdminCars()` di backend query semua row tanpa `skip`/`take`; `CarsList.tsx` render seluruh hasil dalam 1 tabel tanpa kontrol halaman. Tidak masalah saat data masih sedikit, tapi berisiko lambat begitu data mobil bertambah banyak (relevan karena periode validasi 25 hari akan menambah data terus).

## Perbaikan

### Endpoint Berubah — `04-api-contract.md`
`GET /admin/cars` menerima query param tambahan: `page` (default 1), `limit` (default 20), plus filter yang sudah ada (`status`, `search`). Response mengikuti format pagination standar (`meta.page/limit/total/totalPages`), sama seperti `GET /cars` publik.

### Backend
`listAdminCars(query)` diubah menjadi menerima `page`/`limit`, tambah `skip`/`take`, dan `prisma.car.count()` paralel — pola identik dengan `listPublicCars()` yang sudah ada, tinggal disalin tanpa filter `status: PUBLISHED`.

### Frontend
`CarsList.tsx` ditambah komponen pagination (Previous/Next + nomor halaman) di bawah tabel, terhubung ke query param `page`.

**Tidak ada perubahan schema Prisma.**

---

# 7. Fitur Baru #1 — Daftar Kurator Public + Dropdown Pilih Kurator di Inspeksi

## 7.1 Public Page

Endpoint `GET /curators` **sudah ada** dan sudah public — tidak perlu endpoint baru. Yang perlu ditambah murni di frontend:
- Section baru di halaman About (atau halaman `/kurator` tersendiri — **butuh konfirmasi LabKerKom**, lihat Section 9 "Assumption to Confirm") yang me-render list kurator: foto, nama, role, deskripsi.

## 7.2 Dropdown Pilih Kurator di Form Inspeksi

### Konteks
`Car.inspectionReport` adalah kolom `Json?` berisi laporan per kategori (mesin, transmisi, bodi, dst — lihat `06-frontend-prd.md` section 5.3). Saat ini tidak ada field yang mengaitkan laporan inspeksi ke kurator mana yang mengerjakannya.

### Prisma Schema — Tambah Kolom ke `Car`

```prisma
model Car {
  // ...field lain tetap sama...
  inspectedBy   String?   @map("inspected_by")
  curator       Curator?  @relation(fields: [inspectedBy], references: [id], onDelete: SetNull)
}

model Curator {
  // ...field lain tetap sama...
  inspectedCars Car[]
}
```

> **Asumsi Claude:** relasi `SetNull` — kalau kurator dihapus (hard delete), mobil yang pernah diinspeksi kurator tersebut tidak ikut terhapus, `inspected_by` cukup jadi `null`. Riwayat laporan inspeksi (isi JSON) tetap utuh, hanya kehilangan atribusi nama kurator.

### Endpoint Berubah
- `POST /admin/cars` dan `PUT /admin/cars/:id`: tambah field opsional `inspectedById` di body, tervalidasi Zod (UUID, opsional). Jika diisi, backend cek `curator` dengan id tersebut ada — kalau tidak, `404 CURATOR_NOT_FOUND`.
- `GET /cars/:slug` dan `GET /admin/cars/:id`: response tambah field `curator: { id, name, role, photoUrl } | null` (include relasi, bukan cuma `inspectedById` mentah — supaya frontend detail mobil bisa langsung tampilkan "Diinspeksi oleh [nama kurator]").

### Frontend Admin
Form tambah/edit mobil (bagian Laporan Inspeksi) ditambah 1 dropdown "Kurator Pemeriksa" yang isinya di-fetch dari `GET /curators` (existing endpoint) — bukan input teks bebas.

### Frontend Public
Detail mobil (`/cars/:slug`) di bagian Laporan Inspeksi menampilkan badge "Diperiksa oleh [nama + foto kecil kurator]" jika `curator` tidak null.

---

# 8. Fitur Baru #2 — Menu Media Library

## Scope (dikonfirmasi LabKerKom)
Fase ini: **Upload manual + Link custom**. Tombol **Generate AI** ditampilkan di UI tapi berstatus "Segera Hadir" (disabled) — arsitektur disiapkan supaya provider AI tinggal dicolok nanti tanpa bongkar ulang struktur.

## Prisma Schema Baru

```prisma
enum MediaSourceType {
  UPLOAD
  EXTERNAL_LINK
  AI_GENERATED   // disiapkan untuk fase berikutnya, belum dipakai
}

model MediaAsset {
  id         String          @id @default(uuid())
  url        String          @db.VarChar(500)
  sourceType MediaSourceType @map("source_type")
  fileHash   String?         @map("file_hash") @db.VarChar(64) // null untuk EXTERNAL_LINK
  sizeBytes  Int?            @map("size_bytes")                // null untuk EXTERNAL_LINK
  altText    String?         @map("alt_text") @db.VarChar(255)
  uploadedBy String          @map("uploaded_by")
  uploader   User            @relation(fields: [uploadedBy], references: [id])
  createdAt  DateTime        @default(now()) @map("created_at")

  @@index([sourceType])
  @@map("media_assets")
}
```

## Endpoint Baru

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/admin/media` | 🔒 | List media (pagination, filter `sourceType`) |
| POST | `/admin/media/upload` | 🔒 | Upload file (multipart) → Sharp → WebP → R2 → simpan row |
| POST | `/admin/media/link` | 🔒 | Simpan link eksternal (tanpa proses Sharp, validasi URL format + `HEAD` request opsional untuk cek gambar valid) |
| DELETE | `/admin/media/:id` | 🔒 | Hapus 1 asset (hapus dari R2 dulu jika `sourceType: UPLOAD`, baru hapus row) |

## Business Logic
- `POST /admin/media/upload`: proses identik pola upload gambar mobil (Sharp resize max 1920×1080, convert WebP, compress, hash untuk dedup), simpan ke folder R2 `media/`.
- `POST /admin/media/link`: **tidak** melewati Sharp/R2 — `url` disimpan apa adanya. Validasi Zod `url` harus format URL valid dan (disarankan) MIME response `Content-Type` diawali `image/` — kalau gagal `HEAD` request, tetap simpan tapi beri warning di response (jangan block, karena bisa saja server eksternal tidak support `HEAD`).
- `sourceType: AI_GENERATED` — kolom enum sudah disiapkan, tapi endpoint `POST /admin/media/generate` **belum dibuat** di iterasi ini (YAGNI, sesuai keputusan LabKerKom). Ditambahkan nanti begitu provider AI ditentukan.

## Integrasi ke Upload Gambar Existing (Cars, Curators, Articles, Branding)
Setiap tempat yang sekarang punya tombol upload gambar (form mobil, form kurator, cover artikel, logo branding) ditambah 1 popup pilihan:
1. **Upload dari Perangkat** — flow existing yang sudah ada (tidak berubah, tetap lewat endpoint masing-masing modul, bukan lewat `media_assets`, supaya tidak mengubah kontrak existing).
2. **Pilih dari Media Library** — buka modal daftar `MediaAsset`, pilih salah satu, dapat `url`-nya untuk dipakai.
3. **Generate Gambar (AI)** — tombol disabled dengan label "Segera Hadir".
4. **Link Custom** — input manual URL gambar, tersimpan juga sebagai `MediaAsset` baru (`sourceType: EXTERNAL_LINK`) agar tercatat di Media Library untuk dipakai ulang.

> **Asumsi Claude (mohon dikonfirmasi):** upload gambar mobil/kurator/artikel/logo **tetap pakai endpoint modul masing-masing** seperti sekarang (bukan direfactor untuk lewat `media_assets`), supaya tidak mengubah kontrak API yang sudah berjalan produksi. Media Library jadi lapisan tambahan/opsional di atasnya, bukan pengganti. Kalau LabKerKom maunya semua upload gambar disentralisasi lewat Media Library (1 sumber kebenaran), itu perubahan arsitektur lebih besar dan saya perlu scope ulang endpoint2 existing.

---

# 9. Fitur Baru #3 — Backup & Restore

## Scope (dikonfirmasi LabKerKom)
Fitur di admin console: tombol export & import database dari UI (bukan cuma cron/script tanpa UI).

## Endpoint Baru

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| POST | `/admin/backup/export` | 🔒 OWNER only | Trigger `pg_dump`, kompres, upload sementara ke R2 folder `backups/`, return signed URL download |
| GET | `/admin/backup/list` | 🔒 OWNER only | List riwayat backup (nama file, ukuran, tanggal) |
| POST | `/admin/backup/restore` | 🔒 OWNER only | Upload file dump (multipart) → restore ke database — **destruktif** |

## Business Logic

### Export
1. Jalankan `pg_dump` (via `child_process.exec`, bukan Prisma — Prisma tidak punya native dump) dengan `DATABASE_URL` dari env, output format custom (`-Fc`) supaya lebih ringkas dan bisa direstore parsial jika perlu.
2. Kompres hasil (`pg_dump -Fc` sudah terkompresi secara default, tidak perlu gzip tambahan).
3. Upload ke R2 folder `backups/{timestamp}.dump`, catat metadata (ukuran, siapa yang trigger) — **tidak** perlu tabel Prisma baru untuk ini, cukup list langsung dari R2 (`ListObjectsV2`) karena backup bukan data relasional.
4. Return signed URL (expiry pendek, misal 10 menit) supaya admin bisa download langsung dari browser.
5. Retention: simpan maksimal 7 backup terakhir di R2, hapus yang paling lama otomatis setiap kali backup baru dibuat (hindari biaya storage R2 membengkak — sesuai YAGNI, tidak perlu retention policy kompleks di MVP).

### Restore — **Wajib Ada Konfirmasi Eksplisit, Destruktif**
1. Endpoint terima file `.dump` via multipart.
2. **Wajib** double-confirmation di level API: body request harus menyertakan field `confirmationText` yang harus persis sama dengan string tertentu (mis. nama situs, `"SUHUMOBIL RESTORE"`), supaya tidak bisa ke-trigger tidak sengaja lewat request otomatis/replay.
3. Jalankan `pg_restore --clean --if-exists` terhadap `DATABASE_URL`.
4. Setelah restore sukses, **wajib** invalidate semua sesi JWT aktif (karena tabel `users` bisa saja berubah) — cara paling simpel: ubah `JWT_SECRET` butuh restart server manual, **atau** (lebih baik, tanpa restart) tambah kolom `tokenVersion` di `User` yang di-bump saat restore, dicek di `auth-guard.ts` setiap request.
5. Endpoint ini **wajib** role `OWNER`, bukan `ADMIN` biasa (per `00-development-rules.md` section 16 — MVP masih 2 role, ini kasus tepat untuk membedakan keduanya).
6. Restore tercatat di Audit Log (lihat Section 10) sebagai event kritikal, termasuk siapa yang melakukan dan timestamp.

> **Asumsi Claude (mohon dikonfirmasi — ini keputusan berisiko, tolong direview serius):**
> - Saya asumsikan `pg_dump`/`pg_restore` CLI **tersedia di container/VPS backend** (biasanya perlu `postgresql-client` di-install terpisah dari Node.js image — perlu ditambahkan ke `Dockerfile`).
> - Saya pilih pakai kolom `tokenVersion` untuk invalidasi sesi otomatis pasca-restore (tanpa perlu restart manual) — kalau LabKerKom lebih suka restart manual server sebagai langkah restore (lebih simpel tapi butuh akses VPS), saya bisa hilangkan kompleksitas `tokenVersion` ini.
> - Restore **tidak** ada "dry-run"/preview di MVP ini (YAGNI) — begitu file di-upload dan `confirmationText` cocok, restore langsung jalan. Kalau LabKerKom mau ada tahap preview/backup-otomatis-sebelum-restore (safety net), saya tambahkan di scope ini juga — kasih tau saya.

## Error Code Baru
| Code | HTTP Status | Keterangan |
| --- | --- | --- |
| `RESTORE_CONFIRMATION_MISMATCH` | 422 | `confirmationText` tidak cocok |
| `BACKUP_OPERATION_FAILED` | 500 | `pg_dump`/`pg_restore` gagal dieksekusi |

---

# 10. Fitur Baru #4 — Log & Audit Log

## Konteks
`00-development-rules.md` section 21 sudah mewajibkan logging (Login, Logout, Create, Update, Delete, Error) — dan itu **sudah** jalan lewat Pino (`logger.info({ action: ... })` tersebar di semua service, lihat contoh di `curators.service.ts`, `branding.service.ts`). Tapi log Pino ini **hanya ke stdout/file**, tidak ada di database, jadi tidak bisa ditampilkan/difilter dari admin console. Itu gap-nya.

## Prisma Schema Baru

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  userId     String?  @map("user_id")   // null jika aksi sistem (mis. cron) atau login gagal (user belum diketahui)
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action     String   @db.VarChar(50)   // "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | dst
  entity     String   @db.VarChar(50)   // "car" | "curator" | "article" | "settings" | "database" | dst
  entityId   String?  @map("entity_id")
  metadata   Json?                      // detail perubahan (opsional, ringkas, JANGAN simpan password/token)
  ipAddress  String?  @map("ip_address") @db.VarChar(45)
  createdAt  DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
  @@map("audit_logs")
}
```

## Endpoint Baru

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/admin/audit-logs` | 🔒 | List audit log, pagination + filter (`action`, `entity`, `userId`, tanggal dari-sampai) |

Tidak ada endpoint create manual — audit log hanya ditulis otomatis dari backend, tidak pernah dari input user langsung (mencegah pemalsuan riwayat).

## Business Logic
- Helper baru `utils/audit-log.ts`: `writeAuditLog({ userId, action, entity, entityId, metadata, req })` — dipanggil di titik-titik yang sudah punya `logger.info({ action: ... })` sekarang, **ditambah** (bukan mengganti) baris `logger.info` yang sudah ada.
- Prioritas modul yang dicatat: `auth` (login/logout, termasuk **login gagal** untuk deteksi brute force), `cars`, `curators`, `articles`, `settings`, `content-sections`, `media`, `backup` (restore = wajib, lihat Section 9).
- `metadata` disarankan hanya simpan **field yang berubah** (before/after ringkas), bukan seluruh row — supaya tabel tidak membengkak dan tidak bocor data sensitif secara tidak sengaja.
- Retention: **tidak** ada auto-delete di MVP ini (audit log justru harus tahan lama untuk keperluan investigasi) — kalau nanti tabel besar, itu concern optimasi terpisah, bukan bagian MVP (YAGNI).

## Frontend Admin
Halaman baru `/admin/audit-logs`: tabel dengan filter (aksi, entity, user, rentang tanggal), pagination. Menu ini disarankan **hanya muncul untuk role `OWNER`** (data sensitif riwayat operasional) — **butuh konfirmasi LabKerKom**, lihat Section 11.

---

# 11. Ringkasan Assumption yang Butuh Konfirmasi LabKerKom

| # | Assumption | Section |
| --- | --- | --- |
| 1 | `ContentSection.content` bebas struktur JSON per `sectionKey`, bukan kolom rigid | 4 |
| 2 | Daftar kurator public: masuk ke halaman About yang sudah ada, atau halaman `/kurator` baru terpisah? | 7.1 |
| 3 | Base URL API tetap bisa diubah runtime via env var (tanpa toggle mock), bukan hardcode per build | 5 |
| 4 | Upload gambar existing (cars/curators/articles/branding) **tidak** direfactor lewat Media Library, tetap pakai endpoint masing-masing | 8 |
| 5 | Restore pakai `tokenVersion` untuk auto-invalidate sesi (bukan restart manual server) | 9 |
| 6 | Restore tidak ada dry-run/preview di MVP ini | 9 |
| 7 | Halaman Audit Log hanya bisa diakses role `OWNER`, bukan `ADMIN` biasa | 10 |

---

# 12. Urutan Pengerjaan yang Disarankan

Mengikuti Coding Workflow (`02-project-blueprint.md` section 26: Database → Prisma → API → Validation → Service → UI → Testing):

1. Bug fix murni frontend (tidak perlu backend): **#1 Foto Kurator**, **#3 Hilangkan Sandbox**
2. Migrasi Prisma gabungan untuk semua fitur baru (`ContentSection`, `Car.inspectedBy`, `MediaAsset`, `AuditLog`) — 1 migrasi sekali jalan lebih efisien daripada 4 migrasi terpisah
3. Backend: `content-sections/`, pagination `admin/cars`, `curators` dropdown wiring, `media/`, `audit-logs/` (helper + integrasi ke module existing)
4. Backend: `backup/` (paling terakhir & paling hati-hati karena destruktif — butuh testing terpisah di environment non-production dulu)
5. Frontend: sinkron mengikuti urutan backend di atas
6. Update Postman collection (folder baru: Content Sections, Media Library, Backup, Audit Logs)

---

# Approval

| Role | Status |
| --- | --- |
| Software Architect (Claude) | ✅ Draft Selesai |
| Product Owner (LabKerKom) | ⏳ Pending Review |

---

**End of Document**
