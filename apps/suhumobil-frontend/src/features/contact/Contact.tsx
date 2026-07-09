/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { LeadSource } from '../../types';
import { leadsService } from '../../services/leads.service';
import { formatRupiah } from '../../utils/format';

const dreamCarSchema = z.object({
  name: z.string().min(2, 'Nama minimal terdiri dari 2 karakter'),
  phone: z
    .string()
    .min(10, 'Nomor WhatsApp minimal 10 digit')
    .max(15, 'Nomor WhatsApp maksimal 15 digit')
    .regex(/^[0-9]+$/, 'Nomor WhatsApp hanya boleh berisi angka'),
  city: z.string().min(2, 'Silakan isi kota domisili Anda'),
  budget: z.string().transform((val) => Number(val) || 0).refine((val) => val > 0, { message: 'Silakan isi budget dalam angka positif' }),
  carInterest: z.string().min(4, 'Tulis minimal 4 karakter mengenai mobil impian Anda')
});

type DreamCarValues = z.infer<typeof dreamCarSchema>;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<DreamCarValues>({
    resolver: zodResolver(dreamCarSchema) as any,
    defaultValues: {
      name: '',
      phone: '',
      city: '',
      budget: 0 as any,
      carInterest: ''
    }
  });

  const watchedBudget = watch('budget');

  const onSubmit = async (values: DreamCarValues) => {
    setIsSubmitting(true);
    try {
      await leadsService.createLead({
        name: values.name,
        phone: values.phone,
        city: values.city,
        budget: values.budget,
        carInterest: values.carInterest,
        source: LeadSource.DREAM_CAR_FORM
      });
      setSuccessMsg(true);
      reset();
    } catch (err) {
      console.error('Error submitting dream car lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-start">
        {/* LEFT COLUMN: Contact Details & Office */}
        <div className="md:col-span-5 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Hubungi Kami</span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 leading-tight">Mulai Konsultasi Anda Hari Ini</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Tim SuhuMobil siap melayani tanya jawab, bimbingan kredit sehat, hingga jasa penjemputan unit untuk kebutuhan titip jual Anda.
            </p>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex gap-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Phone size={20} /></div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">WhatsApp Call & Chat</h3>
                <p className="text-xs text-slate-500 mt-0.5">Senin - Minggu (08:00 - 21:00 WIB)</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">+62 812-3456-7890</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Mail size={20} /></div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Email Co-partnership</h3>
                <p className="text-xs text-slate-500 mt-0.5">Titip Jual, Kerja sama diler atau inspect</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">support@suhumobil.com</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><MapPin size={20} /></div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Lokasi Showroom & Garasi</h3>
                <p className="text-xs text-slate-500 mt-0.5">Janjian survey fisik kendaraan</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">Gedung Suhu, Jl. Jendral Sudirman No. 42, Kota Bandung, Jawa Barat</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CARI MOBIL IMPIAN FORM */}
        <div className="md:col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 relative">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-xl text-slate-900">Formulir Cari Mobil Impian</h2>
            <p className="text-xs text-slate-500">
              Sulit mencari unit yang cocok? Beritahu kriteria Anda, dan kurator kami akan mencarikan unit terbaik yang lolos sertifikasi.
            </p>
          </div>

          {successMsg ? (
            <div className="bg-green-50 border border-green-100 p-6 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                <CheckCircle size={24} />
              </div>
              <h3 className="font-display font-bold text-slate-900 text-base">Permohonan Terkirim!</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Formulir Anda telah terdaftar sebagai lead baru. Tim kurator SuhuMobil akan menghubungi Anda via WhatsApp dalam waktu maksimal 1x24 jam. Terima kasih!
              </p>
              <button
                onClick={() => setSuccessMsg(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition duration-150"
              >
                Kirim Permohonan Baru
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Nama Lengkap *</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Subardjo"
                  {...register('name')}
                  className={`px-3 py-2 border rounded-xl outline-none text-sm transition font-sans ${errors.name ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                />
                {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 text-sm font-sans">+62</span>
                  <input
                    type="text"
                    placeholder="81288889999"
                    {...register('phone')}
                    className={`w-full pl-11 pr-3 py-2 border rounded-xl outline-none text-sm transition font-sans ${errors.phone ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                  />
                </div>
                {errors.phone && <span className="text-[10px] text-red-500">{errors.phone.message}</span>}
              </div>

              {/* City & Budget */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Kota Domisili *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bandung"
                    {...register('city')}
                    className={`px-3 py-2 border rounded-xl outline-none text-sm transition font-sans ${errors.city ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                  />
                  {errors.city && <span className="text-[10px] text-red-500">{errors.city.message}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">Anggaran Belanja (Rp) *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 text-sm font-sans">Rp</span>
                    <input
                      type="number"
                      placeholder="150000000"
                      {...register('budget')}
                      className={`w-full pl-10 pr-3 py-2 border rounded-xl outline-none text-sm transition font-sans ${errors.budget ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                    />
                  </div>
                  {watchedBudget ? (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/40 w-max mt-0.5 shadow-sm">
                      Format Rupiah: {formatRupiah(Number(watchedBudget))}
                    </span>
                  ) : null}
                  {errors.budget && <span className="text-[10px] text-red-500">{errors.budget.message}</span>}
                </div>
              </div>

              {/* Car Interest Details */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Detail Mobil yang Dicari *</label>
                <textarea
                  placeholder="Contoh: Cari SUV transmisi matic merk Honda/Toyota, warna putih/hitam, tahun 2018 ke atas, kilometer di bawah 60rb..."
                  rows={4}
                  {...register('carInterest')}
                  className={`px-3 py-2 border rounded-xl outline-none text-sm transition font-sans ${errors.carInterest ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
                />
                {errors.carInterest && <span className="text-[10px] text-red-500">{errors.carInterest.message}</span>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-bold text-sm rounded-xl shadow transition duration-150 active:scale-98 disabled:opacity-50"
              >
                <Send size={16} />
                {isSubmitting ? 'Mengirim Formulir...' : 'Kirim Formulir Cari Mobil'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
