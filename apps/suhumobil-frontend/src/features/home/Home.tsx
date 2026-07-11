/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, Compass, PhoneCall, ArrowRight, Star } from 'lucide-react';
import { carsService } from '../../services/cars.service';
import { curatorsService } from '../../services/curators.service';
import { contentSectionsService } from '../../services/content-sections.service';
import { Car, Curator } from '../../types';
import { formatRupiah, formatMileage } from '../../utils/format';
import Watermark from '../../components/Watermark';

// Fallback default — dipakai kalau data CMS belum sempat termuat / API gagal
// (defense in depth, sesuai 09-perbaikan-dan-fitur-tambahan.md Section 4)
const DEFAULT_LANDING_CONTENT = {
  hero: {
    headline: 'Beli Mobil Bekas Tanpa Was-Was',
    subheadline:
      'Selamat datang di SuhuMobil. Setiap mobil melewati kurasi & inspeksi mendalam di 150+ titik secara independen oleh teknisi senior. Jaminan kondisi jujur, harga adil, dan kepuasan aman.',
    ctaLabel: 'Jelajahi Katalog',
  },
  trust: {
    items: [
      { icon: 'shield', title: 'Kurasi Ahli 150+ Titik', description: 'Setiap mobil wajib lolos inspeksi 150+ titik mencakup mesin, transmisi, sasis, kaki-kaki, kelistrikan, serta bebas sanksi/banjir/tabrak besar.' },
      { icon: 'eye', title: 'Kondisi Jujur & Transparan', description: 'Kami menyertakan rincian lengkap laporan inspeksi, foto asli tanpa rekayasa, dan deskripsi kekurangan minor apa adanya. Tidak ada rahasia.' },
      { icon: 'message-circle', title: 'Konsultasi Personal', description: 'Dapatkan bimbingan gratis dari kurator kami sebelum survey untuk membantu Anda mencocokkan kriteria berkendara dan kesiapan anggaran.' },
    ],
  },
  about_curator_summary: {
    headline: 'Para Ahli & Inspektur Senior',
    narrative: 'Teknisi berpengalaman tinggi yang menjamin transparansi kondisi setiap mobil bekas di showroom kami.',
  },
  cta_footer: {
    headline: 'Cari Mobil Impian Belum Ketemu?',
    ctaLabel: 'Gunakan Jasa Cari Mobil',
  },
};

// Mapping string icon dari backend (CMS) ke komponen lucide-react
const ICON_MAP: Record<string, React.ReactNode> = {
  shield: <ShieldCheck size={24} />,
  eye: <Eye size={24} />,
  'message-circle': <Compass size={24} />,
};

export default function Home() {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [curators, setCurators] = useState<Curator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<typeof DEFAULT_LANDING_CONTENT>(DEFAULT_LANDING_CONTENT);

  useEffect(() => {
    Promise.all([
      carsService.getCars(),
      curatorsService.getCurators()
    ])
      .then(([carsRes, curatorsRes]) => {
        if (carsRes.success) {
          setFeaturedCars(carsRes.data.slice(0, 3));
        }
        if (curatorsRes.success) {
          setCurators(curatorsRes.data);
        }
      })
      .catch(err => console.error('Error fetching homepage data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    contentSectionsService.getPublicContent('landing')
      .then(res => {
        if (res.success) {
          setContent(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(err => console.error('Error fetching landing content:', err));
  }, []);

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-slate-900/40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Star size={12} className="fill-amber-400" /> Kurasi Ahli Pengalaman 25 Tahun
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight">
              {content.hero.headline}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-xl font-light leading-relaxed">
              {content.hero.subheadline}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/cars"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-semibold rounded-xl shadow-lg transition duration-150 flex items-center gap-2"
              >
                {content.hero.ctaLabel} <ArrowRight size={16} />
              </Link>
              <Link
                to="/about"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-medium rounded-xl border border-slate-700 transition duration-150"
              >
                Pelajari Metode Kurasi
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-3xl blur-md opacity-20" />
            <img
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600"
              alt="Premium Car"
              className="relative rounded-2xl shadow-2xl border border-white/5 object-cover h-[350px] w-full"
            />
          </div>
        </div>
      </section>

      {/* 2. TRUST / VALUE PROP SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-display font-bold text-slate-900">Mengapa Memilih SuhuMobil?</h2>
          <p className="text-slate-500 text-sm">Menghilangkan kekhawatiran terbesar Anda saat bertransaksi mobil bekas dengan tiga pilar utama kami.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {content.trust.items.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                {ICON_MAP[item.icon] ?? <ShieldCheck size={24} />}
              </div>
              <h3 className="text-lg font-display font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-sans">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED CARS */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">Rekomendasi Terbaru</h2>
              <p className="text-slate-500 text-sm mt-1">Mobil bekas pilihan kurator terbaik yang baru saja lolos sertifikasi.</p>
            </div>
            <Link
              to="/cars"
              className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1 transition"
            >
              Lihat Semua Unit <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-[380px] border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : featuredCars.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-400 font-sans">Belum ada mobil terpublikasi. Nantikan rekomendasi pilihan kurator kami!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map((car) => {
                const cover = car.images.find(img => img.isCover) || car.images[0];
                return (
                  <div
                    key={car.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group relative"
                  >
                    <div className="relative h-48 bg-slate-200 overflow-hidden">
                      {cover ? (
                        <img
                          src={cover.url}
                          alt={car.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-sans text-xs">
                          Tidak Ada Foto
                        </div>
                      )}
                      <Watermark variant="overlay" />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-amber-600 transition-colors">
                            <Link to={`/cars/${car.slug}`}>{car.title}</Link>
                          </h3>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                            {car.year}
                          </span>
                        </div>
                        <div className="text-amber-600 font-display font-bold text-lg mt-1">
                          {formatRupiah(car.price)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                        <div>Transmisi: <span className="font-semibold text-slate-700">{car.transmission}</span></div>
                        <div>Jarak Tempuh: <span className="font-semibold text-slate-700">{formatMileage(car.mileage)}</span></div>
                        <div>Lokasi: <span className="font-semibold text-slate-700">{car.location}</span></div>
                        <div>Bahan Bakar: <span className="font-semibold text-slate-700">{car.fuelType}</span></div>
                      </div>

                      <div className="pt-2 flex gap-3">
                        <Link
                          to={`/cars/${car.slug}`}
                          className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-semibold rounded-xl text-center transition"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. ABOUT CURATOR SECTION */}
      {curators.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-6 space-y-20 border-t border-slate-200/50 mt-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Mengenal Kurator Utama Kami</span>
            <h2 className="text-3xl font-display font-bold text-slate-900">{content.about_curator_summary.headline}</h2>
            <p className="text-slate-500 text-sm">{content.about_curator_summary.narrative}</p>
          </div>

          <div className="space-y-24">
            {curators.map((curator, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={curator.id}
                  className="grid md:grid-cols-12 gap-12 items-center"
                >
                  <div className={`md:col-span-5 relative ${isEven ? 'md:order-1' : 'md:order-11'}`}>
                    <div className="absolute -inset-3 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl blur-md opacity-25" />
                    <img
                      src={curator.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=500'}
                      alt={curator.name}
                      className="relative rounded-xl shadow-lg border border-slate-200 h-[380px] w-full object-cover object-top"
                    />
                  </div>
                  <div className={`md:col-span-7 space-y-6 ${isEven ? 'md:order-11' : 'md:order-1'}`}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                      {curator.role || 'Kurator Utama'}
                    </span>
                    <h3 className="text-3xl font-display font-bold text-slate-900">{curator.name}</h3>
                    <div className="text-slate-600 font-sans leading-relaxed text-sm space-y-4 whitespace-pre-line">
                      {curator.description}
                    </div>
                    <div className="flex gap-4 pt-2">
                      <Link
                        to="/about"
                        className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-sans text-xs font-semibold rounded-xl transition duration-150"
                      >
                        Baca Selengkapnya
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. SELLER CTA / BOTTOM HERO */}
      <section className="bg-amber-500 py-16 text-slate-950">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-display font-bold">{content.cta_footer.headline}</h2>
          <p className="text-slate-900 text-base max-w-xl mx-auto font-light leading-relaxed">
            Biarkan tim SuhuMobil mencarikan unit terbaik sesuai kriteria, preferensi transmisi, dan anggaran belanja Anda tanpa repot. Kami bantu inspeksi mendalam sebelum Anda membayar.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/contact"
              className="px-6 py-3 bg-slate-950 hover:bg-slate-850 text-white font-semibold rounded-xl shadow-lg transition duration-150"
            >
              {content.cta_footer.ctaLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
