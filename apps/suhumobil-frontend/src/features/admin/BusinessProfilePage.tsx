/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Briefcase, FileText, Smartphone, Home, Sparkles } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import { BusinessProfile } from '../../types';
import RichTextEditor from '../../components/RichTextEditor';

const profileSchema = z.object({
  name: z.string().min(2, 'Nama bisnis wajib diisi'),
  tagline: z.string().min(5, 'Slogan/tagline minimal 5 karakter'),
  address: z.string().optional(),
  phone: z.string().optional(),
  logoUrl: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function BusinessProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      tagline: '',
      address: '',
      phone: '',
      logoUrl: ''
    }
  });

  useEffect(() => {
    setIsLoading(true);
    settingsService.getAdminSettings()
      .then(res => {
        if (res.success && res.data.businessProfile) {
          const prof = res.data.businessProfile;
          setValue('name', prof.name);
          setValue('tagline', prof.tagline);
          setValue('address', prof.address || '');
          setValue('phone', prof.phone || '');
          setValue('logoUrl', prof.logoUrl || '');
          setDescription(prof.description || '');
        }
      })
      .catch(err => console.error('Error fetching admin business profile:', err))
      .finally(() => setIsLoading(false));
  }, [setValue]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const payload: BusinessProfile = {
        name: values.name,
        tagline: values.tagline,
        address: values.address,
        phone: values.phone,
        logoUrl: values.logoUrl,
        description
      };
      const res = await settingsService.updateSettings({
        businessProfile: payload
      });
      if (res.success) {
        alert('Profil bisnis perusahaan berhasil diperbarui!');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memperbarui profil bisnis.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setValue('logoUrl', base64);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-slate-500 font-sans gap-3 animate-pulse">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>Memuat profil perusahaan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Profil Bisnis Perusahaan</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-sans">Sesuaikan logo, alamat, slogan, dan deskripsi komprehensif SuhuMobil</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="font-display font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Briefcase size={18} className="text-amber-500" /> Profil Brand & Kontak Resmi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Nama Bisnis / Showroom *</label>
              <input
                type="text"
                placeholder="SuhuMobil"
                {...register('name')}
                className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.name ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
              />
              {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
            </div>

            {/* Tagline */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Slogan / Tagline Perusahaan *</label>
              <input
                type="text"
                placeholder="Kondisi Jujur, Kurasi Maksimun, Transaksi Aman"
                {...register('tagline')}
                className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.tagline ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
              />
              {errors.tagline && <span className="text-[10px] text-red-500">{errors.tagline.message}</span>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><Smartphone size={13} /> No. HP WhatsApp Resmi (Kode Negara: 62) *</label>
              <input
                type="text"
                placeholder="628123456789"
                {...register('phone')}
                className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition"
              />
              <span className="text-[10px] text-slate-400">Masukkan angka saja diawali dengan 62 (contoh: 6281234567890)</span>
            </div>

            {/* Logo URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><Sparkles size={13} /> URL Logo Brand</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                {...register('logoUrl')}
                className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          {/* Quick upload file as Logo */}
          <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between text-xs text-slate-600 gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800">Upload Alternatif File Logo</span>
              <p className="text-[10px] text-slate-400">Pilih file logo showroom Anda untuk diunggah langsung.</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><Home size={13} /> Alamat Fisik Showroom / Garasi Utama</label>
            <textarea
              rows={2}
              placeholder="Gedung Suhu, Jl. Jendral Sudirman No. 42, Kota Bandung, Jawa Barat"
              {...register('address')}
              className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>

          {/* About us Description Rich Text */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><FileText size={14} /> Profil & Kisah Perusahaan (Tentang Kami)</label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>

          {/* Save Bar */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Save size={14} /> {isSaving ? 'Menyimpan Profil...' : 'Simpan Profil Perusahaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
