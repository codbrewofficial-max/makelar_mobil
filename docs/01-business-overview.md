# 01-business-overview.md

> **Project:** SuhuMobil (Working Title)
>
> **Version:** 1.3.0
>
> **Status:** Approved
>
> **Document Type:** Business Overview
>
> **Target:** AI Assisted Development

---

# 1. Executive Summary

SuhuMobil adalah platform digital yang membantu masyarakat membeli maupun menjual mobil bekas melalui proses kurasi yang dilakukan oleh tenaga ahli berpengalaman.

Berbeda dengan marketplace otomotif pada umumnya, SuhuMobil tidak hanya menampilkan daftar kendaraan, tetapi juga memberikan hasil inspeksi, transparansi kondisi kendaraan, serta konsultasi langsung dengan kurator.

MVP difokuskan untuk memvalidasi model bisnis dalam waktu sesingkat mungkin dengan membangun sistem yang ringan, mudah digunakan, dan mudah dikembangkan.

---

# 2. Product Vision

Menjadi platform mobil bekas terpercaya yang menggabungkan pengalaman teknisi, sales, dan teknologi modern untuk membantu masyarakat membeli kendaraan dengan aman.

---

# 3. Product Mission

Menyediakan platform yang:

- Transparan
- Mudah digunakan
- Cepat diakses
- Mobile First
- SEO Friendly
- Mempermudah komunikasi antara calon pembeli dan kurator.

---

# 4. Business Objective

Target utama MVP bukan menjadi marketplace terbesar. Target utamanya adalah membuktikan bahwa sistem mampu menghasilkan prospek (Lead) dan membantu proses closing penjualan.

Fokus bisnis:

- Mendapatkan Leads
- Meningkatkan Trust
- Mempermudah Closing
- Menjadi aset digital perusahaan

---

# 5. Success Metrics (30 Hari)

| KPI | Target |
| --- | --- |
| Leads Masuk | ≥ 20 |
| Penjualan | 1–2 Unit |
| CTA WhatsApp | ≥ 5% |
| Index Google | Minggu Ke-2 |
| Uptime | ≥ 99% |
| Lighthouse Performance | ≥ 90 |

> KPI di atas diukur sepanjang **30 hari sejak website live** (bukan sejak mulai development). Lihat Section 17 untuk pembagian fase waktu.
>
> **Catatan CTA WhatsApp ≥5%:** karena CTA WhatsApp kini melalui popup lead form (bukan direct link), metrik ini dihitung sebagai *popup berhasil di-submit* dibagi *visitor unik* — sehingga otomatis tercatat sebagai lead juga (lihat Section 12 & `04-api-contract.md` section 11).

---

# 6. Target Market

## Primary Market
Masyarakat yang ingin membeli mobil bekas dengan aman.

Karakteristik:

- Usia 25–45 Tahun
- Pekerja
- Keluarga muda
- Budget 80–300 juta
- Tidak memahami kondisi mobil secara teknis

## Secondary Market
Pemilik kendaraan yang ingin menjual mobilnya melalui jasa titip jual.

---

# 7. User Persona

## Buyer
**Pain Point:** Takut tertipu, tidak mengerti mesin, bingung memilih mobil, tidak punya waktu survei.
**Goal:** Mendapatkan mobil terbaik, mendapatkan rekomendasi ahli, proses cepat, aman.

## Seller
**Pain Point:** Sulit mendapatkan pembeli serius, banyak penawar tidak jelas, proses jual lama.
**Goal:** Mobil cepat terjual, harga sesuai, tidak repot.

## Admin
Mengelola seluruh website.

Tugas: Login, CRUD Mobil, CRUD Lead, Upload Foto, Kelola Setting.

## Kurator
Memastikan kualitas kendaraan.

Tugas: Inspeksi, Upload hasil inspeksi, Update status kendaraan, Menjawab pertanyaan pelanggan.

> **Catatan:** Kurator adalah peran fungsional/bisnis. Secara sistem (login, role, permission), Kurator menggunakan akun **Admin** yang sama — tidak ada role terpisah di MVP (lihat `00-development-rules.md` section 16).

---

# 8. Problem Statement

Saat ini sebagian besar pembeli mobil bekas mengalami beberapa masalah:

- Sulit membedakan mobil bagus dan buruk.
- Informasi kendaraan kurang transparan.
- Banyak penipuan.
- Sulit mendapatkan rekomendasi terpercaya.

Platform ini hadir untuk mengurangi risiko tersebut melalui proses kurasi dan konsultasi.

---

# 9. Product Value Proposition

**Transparansi** — Setiap mobil memiliki informasi lengkap.
**Kepercayaan** — Mobil diperiksa oleh tenaga berpengalaman.
**Kemudahan** — Calon pembeli dapat langsung menghubungi admin melalui WhatsApp.
**Efisiensi** — Mengurangi waktu pencarian kendaraan.

---

# 10. Scope MVP

## Fitur Public

- Landing Page
- Catalog Mobil
- Detail Mobil
- Search Mobil
- Filter Mobil
- CTA WhatsApp (dengan Popup Lead Form) — per Card & per Detail Mobil
- Floating Action Button WhatsApp (general, site-wide)
- Form Lead
- Tentang Kami
- Kontak
- Blog / Article
- Watermark (footer, card gambar, galeri detail)

## Dashboard Admin

- Login
- Dashboard
- CRUD Mobil
- Upload Foto
- CRUD Lead
- CRUD Article/Blog
- Business Profile (logo, nama, deskripsi)
- Pengaturan Website (termasuk Watermark, GTM/GA4)

## Sistem

- Authentication
- Upload Image
- PostgreSQL
- Cloudflare R2
- SEO
- Sitemap
- Robots.txt
- GTM / GA4 Integration

---

# 11. Out of Scope

Fitur berikut tidak termasuk MVP:

- Marketplace Multi Seller
- Mobile Apps
- Payment Gateway
- Kredit Online
- Wishlist
- Compare Mobil
- Chat Internal
- Push Notification
- Multi Bahasa
- Membership

---

# 12. User Flow

## Buyer
```
Landing Page → Lihat Katalog → Filter Mobil → Detail Mobil
→ Klik WhatsApp → Isi Popup Form (Nama, Email, WA, Subjek, Pesan)
→ Redirect ke WhatsApp → Konsultasi → Survey → Closing
```

> Popup form sebelum redirect WhatsApp bertujuan agar setiap ketertarikan pengunjung tetap tercatat sebagai lead terstruktur (bukan sekadar klik), sekaligus membuat pesan WhatsApp yang terkirim lebih informatif (sudah berisi nama & kebutuhan pengunjung).

## Seller
```
Hubungi Admin → Inspeksi → Mobil Dipublikasikan
→ Lead Masuk → Negosiasi → Terjual
```

## Admin
```
Login → Dashboard → Tambah Mobil → Upload Foto
→ Publish → Kelola Lead → Update Status
```

---

# 13. Business Rules

## Mobil

Status mobil: Draft, Published, Sold, Archived.

Mobil dengan status **Sold** tidak muncul pada katalog publik.

## Lead

Status Lead: New, Contacted, Negotiation, Closed, Rejected.

Lead tidak boleh dihapus, hanya dapat diperbarui statusnya.

## Foto

Minimal **5 Foto** — Maksimal **20 Foto** per kendaraan.
*(Konsisten dengan `00-development-rules.md` Storage Rules.)*

---

# 14. Revenue Model

**Titip Jual** — Komisi berdasarkan kesepakatan.
**Car Finder** — Jasa pencarian kendaraan sesuai kebutuhan pelanggan.

**Future Revenue:** Banner Promosi, Iklan Dealer, Kerja Sama Leasing, Jasa Inspeksi.

---

# 15. Competitive Advantage

- Kurasi kendaraan
- Pengalaman teknisi
- Pengalaman sales
- Transparansi kondisi mobil
- Website cepat
- SEO Friendly
- Mobile Friendly

---

# 16. Non Functional Requirements

**Performance** — Load < 2 detik, Lighthouse > 90
**Security** — JWT Authentication, Input Validation, SQL Injection Protection, XSS Protection
**Availability** — Target uptime 99%
**Accessibility** — Minimal WCAG AA

---

# 17. MVP Timeline (30 Hari)

Timeline terbagi menjadi dua fase besar: **Development (Hari 1–5)** dan **Market Validation (Hari 6–30)**.

## Fase 1 — Development (Hari 1–5)

| Hari | Aktivitas |
| --- | --- |
| Hari 1 | Finalisasi dokumen (03-06), setup project, database, environment |
| Hari 2 | Backend development (API core: auth, cars, leads, upload) |
| Hari 3 | Frontend development (landing, catalog, detail mobil, form lead) |
| Hari 4 | Dashboard admin & testing (Lighthouse, SEO, WCAG) |
| Hari 5 | Deployment & Publish ke production |

## Fase 2 — Market Validation & Closing (Hari 6–30)

| Rentang Hari | Aktivitas |
| --- | --- |
| Hari 6–10 | Input unit mobil pertama, mulai konten media sosial (short video), distribusi trafik |
| Hari 11–20 | Follow-up leads, konsultasi calon pembeli, jadwal survey/test drive |
| Hari 21–30 | Closing penjualan, kumpulkan testimoni, evaluasi KPI 30 hari |

> KPI pada Section 5 (Leads, Penjualan, CTA WhatsApp, Index Google) diukur berjalan sepanjang Fase 2, terhitung sejak website live di akhir Hari 5.

---

# 18. Risk

| Risiko | Mitigasi |
| --- | --- |
| Sedikit Lead | Optimasi SEO dan konten media sosial |
| Tidak Ada Penjualan | Fokus pada kualitas unit dan follow-up cepat |
| Upload Foto Gagal | Gunakan Cloudflare R2 |
| Downtime VPS | Monitoring dan backup rutin |
| Scope bertambah (blog, watermark, business profile, dll) tapi timeline dev tetap 5 hari | Prioritaskan modul inti dulu (catalog, detail, lead, CTA WhatsApp) di Hari 1–5; jika Article/Blog belum sempat matang, publish dengan versi paling sederhana dulu (judul, cover, rich text, publish/draft) lalu disempurnakan di Hari 6–30 tanpa mengganggu KPI utama |

---

# 19. Future Roadmap

## Phase 2
Dashboard Analytics, Blog, Testimoni, FAQ

## Phase 3
Kalkulator Kredit, Booking Test Drive, Email Notification, Telegram Notification

## Phase 4
Marketplace Multi Seller, Leasing Integration, Mobile Apps, AI Recommendation

---

# 20. Definition of Success

MVP dianggap berhasil apabila:

- Website online di production.
- Admin dapat mengelola data kendaraan.
- Pengunjung dapat melihat katalog.
- Pengunjung dapat menghubungi admin melalui WhatsApp.
- Lead tersimpan di database.
- Website responsif di perangkat mobile.
- Seluruh halaman terindeks Google.
- Minimal 20 lead masuk dalam 30 hari.
- Minimal 1 transaksi berhasil.

---

# 21. Acceptance Criteria

## Public Website
- Landing Page dapat diakses.
- Katalog dapat ditampilkan.
- Detail mobil dapat dibuka.
- WhatsApp dapat dibuka dengan pesan otomatis.
- Form Lead dapat disimpan.

## Dashboard
- Admin dapat login.
- Admin dapat CRUD mobil.
- Admin dapat mengelola lead.
- Admin dapat mengubah status mobil.

## System
- Upload gambar berhasil.
- Database berjalan normal.
- API berfungsi.
- Website dapat di-deploy ke VPS.

---

# Approval

| Role | Status |
| --- | --- |
| Product Owner | ⏳ Review |
| Software Architect | ✅ Approved |

---

**End of Document**