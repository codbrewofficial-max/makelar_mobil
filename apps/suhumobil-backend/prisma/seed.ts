import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

function fakeHash() {
  return randomBytes(32).toString("hex");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  // ---------------------------------------------------------------------
  // 1. USERS (Owner + Admin) — sudah ada sebelumnya, dipertahankan apa adanya
  // ---------------------------------------------------------------------
  const ownerPasswordHash = await bcrypt.hash("owner12345", 10);
  const adminPasswordHash = await bcrypt.hash("admin12345", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@suhumobil.com" },
    update: {},
    create: {
      name: "Owner SuhuMobil",
      email: "owner@suhumobil.com",
      passwordHash: ownerPasswordHash,
      role: "OWNER",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@suhumobil.com" },
    update: {},
    create: {
      name: "Admin SuhuMobil",
      email: "admin@suhumobil.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // ---------------------------------------------------------------------
  // 2. SETTINGS — sudah ada sebelumnya, dipertahankan apa adanya
  // ---------------------------------------------------------------------
  const defaultSettings: Record<string, unknown> = {
    site_title: "SuhuMobil - Mobil Bekas Terkurasi",
    whatsapp_number: "6281234567890",
    social_links: { instagram: "suhumobil.id", tiktok: "suhumobil.id", youtube: "SuhuMobilOfficial" },
    storage_quota_gb: 1,
    watermark: { label: "Powered by SuhuMobil", link: "https://suhumobil.com" },
    business_profile: {
      logoUrl: null,
      name: "SuhuMobil",
      tagline: "Mobil Bekas Terkurasi & Terpercaya",
      description: "SuhuMobil adalah bursa mobil bekas terkurasi kelas premium, mengedepankan kejujuran dan transparansi lewat laporan inspeksi ketat langsung dari Kurator Utama berpengalaman.",
      address: "Jl. Otomotif Raya No. 25, Bandung, Jawa Barat",
      phone: "6281234567890",
    },
    gtm_id: "",
    ga4_id: "",
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as any },
    });
  }

  // ---------------------------------------------------------------------
  // 3. CURATORS
  // ---------------------------------------------------------------------
  const curatorData = [
    {
      name: "Suhu Benny Susilo",
      role: "Kurator Utama",
      photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500",
      description:
        "Berpengalaman lebih dari 25 tahun di dunia otomotif. Memulai karier sebagai teknisi bengkel resmi sebelum menjadi kepala inspektur independen. Prinsip utamanya: jujur soal kondisi mobil, sekecil apapun catatannya.",
    },
    {
      name: "Rudi Hartawan",
      role: "Teknisi Senior - Mesin & Transmisi",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=500",
      description:
        "Spesialis mesin dan transmisi dengan pengalaman 15 tahun di berbagai bengkel resmi merek Jepang dan Eropa. Fokus utama pada deteksi dini masalah mesin sebelum jadi kerusakan besar.",
    },
    {
      name: "Dewi Anggraini",
      role: "Inspektur Bodi & Interior",
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=500",
      description:
        "Ahli deteksi tabrakan dan cat ulang dengan sertifikasi appraisal kendaraan. Memastikan histori kecelakaan sebuah unit terungkap jujur sebelum sampai ke pembeli.",
    },
  ];

  const curators = [];
  for (const c of curatorData) {
    const existing = await prisma.curator.findFirst({ where: { name: c.name } });
    const curator = existing
      ? await prisma.curator.update({ where: { id: existing.id }, data: c })
      : await prisma.curator.create({ data: c });
    curators.push(curator);
  }

  // ---------------------------------------------------------------------
  // 4. CARS + CAR IMAGES
  // ---------------------------------------------------------------------
  const placeholderImages = [
    "https://picsum.photos/seed/suhumobil1/1200/800",
    "https://picsum.photos/seed/suhumobil2/1200/800",
    "https://picsum.photos/seed/suhumobil3/1200/800",
    "https://picsum.photos/seed/suhumobil4/1200/800",
    "https://picsum.photos/seed/suhumobil5/1200/800",
    "https://picsum.photos/seed/suhumobil6/1200/800",
  ];

  const sampleInspection = (note: string) => ({
    mesin: { status: "good", note: "Normal, tidak ada rembesan oli." },
    transmisi: { status: "good", note: "Perpindahan gigi halus." },
    bodi: { status: "minor", note: "Baret halus di beberapa titik, wajar pemakaian." },
    interior: { status: "good", note: "Bersih, jok original." },
    kakiKaki: { status: "good", note: "Ban masih 80%, tidak ada bunyi." },
    kelistrikan: { status: "good", note: "AC dingin, semua fitur berfungsi normal." },
    catatanKhusus: note,
    inspectedBy: "Suhu Benny Susilo",
    inspectedAt: new Date().toISOString().split("T")[0],
  });

  const carData = [
    {
      title: "Toyota Avanza 2019 G MT - Istimewa Tangan Pertama",
      brand: "Toyota", model: "Avanza", year: 2019, price: 150000000, mileage: 45000,
      transmission: "MANUAL", fuelType: "GASOLINE", color: "Silver Metallic", location: "Bandung",
      status: "PUBLISHED", curatorIdx: 0, imageCount: 6,
      note: "Servis rutin di bengkel resmi, kondisi sangat terawat.",
    },
    {
      title: "Honda HR-V 2020 E CVT - Low KM",
      brand: "Honda", model: "HR-V", year: 2020, price: 285000000, mileage: 28000,
      transmission: "CVT", fuelType: "GASOLINE", color: "Putih Mutiara", location: "Jakarta Selatan",
      status: "PUBLISHED", curatorIdx: 1, imageCount: 6,
      note: "Kilometer rendah, bebas banjir, surat lengkap.",
    },
    {
      title: "Daihatsu Xenia 2018 R Deluxe MT",
      brand: "Daihatsu", model: "Xenia", year: 2018, price: 128000000, mileage: 62000,
      transmission: "MANUAL", fuelType: "GASOLINE", color: "Hitam", location: "Bandung",
      status: "SOLD", curatorIdx: 0, imageCount: 5,
      note: "Terjual, kondisi keluarga terawat.",
    },
    {
      title: "Mitsubishi Pajero Sport 2017 Dakar 4x2 AT",
      brand: "Mitsubishi", model: "Pajero Sport", year: 2017, price: 385000000, mileage: 75000,
      transmission: "AUTOMATIC", fuelType: "DIESEL", color: "Putih", location: "Bandung",
      status: "ARCHIVED", curatorIdx: 2, imageCount: 5,
      note: "Diarsipkan sementara, unit direnovasi ulang.",
    },
    {
      title: "Suzuki Ertiga 2021 GX AT Hybrid",
      brand: "Suzuki", model: "Ertiga", year: 2021, price: 215000000, mileage: 18000,
      transmission: "AUTOMATIC", fuelType: "HYBRID", color: "Abu-abu", location: "Bekasi",
      status: "DRAFT", curatorIdx: 1, imageCount: 0,
      note: "Masih tahap dokumentasi foto.",
    },
    {
      title: "Nissan Livina 2019 VE AT",
      brand: "Nissan", model: "Livina", year: 2019, price: 168000000, mileage: 51000,
      transmission: "AUTOMATIC", fuelType: "GASOLINE", color: "Merah Maroon", location: "Bandung",
      status: "DRAFT", curatorIdx: 2, imageCount: 0,
      note: "Menunggu jadwal inspeksi fisik final.",
    },
  ];

  for (const c of carData) {
    const slug = slugify(c.title);
    const curator = curators[c.curatorIdx];

    const car = await prisma.car.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: c.title,
        brand: c.brand,
        model: c.model,
        year: c.year,
        price: BigInt(c.price),
        mileage: c.mileage,
        transmission: c.transmission as any,
        fuelType: c.fuelType as any,
        color: c.color,
        location: c.location,
        description: `<p>${c.title} dengan kondisi terjaga. ${c.note}</p><p>Setiap unit di SuhuMobil sudah melalui inspeksi ketat oleh kurator berpengalaman sebelum dipasarkan.</p>`,
        inspectionReport: sampleInspection(c.note) as any,
        status: c.status as any,
        createdBy: admin.id,
        inspectedBy: curator.id,
      },
    });

    const existingImages = await prisma.carImage.count({ where: { carId: car.id } });
    if (existingImages === 0 && c.imageCount > 0) {
      const imagesToCreate = Array.from({ length: c.imageCount }).map((_, idx) => ({
        carId: car.id,
        url: placeholderImages[idx % placeholderImages.length],
        fileHash: fakeHash(),
        sizeBytes: 250000 + idx * 10000,
        sortOrder: idx,
        isCover: idx === 0,
      }));
      await prisma.carImage.createMany({ data: imagesToCreate });
    }
  }

  // ---------------------------------------------------------------------
  // 5. ARTICLES
  // ---------------------------------------------------------------------
  const articleData = [
    {
      title: "5 Tanda Mobil Bekas Pernah Kebanjiran yang Sering Terlewat",
      excerpt: "Banjir bisa merusak komponen vital mobil tanpa terlihat dari luar. Ini titik-titik yang wajib dicek sebelum membeli.",
      content: "<h2>Kenapa Penting Dicek?</h2><p>Mobil bekas banjir sering dijual dengan tampilan luar yang mulus, padahal komponen kelistrikan dan interior sudah rusak parah.</p><h2>5 Titik Pemeriksaan</h2><ul><li>Karpet dan jok bagian bawah</li><li>Baut-baut di kolong mobil (cek karat)</li><li>Lampu bagian dalam (embun/kabut)</li><li>Bau apek di AC</li><li>Riwayat servis kelistrikan</li></ul><p>Selalu minta laporan inspeksi tertulis dari penjual.</p>",
      tags: ["tips", "inspeksi", "mobil-bekas"],
      status: "PUBLISHED",
      cover: true,
    },
    {
      title: "Manual vs Matic: Mana yang Lebih Awet untuk Mobil Bekas?",
      excerpt: "Perdebatan klasik pembeli mobil bekas. Kita bedah kelebihan dan kekurangan masing-masing dari sisi biaya perawatan jangka panjang.",
      content: "<h2>Transmisi Manual</h2><p>Lebih sederhana secara mekanis, biaya servis cenderung lebih murah, kopling adalah komponen aus yang perlu diperhatikan.</p><h2>Transmisi Matic</h2><p>Lebih nyaman dipakai harian terutama macet, tapi biaya servis CVT/AT lebih mahal jika rusak.</p><p>Kesimpulan: sesuaikan dengan kebiasaan berkendara dan budget servis.</p>",
      tags: ["tips", "transmisi"],
      status: "PUBLISHED",
      cover: true,
    },
    {
      title: "Checklist Dokumen Wajib Sebelum Beli Mobil Bekas",
      excerpt: "Jangan sampai tergiur harga murah tapi surat-suratnya bermasalah. Ini daftar dokumen yang wajib dicek satu per satu.",
      content: "<h2>Dokumen Utama</h2><ul><li>STNK asli & masih berlaku</li><li>BPKB asli, cocokkan nomor rangka & mesin</li><li>Faktur pembelian (jika ada)</li><li>Kwitansi jual-beli bermaterai</li></ul><p>Selalu cek fisik nomor rangka langsung ke unit, jangan hanya percaya dokumen.</p>",
      tags: ["tips", "dokumen", "legalitas"],
      status: "PUBLISHED",
      cover: true,
    },
    {
      title: "Draft: Perbandingan Biaya Perawatan Mobil Eropa vs Jepang",
      excerpt: "Artikel masih dalam proses penulisan, membandingkan estimasi biaya servis berkala.",
      content: "<p>Draft konten, belum lengkap.</p>",
      tags: ["draft"],
      status: "DRAFT",
      cover: false,
    },
  ];

  for (const a of articleData) {
    const slug = slugify(a.title);
    const text = a.content.replace(/<[^>]*>/g, "");
    const wordCount = text.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        coverImage: a.cover ? "https://picsum.photos/seed/" + slug + "/1200/630" : null,
        tags: a.tags,
        readingTimeMinutes,
        status: a.status as any,
        authorId: admin.id,
        publishedAt: a.status === "PUBLISHED" ? new Date() : null,
      },
    });
  }

  // ---------------------------------------------------------------------
  // 6. CONTENT SECTIONS (CMS) — isi eksplisit, bukan cuma andalkan fallback default
  // ---------------------------------------------------------------------
  const contentSectionData: { page: string; sectionKey: string; content: any }[] = [
    {
      page: "landing", sectionKey: "hero",
      content: {
        headline: "Mobil Bekas Terkurasi & Terpercaya",
        subheadline: "Setiap unit diperiksa tenaga ahli berpengalaman 25 tahun sebelum sampai ke tangan Anda.",
        ctaLabel: "Lihat Katalog",
      },
    },
    {
      page: "landing", sectionKey: "trust",
      content: {
        items: [
          { icon: "shield", title: "Kurasi Mutlak", description: "Setiap unit lolos inspeksi ketat sebelum dipasarkan." },
          { icon: "eye", title: "Transparansi", description: "Laporan kondisi apa adanya, jujur tanpa ditutupi." },
          { icon: "message-circle", title: "Konsultasi Personal", description: "Tanya langsung via WhatsApp ke tim kami." },
        ],
      },
    },
    {
      page: "landing", sectionKey: "about_curator_summary",
      content: {
        headline: "Tentang Kurator Kami",
        narrative: "Dipimpin oleh Suhu Benny Susilo, berpengalaman 25 tahun di dunia otomotif, tim kurator SuhuMobil memastikan setiap unit lolos standar kelayakan tertinggi.",
      },
    },
    {
      page: "landing", sectionKey: "cta_footer",
      content: { headline: "Cari Mobil Impian Anda", ctaLabel: "Hubungi Kami" },
    },
    {
      page: "about", sectionKey: "story",
      content: {
        headline: "Tentang SuhuMobil",
        content: "<p>SuhuMobil lahir dari keresahan banyak pembeli mobil bekas yang trauma dengan istilah \"mobil zonk\". Kami hadir dengan prinsip kejujuran mutlak: setiap unit diperiksa tuntas dan hasilnya dilaporkan apa adanya.</p>",
      },
    },
    {
      page: "footer", sectionKey: "general",
      content: {
        description: "Platform mobil bekas terkurasi & terpercaya.",
        copyrightText: `© ${new Date().getFullYear()} SuhuMobil. All rights reserved.`,
      },
    },
    {
      page: "contact", sectionKey: "intro",
      content: {
        headline: "Hubungi Kami",
        description: "Ada pertanyaan seputar unit atau proses pembelian? Kontak tim kami langsung via WhatsApp atau form di bawah.",
      },
    },
  ];

  for (const s of contentSectionData) {
    await prisma.contentSection.upsert({
      where: { page_sectionKey: { page: s.page, sectionKey: s.sectionKey } },
      update: {},
      create: { page: s.page, sectionKey: s.sectionKey, content: s.content, updatedBy: owner.id },
    });
  }

  // ---------------------------------------------------------------------
  // 7. MEDIA ASSETS (contoh isi Media Library)
  // ---------------------------------------------------------------------
  const existingMediaCount = await prisma.mediaAsset.count();
  if (existingMediaCount === 0) {
    await prisma.mediaAsset.createMany({
      data: [
        {
          url: "https://picsum.photos/seed/media1/800/800",
          sourceType: "EXTERNAL_LINK",
          altText: "Contoh media dari link eksternal 1",
          uploadedBy: admin.id,
        },
        {
          url: "https://picsum.photos/seed/media2/800/800",
          sourceType: "EXTERNAL_LINK",
          altText: "Contoh media dari link eksternal 2",
          uploadedBy: admin.id,
        },
        {
          url: "https://picsum.photos/seed/media3/800/800",
          sourceType: "EXTERNAL_LINK",
          altText: "Contoh media dari link eksternal 3",
          uploadedBy: owner.id,
        },
      ],
    });
  }

  // ---------------------------------------------------------------------
  // 8. AUDIT LOGS (contoh riwayat aktivitas)
  // ---------------------------------------------------------------------
  const existingAuditCount = await prisma.auditLog.count();
  if (existingAuditCount === 0) {
    const now = Date.now();
    const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);

    await prisma.auditLog.createMany({
      data: [
        { userId: owner.id, action: "LOGIN", entity: "auth", createdAt: daysAgo(5) },
        { userId: admin.id, action: "LOGIN", entity: "auth", createdAt: daysAgo(4) },
        { userId: admin.id, action: "CREATE", entity: "car", metadata: { title: "Toyota Avanza 2019 G MT" }, createdAt: daysAgo(4) },
        { userId: admin.id, action: "CREATE", entity: "curator", metadata: { name: "Suhu Benny Susilo" }, createdAt: daysAgo(4) },
        { userId: owner.id, action: "UPDATE", entity: "settings", metadata: { keys: ["businessProfile"] }, createdAt: daysAgo(3) },
        { userId: admin.id, action: "CREATE", entity: "article", metadata: { title: "5 Tanda Mobil Bekas Pernah Kebanjiran" }, createdAt: daysAgo(2) },
        { userId: admin.id, action: "UPDATE", entity: "car", metadata: { status: "PUBLISHED" }, createdAt: daysAgo(2) },
        { userId: owner.id, action: "LOGIN", entity: "auth", createdAt: daysAgo(1) },
        { userId: admin.id, action: "UPDATE", entity: "content_section", metadata: { page: "landing", sectionKey: "hero" }, createdAt: daysAgo(1) },
        { userId: owner.id, action: "EXPORT", entity: "database", metadata: { key: "backups/manual-seed-example.dump" }, createdAt: daysAgo(1) },
      ],
    });
  }

  console.log("✅ Seed selesai:");
  console.log("   - Owner:", owner.email, "(password: owner12345)");
  console.log("   - Admin:", admin.email, "(password: admin12345)");
  console.log("   - Settings default sudah dibuat");
  console.log("   -", curators.length, "Curators");
  console.log("   -", carData.length, "Cars (+ CarImages untuk yang bukan DRAFT)");
  console.log("   -", articleData.length, "Articles");
  console.log("   -", contentSectionData.length, "Content Sections");
  console.log("   - Media Assets & Audit Logs contoh sudah dibuat");
  console.log("   ⛔ Leads & Tracking Logs SENGAJA TIDAK di-seed (sesuai permintaan)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
