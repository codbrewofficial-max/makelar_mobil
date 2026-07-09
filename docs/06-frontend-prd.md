# 06-frontend-prd.md

> **Project:** SuhuMobil (Working Title)
>
> **Version:** 1.1.0
>
> **Status:** Draft — Pending Review
>
> **Document Type:** Frontend Product Requirements Document
>
> **Target:** AI Assisted Development (Google AI Studio)
>
> **Referensi wajib:** `00-development-rules.md`, `01-business-overview.md`, `02-project-blueprint.md`, `03-database-design.md`, `04-api-contract.md`

---

# 1. Tujuan Dokumen

Dokumen ini adalah spesifikasi lengkap untuk membangun **frontend** SuhuMobil. Backend sudah dispesifikasikan penuh di `05-backend-prd.md` dan `04-api-contract.md` — frontend **hanya mengonsumsi** endpoint yang sudah ada di sana, tidak boleh berasumsi struktur data lain.

Urutan baca wajib sebelum menulis kode:
1. `00-development-rules.md` — aturan UI, responsive, SEO, performance
2. `04-api-contract.md` — kontrak data yang dikonsumsi
3. `01-business-overview.md` — user flow & persona
4. Dokumen ini — spesifikasi implementasi halaman & komponen

---

# 2. Ringkasan Frontend

Frontend adalah aplikasi Next.js 15 (App Router) yang melayani dua sisi:

- **Public Site** — katalog mobil, detail mobil, landing page, form lead, popup CTA WhatsApp.
- **Admin Dashboard** — CRUD mobil, kelola lead, pengaturan website, semua di balik login.

Frontend berkomunikasi ke backend murni via REST API (`04-api-contract.md`), tidak ada server-side database access langsung dari Next.js.

---

# 3. Tech Stack Frontend (Recap)

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 15.x (App Router) |
| UI Library | React 19.x |
| Bahasa | TypeScript 5.x (Strict Mode) |
| Styling | Tailwind CSS 4.x |
| Server State | TanStack Query |
| Global State | Zustand |
| Form | React Hook Form + Zod |
| HTTP Client | Axios |
| Icon | Lucide React |
| Rich Text Editor | TipTap |

---

# 4. Halaman & Routing (App Router)

```
app/
  (public)/
    page.tsx                    → Landing Page          [ / ]
    cars/
      page.tsx                  → Catalog                [ /cars ]
      [slug]/
        page.tsx                → Detail Mobil           [ /cars/:slug ]
    articles/
      page.tsx                  → List Artikel/Blog      [ /articles ]
      [slug]/
        page.tsx                → Detail Artikel         [ /articles/:slug ]
    about/
      page.tsx                  → Tentang Kami           [ /about ]
    contact/
      page.tsx                  → Kontak                 [ /contact ]
  admin/
    login/
      page.tsx                  → Admin Login             [ /admin/login ]
    dashboard/
      page.tsx                  → Dashboard Stats         [ /admin/dashboard ]
    cars/
      page.tsx                  → List Mobil (Admin)      [ /admin/cars ]
      new/
        page.tsx                → Tambah Mobil            [ /admin/cars/new ]
      [id]/
        edit/
          page.tsx              → Edit Mobil              [ /admin/cars/:id/edit ]
    leads/
      page.tsx                  → List Lead                [ /admin/leads ]
    articles/
      page.tsx                  → List Artikel (Admin)      [ /admin/articles ]
      new/
        page.tsx                → Tulis Artikel Baru        [ /admin/articles/new ]
      [id]/
        edit/
          page.tsx              → Edit Artikel              [ /admin/articles/:id/edit ]
    business-profile/
      page.tsx                  → Business Profile          [ /admin/business-profile ]
    settings/
      page.tsx                  → Pengaturan Website        [ /admin/settings ]
  layout.tsx
```

Semua route di bawah `admin/` (kecuali `admin/login`) **wajib** dilindungi — redirect ke `/admin/login` jika belum login (lihat section 12, Auth Flow Frontend).

---

# 5. Halaman Public — Spesifikasi Detail

## 5.1 Landing Page (`/`)

| Bagian | Konten | Sumber Data |
| --- | --- | --- |
| Hero | Headline + subheadline value proposition, CTA "Lihat Katalog" | Statis |
| Trust Section | 3 poin: Kurasi Mutlak, Transparansi, Konsultasi Personal | Statis |
| Featured Cars | 4–6 mobil terbaru berstatus `PUBLISHED` | `GET /cars?limit=6` |
| Tentang Kurator | Ringkasan pengalaman 25 tahun (foto + narasi singkat) | Statis |
| CTA Footer | "Cari Mobil Impian" → link ke form (bisa di halaman sendiri atau modal) | - |

States: Loading (skeleton card ×6), Empty (jika 0 mobil published, tampilkan pesan "Segera hadir, mobil pilihan akan tampil di sini"), Error (retry button).

## 5.2 Catalog (`/cars`)

- Grid card responsif (1 kolom mobile, 2 tablet, 3–4 desktop).
- Filter sidebar/drawer: `brand`, `location`, `minPrice`–`maxPrice` (range slider atau 2 input), `transmission`, `search` (debounced 400ms).
- Pagination (atau infinite scroll — pilih salah satu, infinite scroll lebih ramah mobile).
- Sumber data: `GET /cars` dengan query params sesuai filter aktif (lihat `04-api-contract.md` section 8).
- State kosong: "Tidak ada mobil yang sesuai filter" + tombol reset filter.
- Setiap **Car Card**: gambar cover (dengan watermark overlay, lihat section 7.1), title, harga, spek ringkas, **tombol WA cepat** (icon-only atau kecil, buka Popup Lead Form dengan `carId` terisi — sama seperti di Detail) di pojok card, dan link ke Detail Mobil.

## 5.3 Detail Mobil (`/cars/:slug`)

| Bagian | Konten |
| --- | --- |
| Gallery | Carousel/lightbox dari `images[]`, urutan sesuai `sortOrder`, cover di depan, dengan watermark overlay subtle di setiap gambar |
| Info Utama | Title, harga (format Rupiah), tahun, transmisi, jarak tempuh, lokasi |
| Laporan Inspeksi | Render `inspectionReport` per kategori (mesin, transmisi, bodi, interior, kaki-kaki, kelistrikan) dengan ikon status (✅ good, ⚠️ minor, ❌ bad) + catatan |
| Deskripsi | **Rich text** — render `description` (HTML sudah disanitasi dari backend) via komponen `RichTextRenderer` (lihat section 8), bukan plain text lagi |
| CTA Utama | Tombol "Tanya via WhatsApp" → membuka **Popup Lead Form** (lihat section 7) |

Sumber data: `GET /cars/:slug`. Jika `404` → tampilkan halaman "Mobil tidak ditemukan / sudah terjual" dengan link kembali ke katalog.

SEO wajib per halaman ini (lihat section 10): meta title/description dinamis dari data mobil, Open Graph image dari cover, JSON-LD `Vehicle` schema.

## 5.3a List Artikel/Blog (`/articles`)

- Grid card (mirip Medium): cover image, title, excerpt, tags (badge kecil), reading time (`"4 menit baca"`), tanggal publish.
- Filter by tag (klik tag → filter list).
- Search title/excerpt.
- Pagination.
- Sumber data: `GET /articles` (lihat `04-api-contract.md` section 14).
- State kosong: "Belum ada artikel, nantikan tips seputar mobil dari kami."

## 5.3b Detail Artikel (`/articles/:slug`)

- Layout ala Medium: cover image full-width di atas, title besar, meta info (reading time, tanggal publish), lalu **rich text content** (render via `RichTextRenderer`), tags di bawah artikel.
- Sumber data: `GET /articles/:slug`. Jika `404` → halaman "Artikel tidak ditemukan".
- SEO: meta title/description dari `seoTitle`/`seoDescription` (fallback ke `title`/`excerpt`), Open Graph image dari `coverImage`, JSON-LD `BlogPosting` schema.
- Tidak ada fitur komentar atau likes/claps (lihat `05-backend-prd.md` section 21, Out of Scope).

## 5.4 About (`/about`)

Konten dari `business_profile` (via `/settings/public`): logo, nama, tagline, dan `description` (rich text, render via `RichTextRenderer`). Cerita partner (25 tahun pengalaman teknisi & sales) ditulis admin lewat form Business Profile (section 6.7), bukan hardcode di kode frontend.

## 5.5 Contact (`/contact`)

Form kontak (`source: CONTACT_PAGE`) — field: `name`, `phone`, pesan bebas (map ke `carInterest` atau field bebas, sepakati saat implementasi). Submit ke `POST /leads`.

Tampilkan juga info kontak langsung: nomor WhatsApp (dari `/settings/public`), link sosial media.

---

# 6. Halaman Admin — Spesifikasi Detail

## 6.1 Login (`/admin/login`)

Form email + password → `POST /auth/login`. Sukses → redirect `/admin/dashboard`. Gagal → tampilkan pesan error dari `errors.credentials`.

## 6.2 Dashboard (`/admin/dashboard`)

Card ringkasan dari `GET /admin/dashboard/stats`: Total Mobil, Mobil Published, Mobil Terjual, Total Lead, Lead Baru, Total Artikel, Artikel Published, Storage Used/Quota (progress bar, warning kalau ≥90%).

## 6.3 List Mobil Admin (`/admin/cars`)

Tabel dengan kolom: thumbnail (cover), title, brand, harga, status (badge berwarna), tanggal dibuat, aksi (Edit, Ubah Status, Hapus).

- Filter status, search.
- Tombol "Tambah Mobil" → `/admin/cars/new`.
- Aksi "Ubah Status" → dropdown pilihan sesuai transisi valid (lihat `04-api-contract.md` section 12) — **jangan tampilkan opsi status yang transisinya tidak valid** dari status saat ini.
- Aksi "Hapus" → modal konfirmasi (karena ini destructive action yang juga menghapus gambar di R2).

## 6.4 Tambah/Edit Mobil (`/admin/cars/new`, `/admin/cars/:id/edit`)

Form multi-section (bisa 1 halaman panjang atau tab):
1. **Info Dasar** — title, brand, model, year, price, mileage, transmission, fuelType, color, location.
2. **Deskripsi** — **Rich Text Editor** (komponen `RichTextEditor` berbasis TipTap, lihat section 8), bukan textarea polos lagi.
3. **Laporan Inspeksi** — form terstruktur per kategori (mesin, transmisi, bodi, interior, kaki-kaki, kelistrikan): dropdown status (good/minor/bad) + input catatan per kategori, plus 1 field `catatanKhusus` umum.
4. **Galeri Foto** — upload multi-file (drag & drop), preview grid, indikator "5/20 foto minimum" saat draft, tombol set cover, reorder (drag), hapus per foto. Upload memanggil `POST /admin/cars/:id/images` (multipart) satu per satu atau berurutan (bukan `Promise.all` paralel — untuk hindari race condition di `sort_order` dan cek kuota).

> Catatan: mobil baru harus disimpan dulu (`POST /admin/cars`) sebelum bisa upload foto (karena endpoint upload butuh `:id`). Jadi alur "Tambah Mobil" adalah: isi form dasar → submit → dapat `id` → lanjut ke tab galeri foto → baru bisa publish setelah foto ≥5.

Validasi form pakai Zod schema yang **field-nya sama persis** dengan request body di `04-api-contract.md` section 9.

## 6.5 List Lead (`/admin/leads`)

Tabel: nama, telepon, email (jika ada), subjek/mobil terkait, sumber (badge: `WHATSAPP_CTA`, `WHATSAPP_FAB`, `DREAM_CAR_FORM`, `CONTACT_PAGE`), status (badge), tanggal masuk.

- Filter: status, source, search (nama/telepon).
- Klik baris → panel detail (side drawer atau halaman terpisah) menampilkan semua data termasuk `message`, `notes`, dengan form update `status` (dropdown bebas, lihat section Lead Status di `04-api-contract.md` section 12) dan `notes` (textarea).
- **Tidak ada tombol hapus** — sesuai business rule, lead tidak bisa dihapus dari UI sama sekali.

## 6.6 List & Editor Artikel (`/admin/articles`, `/admin/articles/new`, `/admin/articles/:id/edit`)

**List (`/admin/articles`):** Tabel dengan kolom thumbnail (cover), title, tags, status (badge draft/published), tanggal, aksi (Edit, Ubah Status, Hapus). Filter status, search.

**Editor (`new`/`edit`):** Layout ala Medium editor:
1. **Title** — input besar di atas.
2. **Cover Image** — upload single image (drag & drop atau klik), preview besar. Panggil `POST /admin/articles/:id/cover` (butuh artikel disimpan dulu, sama pola seperti galeri mobil).
3. **Excerpt** — textarea pendek (max 300 karakter, tampilkan counter).
4. **Content** — **Rich Text Editor** (TipTap) dengan toolbar: Heading, Bold, Italic, List, Blockquote, Link, Image embed, Code block (lihat `00-development-rules.md` section 34).
5. **Tags** — input tag (chip/pill), max 5 tag.
6. **SEO** — collapsible section: `seoTitle`, `seoDescription` (optional, tampilkan preview mirip hasil Google Search).
7. **Aksi** — tombol "Simpan Draft" dan "Publish" (disabled jika cover belum diupload, dengan tooltip penjelasan).

> Sama seperti mobil: artikel baru harus disimpan dulu (`POST /admin/articles`, dapat `id`) sebelum bisa upload cover.

Reading time ditampilkan **read-only** (dihitung backend otomatis, lihat `05-backend-prd.md` section 12) — bukan input manual.

## 6.7 Business Profile (`/admin/business-profile`)

Form: upload logo (single image, preview bulat/kotak), `name`, `tagline`, `description` (**Rich Text Editor**), `address`, `phone`. Logo upload panggil `POST /admin/settings/branding/logo`. Field teks lain submit ke `PUT /admin/settings` dengan key `businessProfile`.

## 6.8 Settings (`/admin/settings`)

Form: `siteTitle`, `whatsappNumber`, `socialLinks` (instagram/tiktok/youtube), `watermark` (label teks + link URL), `gtmId`, `ga4Id`. Submit ke `PUT /admin/settings`.

> Business Profile (logo, nama, deskripsi) dipisah ke halaman sendiri (section 6.7) agar form Settings tidak terlalu panjang — pemisahan ini murni UX, datanya tetap sama-sama di tabel `settings`.

---

# 7. Komponen Khusus: Popup Lead Form (WhatsApp)

Ini komponen paling penting secara bisnis — dipakai di **3 tempat**: Car Card (katalog), Detail Mobil, dan Floating Action Button (site-wide). Ketiganya memakai komponen React yang **sama** (`WhatsappLeadPopup`), dibedakan lewat props `carId` (nullable) dan `source`.

## 7.1 Trigger

| Lokasi | `carId` | `source` |
| --- | --- | --- |
| Tombol WA di Car Card | id mobil terkait | `WHATSAPP_CTA` |
| Tombol WA di Detail Mobil | id mobil terkait | `WHATSAPP_CTA` |
| Floating Action Button (semua halaman) | `null` | `WHATSAPP_FAB` |

## 7.2 Field Form

| Field | Tipe Input | Wajib? |
| --- | --- | --- |
| Nama | Text | Ya |
| Email | Email | Tidak |
| No. WhatsApp | Text (angka) | Ya |
| Subjek | Select/Dropdown: "Tanya Detail Mobil" / "Nego Harga" / "Jadwal Survey & Test Drive" / "Lainnya" | Ya |
| Pesan | Textarea | Ya |

Jika dibuka dari FAB (tanpa konteks mobil), opsi subjek "Tanya Detail Mobil" tetap boleh muncul tapi labelnya bisa disesuaikan jadi lebih general (misal "Tanya-tanya" — opsional penyesuaian UI, value enum tetap sama `PRICE_INQUIRY`).

## 7.3 Alur Submit

1. Validasi client-side (React Hook Form + Zod) sesuai `04-api-contract.md` section 17.
2. Panggil `POST /leads` dengan `source` dan `carId` sesuai tabel 7.1 (tidak diinput manual oleh user, sudah ditentukan dari komponen pemanggil).
3. Setelah response (baik sukses maupun gagal — lihat catatan di `04-api-contract.md` section 8), redirect browser (`window.location.href` atau `window.open`) ke:
   ```
   https://wa.me/{whatsappNumber}?text={encodeURIComponent(pesanGabungan)}
   ```
   `pesanGabungan` contoh (jika ada mobil): `"Halo, saya {name}. {subjectLabel} untuk mobil {carTitle}. {message}"` — jika `carId: null` (dari FAB), hilangkan bagian "untuk mobil {carTitle}".
4. `whatsappNumber` diambil dari `GET /settings/public` (fetch sekali, cache via TanStack Query, tidak perlu fetch ulang tiap buka popup).
5. Jika `POST /leads` gagal, tetap lanjut redirect ke WhatsApp (sesuai catatan di `04-api-contract.md`), tapi tampilkan toast kecil: "Pesan tersimpan gagal, tapi kamu tetap bisa lanjut chat langsung."

## 7.4 State Popup
Loading (saat submit), Success (auto redirect, tidak perlu state sukses terpisah karena langsung pindah ke WA), Error validasi per-field (inline di bawah input).

## 7.5 Floating Action Button (FAB)

- Posisi: fixed bottom-right, semua halaman public (di root `layout.tsx`, bukan per-halaman).
- Icon WhatsApp, warna brand WhatsApp (`#25D366`) atau warna brand SuhuMobil (sesuaikan saat desain).
- Z-index tinggi tapi tidak menutupi elemen penting (beri margin aman dari Popup Lead Form & Toast notification).
- Di mobile, pastikan tidak menutupi elemen interaktif lain (misal tombol pagination) — beri `margin-bottom` cukup atau sembunyikan sementara saat scroll ke footer.
- Klik → buka `WhatsappLeadPopup` dengan `carId: null`, `source: "WHATSAPP_FAB"`.

## 7.6 Watermark

Komponen `<Watermark />` — teks + link, diambil dari `settings.watermark` (`{label, link}` via `/settings/public`), render sebagai `<a href={link} target="_blank">{label}</a>` dengan style subtle (opacity rendah, font kecil, tidak mengganggu konten utama tapi tetap terbaca).

Ditempatkan di:
1. **Footer** — selalu tampil, ukuran normal-kecil.
2. **Card gambar** (Car Card, dan cover Article Card) — overlay di pojok bawah gambar (misal `absolute bottom-2 right-2`), background semi-transparan agar tetap terbaca di gambar apapun.
3. **Galeri Detail Mobil** — overlay serupa di setiap gambar gallery/lightbox.

Karena disimpan di database (bukan hardcode), mengganti `label` atau `link` di `/admin/settings` **otomatis** mengubah watermark di semua tempat tanpa perlu redeploy.

---

# 8. Komponen Shared vs Feature

## Shared Components (`components/`)
`Button`, `Card`, `Input`, `Select`, `Textarea`, `Modal`, `Table`, `Badge`, `Loading` (skeleton), `EmptyState`, `Toast/Notification`, `Pagination`, `ImageUploader`, `ConfirmDialog`, `RichTextEditor` (wrapper TipTap untuk form), `RichTextRenderer` (render HTML tersanitasi untuk tampilan baca), `Watermark`, `WhatsappFAB`, `TagInput`

## Feature Components (`features/*/components/`)
- `features/cars`: `CarCard` (dengan tombol WA & watermark overlay), `CarGallery` (dengan watermark), `CarFilter`, `InspectionReportView`, `CarForm`, `CarImageManager`
- `features/leads`: `LeadTable`, `LeadDetailDrawer`, `WhatsappLeadPopup`, `DreamCarForm`
- `features/articles`: `ArticleCard`, `ArticleList`, `ArticleForm` (pakai `RichTextEditor` + `TagInput`), `ArticleContentView` (pakai `RichTextRenderer`), `ReadingTimeBadge`
- `features/dashboard`: `DashboardStatCard`, `StorageUsageBar`
- `features/settings`: `SettingsForm`
- `features/branding`: `BusinessProfileForm`, `LogoUploader`
- `features/auth`: `LoginForm`

---

# 9. State Management Strategy

| Jenis Data | Tool | Contoh |
| --- | --- | --- |
| Data dari API (server state) | TanStack Query | List mobil, detail mobil, list lead, settings |
| State UI lokal | React State (`useState`) | Buka/tutup modal, tab aktif di form |
| State global lintas komponen | Zustand | Status login admin (user info dari `/auth/me`), filter katalog aktif (supaya persist saat navigasi balik) |

**Jangan** simpan data hasil fetch API di Zustand (lihat `02-project-blueprint.md` section 18) — itu tanggung jawab TanStack Query (termasuk caching & revalidation).

---

# 10. SEO Implementation

Wajib per `00-development-rules.md` section 22, diterapkan di:

| Halaman | Title | Description | Structured Data |
| --- | --- | --- | --- |
| Landing | "SuhuMobil - Mobil Bekas Terkurasi & Terpercaya" | Value prop singkat | `Organization` |
| Catalog | "Katalog Mobil Bekas Terkurasi" | Jumlah unit tersedia | `ItemList` |
| Detail Mobil | `{title} - SuhuMobil` (dinamis) | Ringkasan spek + harga | `Vehicle` schema (dari data mobil) |
| List Artikel | "Blog & Tips Seputar Mobil - SuhuMobil" | Ringkasan blog | `ItemList` |
| Detail Artikel | `{seoTitle ?? title} - SuhuMobil` (dinamis) | `seoDescription ?? excerpt` | `BlogPosting` schema |

Tambahan wajib: `sitemap.xml` (generate dinamis dari daftar mobil published **dan** artikel published), `robots.txt` (allow semua kecuali `/admin`), Open Graph tags di setiap halaman public, canonical URL.

---

# 11. Performance Requirements (Recap)

Sesuai `00-development-rules.md` section 21 dan strategi di dokumen analisis awal:

- Bundle JS < 100KB gzip untuk halaman publik.
- Gambar lazy load + `next/image` dengan custom loader ke Cloudflare (WebP otomatis dari backend).
- Font: system font stack, tidak load Google Fonts eksternal.
- Target Lighthouse: Performance >90, SEO >95, Accessibility >90, Best Practice >90.
- Skeleton loading state untuk semua data async (bukan spinner polos) agar Cumulative Layout Shift rendah.
- TipTap (Rich Text Editor) hanya di-load di halaman admin yang butuh (dynamic import / `next/dynamic`), **jangan** bundle di halaman public — biar bundle size publik tetap kecil.

---

# 12. Auth Flow Frontend

1. Login (`/admin/login`) → `POST /auth/login` → cookie JWT otomatis di-set oleh backend (HttpOnly, tidak bisa dibaca JS).
2. Setelah login sukses, panggil `GET /auth/me` untuk ambil data user, simpan di Zustand store (`useAuthStore`).
3. Semua route `admin/*` (kecuali login) dibungkus layout yang cek status auth: jika `GET /auth/me` return `401` → redirect ke `/admin/login`.
4. Axios instance untuk admin **wajib** `withCredentials: true` agar cookie ikut terkirim.
5. Logout → `POST /auth/logout` → clear Zustand store → redirect ke `/admin/login`.

---

# 13. Analytics Integration (GTM/GA4)

1. Fetch `gtmId` dari `GET /settings/public` (via TanStack Query, sekali di root layout, cache lama karena jarang berubah).
2. Jika `gtmId` terisi, inject script GTM di `<head>` (root `layout.tsx`) menggunakan `next/script` dengan `strategy="afterInteractive"`.
3. Jika `gtmId` kosong/`null`, **jangan** render script apapun (hindari error/console warning karena container ID kosong).
4. GA4 (`ga4Id`) di MVP ini dianggap dikelola **lewat GTM** (tag GA4 dikonfigurasi di dalam container GTM oleh admin via GTM dashboard) — frontend cukup inject 1 script GTM saja. Field `ga4Id` disimpan sebagai referensi/dokumentasi, tidak wajib dipakai untuk inject script terpisah di MVP (YAGNI — hindari 2 sistem tracking paralel yang bisa dobel-count).

---

# 14. API Integration Layer

```
services/
  api-client.ts        # axios instance, base URL dari env, withCredentials
  cars.service.ts       # getCars, getCarBySlug, createCar, updateCar, updateCarStatus, deleteCar
  car-images.service.ts # uploadImage, setCover, reorderImages, deleteImage
  leads.service.ts      # createLead, getLeads, getLeadById, updateLead
  articles.service.ts   # getArticles, getArticleBySlug, createArticle, updateArticle, updateArticleStatus, uploadCover, deleteArticle
  settings.service.ts   # getPublicSettings, getAdminSettings, updateSettings
  branding.service.ts   # uploadLogo
  auth.service.ts       # login, logout, getMe
  dashboard.service.ts  # getStats
```

Setiap service function **hanya** membungkus axios call + tipe TypeScript return — tidak boleh ada logic UI di dalam `services/` (lihat `00-development-rules.md` section 7).

Environment variable frontend:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

---

# 15. Error Handling UI

- Error dari API (`success: false`) ditangani terpusat di axios interceptor → tampilkan toast dengan `message` dari response.
- Error validasi (`422`) → mapping `errors` per field ke React Hook Form (`setError`).
- Error jaringan/500 → toast generik "Terjadi kesalahan, coba lagi" — tidak pernah tampilkan detail teknis ke user (sesuai `00-development-rules.md` section 14).

---

# 16. Responsive & Accessibility

- **Mobile First** — desain & develop dimulai dari breakpoint mobile dulu, baru scale up ke `sm`, `md`, `lg`, `xl` (Tailwind default). Semua halaman baru di section 5 & 6 wajib di-test dulu tampilannya di lebar 375px sebelum ke breakpoint lebih besar.
- Semua interactive element (button, link, input, **termasuk FAB WhatsApp**) minimal touch target 44×44px di mobile.
- Semua image wajib `alt` text deskriptif (dari `title` mobil / `title` artikel, bukan generik "image").
- Form wajib label yang terhubung ke input (`htmlFor`), bukan hanya placeholder — berlaku juga untuk field di **Rich Text Editor** toolbar (`aria-label` per tombol toolbar, misal "Bold", "Heading 2").
- Kontras warna minimal **WCAG 2.1 Level AA** (rasio 4.5:1 untuk teks normal, 3:1 untuk teks besar/UI component) — termasuk teks Watermark yang sengaja dibuat subtle: tetap harus lolos kontras minimum meski "lembut".
- Semua modal (Popup Lead Form, ConfirmDialog) wajib bisa ditutup via `Esc`, focus trap saat terbuka, dan focus kembali ke trigger element saat ditutup.
- Navigasi keyboard penuh (Tab/Shift+Tab) untuk seluruh flow penting: mengisi Popup Lead Form, navigasi Catalog filter, mengisi form Admin.

---

# 17. Definition of Done (Frontend)

Sesuai `00-development-rules.md` section 30, ditambah spesifik frontend:

- Semua halaman di section 4 dokumen ini terimplementasi (termasuk Articles & Business Profile).
- Setiap halaman async punya Loading, Empty, Error, dan Success state (tidak ada halaman kosong/blank).
- Popup Lead Form (section 7) berfungsi end-to-end dari ketiga trigger (Card, Detail, FAB) — submit lead + redirect WhatsApp.
- Watermark tampil konsisten di Footer, Card gambar, dan Galeri Detail Mobil, dan berubah otomatis saat admin ganti setting-nya.
- Rich Text Editor berfungsi di form Mobil, Article, dan Business Profile; hasil render di halaman publik tampil rapi (tidak ada HTML mentah bocor ke tampilan).
- Article/Blog CRUD lengkap end-to-end (create draft → upload cover → publish → tampil di `/articles`).
- GTM script ter-inject dengan benar jika `gtmId` diisi admin, tidak error jika kosong.
- Responsive di mobile, tablet, desktop (manual test minimal 3 breakpoint), mobile-first sebagai baseline.
- Lighthouse score sesuai target section 11.
- Aksesibilitas minimal WCAG AA (kontras, keyboard nav, alt text, label form) — lihat section 16.
- Tidak ada error TypeScript, tidak ada error ESLint.
- Admin routes terproteksi (tidak bisa diakses tanpa login, termasuk via direct URL).

---

# 18. Out of Scope (Frontend)

Tidak dikerjakan di MVP frontend:

- Dark mode
- Multi-bahasa
- PWA offline mode penuh (caching dasar boleh, tapi tidak wajib)
- Animasi kompleks/3D
- Wishlist / Compare mobil (sudah di luar scope bisnis, lihat `01-business-overview.md` section 11)
- Komentar & likes/claps pada artikel
- Multi-author article, kategori bertingkat (hanya tags flat)
- Editor rich text tingkat lanjut (embed video, table, custom block) — toolbar dibatasi sesuai `00-development-rules.md` section 34

---

# Approval

| Role | Status |
| --- | --- |
| Software Architect | ✅ Approved |
| Product Owner | ⏳ Pending Review |

---

**End of Document**