# 10-instruksi-sinkronisasi-lanjutan.md

> Pendamping `09-perbaikan-dan-fitur-tambahan.md`. Dokumen ini berisi instruksi **diff-style**
> untuk file yang **sudah ada** di repo kamu (bukan file baru). File baru (module
> `content-sections`, `media`, `audit-logs`, `backup`) sudah saya kirim lengkap sebagai file
> terpisah — tinggal copy ke `backend/src/modules/`.
>
> Kenapa diff, bukan full-file rewrite? Supaya saya tidak berisiko menimpa bagian kode yang
> belum saya lihat utuh. Ikuti tiap langkah di bawah secara berurutan.

---

## 1. Prisma Schema — Tambahan ke `backend/prisma/schema.prisma`

### 1.1 Enum baru
Tambahkan di bagian enum (dekat `enum TrackingLogType`):

```prisma
enum MediaSourceType {
  UPLOAD
  EXTERNAL_LINK
  AI_GENERATED
}
```

### 1.2 Model baru
Tambahkan di mana saja (disarankan dekat `Setting`/`TrackingLog`):

```prisma
model ContentSection {
  id         String   @id @default(uuid())
  page       String   @db.VarChar(50)
  sectionKey String   @map("section_key") @db.VarChar(50)
  content    Json
  updatedBy  String   @map("updated_by")
  updater    User     @relation(fields: [updatedBy], references: [id])
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@unique([page, sectionKey])
  @@index([page])
  @@map("content_sections")
}

model MediaAsset {
  id         String          @id @default(uuid())
  url        String          @db.VarChar(500)
  sourceType MediaSourceType @map("source_type")
  fileHash   String?         @map("file_hash") @db.VarChar(64)
  sizeBytes  Int?            @map("size_bytes")
  altText    String?         @map("alt_text") @db.VarChar(255)
  uploadedBy String          @map("uploaded_by")
  uploader   User            @relation(fields: [uploadedBy], references: [id])
  createdAt  DateTime        @default(now()) @map("created_at")

  @@index([sourceType])
  @@map("media_assets")
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action    String   @db.VarChar(50)
  entity    String   @db.VarChar(50)
  entityId  String?  @map("entity_id")
  metadata  Json?
  ipAddress String?  @map("ip_address") @db.VarChar(45)
  createdAt DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
  @@map("audit_logs")
}
```

### 1.3 Ubah model `User` — tambah 4 baris

```prisma
model User {
  id           String    @id @default(uuid())
  name         String    @db.VarChar(100)
  email        String    @unique @db.VarChar(150)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  role         UserRole  @default(ADMIN)
  tokenVersion Int       @default(0) @map("token_version")   // 🆕 dipakai backup.service.ts untuk invalidate sesi pasca-restore
  cars         Car[]
  articles     Article[]
  contentSections ContentSection[]                            // 🆕
  mediaAssets     MediaAsset[]                                 // 🆕
  auditLogs       AuditLog[]                                   // 🆕
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  @@map("users")
}
```

### 1.4 Ubah model `Car` — tambah relasi kurator inspeksi (Fitur Baru #1, `09` Section 7.2)

```prisma
model Car {
  // ...field lain tetap sama, JANGAN dihapus...
  inspectedBy   String?   @map("inspected_by")
  curator       Curator?  @relation(fields: [inspectedBy], references: [id], onDelete: SetNull)
}
```

### 1.5 Ubah model `Curator` — tambah relasi balik

```prisma
model Curator {
  // ...field lain tetap sama...
  inspectedCars Car[]
}
```

### 1.6 Jalankan migrasi (di environment lokal kamu, bukan sandbox Claude)

```bash
npx prisma migrate dev --name addendum_09_content_media_audit_backup
npx prisma generate
```

---

## 2. `backend/src/app.ts` — Daftarkan 3 router baru

Tambahkan import di bagian atas:
```ts
import contentSectionsRoutes from "./modules/content-sections/content-sections.routes";
import mediaRoutes from "./modules/media/media.routes";
import auditLogsRoutes from "./modules/audit-logs/audit-logs.routes";
import backupRoutes from "./modules/backup/backup.routes";
```

Tambahkan setelah baris `app.use(API_PREFIX, trackingRoutes);`:
```ts
app.use(API_PREFIX, contentSectionsRoutes);
app.use(API_PREFIX, mediaRoutes);
app.use(API_PREFIX, auditLogsRoutes);
app.use(API_PREFIX, backupRoutes);
```

---

## 3. `backend/src/modules/cars/cars.service.ts` — 2 perubahan

### 3.1 `listAdminCars` — tambah pagination (Perbaikan Tambahan, `09` Section 6)

**Ganti fungsi ini:**
```ts
export async function listAdminCars() {
  const items = await prisma.car.findMany({
    where: { deletedAt: null },
    include: { images: true },
    orderBy: { createdAt: "desc" },
  });
  return items.map(serializeCar);
}
```

**Menjadi:**
```ts
export async function listAdminCars(query: { page: number; limit: number; status?: string; search?: string }) {
  const { page, limit, status, search } = query;
  const where: any = { deletedAt: null };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { images: true, curator: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.car.count({ where }),
  ]);

  return {
    data: items.map(serializeCar),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
```

> Sesuaikan `cars.controller.ts` fungsi `getAdminCars` supaya membaca `req.validatedQuery` (page/limit/status/search) dan mengembalikan `success(result.data, "Success", result.meta)` — pola sama seperti `getCars` (public) yang sudah ada.
>
> Tambahkan juga schema query baru `listAdminCarsQuerySchema` di `cars.schema.ts` (mirror dari `listCarsQuerySchema` yang sudah ada, tanpa filter harga/lokasi kalau tidak diperlukan admin), lalu daftarkan `validateQuery(listAdminCarsQuerySchema)` di route `GET /admin/cars` pada `cars.routes.ts`.

### 3.2 `createCar` & `updateCar` — terima `inspectedById` (Fitur Baru #1, `09` Section 7.2)

Di `cars.schema.ts`, tambahkan field opsional ke `createCarSchema` dan `updateCarSchema`:
```ts
inspectedById: z.string().uuid().optional(),
```

Di `cars.service.ts`, pada `createCar` dan `updateCar`, tambahkan validasi + assignment:
```ts
if (input.inspectedById) {
  const curator = await prisma.curator.findUnique({ where: { id: input.inspectedById } });
  if (!curator) throw new AppError(404, "CURATOR_NOT_FOUND", "Kurator tidak ditemukan");
}
```
lalu masukkan `inspectedBy: input.inspectedById` ke object `data` pada `prisma.car.create(...)` / `prisma.car.update(...)`.

Tambahkan juga `curator: true` ke `include` pada `getPublicCarBySlug` dan `getAdminCarById`, supaya response `GET /cars/:slug` dan `GET /admin/cars/:id` menyertakan object `curator` (name, role, photoUrl) — sesuai kontrak baru di `09` Section 7.2.

### Error Code Baru — Tambahan ke `04-api-contract.md` §6 dan `error-handler.ts` (otomatis ter-cover karena `AppError` generik)
| Code | HTTP Status | Keterangan |
| --- | --- | --- |
| `MEDIA_NOT_FOUND` | 404 | Media asset tidak ditemukan |
| `BACKUP_OPERATION_FAILED` | 500 | `pg_dump`/`pg_restore` gagal |
| `INVALID_SECTION_KEY` | 422 | `sectionKey`/`page` tidak dikenal |

---

## 4. `backend/package.json` — Dependency baru

```bash
npm install @aws-sdk/s3-request-presigner
```
(dipakai `backup.service.ts` untuk generate signed download URL — package lain yang dipakai, `@aws-sdk/client-s3`, sudah ada dari `r2-client.ts`.)

---

## 5. `backend/Dockerfile` — Tambah `postgresql-client`

Tambahkan baris ini sebelum `npm install` di Dockerfile (dibutuhkan `pg_dump`/`pg_restore` untuk fitur Backup & Restore):
```dockerfile
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*
```

---

## 6. Frontend Bug Fix #1 — Upload Foto Kurator (`frontend/src/features/admin/CuratorsList.tsx`)

**Hapus** fungsi `handlePhotoUpload` yang sekarang (convert ke base64):
```ts
const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = reader.result as string;
    setFormData(prev => ({ ...prev, photoUrl: base64 }));
  };
  reader.readAsDataURL(file);
};
```

**Ganti dengan:**
```ts
const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);

const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Local preview only - the actual upload happens via curatorsService.uploadPhoto()
  setFormData(prev => ({ ...prev, photoUrl: URL.createObjectURL(file) }));

  if (editingCurator) {
    // Existing curator: upload immediately, no need to wait for form submit.
    curatorsService.uploadPhoto(editingCurator.id, file)
      .then(res => {
        if (res.success) setFormData(prev => ({ ...prev, photoUrl: res.data.photoUrl || '' }));
      })
      .catch(err => {
        console.error('Error uploading curator photo:', err);
        alert('Gagal mengunggah foto kurator.');
      });
  } else {
    // New curator: no id yet, defer upload until after create succeeds.
    setPendingPhotoFile(file);
  }
};
```

**Di `handleSubmit`**, hapus fallback URL Unsplash hardcode dari body `createCurator`/`updateCurator`:
```ts
// SEBELUM:
photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500',
// SESUDAH: hapus baris photoUrl sepenuhnya dari body create/update — backend sudah handle photoUrl: null by design.
```

Pada blok `Create` di `handleSubmit`, setelah `res.success` sukses membuat curator baru, tambahkan upload foto yang tertunda:
```ts
if (res.success) {
  if (pendingPhotoFile) {
    await curatorsService.uploadPhoto(res.data.id, pendingPhotoFile).catch(err =>
      console.error('Error uploading photo for new curator:', err)
    );
    setPendingPhotoFile(null);
  }
  alert('Kurator Utama baru berhasil ditambahkan!');
  setIsModalOpen(false);
  fetchCurators();
}
```

---

## 7. Frontend Bug Fix #3 — Hilangkan Mode Sandbox/Mock

### 7.1 `frontend/src/services/api-client.ts`

**Hapus** fungsi `getApiMode` dan `setApiMode` sepenuhnya. `apiClient` langsung dipakai tanpa branch mock.

### 7.2 Pola perubahan di **semua** file `frontend/src/services/*.service.ts`

Terapkan pola yang sama ke `auth.service.ts`, `cars.service.ts`, `curators.service.ts`, `settings.service.ts`, `tracking.service.ts`, dan service lain yang masih punya branch mock:

**Hapus** import:
```ts
import { getApiMode } from './api-client';
import { mockDb } from './mock-db';
```

**Hapus** setiap blok:
```ts
if (getApiMode() === 'mock') {
  // ...seluruh isi blok ini...
}
```
sehingga tersisa hanya jalur `apiClient` asli di tiap fungsi.

**Contoh sebelum/sesudah untuk 1 fungsi** (`curatorsService.getCurators`, pola sama untuk fungsi lain):
```ts
// SESUDAH:
async getCurators(filters?: { search?: string }) {
  const response = await apiClient.get('/curators', { params: filters });
  return response.data;
},
```

### 7.3 Hapus file `frontend/src/services/mock-db.ts` sepenuhnya (tidak dipakai lagi di manapun).

### 7.4 `frontend/src/features/admin/Login.tsx`

**Hapus** panel "Konfigurasi API" (tombol gear kanan atas + modal `showConfig`) dan blok:
```tsx
{getApiMode() === 'mock' && (
  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed space-y-1">
    <p className="font-semibold text-slate-300">💡 Akses Sandbox Demo:</p>
    <p>...</p>
  </div>
)}
```
Beserta state `showConfig`, `apiMode`, `apiUrl`, dan fungsi `handleSaveConfig` yang terkait — semuanya sudah tidak relevan tanpa mode mock.

---

## 8. Frontend — Wiring Baru untuk Fitur (Ringkas, Detail Menyusul)

Bagian ini di luar scope bug fix, disiapkan untuk fase coding frontend berikutnya:
- Form tambah/edit mobil: tambah dropdown "Kurator Pemeriksa" (fetch `GET /curators`), kirim `inspectedById` di payload create/update.
- Detail mobil public: tampilkan badge kurator jika `car.curator` tidak null.
- Halaman baru `/admin/content` (CMS), `/admin/media` (Media Library), `/admin/backup`, `/admin/audit-logs`.
- Section daftar kurator di halaman About/`/kurator` public — **masih menunggu konfirmasi kamu** soal halaman mana (lihat `09` Section 11 poin #2).

---

## 9. Postman Collection

Tambahkan 4 folder baru: **Content Sections**, **Media Library**, **Backup & Restore**, **Audit Logs** — masing-masing endpoint sesuai tabel di `09-perbaikan-dan-fitur-tambahan.md`. Saya bisa generate file collection-nya sekali jalan kalau kamu mau, tinggal bilang.

---

**End of Document**
