/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Image,
  FileSpreadsheet,
  Plus,
  Trash2,
  Star,
  Sparkles,
  Upload,
  AlertCircle
} from 'lucide-react';
import { carsService } from '../../services/cars.service';
import { carImagesService } from '../../services/car-images.service';
import { Car, CarTransmission, CarFuelType, CarStatus, InspectionReport } from '../../types';
import RichTextEditor from '../../components/RichTextEditor';
import { formatRupiah } from '../../utils/format';

const carSchema = z.object({
  title: z.string().min(4, 'Judul unit minimal 4 karakter'),
  brand: z.string().min(2, 'Silakan isi merek mobil'),
  model: z.string().min(2, 'Silakan isi model mobil'),
  year: z.coerce.number().min(1990, 'Tahun pembuatan minimal 1990').max(new Date().getFullYear(), 'Tahun tidak boleh melebihi tahun berjalan'),
  price: z.coerce.number().min(10000000, 'Harga unit minimal Rp 10.000.000'),
  mileage: z.coerce.number().min(0, 'Jarak tempuh minimal 0 km'),
  transmission: z.nativeEnum(CarTransmission),
  fuelType: z.nativeEnum(CarFuelType),
  color: z.string().optional(),
  location: z.string().min(3, 'Silakan isi lokasi unit (contoh: Bandung)'),
});

type CarFormValues = z.infer<typeof carSchema>;

const INITIAL_INSPECTION = {
  mesin: { status: 'good' as const, note: '' },
  transmisi: { status: 'good' as const, note: '' },
  bodi: { status: 'good' as const, note: '' },
  interior: { status: 'good' as const, note: '' },
  kakiKaki: { status: 'good' as const, note: '' },
  kelistrikan: { status: 'good' as const, note: '' },
  catatanKhusus: '',
  inspectedBy: 'Suhu Benny',
  inspectedAt: new Date().toISOString().split('T')[0]
};

export default function CarFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState<'info' | 'inspection' | 'gallery'>('info');
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSubmitting] = useState(false);

  // Rich Text Description state
  const [description, setDescription] = useState('');

  // Structured Inspection report state
  const [inspection, setInspection] = useState(INITIAL_INSPECTION);

  // Gallery images list
  const [images, setImages] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CarFormValues>({
    resolver: zodResolver(carSchema) as any,
    defaultValues: {
      title: '',
      brand: '',
      model: '',
      year: 2020,
      price: 150000000,
      mileage: 40000,
      transmission: CarTransmission.MANUAL,
      fuelType: CarFuelType.GASOLINE,
      color: '',
      location: ''
    }
  });

  const watchedPrice = watch('price');

  useEffect(() => {
    if (isEdit) {
      setIsLoading(true);
      carsService.getAdminCarById(id)
        .then(res => {
          if (res.success && res.data) {
            setCar(res.data);
            setDescription(res.data.description || '');
            
            // Map values to hook form
            setValue('title', res.data.title);
            setValue('brand', res.data.brand);
            setValue('model', res.data.model);
            setValue('year', res.data.year);
            setValue('price', Number(res.data.price));
            setValue('mileage', res.data.mileage);
            setValue('transmission', res.data.transmission);
            setValue('fuelType', res.data.fuelType);
            setValue('color', res.data.color || '');
            setValue('location', res.data.location);

            // Inspection map
            if (res.data.inspectionReport) {
              setInspection(res.data.inspectionReport as any);
            }

            // Images map
            if (res.data.images) {
              setImages(res.data.images);
            }
          }
        })
        .catch(err => {
          console.error(err);
          alert('Gagal mengambil data kendaraan.');
          navigate('/admin/cars');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEdit, setValue, navigate]);

  const handleSaveCar = async (values: CarFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        description,
        inspectionReport: inspection
      };

      if (isEdit && car) {
        const res = await carsService.updateCar(car.id, payload);
        if (res.success) {
          alert('Katalog unit berhasil diperbarui!');
          navigate('/admin/cars');
        }
      } else {
        const res = await carsService.createCar(payload);
        if (res.success) {
          alert('Katalog unit berhasil dibuat! Silakan lanjutkan ke tab galeri untuk mengupload minimal 5 foto sebelum melakukan publikasi.');
          setCar(res.data);
          // Auto route to gallery tab
          setActiveTab('gallery');
          navigate(`/admin/cars/${res.data.id}/edit`);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!car) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 20) {
      alert('Batas maksimal terlampaui: Satu mobil hanya diizinkan memiliki maksimal 20 foto.');
      return;
    }

    setUploadingImage(true);
    try {
      // In mock mode or live mode
      const isCover = images.length === 0;
      const res = await carImagesService.uploadImage(car.id, file, isCover);
      if (res.success) {
        // reload image metadata list
        const updatedImages = [...images, res.data];
        setImages(updatedImages);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Gagal mengupload gambar.';
      alert(msg);
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSetCover = async (imageId: string) => {
    if (!car) return;
    try {
      const res = await carImagesService.setCover(car.id, imageId);
      if (res.success) {
        // reload images locally
        const updatedImages = images.map(img => ({
          ...img,
          isCover: img.id === imageId
        }));
        setImages(updatedImages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!car) return;
    if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
      try {
        const res = await carImagesService.deleteImage(car.id, imageId);
        if (res.success) {
          const updatedImages = images.filter(img => img.id !== imageId);
          setImages(updatedImages);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Helper inspection status change
  const handleInspectionStatus = (section: keyof typeof INITIAL_INSPECTION, status: 'good' | 'minor' | 'bad') => {
    setInspection(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        status
      }
    }));
  };

  const handleInspectionNote = (section: keyof typeof INITIAL_INSPECTION, note: string) => {
    setInspection(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        note
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-slate-500 font-sans gap-3 animate-pulse">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>Memuat data katalog...</span>
      </div>
    );
  }

  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header back row */}
      <div className="flex items-center gap-4">
        <Link to="/admin/cars" className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">
            {isEdit ? 'Ubah Informasi Unit' : 'Registrasi Unit Baru'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Isi seluruh properti mobil dan lengkapi surat-surat hasil uji inspeksi kurator</p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 bg-white px-2 rounded-xl border p-1 shadow-sm gap-1 max-w-lg">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${activeTab === 'info' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <FileSpreadsheet size={14} /> Spek Dasar
        </button>
        <button
          onClick={() => setActiveTab('inspection')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${activeTab === 'inspection' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <CheckCircle size={14} /> Lembar Inspeksi
        </button>
        <button
          disabled={!car}
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 ${!car ? 'opacity-40 cursor-not-allowed' : ''} ${activeTab === 'gallery' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
          title={!car ? 'Simpan unit terlebih dahulu untuk mengakses menu upload galeri' : ''}
        >
          <Image size={14} /> Galeri Foto ({images.length})
        </button>
      </div>

      {/* TABS CONTAINER BODY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit(handleSaveCar)} className="space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" /> Informasi Properti Kendaraan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Title */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Judul Mobil / Listing *</label>
                <input
                  type="text"
                  placeholder="Contoh: Toyota Avanza 2019 G MT - Istimewa"
                  {...register('title')}
                  className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.title ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                />
                {errors.title && <span className="text-[10px] text-red-500">{errors.title.message}</span>}
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Tahun Pembuatan *</label>
                <input
                  type="number"
                  placeholder="2019"
                  {...register('year')}
                  className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.year ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                />
                {errors.year && <span className="text-[10px] text-red-500">{errors.year.message}</span>}
              </div>

              {/* Merek (Brand) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Merek Mobil *</label>
                <input
                  type="text"
                  placeholder="Toyota, Honda, dll..."
                  {...register('brand')}
                  className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.brand ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                />
                {errors.brand && <span className="text-[10px] text-red-500">{errors.brand.message}</span>}
              </div>

              {/* Model */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Model *</label>
                <input
                  type="text"
                  placeholder="Avanza, HRV, Brio..."
                  {...register('model')}
                  className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.model ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                />
                {errors.model && <span className="text-[10px] text-red-500">{errors.model.message}</span>}
              </div>

              {/* Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Warna Bodi</label>
                <input
                  type="text"
                  placeholder="Contoh: Silver Metallic"
                  {...register('color')}
                  className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Harga Jual (Rp) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-semibold text-slate-400">Rp</span>
                  <input
                    type="number"
                    placeholder="150000000"
                    {...register('price')}
                    className={`w-full pl-10 pr-3 py-2 border rounded-xl outline-none text-sm transition ${errors.price ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                  />
                </div>
                {watchedPrice ? (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/40 w-max mt-0.5 shadow-sm">
                    Format Rupiah: {formatRupiah(Number(watchedPrice))}
                  </span>
                ) : null}
                {errors.price && <span className="text-[10px] text-red-500">{errors.price.message}</span>}
              </div>

              {/* Mileage */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Kilometer (Mileage) *</label>
                <input
                  type="number"
                  placeholder="45000"
                  {...register('mileage')}
                  className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.mileage ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                />
                {errors.mileage && <span className="text-[10px] text-red-500">{errors.mileage.message}</span>}
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Lokasi Penahanan Unit *</label>
                <input
                  type="text"
                  placeholder="Contoh: Bandung Wetan"
                  {...register('location')}
                  className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.location ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                />
                {errors.location && <span className="text-[10px] text-red-500">{errors.location.message}</span>}
              </div>

              {/* Transmisi */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Transmisi *</label>
                <select
                  {...register('transmission')}
                  className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition bg-white"
                >
                  <option value={CarTransmission.MANUAL}>MANUAL</option>
                  <option value={CarTransmission.AUTOMATIC}>AUTOMATIC</option>
                  <option value={CarTransmission.CVT}>CVT</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Bahan Bakar *</label>
                <select
                  {...register('fuelType')}
                  className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition bg-white"
                >
                  <option value={CarFuelType.GASOLINE}>GASOLINE</option>
                  <option value={CarFuelType.DIESEL}>DIESEL</option>
                  <option value={CarFuelType.HYBRID}>HYBRID</option>
                  <option value={CarFuelType.ELECTRIC}>ELECTRIC</option>
                </select>
              </div>
            </div>

            {/* Rich Text Description */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-xs font-semibold text-slate-700">Deskripsi & Ulasan Kurator Senior *</label>
              <RichTextEditor value={description} onChange={setDescription} />
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <Link
                to="/admin/cars"
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Save size={14} /> {isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: INSPECTION REPORT */}
        {activeTab === 'inspection' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-amber-500" /> Sertifikasi Kelayakan 150+ Titik
            </h3>

            <div className="space-y-5 text-sm">
              {[
                { section: 'mesin', title: 'Mesin, Kompresi & Ruang Radiator' },
                { section: 'transmisi', title: 'Transmisi, Girboks & Kopling' },
                { section: 'bodi', title: 'Bodi, Sasis, Sambungan & Cat Fisik' },
                { section: 'interior', title: 'Interior, Dashboard & AC Kabin' },
                { section: 'kakiKaki', title: 'Kaki-kaki, Rem & Suspensi Roda' },
                { section: 'kelistrikan', title: 'Sistem Kelistrikan, Lampu & Aki' }
              ].map(({ section, title }) => {
                const sectKey = section as keyof typeof INITIAL_INSPECTION;
                const data = inspection[sectKey] as any;

                return (
                  <div key={section} className="p-4 bg-slate-50/50 border border-slate-150 rounded-xl grid md:grid-cols-4 gap-4 items-start">
                    <div className="md:col-span-1 space-y-1">
                      <h4 className="font-bold text-slate-800">{title}</h4>
                      <p className="text-[10px] text-slate-400">Pilih penilaian fisik</p>
                    </div>

                    {/* Status selection */}
                    <div className="md:col-span-1">
                      <select
                        value={data.status}
                        onChange={(e) => handleInspectionStatus(sectKey, e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white"
                      >
                        <option value="good">🟢 Baik (Lolos)</option>
                        <option value="minor">🟡 Minor Catatan</option>
                        <option value="bad">🔴 Butuh Perbaikan</option>
                      </select>
                    </div>

                    {/* Inspection Note */}
                    <div className="md:col-span-2">
                      <textarea
                        rows={1.5}
                        placeholder={`Tulis catatan teknis ulasan ${title.toLowerCase()}...`}
                        value={data.note}
                        onChange={(e) => handleInspectionNote(sectKey, e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Special Remarks & Inspector Details */}
              <div className="p-4 border border-amber-100 bg-amber-50/20 rounded-xl space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Kesimpulan & Profil Penilai</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Nama Kurator / Inspektur</label>
                    <input
                      type="text"
                      value={inspection.inspectedBy || ''}
                      onChange={(e) => setInspection(prev => ({ ...prev, inspectedBy: e.target.value }))}
                      className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs bg-white"
                      placeholder="Suhu Benny"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-700">Tanggal Inspeksi Fisik</label>
                    <input
                      type="date"
                      value={inspection.inspectedAt || ''}
                      onChange={(e) => setInspection(prev => ({ ...prev, inspectedAt: e.target.value }))}
                      className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Rangkuman Catatan Khusus Utama</label>
                  <textarea
                    rows={3}
                    placeholder="Bebas banjir, surat lengkap tangan pertama, garansi kelayakan mesin..."
                    value={inspection.catatanKhusus || ''}
                    onChange={(e) => setInspection(prev => ({ ...prev, catatanKhusus: e.target.value }))}
                    className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  alert('Lembar laporan inspeksi berhasil diperbarui! Pastikan Anda menekan tombol simpan utama di tab Spek Dasar untuk menyimpannya ke basis data.');
                  setActiveTab('info');
                }}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
              >
                Terapkan & Kembali
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: GALLERY MANAGER (Only accessible if car saved) */}
        {activeTab === 'gallery' && car && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Image size={18} className="text-amber-500" /> Galeri Foto Kendaraan
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 font-sans">
                  Sistem mewajibkan minimal <span className="font-bold text-red-500">5 foto</span> dan maksimal <span className="font-bold text-slate-700">20 foto</span> terupload sebelum kendaraan dapat diterbitkan (Published).
                </p>
              </div>

              {/* Upload input button */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                  id="car-img-file"
                  className="hidden"
                />
                <label
                  htmlFor="car-img-file"
                  className={`px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow active:scale-95 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload size={14} /> {uploadingImage ? 'Sedang Mengunggah...' : 'Upload Foto'}
                </label>
              </div>
            </div>

            {/* Images Grid */}
            {sortedImages.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 p-16 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Image size={20} />
                </div>
                <div className="space-y-1 font-sans text-xs">
                  <p className="font-semibold text-slate-700">Belum ada foto kendaraan terunggah</p>
                  <p className="text-slate-400">Silakan gunakan tombol kanan atas untuk mulai mengupload foto unit pertama Anda.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                {sortedImages.map((img, idx) => {
                  return (
                    <div
                      key={img.id}
                      className={`relative bg-slate-50 rounded-xl overflow-hidden border-2 flex flex-col justify-between group shadow-sm transition-all h-36 ${img.isCover ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200'}`}
                    >
                      {/* Thumbnail photo */}
                      <div className="relative flex-1 overflow-hidden bg-slate-900 flex items-center justify-center select-none">
                        <img src={img.url} alt="listing gallery" className="w-full h-full object-cover" />
                        
                        {/* Badges overlay */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {img.isCover ? (
                            <span className="inline-flex items-center gap-0.5 bg-amber-500 text-slate-950 text-[9px] font-bold font-sans px-1.5 py-0.5 rounded shadow">
                              <Star size={8} className="fill-slate-950" /> Cover
                            </span>
                          ) : (
                            <span className="bg-slate-900/60 text-white text-[9px] font-sans px-1 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Image Action Row footer */}
                      <div className="bg-white px-2 py-1.5 border-t border-slate-100 flex justify-between items-center select-none">
                        {/* Cover click */}
                        {!img.isCover ? (
                          <button
                            onClick={() => handleSetCover(img.id)}
                            className="text-[9px] font-sans font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded transition active:scale-95"
                          >
                            Set Cover
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-400 font-bold">Utama</span>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-1 rounded text-red-500 hover:bg-red-50 transition active:scale-95"
                          title="Hapus foto ini"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
