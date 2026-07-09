# SuhuMobil - Postman Collection

Isi folder ini:

- `SuhuMobil.postman_collection.json` — koleksi lengkap (45 request, 11 folder) sesuai
  `04-api-contract.md` + delta `07-frontend-reconciliation-addendum.md` /
  `08-instruksi-sinkronisasi-backend.md` (modul Curators & Tracking, field `landingSource` di Leads)
- `SuhuMobil - Local.postman_environment.json` — environment untuk `http://localhost:4000/api/v1`
- `SuhuMobil - Production.postman_environment.json` — environment untuk `https://api.suhumobil.com/api/v1`

## Cara Import

1. Buka Postman → **Import** → pilih ketiga file di atas (drag & drop sekaligus juga bisa).
2. Di kanan atas Postman, pilih environment **"SuhuMobil - Local"** (atau Production).
3. Selesai.

## Cara Pakai (Alur Testing)

1. **Auth > Login (Admin/Owner)** — jalankan dulu. Body sudah terisi `{{adminEmail}}` /
   `{{adminPassword}}` dari environment (default seed: `admin@suhumobil.com` / `admin12345`).
   Cookie JWT (`HttpOnly`) otomatis disimpan Postman untuk domain `{{baseUrl}}`, jadi seluruh
   request 🔒 admin setelahnya otomatis terautentikasi — tidak perlu copy-paste token manual.
2. **Cars (Admin) > Create Car** — otomatis menyimpan `carId` dan `carSlug` ke environment
   (lihat tab **Tests** pada request tersebut) untuk dipakai request lain di folder
   `Car Images`, `Cars (Public)`, dan `Leads`.
3. **Car Images (Admin) > Upload Car Image** — di tab **Body > form-data**, klik field `file`
   lalu pilih file gambar dari komputer kamu (Postman tidak bisa auto-isi file biner).
   Upload minimal 5x sebelum mencoba `Update Car Status` ke `PUBLISHED` (aturan minimum foto).
4. **Articles (Admin) > Create Article** — sama seperti Cars, otomatis menyimpan `articleId` /
   `articleSlug`. Upload cover dulu sebelum `Update Article Status` ke `PUBLISHED`.
5. **Leads > Create Lead - WhatsApp CTA** — otomatis menyimpan `leadId`, dipakai di folder
   admin leads (`Get Lead Detail`, `Update Lead Status/Notes`). Body sudah menyertakan
   `landingSource: "instagram"` contoh — backend otomatis mencatat `TrackingLog(type: LEAD)`
   terhubung ke lead ini.
6. **Curators > Create Curator** — otomatis menyimpan `curatorId`, dipakai di
   `Upload Curator Photo`, `Update Curator`, `Delete Curator`.
7. **Tracking & Insights > Track Visit / Track Click** — pakai `{{carId}}` dari Cars (opsional,
   boleh dikosongkan/`null` kalau tidak terkait mobil tertentu). Cek hasilnya di
   `Get System Insights (Admin)`.

## Environment Variables

| Variable | Diisi Otomatis? | Keterangan |
| --- | --- | --- |
| `baseUrl` | Manual (sudah diset) | Base URL API, beda per environment |
| `adminEmail`, `adminPassword` | Manual (sudah diisi default seed) | Kredensial login |
| `carId`, `carSlug` | ✅ dari response Create Car | Dipakai request lain |
| `carImageId` | ✅ dari response Upload Car Image | Dipakai Set Cover/Reorder/Delete |
| `curatorId` | ✅ dari response Create Curator | Dipakai Update/Upload Photo/Delete |
| `leadId` | ✅ dari response Create Lead (WhatsApp CTA) | Dipakai admin leads |
| `articleId`, `articleSlug` | ✅ dari response Create Article | Dipakai request lain |
| `userId`, `userRole` | ✅ dari response Login | Info user yang sedang login |

## Catatan

- Semua request mengikuti format response standar (`success`, `message`, `data`, `meta`)
  dan error code sesuai `04-api-contract.md` section 6.
- Endpoint bertanda 🔒 di deskripsi request butuh login (cookie JWT) — jalankan **Auth > Login**
  terlebih dahulu di environment yang sama.
- Rate limit: `POST /leads` dan `POST /auth/login` dibatasi 5 request/menit/IP — kalau testing
  berulang cepat, kamu bisa kena `429 RATE_LIMIT_EXCEEDED`, tunggu sebentar lalu ulangi.
- `POST /tracking/visit` dan `POST /tracking/click` dibatasi khusus **30 request/menit/IP**
  (lebih longgar dari leads, lebih ketat dari limit umum 60/menit) — sesuai
  `07-frontend-reconciliation-addendum.md` Section 6.
- Modul **Curators** adalah entitas konten publik (profil tim), **bukan** role login —
  jangan disamakan dengan `userRole` (`OWNER`/`ADMIN`) di environment.
