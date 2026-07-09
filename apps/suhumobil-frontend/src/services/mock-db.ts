/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Car,
  CarStatus,
  CarTransmission,
  CarFuelType,
  Lead,
  LeadStatus,
  LeadSource,
  LeadSubject,
  Article,
  ArticleStatus,
  PublicSettings,
  AdminSettings,
  DashboardStats,
  User,
  UserRole,
  Curator,
  TrackingLog,
  SystemInsight
} from '../types';

const INITIAL_USERS: User[] = [
  {
    id: 'user-owner',
    name: 'Suhu Owner',
    email: 'owner@suhumobil.com',
    role: UserRole.OWNER,
    createdAt: '2026-06-01T00:00:00Z'
  },
  {
    id: 'user-admin',
    name: 'Admin Farhan',
    email: 'admin@suhumobil.com',
    role: UserRole.ADMIN,
    createdAt: '2026-06-02T00:00:00Z'
  }
];

const INITIAL_CURATORS: Curator[] = [
  {
    id: 'curator-1',
    name: 'Suhu Benny Susilo',
    role: 'Kurator Utama',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500',
    description: 'Selama 25 tahun berkecimpung di dunia otomotif, dari bengkel resmi hingga pasar bursa mobil bekas, saya menyaksikan ribuan pembeli yang merasa cemas akan ditipu atau mendapatkan mobil zonk. Ketakutan itu nyata karena mesin tidak pernah berbohong, tetapi penjual seringkali bisa memoles permukaan luar.\n\nSuhuMobil didirikan dengan satu nilai mutlak: Kejujuran. Setiap unit yang Anda lihat di katalog ini telah melewati proses penyaringan yang ketat langsung di bawah pengawasan saya sendiri. Jika ada baret, kita bilang ada baret. Jika kaki-kaki berisik, kita catat berisik. Integritas inilah yang menjadi fondasi keamanan berkendara Anda.',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z'
  }
];

const INITIAL_SETTINGS: AdminSettings = {
  siteTitle: 'SuhuMobil - Mobil Bekas Terkurasi',
  whatsappNumber: '6281234567890',
  socialLinks: {
    instagram: 'https://instagram.com/suhumobil',
    tiktok: 'https://tiktok.com/@suhumobil',
    youtube: 'https://youtube.com/suhumobil'
  },
  watermark: {
    label: 'Terkurasi SuhuMobil',
    link: 'https://suhumobil.com'
  },
  businessProfile: {
    logoUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=200',
    name: 'SuhuMobil',
    tagline: 'Kondisi Jujur, Kurasi Maksimun, Transaksi Aman',
    description: '<p>Didirikan oleh ahli inspeksi otomotif dengan pengalaman lapangan lebih dari 25 tahun, SuhuMobil hadir sebagai solusi atas kekhawatiran masyarakat saat membeli mobil bekas. Kami percaya setiap transaksi harus didasari oleh transparansi penuh dan integritas tanpa kompromi.</p><p>Setiap unit kendaraan yang masuk ke katalog kami wajib melewati inspeksi 150+ titik secara mandiri oleh kurator berpengalaman kami, mencakup pemeriksaan mesin, transmisi, sasis, bekas banjir, bekas tabrakan, hingga komponen kelistrikan halus.</p>'
  },
  gtmId: 'GTM-MOCK123',
  ga4Id: 'G-MOCK123',
  storageQuotaGb: 1
};

const INITIAL_CARS: Car[] = [
  {
    id: 'car-1',
    slug: 'toyota-avanza-2019-g-mt',
    title: 'Toyota Avanza 2019 G MT',
    brand: 'Toyota',
    model: 'Avanza',
    year: 2019,
    price: 155000000,
    mileage: 48200,
    transmission: CarTransmission.MANUAL,
    fuelType: CarFuelType.GASOLINE,
    color: 'Silver Metallic',
    location: 'Bandung',
    description: '<p>Toyota Avanza tipe G transmisi manual tahun 2019 akhir. Kondisi sangat istimewa, sangat terawat dengan riwayat servis berkala resmi Toyota yang lengkap. AC double blower dingin menggigil, interior rapi orisinil wangi bebas asap rokok.</p><ul><li>Tangan pertama dari baru, surat-surat lengkap dan dijamin keabsahannya (BPKB, STNK, Faktur).</li><li>Pajak hidup panjang sampai Oktober 2026.</li><li>Kaki-kaki senyap empuk tidak ada bunyi asing.</li><li>Konsumsi bahan bakar irit sangat cocok untuk mobil keluarga atau operasional harian.</li></ul>',
    status: CarStatus.PUBLISHED,
    createdBy: 'user-admin',
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-01T10:00:00Z',
    images: [
      {
        id: 'img-1-1',
        carId: 'car-1',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-1-1',
        sizeBytes: 320000,
        sortOrder: 0,
        isCover: true,
        createdAt: '2026-07-01T10:00:00Z'
      },
      {
        id: 'img-1-2',
        carId: 'car-1',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-1-2',
        sizeBytes: 290000,
        sortOrder: 1,
        isCover: false,
        createdAt: '2026-07-01T10:02:00Z'
      },
      {
        id: 'img-1-3',
        carId: 'car-1',
        url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-1-3',
        sizeBytes: 350000,
        sortOrder: 2,
        isCover: false,
        createdAt: '2026-07-01T10:03:00Z'
      },
      {
        id: 'img-1-4',
        carId: 'car-1',
        url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-1-4',
        sizeBytes: 310000,
        sortOrder: 3,
        isCover: false,
        createdAt: '2026-07-01T10:04:00Z'
      },
      {
        id: 'img-1-5',
        carId: 'car-1',
        url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-1-5',
        sizeBytes: 340000,
        sortOrder: 4,
        isCover: false,
        createdAt: '2026-07-01T10:05:00Z'
      }
    ],
    inspectionReport: {
      mesin: { status: 'good', note: 'Kering, suara halus stabil, kompresi padat, tidak ada rembesan oli maupun tanda overheat.' },
      transmisi: { status: 'good', note: 'Kopling empuk, perpindahan gigi manual presisi, tidak mendengung.' },
      bodi: { status: 'minor', note: 'Cat orisinil pabrik 90%. Ada baret halus minor pemakaian wajar di bagian pintu belakang kanan, tidak penyok.' },
      interior: { status: 'good', note: 'Sangat bersih, jok dilapisi cover kulit sintetis rapi (orisinil di dalam), stir tidak botak, semua instrumen panel berfungsi.' },
      kakiKaki: { status: 'good', note: 'Shockbreaker kering tidak bocor, bushing senyap, ban tebal 85% merk Bridgestone.' },
      kelistrikan: { status: 'good', note: 'Sistem starter responsif, aki sehat, AC dingin menggigil merata sampai baris ketiga, seluruh power window & mirror lancar.' },
      catatanKhusus: 'Unit bergaransi bebas banjir dan bebas tabrak besar. Servis berkala tercatat lengkap di bengkel resmi Toyota.',
      inspectedBy: 'Suhu Inspector Benny',
      inspectedAt: '2026-06-28'
    }
  },
  {
    id: 'car-2',
    slug: 'honda-hrv-2021-e-cvt',
    title: 'Honda HR-V 2021 E CVT',
    brand: 'Honda',
    model: 'HR-V',
    year: 2021,
    price: 268000000,
    mileage: 29500,
    transmission: CarTransmission.CVT,
    fuelType: CarFuelType.GASOLINE,
    color: 'White Orchid Pearl',
    location: 'Jakarta Selatan',
    description: '<p>Honda HR-V tipe 1.5 E dengan transmisi otomatis CVT tahun 2021. Kilometernya masih sangat rendah di angka 29 ribuan asli (bukan putaran). Desain sporty mewah, perawatan sangat mudah dan kenyamanan premium di kelasnya.</p><ul><li>Tangan pertama perorangan dari baru, plat B genap DKI Jakarta.</li><li>Servis selalu rutin di dealer resmi Honda (buku servis lengkap).</li><li>Keyless Smart Entry, Push Start Button, Cruise Control.</li><li>Kamera parkir belakang multi-angle dan sensor parkir normal aktif.</li></ul>',
    status: CarStatus.PUBLISHED,
    createdBy: 'user-admin',
    createdAt: '2026-07-03T11:00:00Z',
    updatedAt: '2026-07-03T11:15:00Z',
    images: [
      {
        id: 'img-2-1',
        carId: 'car-2',
        url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-2-1',
        sizeBytes: 310000,
        sortOrder: 0,
        isCover: true,
        createdAt: '2026-07-03T11:00:00Z'
      },
      {
        id: 'img-2-2',
        carId: 'car-2',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-2-2',
        sizeBytes: 280000,
        sortOrder: 1,
        isCover: false,
        createdAt: '2026-07-03T11:01:00Z'
      },
      {
        id: 'img-2-3',
        carId: 'car-2',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-2-3',
        sizeBytes: 300000,
        sortOrder: 2,
        isCover: false,
        createdAt: '2026-07-03T11:02:00Z'
      },
      {
        id: 'img-2-4',
        carId: 'car-2',
        url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-2-4',
        sizeBytes: 315000,
        sortOrder: 3,
        isCover: false,
        createdAt: '2026-07-03T11:03:00Z'
      },
      {
        id: 'img-2-5',
        carId: 'car-2',
        url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-2-5',
        sizeBytes: 330000,
        sortOrder: 4,
        isCover: false,
        createdAt: '2026-07-03T11:04:00Z'
      }
    ],
    inspectionReport: {
      mesin: { status: 'good', note: 'Sangat bersih terawat, mesin i-VTEC kering tanpa rembes, tarikan responsif, oli mesin baru diganti.' },
      transmisi: { status: 'good', note: 'Transmisi CVT sangat halus dan responsif, tiptronic paddle shift berfungsi sempurna.' },
      bodi: { status: 'good', note: 'Full orisinil cat mulus luks mengkilap, bebas baret dalam, tidak pernah klaim asuransi cat ulang.' },
      interior: { status: 'good', note: 'Interior full hitam premium, jok kulit orisinil kencang, langit-langit bersih, setir kulit kencang seperti baru.' },
      kakiKaki: { status: 'good', note: 'Kaki-kaki khas Honda kencang padat, shockbreaker mantap tidak ada rembes, ban tebal bawaan pabrik 80%.' },
      kelistrikan: { status: 'good', note: 'Aki prima, tombol keyless lancar, layar monitor tengah normal, AC digital climate control berfungsi normal.' },
      catatanKhusus: 'Unit dalam kondisi prima di atas rata-rata tahunnya, cat orisinil dijamin, tidak ada PR tinggal gas.',
      inspectedBy: 'Suhu Inspector Benny',
      inspectedAt: '2026-07-01'
    }
  },
  {
    id: 'car-3',
    slug: 'mitsubishi-pajero-sport-2018-dakar',
    title: 'Mitsubishi Pajero Sport 2018 Dakar AT',
    brand: 'Mitsubishi',
    model: 'Pajero Sport',
    year: 2018,
    price: 395000000,
    mileage: 72000,
    transmission: CarTransmission.AUTOMATIC,
    fuelType: CarFuelType.DIESEL,
    color: 'Titanium Grey',
    location: 'Bandung Kulon',
    description: '<p>Mitsubishi Pajero Sport tipe tertinggi Dakar transmisi otomatis tahun 2018. Mesin diesel MIVEC Turbo bertenaga badak namun sangat efisien. Gagah, tangguh, berwibawa, dan siap melibas segala medan jalanan.</p><ul><li>Tangan kedua, atas nama pribadi, dokumen lengkap terjamin keasliannya.</li><li>Fasilitas sunroof geser berfungsi lancar anti bocor air.</li><li>Kabin lapang 7-seater dengan AC blower triple mendinginkan seisi mobil secara rata.</li><li>Servis berkala disiplin, pengerjaan di bengkel resmi Mitsubishi.</li></ul>',
    status: CarStatus.PUBLISHED,
    createdBy: 'user-admin',
    createdAt: '2026-07-05T09:00:00Z',
    updatedAt: '2026-07-05T09:00:00Z',
    images: [
      {
        id: 'img-3-1',
        carId: 'car-3',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-3-1',
        sizeBytes: 310000,
        sortOrder: 0,
        isCover: true,
        createdAt: '2026-07-05T09:00:00Z'
      },
      {
        id: 'img-3-2',
        carId: 'car-3',
        url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-3-2',
        sizeBytes: 305000,
        sortOrder: 1,
        isCover: false,
        createdAt: '2026-07-05T09:01:00Z'
      },
      {
        id: 'img-3-3',
        carId: 'car-3',
        url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-3-3',
        sizeBytes: 320000,
        sortOrder: 2,
        isCover: false,
        createdAt: '2026-07-05T09:02:00Z'
      },
      {
        id: 'img-3-4',
        carId: 'car-3',
        url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-3-4',
        sizeBytes: 290000,
        sortOrder: 3,
        isCover: false,
        createdAt: '2026-07-05T09:03:00Z'
      },
      {
        id: 'img-3-5',
        carId: 'car-3',
        url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
        fileHash: 'hash-3-5',
        sizeBytes: 340000,
        sortOrder: 4,
        isCover: false,
        createdAt: '2026-07-05T09:04:00Z'
      }
    ],
    inspectionReport: {
      mesin: { status: 'good', note: 'Mesin diesel MIVEC 4N15 prima, turbo aktif padat, suara diesel khas halus rata, tidak ngebos, kering bebas rembes.' },
      transmisi: { status: 'good', note: 'Otomatis 8-speed sangat responsif, perpindahan presisi dan bertenaga besar di tanjakan.' },
      bodi: { status: 'minor', note: 'Cat bodi orisinil, terdapat baret minor pemakaian wajar di bumper depan kiri dan baret tipis akibat ranting di kap mesin.' },
      interior: { status: 'good', note: 'Full leather seat orisinil hitam terawat, jok elektrik driver aktif lancar, sunroof aman bebas bocor air.' },
      kakiKaki: { status: 'good', note: 'Kokoh khas Pajero, link stabilizer & tie rod baru diganti orisinil, ban tebal 4 pcs merk Toyo 80%.' },
      kelistrikan: { status: 'good', note: 'Kelistrikan sensor normal, rem parkir elektrik, HSA, ASTC normal, sunroof lancar, AC dingin rata.' },
      catatanKhusus: 'Bebas banjir dan kecelakaan parah. Surat-surat dan riwayat servis lengkap di bengkel resmi Mitsubishi.',
      inspectedBy: 'Suhu Inspector Benny',
      inspectedAt: '2026-07-03'
    }
  },
  {
    id: 'car-4',
    slug: 'honda-brio-2020-satya-e-cvt',
    title: 'Honda Brio 2020 Satya E CVT',
    brand: 'Honda',
    model: 'Brio',
    year: 2020,
    price: 138000000,
    mileage: 41200,
    transmission: CarTransmission.CVT,
    fuelType: CarFuelType.GASOLINE,
    color: 'Rallye Red',
    location: 'Bandung Wetan',
    description: '<p>Honda Brio Satya tipe E dengan transmisi otomatis CVT tahun 2020. City car lincah, sangat irit bensin, mudah diparkir, dan menjadi favorit anak muda maupun keluarga kecil di perkotaan.</p>',
    status: CarStatus.DRAFT,
    createdBy: 'user-admin',
    createdAt: '2026-07-06T15:00:00Z',
    updatedAt: '2026-07-06T15:00:00Z',
    images: []
  }
];

const INITIAL_ARTICLES: Article[] = [
  {
    id: 'article-1',
    slug: '5-tips-merawat-mesin-mobil-matic-biar-awet',
    title: '5 Tips Merawat Transmisi Mobil Matic Biar Awet',
    excerpt: 'Mobil transmisi otomatis atau matic memerlukan perawatan yang sedikit berbeda dibanding transmisi manual. Temukan tips jitu di sini agar transmisi Anda awet hingga ratusan ribu kilometer.',
    content: '<p>Mobil dengan transmisi otomatis (matic) kian digemari masyarakat perkotaan berkat kepraktisan dan kemudahannya yang membebaskan pengemudi dari rasa lelah menginjak kopling di kala macet melanda. Namun, kemudahan ini menuntut perhatian ekstra pada pemeliharaan sistem transmisi matic yang terkenal sensitif dan cukup mahal biaya perbaikannya jika terjadi kerusakan fatal.</p><p>Sebagai kurator ahli dengan rekam jejak panjang di industri otomotif, berikut adalah <strong>5 langkah praktis untuk merawat transmisi matic Anda agar tetap awet, responsif, dan prima:</strong></p><h3>1. Disiplin Mengganti Oli Transmisi (ATF)</h3><p>Oli transmisi otomatis tidak hanya berfungsi sebagai pelumas, tetapi juga sebagai penyalur daya hidrolik. Gantilah oli transmisi matic secara teratur sesuai buku panduan servis berkala (biasanya berkisar antara 20.000 km hingga 40.000 km). Pastikan spesifikasi oli ATF yang digunakan sesuai rekomendasi pabrikan.</p><h3>2. Hindari Memindahkan Gigi Secara Kasar Saat Mobil Masih Melaju</h3><p>Kebiasaan buruk memindahkan tuas dari D (Drive) ke R (Reverse) atau sebaliknya saat mobil belum berhenti sepenuhnya dapat mengakibatkan tekanan benturan mekanik yang berat pada komponen gearbox. Pastikan mobil dalam kondisi <strong>berhenti total</strong> baru pindahkan tuas gigi.</p><h3>3. Gunakan Gigi N (Netral) Saat Macet Panjang atau Lampu Merah</h3><p>Saat berhenti cukup lama di lampu merah atau kemacetan, sebaiknya pindahkan tuas dari D ke N dan tarik rem tangan. Membiarkan tuas di D sambil menginjak rem terus-menerus akan membuat mesin dan transmisi bekerja keras secara statis, memicu overheat pada oli transmisi yang mempercepat keausan komponen gesek internal.</p><h3>4. Perhatikan Beban Maksimum Kendaraan</h3><p>Transmisi matic bekerja keras menyalurkan tenaga mesin ke roda. Mengangkut muatan yang melebihi kapasitas desain mobil secara berulang dapat menimbulkan panas berlebih (overheating) pada komponen transmisi otomatis, mempersingkat masa pakainya secara drastis.</p><h3>5. Lakukan Pemanasan Mesin yang Cukup Sebelum Jalan</h3><p>Sebelum menjalankan mobil pertama kali di pagi hari, panaskan mesin sekitar 1-2 menit agar sirkulasi oli transmisi merata dan mencapai suhu kerja optimal. Hindari langsung menginjak pedal gas dalam-dalam begitu mesin baru dihidupkan.</p><p>Dengan menerapkan kelima kebiasaan sehat di atas, transmisi otomatis mobil Anda dijamin akan memiliki umur pakai yang jauh lebih panjang, menyajikan perpindahan gigi yang halus, dan menghindarkan Anda dari biaya turun setengah mesin matic yang menguras dompet.</p>',
    coverImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    tags: ['tips', 'perawatan', 'mobil-matic'],
    readingTimeMinutes: 3,
    status: ArticleStatus.PUBLISHED,
    seoTitle: 'Cara Merawat Transmisi Mobil Matic Agar Awet & Halus | SuhuMobil',
    seoDescription: 'Temukan 5 tips jitu merawat transmisi otomatis (matic) mobil Anda dari ahlinya agar terhindar dari overheat dan biaya turun mesin yang mahal.',
    authorId: 'user-admin',
    publishedAt: '2026-07-02T08:00:00Z',
    createdAt: '2026-07-02T08:00:00Z',
    updatedAt: '2026-07-02T08:00:00Z'
  },
  {
    id: 'article-2',
    slug: 'panduan-membeli-mobil-bekas-bebas-banjir-dan-tabrak-besar',
    title: 'Panduan Membeli Mobil Bekas Bebas Banjir dan Tabrak Besar',
    excerpt: 'Jangan sampai tertipu penampilan luar yang mengkilap! Pelajari ciri fisik krusial untuk mendeteksi mobil bekas banjir atau bekas kecelakaan fatal bersama SuhuMobil.',
    content: '<p>Membeli mobil bekas berkualitas tinggi memang merupakan langkah finansial yang cerdas dibanding menanggung depresiasi harga mobil baru. Namun, pasar mobil bekas menyimpan ranjau bagi calon pembeli yang kurang teliti, terutama risiko mendapatkan unit bekas tabrak besar (sasis bengkok) atau bekas terendam banjir.</p><p>Mari kita ulas tuntas panduan mendeteksi dua kondisi buruk ini agar Anda dapat bertransaksi dengan aman:</p><h3>Bagian I: Mendeteksi Mobil Bekas Tabrak Besar</h3><ol><li><strong>Perhatikan Keselarasan Garis Bodi (Gap Antar Panel):</strong> Celah antara kap mesin, pintu, dan fender harus sama rata kiri dan kanan. Jika celah tidak simetris, kemungkinan panel tersebut pernah diganti atau dipasang ulang pasca benturan.</li><li><strong>Periksa Tulang Sasis (Apron & Support Radiator):</strong> Buka kap mesin dan periksa sasis bagian depan. Titik las pabrik harus bulat sempurna dan catnya rata. Sasis bekas tabrakan biasanya memiliki kerutan, bekas las kasar, atau cat yang tidak rata.</li><li><strong>Cek Karet Pintu dan Pilar Bodi (Pillar A, B, C):</strong> Tarik karet penutup pintu dan periksa spot welding pabrikan. Jika spot-welding hilang atau diganti dempulan tebal, pilar tersebut kemungkinan pernah penyok akibat benturan samping atau terguling.</li></ol><h3>Bagian II: Mendeteksi Mobil Bekas Terendam Banjir</h3><ol><li><strong>Aroma Kabin yang Khas Apek:</strong> Bau apek atau lembab yang disamarkan dengan parfum menyengat adalah indikator awal kabin pernah basah kuyup akibat banjir.</li><li><strong>Karat Halus di Kolong Jok dan Pedal-pedal:</strong> Periksa bagian kolong jok depan, per pengatur, dan batang pedal gas/rem. Besi un-painted di area ini sangat mudah berkarat jika terendam air banjir dalam waktu lama.</li><li><strong>Endapan Lumpur Halus di Sela-sela Karet & Sekring:</strong> Buka penutup sekring kabin (fuse box) dan sela-sela karet karet pintu. Lumpur halus akibat banjir sangat sulit dibersihkan dari sela-sela sempit ini meskipun mobil telah salon detailer.</li></ol><p>Jika Anda merasa kurang percaya diri untuk melakukan pengecekan mandiri, sangat disarankan menggunakan jasa inspeksi profesional terpercaya seperti tim kurator <strong>SuhuMobil</strong>. Seluruh kendaraan di katalog kami dijamin telah melalui proses filtrasi ketat ini demi keselamatan dan kenyamanan berkendara Anda.</p>',
    coverImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
    tags: ['panduan', 'tips-beli', 'mobil-bekas'],
    readingTimeMinutes: 4,
    status: ArticleStatus.PUBLISHED,
    seoTitle: 'Ciri-ciri Mobil Bekas Banjir & Tabrak Besar yang Wajib Dihindari',
    seoDescription: 'Buku panduan lengkap mendeteksi sasis bekas tabrakan dan komponen interior berkarat akibat terendam banjir agar terhindar dari jebakan mobil bekas zonk.',
    authorId: 'user-admin',
    publishedAt: '2026-07-04T09:00:00Z',
    createdAt: '2026-07-04T09:00:00Z',
    updatedAt: '2026-07-04T09:00:00Z'
  }
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Ahmad Jayadi',
    email: 'ahmad.jayadi@gmail.com',
    phone: '081288889999',
    city: 'Jakarta Selatan',
    budget: 160000000,
    carInterest: 'Toyota Avanza 2019',
    subject: LeadSubject.PRICE_INQUIRY,
    message: 'Halo, saya Ahmad. Tertarik dengan Avanza 2019 G MT. Apakah harganya masih bisa kurang sedikit? Dan boleh dijadwalkan melihat unit sabtu ini?',
    carId: 'car-1',
    source: LeadSource.WHATSAPP_CTA,
    status: LeadStatus.NEW,
    notes: undefined,
    createdAt: '2026-07-08T10:00:00Z',
    updatedAt: '2026-07-08T10:00:00Z'
  },
  {
    id: 'lead-2',
    name: 'Siska Amelia',
    phone: '087711223344',
    city: 'Bandung Kota',
    budget: 250000000,
    carInterest: 'Honda HR-V atau sejenisnya budget 250jt',
    source: LeadSource.DREAM_CAR_FORM,
    status: LeadStatus.CONTACTED,
    notes: 'Sudah dihubungi via WA. Kak Siska sedang mempertimbangkan unit HRV 2021 putih di katalog kita. Rencana mau janjian survey hari Sabtu siang.',
    createdAt: '2026-07-07T14:30:00Z',
    updatedAt: '2026-07-08T09:15:00Z'
  }
];

const generateInitialTrackingLogs = (): TrackingLog[] => {
  const logs: TrackingLog[] = [];
  const sources = ['whatsapp', 'facebook', 'instagram', 'tiktok', 'telegram', 'custom'];
  const cars = [
    { id: 'car-1', title: 'Toyota Avanza 2019 G MT' },
    { id: 'car-2', title: 'Honda HR-V 2021 E CVT' },
    { id: 'car-3', title: 'Mitsubishi Pajero Sport 2018' }
  ];
  
  const now = new Date();
  
  // Generate logs over the last 14 days
  for (let i = 14; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    
    sources.forEach(source => {
      let visitMultiplier = 1;
      if (source === 'tiktok') visitMultiplier = 2.4;
      if (source === 'instagram') visitMultiplier = 1.9;
      if (source === 'whatsapp') visitMultiplier = 1.3;
      if (source === 'facebook') visitMultiplier = 0.8;

      const numVisits = Math.floor((Math.random() * 12 + 6) * visitMultiplier);
      const numClicks = Math.floor((Math.random() * 4 + 1) * (visitMultiplier * 0.7));
      const numLeads = Math.random() > 0.6 ? Math.floor(Math.random() * 2 + 1) : 0;

      for (let v = 0; v < numVisits; v++) {
        const car = cars[Math.floor(Math.random() * cars.length)];
        const logTime = new Date(date);
        logTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        logs.push({
          id: `log-v-${date.getTime()}-${v}-${Math.floor(Math.random() * 100000)}`,
          type: 'visit',
          source,
          carId: car.id,
          carTitle: car.title,
          timestamp: logTime.toISOString()
        });
      }

      for (let c = 0; c < numClicks; c++) {
        const car = cars[Math.floor(Math.random() * cars.length)];
        const logTime = new Date(date);
        logTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        logs.push({
          id: `log-c-${date.getTime()}-${c}-${Math.floor(Math.random() * 100000)}`,
          type: 'click',
          source,
          carId: car.id,
          carTitle: car.title,
          timestamp: logTime.toISOString()
        });
      }

      for (let l = 0; l < numLeads; l++) {
        const car = cars[Math.floor(Math.random() * cars.length)];
        const logTime = new Date(date);
        logTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        logs.push({
          id: `log-l-${date.getTime()}-${l}-${Math.floor(Math.random() * 100000)}`,
          type: 'lead',
          source,
          carId: car.id,
          carTitle: car.title,
          timestamp: logTime.toISOString()
        });
      }
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

class MockDatabase {
  private cars: Car[] = [];
  private leads: Lead[] = [];
  private articles: Article[] = [];
  private curators: Curator[] = [];
  private trackingLogs: TrackingLog[] = [];
  private settings: AdminSettings = INITIAL_SETTINGS;
  private currentUser: User | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const storedCars = localStorage.getItem('suhumobil_cars');
      const storedLeads = localStorage.getItem('suhumobil_leads');
      const storedArticles = localStorage.getItem('suhumobil_articles');
      const storedCurators = localStorage.getItem('suhumobil_curators');
      const storedTrackingLogs = localStorage.getItem('suhumobil_tracking_logs');
      const storedSettings = localStorage.getItem('suhumobil_settings');
      const storedUser = localStorage.getItem('suhumobil_current_user');

      this.cars = storedCars ? JSON.parse(storedCars) : INITIAL_CARS;
      this.leads = storedLeads ? JSON.parse(storedLeads) : INITIAL_LEADS;
      this.articles = storedArticles ? JSON.parse(storedArticles) : INITIAL_ARTICLES;
      this.curators = storedCurators ? JSON.parse(storedCurators) : INITIAL_CURATORS;
      this.settings = storedSettings ? JSON.parse(storedSettings) : INITIAL_SETTINGS;
      this.currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (storedTrackingLogs) {
        this.trackingLogs = JSON.parse(storedTrackingLogs);
      } else {
        this.trackingLogs = generateInitialTrackingLogs();
        this.saveTrackingLogs();
      }

      // Ensure data is saved back if first load
      if (!storedCars) this.saveCars();
      if (!storedLeads) this.saveLeads();
      if (!storedArticles) this.saveArticles();
      if (!storedCurators) this.saveCurators();
      if (!storedSettings) this.saveSettings();
    } else {
      this.cars = INITIAL_CARS;
      this.leads = INITIAL_LEADS;
      this.articles = INITIAL_ARTICLES;
      this.curators = INITIAL_CURATORS;
      this.trackingLogs = [];
      this.settings = INITIAL_SETTINGS;
    }
  }

  private saveCars() {
    localStorage.setItem('suhumobil_cars', JSON.stringify(this.cars));
  }

  private saveLeads() {
    localStorage.setItem('suhumobil_leads', JSON.stringify(this.leads));
  }

  private saveArticles() {
    localStorage.setItem('suhumobil_articles', JSON.stringify(this.articles));
  }

  private saveCurators() {
    localStorage.setItem('suhumobil_curators', JSON.stringify(this.curators));
  }

  private saveTrackingLogs() {
    localStorage.setItem('suhumobil_tracking_logs', JSON.stringify(this.trackingLogs));
  }

  private saveSettings() {
    localStorage.setItem('suhumobil_settings', JSON.stringify(this.settings));
  }

  // --- AUTH OPERATIONS ---
  login(email: string, passwordHash: string): User {
    const user = INITIAL_USERS.find(u => u.email === email);
    if (!user || passwordHash !== 'secret123') {
      throw new Error('Email atau password salah');
    }
    this.currentUser = user;
    localStorage.setItem('suhumobil_current_user', JSON.stringify(user));
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('suhumobil_current_user');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // --- CAR OPERATIONS ---
  getCars(filters?: {
    brand?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    transmission?: string;
    search?: string;
    status?: string;
  }): Car[] {
    let list = this.cars;

    // By default, public endpoint shows only PUBLISHED cars
    if (!filters?.status) {
      list = list.filter(c => c.status === CarStatus.PUBLISHED);
    } else if (filters.status !== 'ALL') {
      list = list.filter(c => c.status === filters.status);
    }

    if (filters?.brand) {
      list = list.filter(c => c.brand.toLowerCase() === filters.brand?.toLowerCase());
    }
    if (filters?.location) {
      list = list.filter(c => c.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    if (filters?.minPrice !== undefined) {
      list = list.filter(c => c.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      list = list.filter(c => c.price <= filters.maxPrice!);
    }
    if (filters?.transmission) {
      list = list.filter(c => c.transmission === filters.transmission);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.brand.toLowerCase().includes(searchLower) ||
        c.model.toLowerCase().includes(searchLower)
      );
    }

    return list;
  }

  getCarById(id: string): Car | undefined {
    return this.cars.find(c => c.id === id);
  }

  getCarBySlug(slug: string): Car | undefined {
    return this.cars.find(c => c.slug === slug);
  }

  createCar(carData: Omit<Car, 'id' | 'slug' | 'status' | 'images' | 'createdBy' | 'createdAt' | 'updatedAt'>): Car {
    const slug = carData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const isSlugTaken = this.cars.some(c => c.slug === slug);
    const finalSlug = isSlugTaken ? `${slug}-${Math.random().toString(36).substring(2, 6)}` : slug;

    const newCar: Car = {
      ...carData,
      id: `car-${Date.now()}`,
      slug: finalSlug,
      status: CarStatus.DRAFT,
      images: [],
      createdBy: this.currentUser?.id || 'user-admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.cars.push(newCar);
    this.saveCars();
    return newCar;
  }

  updateCar(id: string, carData: Partial<Car>): Car {
    const idx = this.cars.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('CAR_NOT_FOUND');

    const updated = {
      ...this.cars[idx],
      ...carData,
      updatedAt: new Date().toISOString()
    };

    this.cars[idx] = updated;
    this.saveCars();
    return updated;
  }

  updateCarStatus(id: string, status: CarStatus): Car {
    const car = this.getCarById(id);
    if (!car) throw new Error('CAR_NOT_FOUND');

    // Rule: PUBLISHED needs at least 5 images
    if (status === CarStatus.PUBLISHED && car.images.length < 5) {
      throw new Error('IMAGE_MINIMUM_NOT_MET');
    }

    return this.updateCar(id, { status });
  }

  deleteCar(id: string) {
    const idx = this.cars.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('CAR_NOT_FOUND');
    
    // In mock database, we can do hard/soft delete
    this.cars.splice(idx, 1);
    this.saveCars();
  }

  // --- CAR IMAGES OPERATIONS ---
  uploadCarImage(carId: string, url: string, isCover = false): Car {
    const car = this.getCarById(carId);
    if (!car) throw new Error('CAR_NOT_FOUND');

    if (car.images.length >= 20) {
      throw new Error('IMAGE_LIMIT_EXCEEDED');
    }

    const imageId = `img-${carId}-${Date.now()}`;
    const newImage = {
      id: imageId,
      carId,
      url,
      fileHash: `hash-${imageId}`,
      sizeBytes: Math.floor(Math.random() * 200000) + 150000, // 150kb - 350kb
      sortOrder: car.images.length,
      isCover: car.images.length === 0 ? true : isCover,
      createdAt: new Date().toISOString()
    };

    // If setting to cover, other images cover to false
    let updatedImages = [...car.images];
    if (newImage.isCover) {
      updatedImages = updatedImages.map(img => ({ ...img, isCover: false }));
    }
    updatedImages.push(newImage);

    return this.updateCar(carId, { images: updatedImages });
  }

  setCarImageCover(carId: string, imageId: string): Car {
    const car = this.getCarById(carId);
    if (!car) throw new Error('CAR_NOT_FOUND');

    const updatedImages = car.images.map(img => ({
      ...img,
      isCover: img.id === imageId
    }));

    return this.updateCar(carId, { images: updatedImages });
  }

  reorderCarImages(carId: string, imageOrders: { id: string; sortOrder: number }[]): Car {
    const car = this.getCarById(carId);
    if (!car) throw new Error('CAR_NOT_FOUND');

    const updatedImages = car.images.map(img => {
      const ord = imageOrders.find(o => o.id === img.id);
      return ord ? { ...img, sortOrder: ord.sortOrder } : img;
    }).sort((a, b) => a.sortOrder - b.sortOrder);

    return this.updateCar(carId, { images: updatedImages });
  }

  deleteCarImage(carId: string, imageId: string): Car {
    const car = this.getCarById(carId);
    if (!car) throw new Error('CAR_NOT_FOUND');

    const isCoverDeleted = car.images.find(img => img.id === imageId)?.isCover;
    let updatedImages = car.images.filter(img => img.id !== imageId);

    // If cover was deleted and we still have images, assign first image as cover
    if (isCoverDeleted && updatedImages.length > 0) {
      updatedImages[0].isCover = true;
    }

    return this.updateCar(carId, { images: updatedImages });
  }

  // --- LEAD OPERATIONS ---
  getLeads(filters?: { status?: string; source?: string; search?: string }): Lead[] {
    let list = this.leads;

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(l => l.status === filters.status);
    }
    if (filters?.source && filters.source !== 'ALL') {
      list = list.filter(l => l.source === filters.source);
    }
    if (filters?.search) {
      const lower = filters.search.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(lower) ||
        l.phone.includes(lower)
      );
    }

    // Sort by newest
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getLeadById(id: string): Lead | undefined {
    return this.leads.find(l => l.id === id);
  }

  createLead(leadData: Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: LeadStatus.NEW,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.leads.push(newLead);
    this.saveLeads();

    // Register conversion in tracking
    if (typeof window !== 'undefined') {
      try {
        const refSource = sessionStorage.getItem('suhumobil_ref_source');
        if (refSource) {
          this.registerLeadConversion(leadData.carId, refSource);
        }
      } catch (err) {
        console.error('Error tracking lead conversion:', err);
      }
    }

    return newLead;
  }

  updateLeadStatus(id: string, status: LeadStatus, notes?: string): Lead {
    const idx = this.leads.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('LEAD_NOT_FOUND');

    const updated = {
      ...this.leads[idx],
      status,
      ...(notes !== undefined ? { notes } : {}),
      updatedAt: new Date().toISOString()
    };

    this.leads[idx] = updated;
    this.saveLeads();
    return updated;
  }

  // --- ARTICLE OPERATIONS ---
  getArticles(filters?: { status?: string; search?: string; tag?: string }): Article[] {
    let list = this.articles;

    // By default, public view shows only PUBLISHED articles
    if (!filters?.status) {
      list = list.filter(a => a.status === ArticleStatus.PUBLISHED);
    } else if (filters.status !== 'ALL') {
      list = list.filter(a => a.status === filters.status);
    }

    if (filters?.tag) {
      list = list.filter(a => a.tags.includes(filters.tag!));
    }

    if (filters?.search) {
      const lower = filters.search.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(lower) ||
        a.excerpt.toLowerCase().includes(lower)
      );
    }

    return [...list].sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime();
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }

  getArticleBySlug(slug: string): Article | undefined {
    return this.articles.find(a => a.slug === slug);
  }

  getArticleById(id: string): Article | undefined {
    return this.articles.find(a => a.id === id);
  }

  createArticle(articleData: Omit<Article, 'id' | 'slug' | 'status' | 'readingTimeMinutes' | 'authorId' | 'createdAt' | 'updatedAt'>): Article {
    const slug = articleData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const isSlugTaken = this.articles.some(a => a.slug === slug);
    const finalSlug = isSlugTaken ? `${slug}-${Math.random().toString(36).substring(2, 6)}` : slug;

    // Calculate reading time roughly: words / 200, min 1
    const text = articleData.content.replace(/<[^>]*>/g, '');
    const wordCount = text.trim().split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const newArticle: Article = {
      ...articleData,
      id: `article-${Date.now()}`,
      slug: finalSlug,
      status: ArticleStatus.DRAFT,
      readingTimeMinutes,
      authorId: this.currentUser?.id || 'user-admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.articles.push(newArticle);
    this.saveArticles();
    return newArticle;
  }

  updateArticle(id: string, articleData: Partial<Article>): Article {
    const idx = this.articles.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('ARTICLE_NOT_FOUND');

    let additional: Partial<Article> = {};
    if (articleData.content) {
      const text = articleData.content.replace(/<[^>]*>/g, '');
      const wordCount = text.trim().split(/\s+/).length;
      additional.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    }

    const updated = {
      ...this.articles[idx],
      ...articleData,
      ...additional,
      updatedAt: new Date().toISOString()
    };

    this.articles[idx] = updated;
    this.saveArticles();
    return updated;
  }

  updateArticleStatus(id: string, status: ArticleStatus): Article {
    const article = this.getArticleById(id);
    if (!article) throw new Error('ARTICLE_NOT_FOUND');

    if (status === ArticleStatus.PUBLISHED && !article.coverImage) {
      throw new Error('Mohon upload cover image terlebih dahulu sebelum melakukan publikasi');
    }

    const publishedAt = status === ArticleStatus.PUBLISHED ? (article.publishedAt || new Date().toISOString()) : article.publishedAt;

    return this.updateArticle(id, { status, publishedAt });
  }

  deleteArticle(id: string) {
    const idx = this.articles.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('ARTICLE_NOT_FOUND');

    this.articles.splice(idx, 1);
    this.saveArticles();
  }

  // --- SETTINGS OPERATIONS ---
  getPublicSettings(): PublicSettings {
    return {
      siteTitle: this.settings.siteTitle,
      whatsappNumber: this.settings.whatsappNumber,
      socialLinks: this.settings.socialLinks,
      watermark: this.settings.watermark,
      businessProfile: this.settings.businessProfile,
      gtmId: this.settings.gtmId,
      ga4Id: this.settings.ga4Id
    };
  }

  getAdminSettings(): AdminSettings {
    return this.settings;
  }

  updateSettings(newSettings: Partial<AdminSettings>): AdminSettings {
    this.settings = {
      ...this.settings,
      ...newSettings,
      businessProfile: {
        ...this.settings.businessProfile,
        ...(newSettings.businessProfile || {})
      },
      socialLinks: {
        ...this.settings.socialLinks,
        ...(newSettings.socialLinks || {})
      },
      watermark: {
        ...this.settings.watermark,
        ...(newSettings.watermark || {})
      }
    };
    this.saveSettings();
    return this.settings;
  }

  // --- STATS OPERATION ---
  getDashboardStats(): DashboardStats {
    const storageUsedBytes = this.cars.reduce((sum, car) => {
      return sum + car.images.reduce((carSum, img) => carSum + img.sizeBytes, 0);
    }, 0);

    const storageUsedMb = Number((storageUsedBytes / (1024 * 1024)).toFixed(2));
    const storageQuotaMb = this.settings.storageQuotaGb * 1024;

    return {
      totalCars: this.cars.length,
      publishedCars: this.cars.filter(c => c.status === CarStatus.PUBLISHED).length,
      soldCars: this.cars.filter(c => c.status === CarStatus.SOLD).length,
      totalLeads: this.leads.length,
      newLeads: this.leads.filter(l => l.status === LeadStatus.NEW).length,
      totalArticles: this.articles.length,
      publishedArticles: this.articles.filter(a => a.status === ArticleStatus.PUBLISHED).length,
      storageUsedMb,
      storageQuotaMb
    };
  }

  // --- CURATOR OPERATIONS ---
  getCurators(filters?: { search?: string }): Curator[] {
    let list = this.curators || [];
    if (filters?.search) {
      const lower = filters.search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower) ||
        (c.role && c.role.toLowerCase().includes(lower))
      );
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getCuratorById(id: string): Curator | undefined {
    return (this.curators || []).find(c => c.id === id);
  }

  createCurator(curatorData: Omit<Curator, 'id' | 'createdAt' | 'updatedAt'>): Curator {
    const newCurator: Curator = {
      ...curatorData,
      id: `curator-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.curators) this.curators = [];
    this.curators.push(newCurator);
    this.saveCurators();
    return newCurator;
  }

  updateCurator(id: string, curatorData: Partial<Curator>): Curator {
    const idx = (this.curators || []).findIndex(c => c.id === id);
    if (idx === -1) throw new Error('CURATOR_NOT_FOUND');

    const updated = {
      ...this.curators[idx],
      ...curatorData,
      updatedAt: new Date().toISOString()
    };

    this.curators[idx] = updated;
    this.saveCurators();
    return updated;
  }

  deleteCurator(id: string) {
    const idx = (this.curators || []).findIndex(c => c.id === id);
    if (idx === -1) throw new Error('CURATOR_NOT_FOUND');

    this.curators.splice(idx, 1);
    this.saveCurators();
  }

  // --- TRACKING OPERATIONS ---
  registerVisit(carId?: string, source?: string) {
    if (!source) return;
    const car = carId ? this.getCarById(carId) : undefined;
    const newLog: TrackingLog = {
      id: `log-v-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      type: 'visit',
      source: source.toLowerCase(),
      carId,
      carTitle: car?.title,
      timestamp: new Date().toISOString()
    };
    if (!this.trackingLogs) this.trackingLogs = [];
    this.trackingLogs.unshift(newLog);
    this.saveTrackingLogs();
  }

  registerClick(carId?: string, source?: string) {
    if (!source) return;
    const car = carId ? this.getCarById(carId) : undefined;
    const newLog: TrackingLog = {
      id: `log-c-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      type: 'click',
      source: source.toLowerCase(),
      carId,
      carTitle: car?.title,
      timestamp: new Date().toISOString()
    };
    if (!this.trackingLogs) this.trackingLogs = [];
    this.trackingLogs.unshift(newLog);
    this.saveTrackingLogs();
  }

  registerLeadConversion(carId?: string, source?: string) {
    if (!source) return;
    const car = carId ? this.getCarById(carId) : undefined;
    const newLog: TrackingLog = {
      id: `log-l-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      type: 'lead',
      source: source.toLowerCase(),
      carId,
      carTitle: car?.title,
      timestamp: new Date().toISOString()
    };
    if (!this.trackingLogs) this.trackingLogs = [];
    this.trackingLogs.unshift(newLog);
    this.saveTrackingLogs();
  }

  getSystemInsight(): SystemInsight {
    const logs = this.trackingLogs || [];
    const totalVisits = logs.filter(l => l.type === 'visit').length;
    const totalClicks = logs.filter(l => l.type === 'click').length;
    const totalLeads = logs.filter(l => l.type === 'lead').length;

    const sources = ['whatsapp', 'facebook', 'instagram', 'tiktok', 'telegram', 'custom'];
    const bySource = sources.map(source => {
      return {
        source,
        visits: logs.filter(l => l.source === source && l.type === 'visit').length,
        clicks: logs.filter(l => l.source === source && l.type === 'click').length,
        leads: logs.filter(l => l.source === source && l.type === 'lead').length
      };
    });

    const customSources = Array.from(new Set(logs.map(l => l.source)))
      .filter(s => !sources.includes(s));
    
    customSources.forEach(source => {
      bySource.push({
        source,
        visits: logs.filter(l => l.source === source && l.type === 'visit').length,
        clicks: logs.filter(l => l.source === source && l.type === 'click').length,
        leads: logs.filter(l => l.source === source && l.type === 'lead').length
      });
    });

    const carMap: Record<string, { carId: string; carTitle: string; visits: number; clicks: number }> = {};
    logs.forEach(l => {
      if (l.carId) {
        if (!carMap[l.carId]) {
          carMap[l.carId] = {
            carId: l.carId,
            carTitle: l.carTitle || 'Unit Tidak Diketahui',
            visits: 0,
            clicks: 0
          };
        }
        if (l.type === 'visit') carMap[l.carId].visits++;
        if (l.type === 'click') carMap[l.carId].clicks++;
      }
    });

    const byCar = Object.values(carMap).sort((a, b) => (b.visits + b.clicks) - (a.visits + a.clicks)).slice(0, 10);

    return {
      totalVisits,
      totalClicks,
      totalLeads,
      bySource,
      byCar,
      recentLogs: logs.slice(0, 100)
    };
  }
}

export const mockDb = new MockDatabase();
