# 07-frontend-reconciliation-addendum.md

> **Project:** SuhuMobil (Working Title)
>
> **Version:** 1.0.0
>
> **Status:** Draft — Pending Review
>
> **Document Type:** Reconciliation Addendum (Delivered Frontend vs Dokumen 00–06)
>
> **Target:** AI Assisted Development
>
> **Referensi wajib:** `00-development-rules.md`, `01-business-overview.md`, `02-project-blueprint.md`, `03-database-design.md`, `04-api-contract.md`, `05-backend-prd.md`, `06-frontend-prd.md`

---

# 1. Tujuan Dokumen

Frontend sudah dibangun (via Google AI Studio) dan diserahkan sebagai project React + Vite lengkap dengan `README.md` sendiri yang mendeskripsikan fitur. Dokumen ini membandingkan **apa yang sudah benar-benar dibangun** di frontend tersebut terhadap **apa yang didefinisikan di `00`–`06`**, lalu menetapkan versi final yang disepakati.

Dokumen ini **tidak menggantikan** dokumen manapun — ini adalah **addendum/delta** yang wajib dibaca bersamaan dengan `00`–`06`. Jika ada konflik, urutan prioritas tetap mengikuti `README.md` (root) section 11: `00` menang, lalu `04`, lalu `03`. Dokumen ini hanya **menambah** hal yang belum ada dan **mendokumentasikan** deviasi yang sudah terlanjur diimplementasikan di frontend supaya backend bisa disinkronkan — bukan aturan baru yang menimpa `00`.

---

# 2. Ringkasan Temuan

| # | Temuan | Kategori | Tindakan |
| --- | --- | --- | --- |
| 1 | Frontend dibangun dengan **Vite + React Router (SPA, HashRouter)**, bukan Next.js 15 App Router | Deviasi Arsitektur | **DITOLAK — Opsi B dipilih.** Frontend wajib ditulis ulang ke Next.js 15 App Router sesuai `02`/`06` asli. Lihat Section 3 (updated) |
| 2 | Rich Text Editor adalah `contentEditable` custom (`document.execCommand`), bukan TipTap | Deviasi Library | **Ikut ditulis ulang ke TipTap** sesuai `00` §34 & `06` §8 asli (konsekuensi dari keputusan #1) — lihat Section 4 (updated) |
| 3 | Modul **Curators (Kurator)** — CRUD lengkap, tampil di Home & About | Fitur Baru | **Ditambahkan** ke `03`, `04`, `05`, `06`, lihat Section 5 |
| 4 | Modul **Tracking & Insights** — referral link generator + dashboard analitik | Fitur Baru | **Ditambahkan** ke `01`, `03`, `04`, `05`, `06`, lihat Section 6 |
| 5 | Popup Lead (`WhatsappLeadPopup`) tidak mengirim sumber referral ke `POST /leads` | Gap Integrasi | **Wajib diperbaiki** di frontend, lihat Section 7 |
| 6 | Struktur data Car/Lead/Article/Settings di frontend **konsisten 1:1** dengan `03`/`04` | Konfirmasi | Tidak ada perubahan |
| 7 | Base URL & auth cookie (`withCredentials: true`) konsisten dengan `04` §5 dan README §7–8 | Konfirmasi | Tidak ada perubahan |

---

# 3. Deviasi Arsitektur: Vite + React Router, bukan Next.js — **KEPUTUSAN: Opsi B, pakai Next.js**

## Temuan
`package.json` frontend yang diserahkan memakai: `vite`, `react-router-dom` (HashRouter), `react` 19, `zustand`, `@tanstack/react-query`, `axios`, `zod`, `react-hook-form`, `recharts`, `motion`, `lucide-react`. **Tidak ada** `next`. Routing memakai hash (`#/cars/:slug`), bukan App Router `app/`.

## Keputusan (Final — ditetapkan Product Owner)
**Opsi B dipilih: frontend dibangun ulang dengan Next.js 15 App Router**, sesuai spesifikasi asli di `02-project-blueprint.md` dan `06-frontend-prd.md`. Alasan utamanya konsisten dengan trade-off yang tercatat sebelumnya:

| Next.js (dipilih) | Vite + React Router (yang diserahkan, dibuang) |
| --- | --- |
| SSR/SSG per halaman → meta tag dinamis, OG image, JSON-LD otomatis ter-render di HTML awal | Full CSR — butuh workaround manual dan berisiko ke crawler yang tidak render JS |
| URL bersih `/cars/[slug]` via `app/` routing | URL memakai `#` (`HashRouter`), tidak SEO-friendly |
| `next/image` optimasi otomatis | `<img>` biasa, tidak ada `srcset` otomatis |

Ini konsisten dengan KPI "Index Google Minggu ke-2" di `01-business-overview.md` §5 yang butuh SEO server-side sejak awal — jadi worth the extra effort dibanding tetap di Vite.

**Konsekuensi praktis:**
- `02-project-blueprint.md` dan `06-frontend-prd.md` versi **asli tetap berlaku apa adanya** — tidak perlu diubah untuk urusan tech stack/routing (App Router `app/` sudah benar seperti tertulis di sana).
- `00-development-rules.md` §4 (Tech Stack Frontend) **tetap Next.js seperti semula** — tidak perlu diedit.
- Frontend yang diserahkan (Vite/React Router) **berfungsi sebagai referensi desain & logic saja** (UI/UX, alur form, business logic komponen, struktur data) — bukan kode final yang dipakai. Seluruh komponen perlu **ditulis ulang** memakai konvensi Next.js App Router (`app/`, Server/Client Component, `next/image`, `next/script` untuk GTM, dst. sesuai `06` §4–§14).
- **Tambahan library baru** yang ikut terbawa dari fitur README (`recharts` untuk grafik Insights) **tetap dipakai** di Next.js — `recharts` adalah library React biasa, kompatibel penuh dengan Next.js Client Component. Tidak perlu dicatat sebagai perubahan stack di `00`, cukup ditambahkan sebagai dependency baru saat implementasi modul Insights (lihat Section 6).
- `motion` (dulu Framer Motion) dari frontend yang diserahkan **opsional** dipakai kalau ingin animasi — tidak wajib, tidak ada di spek asli, silakan pakai kalau membantu UX tanpa menambah kompleksitas berarti (prinsip KISS tetap berlaku).

## Dampak ke Backend
**Tidak ada dampak ke backend.** Backend tetap REST API murni sesuai `04-api-contract.md`, terlepas dari framework frontend. CORS (`CORS_ORIGIN`) dan cookie `SameSite=Strict` tetap berfungsi sama.

---

# 4. Deviasi Library: Rich Text Editor Custom, bukan TipTap — **KEPUTUSAN: pakai TipTap sesuai spek asli**

## Temuan
`src/components/RichTextEditor.tsx` adalah editor `contentEditable` custom berbasis `document.execCommand` (Bold, Italic, Heading, List, Quote, Link), **bukan** TipTap seperti disebut di `00-development-rules.md` §34 dan `06-frontend-prd.md` §8.

## Keputusan (Final — konsekuensi dari Section 3)
Karena frontend ditulis ulang penuh ke Next.js (Opsi B), **tidak ada alasan lagi mempertahankan deviasi ini** — sekalian pakai **TipTap seperti spesifikasi asli** `00` §34 dan `06` §8 (toolbar: Heading, Bold, Italic, List, Blockquote, Link, Image embed, Code block). Komponen `RichTextEditor.tsx` yang diserahkan cukup jadi **referensi UX** (tampilan toolbar, behavior fokus) — implementasinya diganti total ke TipTap.

**Tidak ada perubahan** di `00-development-rules.md` §34 atau `06-frontend-prd.md` §8 — keduanya sudah benar sejak awal, cukup diikuti persis.

## Dampak ke Backend
**Tidak ada perubahan.** Output akhirnya tetap **HTML string** dengan kontrak yang sama (`03-database-design.md` §11, `04-api-contract.md`). Backend tetap **wajib** sanitasi via `sanitize-html` dengan whitelist tag yang sama (`00` §34) — ini berlaku untuk HTML dari editor manapun, TipTap sekalipun bisa menghasilkan markup di luar whitelist kalau di-paste dari sumber luar, jadi sanitasi server-side tetap non-negotiable seperti semula.

---

# 5. Fitur Baru: Modul Curators (Kurator)

## Konteks Bisnis
`01-business-overview.md` §7 sudah menyebut peran **Kurator** sebagai peran fungsional yang login sebagai akun `ADMIN` (tidak ada role sistem terpisah — ini **tetap berlaku, tidak berubah**). Modul baru ini **bukan** tentang login/permission — ini adalah **entitas konten publik** (profil/bio tim kurator yang ditampilkan di Landing Page & halaman About), mirip "Our Team" section. Jangan tertukar dengan konsep role di `00` §16.

## Data Model — Tambahan ke `03-database-design.md`

### Table: `curators`

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | Primary Key, default `gen_random_uuid()` |
| name | VARCHAR(100) | Not Null |
| role | VARCHAR(100) | Not Null, default `"Kurator Utama"` (contoh: "Kurator Utama", "Teknisi Senior") |
| photo_url | VARCHAR(500) | Nullable (URL Cloudflare R2) |
| description | TEXT | Not Null (bio/narasi, plain text atau rich text sederhana — lihat catatan di bawah) |
| created_at | TIMESTAMP | Not Null, default `now()` |
| updated_at | TIMESTAMP | Not Null, auto-update |

> **Tidak pakai soft delete** (tidak ada `deleted_at`) — sesuai perilaku frontend (`curatorsService.deleteCurator` memanggil hard `DELETE`), dan datanya kecil/non-transaksional (beda karakter dengan `cars`/`articles` yang butuh audit trail penghapusan foto R2). Konsisten prinsip KISS/YAGNI `00` §5.

Prisma addition:
```prisma
model Curator {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(100)
  role        String   @default("Kurator Utama") @db.VarChar(100)
  photoUrl    String?  @map("photo_url") @db.VarChar(500)
  description String
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("curators")
}
```

> `description` di frontend diisi lewat `<textarea>` biasa (bukan Rich Text Editor) dan bisa berisi newline (`\n\n`). **Tidak perlu sanitasi `sanitize-html`** (bukan HTML), tapi tetap wajib validasi Zod panjang max (disarankan 2000 karakter) untuk cegah abuse — treat sebagai plain text, escape saat render di frontend (`white-space: pre-line`).

## Endpoint — Tambahan ke `04-api-contract.md`

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/curators` | Public | List semua kurator (query opsional `search`) |
| GET | `/curators/:id` | Public | Detail 1 kurator |
| POST | `/admin/curators` | 🔒 | Tambah kurator baru |
| PUT | `/admin/curators/:id` | 🔒 | Update kurator |
| POST | `/admin/curators/:id/photo` | 🔒 | Upload/ganti foto kurator (multipart) |
| DELETE | `/admin/curators/:id` | 🔒 | **Hard delete** kurator |

### GET `/curators`
Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "name": "Suhu Benny Susilo",
      "role": "Kurator Utama",
      "photoUrl": "https://cdn.suhumobil.com/curators/uuid.webp",
      "description": "Selama 25 tahun berkecimpung di dunia otomotif...",
      "createdAt": "2026-06-01T00:00:00Z",
      "updatedAt": "2026-06-01T00:00:00Z"
    }
  ]
}
```
> Endpoint public ini **tidak dipaginasi** — jumlah kurator kecil (biasanya < 10), sesuai KISS.

### POST `/admin/curators`
Request:
```json
{ "name": "Suhu Benny Susilo", "role": "Kurator Utama", "description": "..." }
```
Response `201`: sama seperti detail, `photoUrl: null`.

### POST `/admin/curators/:id/photo`
Multipart, field `file` (`image/jpeg`, `image/png`, `image/webp`, max 5 MB). Alur backend **sama seperti logo bisnis** (`05` §13): Sharp resize max 512×512 → convert WebP → compress → upload ke R2 folder `curators/` dengan nama UUID → hapus foto lama dari R2 sebelum simpan yang baru (no orphan file, `00` §28).

Response `200`:
```json
{ "success": true, "message": "Success", "data": { "id": "uuid", "photoUrl": "https://cdn.suhumobil.com/curators/uuid.webp", "...": "..." } }
```

### DELETE `/admin/curators/:id`
Hard delete row + hapus `photo_url` dari R2 (jika ada) sebelum delete row (pola sama seperti `car_images` — hapus file R2 dulu baru hapus row, `05` §9).

Response `200`: `{ "success": true, "message": "Success", "data": null }`

## Error Code Baru — Tambahan ke `04-api-contract.md` §6

| Code | HTTP Status | Keterangan |
| --- | --- | --- |
| `CURATOR_NOT_FOUND` | 404 | Kurator tidak ditemukan |

## Business Logic — Tambahan ke `05-backend-prd.md`
- Module baru `curators/` mengikuti struktur module standar (`curators.controller.ts`, `.service.ts`, `.schema.ts`, `.routes.ts`), ditambahkan ke `src/modules/`.
- Tidak ada limit jumlah kurator di MVP (YAGNI — kalau nanti jadi ratusan baru dipikirkan pagination).
- Rate limit: masuk kategori "Endpoint lain" → 60 req/menit/IP (`00` §? / `04` §16).

## Frontend — Tambahan ke `06-frontend-prd.md`
- Route baru: `/admin/curators` (List + Modal Form tambah/edit, bukan halaman terpisah — sesuai implementasi `CuratorsList.tsx`).
- Landing Page (`06` §5.1) & About Page (`06` §5.4): render section "Tim Kurator/Tentang Kurator" dari `GET /curators`, bukan lagi hardcode "Statis" seperti disebut di `06` §5.1 tabel Landing Page — **update baris "Tentang Kurator"** dari `Sumber Data: Statis` menjadi `Sumber Data: GET /curators`.

---

# 6. Fitur Baru: Modul Tracking & Insights (Analitik Kampanye)

## Konteks Bisnis
README frontend menambahkan **sistem tracking referral mandiri** di luar GTM/GA4 (`00` §35 tetap berlaku untuk GTM/GA4, tidak berubah). Fitur ini justru **memperkuat** pengukuran KPI `01-business-overview.md` §5 "CTA WhatsApp ≥5%" dengan breakdown per-kanal (WhatsApp/Instagram/TikTok/Facebook/Telegram/Custom), sehingga **direkomendasikan ditambahkan ke `01-business-overview.md` §5 sebagai KPI turunan**, bukan cuma fitur teknis lepas.

## Cara Kerja (End-to-End)
1. Admin generate tautan pelacak per unit mobil via tombol **"Bagikan & Salin Tautan"** (di Detail Mobil publik & di List Mobil admin) → format: `https://domain.com/cars/{slug}?src={channel}` (`channel` ∈ `whatsapp|instagram|tiktok|facebook|telegram|custom`).
2. Saat link dibuka pengunjung → frontend mendeteksi query param `src` (atau `utm_source`/`ref` sebagai fallback) → catat **1 log `visit`** ke backend, sekaligus simpan source itu ke `sessionStorage` untuk sesi berjalan.
3. Saat admin **menyalin** link (klik tombol Salin) → catat **1 log `click`** (mengukur seberapa sering link "dipakai ulang" oleh tim admin/reseller).
4. Saat pengunjung yang datang dari link tersebut **submit Popup Lead Form** dalam sesi yang sama → catat **1 log `lead`** (conversion) — lihat Section 7 untuk detail teknis wajib di frontend.
5. Admin melihat semua ini teragregasi di halaman **`/admin/insights`**.

## Data Model — Tambahan ke `03-database-design.md`

### Enum baru
```prisma
enum TrackingLogType {
  VISIT
  CLICK
  LEAD
}
```

### Table: `tracking_logs`

| Column | Type | Constraint |
| --- | --- | --- |
| id | UUID | Primary Key |
| type | TrackingLogType | Not Null |
| source | VARCHAR(30) | Not Null (`whatsapp`, `instagram`, `tiktok`, `facebook`, `telegram`, `custom`, atau nilai bebas lain — **tidak** dibatasi enum ketat karena UI punya opsi "Custom/Lainnya" bebas isi, lihat catatan di bawah) |
| car_id | UUID | Foreign Key → `cars.id`, Nullable (`SET NULL` saat mobil dihapus — tracking historis tetap harus ada meski mobilnya sudah tidak ada, hanya `car_id`/`car_title` snapshot yang tersisa) |
| car_title | VARCHAR(150) | Nullable (snapshot judul mobil saat log dibuat, supaya insight tetap valid walau mobil sudah dihapus/berubah judul) |
| lead_id | UUID | Foreign Key → `leads.id`, Nullable (diisi hanya untuk `type: LEAD`, menghubungkan log konversi ke lead yang benar-benar tersimpan) |
| created_at | TIMESTAMP | Not Null, default `now()` |

Prisma addition:
```prisma
model TrackingLog {
  id        String          @id @default(uuid())
  type      TrackingLogType
  source    String          @db.VarChar(30)
  carId     String?         @map("car_id")
  car       Car?            @relation(fields: [carId], references: [id], onDelete: SetNull)
  carTitle  String?         @map("car_title") @db.VarChar(150)
  leadId    String?         @map("lead_id")
  lead      Lead?           @relation(fields: [leadId], references: [id], onDelete: SetNull)
  createdAt DateTime        @default(now()) @map("created_at")

  @@index([type])
  @@index([source])
  @@index([carId])
  @@index([createdAt])
  @@map("tracking_logs")
}
```
> Tambahkan relasi balik `trackingLogs TrackingLog[]` di model `Car` dan `Lead`.

Catatan `source` sebagai `String` bebas (bukan enum ketat): opsi "Custom/Lainnya" di `ShareLinkModal.tsx` tetap mengirim literal `"custom"` (bukan free text dari user), jadi di praktiknya nilainya terbatas pada 6 nilai (`whatsapp, instagram, tiktok, facebook, telegram, custom`). Tapi karena `RouteTracker` di `App.tsx` juga menerima **`utm_source`/`ref` dari luar sistem** (misal seseorang bikin link manual `?utm_source=blogpost`), nilai `source` bisa jadi apapun — makanya kolom dibuat `VARCHAR` bebas, bukan enum Postgres, supaya tidak error saat insert. Validasi Zod cukup: `min(1).max(30)`, lowercase-kan di backend sebelum simpan (frontend sudah `.toLowerCase()`, tapi backend tidak boleh percaya itu).

## Endpoint — Tambahan ke `04-api-contract.md`

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| POST | `/tracking/visit` | Public | Catat kunjungan dari link referral |
| POST | `/tracking/click` | Public | Catat klik "salin tautan" |
| GET | `/admin/insights/system` | 🔒 | Ambil data agregat insight untuk dashboard |

### POST `/tracking/visit` & POST `/tracking/click`
Request (sama untuk keduanya):
```json
{ "carId": "uuid-atau-null", "source": "instagram" }
```
Response `201`:
```json
{ "success": true, "message": "Success", "data": null }
```
Validasi: `source` wajib diisi (min 1 karakter) → jika kosong, `422`. `carId` opsional — backend **wajib** melakukan lookup `car.title` saat ini dan simpan sebagai snapshot `car_title` (jika `carId` tidak ditemukan, simpan log tetap jalan dengan `carId: null`, jangan gagalkan request hanya karena mobil tidak ketemu).

> **Rate limit khusus:** endpoint ini publik dan dipanggil otomatis oleh setiap pengunjung (bukan aksi sadar user seperti submit form) — rawan dipakai untuk spam/flood analitik palsu. Rekomendasi: **30 request/menit/IP** (lebih longgar dari `POST /leads` yang 5/menit, tapi tetap dibatasi — jangan pakai limit umum 60/menit karena 1 pageview bisa memicu 1 visit call, cukup wajar untuk dibatasi terpisah). Tambahkan baris baru di `04` §16 & `05` §6.4.

### GET `/admin/insights/system`
Response `200`:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "totalVisits": 128,
    "totalClicks": 34,
    "totalLeads": 19,
    "bySource": [
      { "source": "whatsapp", "visits": 40, "clicks": 10, "leads": 8 },
      { "source": "instagram", "visits": 55, "clicks": 15, "leads": 7 },
      { "source": "tiktok", "visits": 20, "clicks": 5, "leads": 3 },
      { "source": "facebook", "visits": 8, "clicks": 3, "leads": 1 },
      { "source": "telegram", "visits": 3, "clicks": 1, "leads": 0 },
      { "source": "custom", "visits": 2, "clicks": 0, "leads": 0 }
    ],
    "byCar": [
      { "carId": "uuid", "carTitle": "Toyota Avanza 2019 G MT", "visits": 30, "clicks": 8 }
    ],
    "recentLogs": [
      { "id": "uuid", "type": "visit", "source": "instagram", "carId": "uuid", "carTitle": "Toyota Avanza 2019 G MT", "timestamp": "2026-07-09T10:00:00Z" }
    ]
  }
}
```
Business logic:
- `bySource`: agregasi `GROUP BY source, type` lalu di-pivot per source. Selalu sertakan 6 kanal standar (`whatsapp, instagram, tiktok, facebook, telegram, custom`) meski nilainya 0, **plus** kanal custom lain yang pernah tercatat (dari `utm_source` eksternal) — pola sama seperti logic `mockDb.getSystemInsight()` di frontend (lihat Section 6 gambaran alur di atas).
- `byCar`: top 10 mobil berdasar `visits + clicks` terbanyak, `LEFT JOIN` snapshot `car_title` (bukan judul mobil terkini, supaya konsisten meski judul mobil berubah setelah link dibagikan).
- `recentLogs`: 100 log terbaru, `ORDER BY created_at DESC`. **Frontend menghitung tren 15 hari terakhir dari array `recentLogs` ini di sisi client** — pastikan backend mengembalikan cukup banyak log (100 sudah mencukupi untuk traffic MVP skala kecil, lihat catatan di Section 6.1 di bawah untuk potensi masalah skala).
- Tidak perlu caching di MVP (sama prinsip seperti `05` §14, dashboard stats).

### 6.1 Catatan Skalabilitas (untuk backend, opsional tapi disarankan)
Frontend prototipe menghitung tren grafik 15-hari **hanya dari 100 `recentLogs` terakhir** (client-side aggregation, lihat `Insights.tsx`). Ini cukup untuk traffic rendah MVP (target 20 lead/30 hari, `01` §5), tapi kalau traffic visit/click jauh lebih tinggi dari leads, 100 log terbaru bisa saja hanya mencakup beberapa jam terakhir, bukan 15 hari. **Rekomendasi (opsional, boleh ditunda ke Phase 2):** backend bisa tambahkan field `dailyTrend` hasil agregasi `GROUP BY DATE(created_at)` di response `GET /admin/insights/system`, supaya grafik tidak bergantung pada volume `recentLogs`. Untuk MVP 30 hari dengan traffic kecil, **cukup kirim `recentLogs` limit 100 seperti kontrak di atas** — catat ini sebagai item Phase 2 di `01-business-overview.md` §19.

## Error Code Baru
Tidak ada error code baru khusus (endpoint tracking tidak pernah return 404 — jika `carId` tidak valid, log tetap disimpan tanpa car).

## Frontend — Tambahan ke `06-frontend-prd.md`
- Route baru: `/admin/insights` (Dashboard Metrik + Recharts: Area Chart tren 15 hari, Bar Chart performa kanal, Tabel rincian referrer, Timeline log real-time).
- Komponen baru: `ShareLinkModal` (dipakai di Detail Mobil publik **dan** List Mobil admin), dipanggil dengan props `carId`, `carSlug`, `carTitle`.
- `RouteTracker` (di root, jalan di setiap perpindahan route): baca query param `src`/`utm_source`/`ref` dari URL → simpan ke `sessionStorage` → panggil `POST /tracking/visit`.
- Tambahkan library `recharts` ke stack resmi frontend (`00` §4 dan `06` §3).

---

# 7. Gap Kritis: Lead Conversion Tracking Tidak Akan Berfungsi di Backend Nyata

## Masalah
Di prototipe frontend (mode `mock`, pakai `localStorage`), `mockDb.createLead()` **membaca `sessionStorage.getItem('suhumobil_ref_source')` langsung di browser** untuk otomatis mencatat log `lead` (konversi) saat lead tersimpan. Tapi `WhatsappLeadPopup.tsx` **tidak pernah mengirim** source itu ke `POST /leads` — request-nya cuma berisi `name, phone, email, carId, source (WHATSAPP_CTA/FAB), subject, message`.

Begitu API mode diganti ke `live` (backend REST sungguhan), logic ini **otomatis putus**: backend tidak bisa membaca `sessionStorage` milik browser pengunjung (itu murni client-side storage). Akibatnya kolom `leads` pada `bySource[].leads` dan `totalLeads` di Insights **akan selalu 0** walau lead sebenarnya tetap tersimpan normal di tabel `leads`.

## Perbaikan Wajib (Frontend)
`WhatsappLeadPopup.tsx` **harus diubah** agar membaca `sessionStorage.getItem('suhumobil_ref_source')` sendiri lalu **mengirimkannya eksplisit** sebagai field baru di body `POST /leads`, misalnya:
```json
{
  "name": "Budi Santoso",
  "phone": "081234567890",
  "carId": "uuid-mobil",
  "source": "WHATSAPP_CTA",
  "subject": "PRICE_INQUIRY",
  "message": "...",
  "landingSource": "instagram"
}
```

## Perbaikan Wajib (Backend) — Tambahan ke `04-api-contract.md` §11 & `05-backend-prd.md` §11
- Field baru **opsional** `landingSource` (string, nullable) di request `POST /leads`.
- **Tidak disimpan sebagai kolom baru di tabel `leads`** (jangan campur konsep referral channel dengan `LeadSource` enum yang sudah ada — itu untuk tempat/trigger form, bukan kanal marketing). Sebagai gantinya, backend membuat **1 baris baru di `tracking_logs`** dengan `type: LEAD`, `source: landingSource`, `carId`, `leadId: <id lead yang baru dibuat>` — **hanya jika** `landingSource` dikirim (tidak wajib, karena tidak semua lead datang dari link referral).
- Tidak perlu response tambahan — `POST /leads` tetap return format yang sama seperti kontrak lama (`04` §11).

> Ini **wajib** dicatat sebagai instruksi eksplisit ke chat backend generation ("Backend file generation dari README Instructions") — lihat file `09-instruksi-sinkronisasi-backend.md` yang menyertai dokumen ini.

---

# 8. Checklist Perubahan per Dokumen

> Konteks: Opsi B dipilih (Section 3) — frontend final memakai **Next.js 15 App Router + TipTap**, sesuai `00`/`02`/`06` versi asli. Jadi **tidak ada** perubahan tech-stack di `00`/`02`/`06`, hanya penambahan spesifikasi 2 fitur baru (Curators, Tracking/Insights).

| Dokumen | Perubahan yang Perlu Dilakukan |
| --- | --- |
| `00-development-rules.md` | **Tidak berubah** (Next.js & TipTap tetap seperti semula). Opsional: tambahkan `recharts` ke daftar library frontend §4 (dipakai khusus modul Insights) |
| `01-business-overview.md` | §5 (KPI): tambah catatan bahwa CTA WhatsApp ≥5% sekarang bisa dipecah per-kanal via modul Tracking; §10 Scope MVP: tambah "Manajemen Kurator (publik + admin)" dan "Insights/Tracking Kampanye" ke daftar fitur Public & Dashboard Admin; §19 Future Roadmap: pindahkan "daily trend aggregation" ke Phase 2 jika belum sempat di backend |
| `02-project-blueprint.md` | **Tidak berubah** — struktur Next.js App Router yang sudah tertulis di sana tetap dipakai apa adanya |
| `03-database-design.md` | Tambah table `curators`, table `tracking_logs`, enum `TrackingLogType`; tambah relasi `Car.trackingLogs`, `Lead.trackingLogs` |
| `04-api-contract.md` | Tambah Endpoint Group **Curators** (§ baru), Endpoint Group **Tracking** (§ baru), field `landingSource` di `POST /leads`, error code `CURATOR_NOT_FOUND`, baris rate limit baru untuk `/tracking/*` |
| `05-backend-prd.md` | Tambah Module `curators/`, Module `tracking/` ke struktur §4; business logic detail di § baru (lihat Section 5 & 6 dokumen ini); update §11 (Leads) untuk logic `landingSource` |
| `06-frontend-prd.md` | **Tech stack & routing tidak berubah** (tetap Next.js App Router + TipTap seperti asli). Tambahan: §5.1 Landing Page (baris "Tentang Kurator" sumber data jadi `GET /curators`, bukan statis); tambah §6.9 halaman Curators admin (`/admin/curators`); tambah §6.10 halaman Insights admin (`/admin/insights`, pakai `recharts`); §7 tambah field `landingSource` di alur submit `WhatsappLeadPopup`; §8 tambah komponen `ShareLinkModal` (dipakai di Detail Mobil publik & List Mobil admin) dan util `RouteTracker`-equivalent (baca query `src`/`utm_source`/`ref` di Server/Client Component halaman relevan, simpan ke `sessionStorage`, panggil `POST /tracking/visit`) |

## Catatan Implementasi Next.js untuk Fitur Baru
- `ShareLinkModal` & referral tracking (`src`/`utm_source`/`ref` di query string) tetap bisa jalan penuh di Next.js — baca `searchParams` di Client Component halaman `/cars/[slug]`, lalu simpan ke `sessionStorage` dan panggil `POST /tracking/visit` di `useEffect`. URL akhirnya bersih tanpa `#`: `https://suhumobil.com/cars/toyota-avanza-2019-g-mt?src=instagram` — ini justru **lebih baik** dibanding versi Vite/HashRouter untuk kebutuhan share link ke medsos.
- Halaman `/admin/insights` dan komponen chart (`recharts`) wajib jadi **Client Component** (`"use client"`) karena pakai hook & rendering interaktif — data awal boleh tetap di-fetch via TanStack Query seperti halaman admin lain (`06` §9).

---

# Approval

| Role | Status |
| --- | --- |
| Software Architect | ⏳ Review |
| Product Owner | ⏳ Review (khusus keputusan Opsi A/B di Section 3) |

---

**End of Document**