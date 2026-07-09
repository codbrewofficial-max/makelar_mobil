# Instruksi Sinkronisasi Backend — SuhuMobil

> **Cara pakai dokumen ini:** salin isi dokumen ini sebagai pesan pertama di chat baru berjudul **"Backend file generation dari README Instructions"**, bersama seluruh dokumen `00`–`06` (yang sudah ada) **dan** `07-frontend-reconciliation-addendum.md` (baru). Dokumen ini murni berisi **delta instruksi** — tidak menggantikan `05-backend-prd.md`, hanya menambah & mengoreksi.

---

## Konteks

Frontend SuhuMobil sudah dibangun (Vite + React + React Router, bukan Next.js — lihat `07-frontend-reconciliation-addendum.md` Section 3, ini tidak berdampak ke backend). Saat membangun frontend, ditemukan **2 modul baru** yang belum ada di `03-database-design.md`/`04-api-contract.md`/`05-backend-prd.md` versi awal, dan **1 gap integrasi** yang wajib ditambal di kontrak API. Backend yang kamu bangun **wajib mengikuti seluruh isi `00`–`05` seperti biasa, ditambah 3 hal berikut**:

1. Modul baru: **Curators** (manajemen profil kurator/tim inspeksi).
2. Modul baru: **Tracking & Insights** (analitik referral link per kanal media sosial).
3. Perubahan kontrak: `POST /leads` menerima field opsional baru `landingSource`.

Detail lengkap desain ada di `07-frontend-reconciliation-addendum.md` Section 5, 6, 7 — baca dulu sebelum coding. Ringkasan actionable ada di bawah ini.

---

## 1. Tambahan Prisma Schema

Tambahkan ke `schema.prisma` yang sudah kamu buat dari `03-database-design.md`:

```prisma
enum TrackingLogType {
  VISIT
  CLICK
  LEAD
}

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

Tambahkan relasi balik di model yang sudah ada:
```prisma
model Car {
  // ...field lain tetap sama...
  trackingLogs TrackingLog[]
}

model Lead {
  // ...field lain tetap sama...
  trackingLogs TrackingLog[]
}
```

`Curator` **tidak** pakai soft delete (tidak ada `deletedAt`) — delete selalu hard delete.

---

## 2. Modul Baru: `curators/`

Tambahkan folder `src/modules/curators/` dengan struktur sama seperti module lain (`curators.controller.ts`, `.service.ts`, `.schema.ts`, `.routes.ts`).

### Endpoint

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/curators` | Public | List semua kurator, query opsional `?search=` (ILIKE `name`) |
| GET | `/curators/:id` | Public | Detail 1 kurator |
| POST | `/admin/curators` | 🔒 | Tambah kurator |
| PUT | `/admin/curators/:id` | 🔒 | Update kurator (`name`, `role`, `description`) |
| POST | `/admin/curators/:id/photo` | 🔒 | Upload/ganti foto (multipart, field `file`) |
| DELETE | `/admin/curators/:id` | 🔒 | Hard delete |

### Business logic
- `POST /admin/curators`: validasi Zod (`name` wajib, `role` default `"Kurator Utama"` jika kosong, `description` wajib max 2000 karakter). **Tidak perlu sanitasi `sanitize-html`** — `description` adalah plain text (textarea biasa di frontend, bukan rich text editor), cukup trim & escape saat render di frontend, bukan tanggung jawab backend untuk strip HTML tag di sini (tapi tetap gunakan validasi Zod string biasa, jangan simpan HTML).
- `POST /admin/curators/:id/photo`: proses sama seperti `POST /admin/settings/branding/logo` (`05-backend-prd.md` §13) — Sharp resize max 512×512, convert WebP, compress, upload ke folder R2 `curators/{uuid}.webp`. **Hapus foto lama dari R2 dulu** sebelum simpan URL baru (no orphan file, `00` §28).
- `DELETE /admin/curators/:id`: jika `photoUrl` terisi, hapus file dari R2 terlebih dulu, baru hapus row (pola sama seperti `car_images`, `05` §9). Jika gagal hapus di R2, jangan lanjut hapus row — return `500`, biar admin bisa retry (sama seperti pola delete `cars`).
- Response format & error handling ikuti standar `00` §11. Error `404` pakai kode baru `CURATOR_NOT_FOUND`.
- Rate limit: masuk kategori umum (60 req/menit/IP).

### Response contract
Lihat `07-frontend-reconciliation-addendum.md` Section 5 untuk contoh JSON request/response lengkap — ikuti persis field name-nya (`photoUrl`, `createdAt`, `updatedAt` — camelCase seperti endpoint lain).

---

## 3. Modul Baru: `tracking/`

Tambahkan folder `src/modules/tracking/`.

### Endpoint

| Method | Endpoint | Auth | Deskripsi |
| --- | --- | --- | --- |
| POST | `/tracking/visit` | Public | Catat 1 kunjungan dari link referral |
| POST | `/tracking/click` | Public | Catat 1 klik "salin tautan" |
| GET | `/admin/insights/system` | 🔒 | Data agregat untuk dashboard Insights |

### Business logic
- `POST /tracking/visit` & `POST /tracking/click`: body `{ carId?: string, source: string }`. `source` wajib (min 1 char, lowercase-kan di backend sebelum simpan, jangan percaya frontend sudah lowercase). Jika `carId` dikirim, lookup `car.title` saat ini dan simpan sebagai snapshot ke kolom `carTitle` (jika mobil tidak ketemu, tetap simpan log dengan `carId: null`, jangan gagalkan request). Insert 1 row `TrackingLog` dengan `type: VISIT` atau `type: CLICK`. Response `201`, `data: null`.
- `GET /admin/insights/system`: agregasi dari tabel `tracking_logs`:
  - `totalVisits`, `totalClicks`, `totalLeads` = `COUNT()` per `type`.
  - `bySource`: `GROUP BY source, type`, pivot ke `{ source, visits, clicks, leads }`. **Selalu sertakan** 6 kanal standar (`whatsapp, instagram, tiktok, facebook, telegram, custom`) walau nilainya 0, lalu tambahkan kanal lain yang pernah tercatat diluar 6 itu (misal dari `utm_source` eksternal).
  - `byCar`: top 10 `carId` dengan `visits + clicks` terbanyak (`type IN (VISIT, CLICK)` saja, exclude `LEAD`), pakai `carTitle` snapshot (bukan join ke `cars.title` — supaya tetap valid walau mobil sudah dihapus/judul berubah).
  - `recentLogs`: 100 row terakhir `ORDER BY createdAt DESC`, format `{ id, type (lowercase: "visit"/"click"/"lead"), source, carId, carTitle, timestamp: createdAt }`.
  - Tidak perlu caching (traffic MVP kecil, sama prinsip `05-backend-prd.md` §14).
- Rate limit khusus: `/tracking/visit` dan `/tracking/click` dibatasi **30 request/menit/IP** (bukan limit umum 60/menit, karena dipanggil otomatis tiap pageview — perlu dibatasi lebih ketat dari endpoint biasa tapi lebih longgar dari `POST /leads`).
- Tidak ada error code baru untuk modul ini — `carId` yang invalid tidak menyebabkan error, log tetap tersimpan.

---

## 4. Perubahan Kontrak: `POST /leads` menerima `landingSource`

**Ini WAJIB, karena tanpa ini fitur Insights tidak akan pernah mencatat konversi lead sama sekali** (root cause dijelaskan di `07-frontend-reconciliation-addendum.md` Section 7).

### Perubahan request `POST /leads`
Tambahkan field **opsional**:
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
`landingSource` **boleh kosong/tidak dikirim** (tidak semua lead datang dari link referral kampanye).

### Business logic tambahan di `leads.service.ts`
1. Simpan lead seperti biasa (logic lama di `05-backend-prd.md` §11 **tidak berubah sama sekali** — `landingSource` **bukan** kolom baru di tabel `leads`, jangan tambahkan ke schema `leads`).
2. **Setelah** lead berhasil disimpan, **jika** `landingSource` dikirim di request → insert 1 row baru ke `tracking_logs`: `type: LEAD`, `source: landingSource.toLowerCase()`, `carId: <carId dari lead, jika ada>`, `carTitle: <snapshot judul mobil>`, `leadId: <id lead yang baru dibuat>`.
3. Response `POST /leads` **tidak berubah** — tetap `{ success, message, data: { id, status } }` seperti kontrak lama.
4. Kegagalan insert `tracking_logs` (misal DB error sesaat) **tidak boleh** membuat `POST /leads` gagal — lakukan seperti notifikasi Telegram (fire-and-forget dengan try-catch yang tidak melempar ke caller, `05` §11).

### Update dokumen `04-api-contract.md` §11 & §17
- Tambahkan `landingSource` (string, opsional, nullable) ke daftar field request `POST /leads` dan ke tabel Validation Rules Summary §17.

---

## 5. Error Code Reference — Tambahan ke `04-api-contract.md` §6

| Code | HTTP Status | Keterangan |
| --- | --- | --- |
| `CURATOR_NOT_FOUND` | 404 | Kurator tidak ditemukan |

---

## 6. Rate Limiting — Tambahan ke `04-api-contract.md` §16

| Endpoint Group | Limit |
| --- | --- |
| `POST /tracking/visit`, `POST /tracking/click` | 30 request / menit / IP |

---

## 7. Update `src/modules/` structure (rekap untuk `05-backend-prd.md` §4)

```
src/
  modules/
    ...(semua module lama tetap sama)...
    curators/
      curators.controller.ts
      curators.service.ts
      curators.schema.ts
      curators.routes.ts
    tracking/
      tracking.controller.ts
      tracking.service.ts
      tracking.schema.ts
      tracking.routes.ts
```

---

## 8. Definition of Done — Tambahan untuk Modul Baru

- [ ] Endpoint `curators` (public + admin) berjalan sesuai kontrak Section 2.
- [ ] Upload foto kurator berhasil end-to-end (WebP, ≤500KB target, masuk R2 folder `curators/`).
- [ ] Delete kurator menghapus foto R2 lebih dulu (tidak ada orphan file).
- [ ] Endpoint `tracking/visit` dan `tracking/click` mencatat log dengan benar, termasuk snapshot `carTitle`.
- [ ] `GET /admin/insights/system` mengembalikan agregasi yang benar (`bySource` selalu ada 6 kanal standar + kanal lain yang tercatat, `byCar` top 10, `recentLogs` max 100).
- [ ] `POST /leads` menerima `landingSource` opsional dan mencatat `TrackingLog type: LEAD` yang terhubung ke lead yang baru dibuat, tanpa mengubah kontrak response yang sudah ada.
- [ ] Rate limit `/tracking/*` diset 30/menit/IP, terpisah dari limit umum.
- [ ] `prisma migrate dev` berhasil dengan schema baru (`curators`, `tracking_logs`, enum `TrackingLogType`) tanpa merusak data/migration lama.

---

## 9. Yang TIDAK Berubah (Konfirmasi)

Supaya tidak ada asumsi salah saat kamu generate ulang kode:
- Struktur response standar (`success/message/data/meta`), format error, dan HTTP status code **tidak berubah** (`00` §11–12).
- Semua module & endpoint lama (`auth`, `users`, `cars`, `car-images`, `leads`, `articles`, `settings`, `branding`, `dashboard`) **tetap seperti di `05-backend-prd.md`/`04-api-contract.md` versi asli**, tidak ada breaking change di sana — hanya modul `leads` yang dapat **tambahan opsional** (Section 4 di atas), bukan diubah.
- Auth tetap JWT + HttpOnly Cookie, role tetap cuma `OWNER`/`ADMIN`, tidak ada role baru untuk "Curator" (itu cuma data konten, bukan akun login) — lihat `07-frontend-reconciliation-addendum.md` Section 5.
- Stack backend (Node 22, Express 5, Prisma 6, PostgreSQL 16, dst.) **tidak berubah** — perubahan stack frontend (Vite vs Next.js) tidak berdampak ke backend sama sekali.

---

**End of Document**