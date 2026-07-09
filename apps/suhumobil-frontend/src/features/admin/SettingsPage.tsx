/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, ShieldCheck, AreaChart, Sliders, Link as LinkIcon } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import { AdminSettings } from '../../types';

const settingsSchema = z.object({
  watermarkLabel: z.string().min(2, 'Label watermark minimal terdiri dari 2 karakter'),
  watermarkLink: z.string().url('Format URL tautan watermark tidak valid').or(z.string().length(0)),
  gtmId: z.string().optional(),
  ga4Id: z.string().optional()
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      watermarkLabel: 'SuhuMobil',
      watermarkLink: '',
      gtmId: '',
      ga4Id: ''
    }
  });

  useEffect(() => {
    setIsLoading(true);
    settingsService.getAdminSettings()
      .then(res => {
        if (res.success && res.data) {
          setValue('watermarkLabel', res.data.watermark?.label || 'SuhuMobil');
          setValue('watermarkLink', res.data.watermark?.link || '');
          setValue('gtmId', res.data.gtmId || '');
          setValue('ga4Id', res.data.ga4Id || '');
        }
      })
      .catch(err => console.error('Error fetching admin system settings:', err))
      .finally(() => setIsLoading(false));
  }, [setValue]);

  const onSubmit = async (values: SettingsFormValues) => {
    setIsSaving(true);
    try {
      const payload: Partial<AdminSettings> = {
        watermark: {
          label: values.watermarkLabel,
          link: values.watermarkLink || 'https://suhumobil.com'
        },
        gtmId: values.gtmId || undefined,
        ga4Id: values.ga4Id || undefined
      };
      const res = await settingsService.updateSettings(payload);
      if (res.success) {
        alert('Pengaturan sistem bursa berhasil diperbarui!');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-slate-500 font-sans gap-3 animate-pulse">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>Memuat panel pengaturan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Pengaturan Website Bursa</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-sans">Kelola parameter hak cipta foto, skrip pelacakan analitis GTM dan Google Analytics GA4</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sliders size={18} className="text-amber-500" /> Proteksi Hak Cipta Gambar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Watermark Label */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><ShieldCheck size={14} className="text-amber-500" /> Teks Watermark Gambar *</label>
              <input
                type="text"
                placeholder="SuhuMobil"
                {...register('watermarkLabel')}
                className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.watermarkLabel ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
              />
              {errors.watermarkLabel && <span className="text-[10px] text-red-500">{errors.watermarkLabel.message}</span>}
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
                Teks ini ditimpa sebagai overlay miring di atas seluruh foto bursa Anda untuk mencegah pembajakan diler liar.
              </p>
            </div>

            {/* Watermark Link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><LinkIcon size={14} className="text-slate-400" /> Tautan Klik Watermark</label>
              <input
                type="text"
                placeholder="https://suhumobil.com"
                {...register('watermarkLink')}
                className={`px-3 py-2 border rounded-xl outline-none text-sm transition ${errors.watermarkLink ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
              />
              {errors.watermarkLink && <span className="text-[10px] text-red-500">{errors.watermarkLink.message}</span>}
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
                Alamat url rujukan ketika watermark diklik pengunjung di dalam galeri detail unit.
              </p>
            </div>
          </div>

          <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-100 pb-3 pt-4 flex items-center gap-2">
            <AreaChart size={18} className="text-amber-500" /> Integrasi Analitik Pihak Ketiga
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GTM ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Google Tag Manager ID (GTM-XXXXXXX)</label>
              <input
                type="text"
                placeholder="GTM-XXXXXXX"
                {...register('gtmId')}
                className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition font-mono text-xs uppercase"
              />
              <span className="text-[10px] text-slate-400">Berguna untuk menanamkan kode Facebook Pixel atau Tiktok Pixel eksternal.</span>
            </div>

            {/* GA4 Measurement ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Google Analytics GA4 Measurement ID (G-XXXXXXX)</label>
              <input
                type="text"
                placeholder="G-XXXXXXX"
                {...register('ga4Id')}
                className="px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm focus:ring-1 focus:ring-amber-500 transition font-mono text-xs uppercase"
              />
              <span className="text-[10px] text-slate-400">Mencatat statistik demografi dan konversi klik WhatsApp secara real-time.</span>
            </div>
          </div>

          {/* Save Bar */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Save size={14} /> {isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
