/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Calendar, MapPin, Gauge, Fuel, Palette, Share2 } from 'lucide-react';
import { carsService } from '../../services/cars.service';
import { Car, LeadSource } from '../../types';
import { formatRupiah, formatMileage, formatDate } from '../../utils/format';
import RichTextRenderer from '../../components/RichTextRenderer';
import Watermark from '../../components/Watermark';
import WhatsappLeadPopup from '../../components/WhatsappLeadPopup';
import ShareLinkModal from '../../components/ShareLinkModal';

export default function Detail() {
  const { slug } = useParams<{ slug: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    carsService.getCarBySlug(slug)
      .then(res => {
        if (res.success) {
          setCar(res.data);
          // Set cover image index or index 0
          const images = res.data.images || [];
          const coverIdx = images.findIndex(img => img.isCover);
          setActiveImageIndex(coverIdx !== -1 ? coverIdx : 0);
        }
      })
      .catch(err => {
        console.error('Error fetching car details:', err);
        setError('Mobil tidak ditemukan atau sudah terjual.');
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse space-y-10 font-sans">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-[400px] bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 w-2/3 bg-slate-200 rounded" />
            <div className="h-6 w-1/2 bg-slate-200 rounded" />
            <div className="h-20 w-full bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 px-6 font-sans">
        <div className="text-amber-500 text-5xl mb-4 font-display font-bold">404</div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Mobil Tidak Ditemukan</h2>
        <p className="text-slate-500 text-sm mb-6">{error || 'Halaman yang Anda tuju tidak tersedia.'}</p>
        <Link
          to="/cars"
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition shadow"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const sortedImages = [...(car.images || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeImage = sortedImages[activeImageIndex];

  const renderInspectionStatus = (status: 'good' | 'minor' | 'bad') => {
    switch (status) {
      case 'good':
        return <span className="inline-flex items-center gap-1 text-green-600 font-sans font-semibold text-xs bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={12} /> Baik</span>;
      case 'minor':
        return <span className="inline-flex items-center gap-1 text-amber-600 font-sans font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded-full"><AlertTriangle size={12} /> Catatan</span>;
      case 'bad':
        return <span className="inline-flex items-center gap-1 text-red-600 font-sans font-semibold text-xs bg-red-50 px-2 py-0.5 rounded-full"><XCircle size={12} /> Perbaikan</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-sans text-slate-800">
      {/* Back button */}
      <div className="mb-6">
        <Link to="/cars" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm font-medium transition">
          <ArrowLeft size={16} /> Kembali ke Katalog
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Gallery & Specifications */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Gallery Frame */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-md relative aspect-video flex items-center justify-center border border-slate-200">
            {activeImage ? (
              <img
                src={activeImage.url}
                alt={`${car.title} view ${activeImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 font-sans text-sm">Tidak ada gambar yang tersedia</div>
            )}
            <Watermark variant="overlay" />
          </div>

          {/* Gallery Thumbnails List */}
          {sortedImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 select-none scrollbar-thin">
              {sortedImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200 hover:border-slate-400'}`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  <Watermark variant="overlay" className="scale-50 translate-x-3 translate-y-2 opacity-50" />
                </button>
              ))}
            </div>
          )}

          {/* General Specifications Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-display font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-slate-100">Spesifikasi Kendaraan</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex gap-3 items-center">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Calendar size={20} /></div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Tahun</div>
                  <div className="text-sm font-semibold text-slate-800">{car.year}</div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Gauge size={20} /></div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Jarak Tempuh</div>
                  <div className="text-sm font-semibold text-slate-800">{formatMileage(car.mileage)}</div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><ShieldCheck size={20} /></div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Transmisi</div>
                  <div className="text-sm font-semibold text-slate-800">{car.transmission}</div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Fuel size={20} /></div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Bahan Bakar</div>
                  <div className="text-sm font-semibold text-slate-800">{car.fuelType}</div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Palette size={20} /></div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Warna</div>
                  <div className="text-sm font-semibold text-slate-800">{car.color || '-'}</div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><MapPin size={20} /></div>
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Lokasi</div>
                  <div className="text-sm font-semibold text-slate-800 truncate">{car.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-900 pb-2 border-b border-slate-100">Catatan & Ulasan Unit</h2>
            <RichTextRenderer content={car.description} />
          </div>
        </div>

        {/* RIGHT COLUMN: Buying info, Inspection Card & CTA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Inquiry Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-5">
            <div>
              <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase">Unit Terkurasi</span>
              <h1 className="text-2xl font-display font-bold text-white mt-1 leading-tight">{car.title}</h1>
              <div className="text-3xl font-display font-bold text-amber-500 mt-2">
                {formatRupiah(car.price)}
              </div>
            </div>

            <div className="text-xs text-slate-300 font-light leading-relaxed border-t border-slate-800 pt-4">
              Silakan jadwalkan konsultasi gratis atau buat kesepakatan janji survey dengan menekan tombol konsultasi di bawah. Form pengajuan akan dikirim ke basis data kami sebelum diarahkan langsung ke kurator via WhatsApp.
            </div>

            <button
              onClick={() => setIsPopupOpen(true)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 animate-pulse"
            >
              <MessageSquare size={18} className="text-slate-950 fill-slate-950" /> Tanya via WhatsApp
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-sans font-semibold rounded-xl transition flex items-center justify-center gap-2 active:scale-95 text-xs border border-slate-700"
            >
              <Share2 size={14} className="text-amber-400" /> Bagikan & Salin Link Pelacak
            </button>
          </div>

          {/* INSPECTION CHECKLIST REPORT */}
          {car.inspectionReport && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck size={20} className="text-amber-500" />
                <h2 className="font-display font-bold text-lg text-slate-900">Laporan Inspeksi Kurator</h2>
              </div>

              {/* Items list */}
              <div className="divide-y divide-slate-100 text-sm">
                {/* Mesin */}
                <div className="py-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Mesin & Ruang Mesin</span>
                    {renderInspectionStatus(car.inspectionReport.mesin.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">{car.inspectionReport.mesin.note}</p>
                </div>

                {/* Transmisi */}
                <div className="py-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Transmisi & Kopling</span>
                    {renderInspectionStatus(car.inspectionReport.transmisi.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">{car.inspectionReport.transmisi.note}</p>
                </div>

                {/* Bodi */}
                <div className="py-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Bodi, Cat & Sasis</span>
                    {renderInspectionStatus(car.inspectionReport.bodi.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">{car.inspectionReport.bodi.note}</p>
                </div>

                {/* Interior */}
                <div className="py-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Interior & AC Kabin</span>
                    {renderInspectionStatus(car.inspectionReport.interior.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">{car.inspectionReport.interior.note}</p>
                </div>

                {/* Kaki Kaki */}
                <div className="py-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Kaki-kaki, Rem & Suspensi</span>
                    {renderInspectionStatus(car.inspectionReport.kakiKaki.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">{car.inspectionReport.kakiKaki.note}</p>
                </div>

                {/* Kelistrikan */}
                <div className="py-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Sistem Kelistrikan & Aki</span>
                    {renderInspectionStatus(car.inspectionReport.kelistrikan.status)}
                  </div>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">{car.inspectionReport.kelistrikan.note}</p>
                </div>
              </div>

              {/* Special Note */}
              {car.inspectionReport.catatanKhusus && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 font-sans leading-relaxed">
                  <span className="font-semibold block text-slate-800 mb-0.5">Catatan Tambahan Kurator:</span>
                  {car.inspectionReport.catatanKhusus}
                </div>
              )}

              {/* Verified Badge info */}
              <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400 font-sans">
                {car.inspectionReport.inspectedBy && (
                  <span>Inspektur: <span className="font-semibold">{car.inspectionReport.inspectedBy}</span></span>
                )}
                {car.inspectionReport.inspectedAt && (
                  <span>Tanggal: <span className="font-semibold">{formatDate(car.inspectionReport.inspectedAt)}</span></span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LEAD MODAL POPUP */}
      <WhatsappLeadPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        carId={car.id}
        carTitle={car.title}
        source={LeadSource.WHATSAPP_CTA}
      />

      {/* SHARE/CAMPAIGN TRACKING MODAL */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        carId={car.id}
        carSlug={car.slug}
        carTitle={car.title}
      />
    </div>
  );
}
