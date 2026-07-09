/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Send } from 'lucide-react';
import { LeadSubject, LeadSource } from '../types';
import { leadsService } from '../services/leads.service';
import { settingsService } from '../services/settings.service';
import { carsService } from '../services/cars.service';

const leadSchema = z.object({
  name: z.string().min(2, 'Nama minimal terdiri dari 2 karakter'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Nomor WhatsApp minimal 10 digit')
    .max(15, 'Nomor WhatsApp maksimal 15 digit')
    .regex(/^[0-9]+$/, 'Nomor WhatsApp hanya boleh berisi angka'),
  subject: z.nativeEnum(LeadSubject),
  message: z.string().min(5, 'Silakan tulis pesan minimal 5 karakter')
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface WhatsappLeadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  carId?: string | null;
  source: LeadSource;
  carTitle?: string;
}

const SUBJECT_LABELS: Record<LeadSubject, string> = {
  [LeadSubject.PRICE_INQUIRY]: 'Tanya Detail & Harga Mobil',
  [LeadSubject.NEGOTIATION]: 'Konsultasi Nego Harga',
  [LeadSubject.SCHEDULE_SURVEY]: 'Jadwalkan Survey & Test Drive',
  [LeadSubject.OTHER]: 'Konsultasi Umum Lainnya'
};

export default function WhatsappLeadPopup({
  isOpen,
  onClose,
  carId = null,
  source,
  carTitle
}: WhatsappLeadPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');
  const [activeCarTitle, setActiveCarTitle] = useState(carTitle || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: LeadSubject.PRICE_INQUIRY,
      message: ''
    }
  });

  // Fetch target WhatsApp number and car title if carId provided but no carTitle
  useEffect(() => {
    if (isOpen) {
      // Load WhatsApp setting
      settingsService.getPublicSettings()
        .then(res => {
          if (res?.data?.whatsappNumber) {
            setWhatsappNumber(res.data.whatsappNumber);
          }
        })
        .catch(err => console.error('Error fetching WA number:', err));

      // Load car details if carId is specified and no carTitle was passed
      if (carId && !carTitle) {
        carsService.getAdminCarById(carId)
          .then(res => {
            if (res?.data?.title) {
              setActiveCarTitle(res.data.title);
            }
          })
          .catch(err => console.error('Error fetching car details:', err));
      }
    }
  }, [isOpen, carId, carTitle]);

  if (!isOpen) return null;

  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Submit lead to database
      await leadsService.createLead({
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        carId: carId || undefined,
        source,
        subject: values.subject,
        message: values.message
      });
    } catch (err) {
      console.error('Failed to submit lead to database, continuing to redirect:', err);
    } finally {
      setIsSubmitting(false);

      // 2. Build Whatsapp Message & redirect
      const subjLabel = SUBJECT_LABELS[values.subject];
      let text = `Halo SuhuMobil, saya *${values.name}*.\n\n`;
      text += `Saya ingin mengajukan permohonan *${subjLabel}*`;
      if (activeCarTitle) {
        text += ` untuk unit *${activeCarTitle}*`;
      }
      text += `.\n\n*Pesan:* "${values.message}"\n*Nomor WA:* ${values.phone}`;
      if (values.email) {
        text += `\n*Email:* ${values.email}`;
      }

      const encodedText = encodeURIComponent(text);
      const cleanedWaNumber = whatsappNumber.replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${cleanedWaNumber}?text=${encodedText}`;

      // Open WA
      window.open(waUrl, '_blank');
      reset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div>
            <h3 className="font-display font-bold text-lg">Konsultasi Suhu</h3>
            <p className="text-xs text-amber-50">Isi formulir singkat untuk mulai chat WA</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeCarTitle && (
            <div className="bg-amber-50 text-amber-800 text-xs px-3 py-2.5 rounded-lg border border-amber-100 flex flex-col gap-0.5">
              <span className="font-semibold text-[10px] tracking-wide uppercase opacity-75">Unit Tertarik:</span>
              <span className="font-medium text-sm">{activeCarTitle}</span>
            </div>
          )}

          {/* Nama */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 font-sans">Nama Lengkap *</label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso"
              {...register('name')}
              className={`px-3 py-2 border rounded-xl outline-none transition font-sans text-sm ${errors.name ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
            />
            {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
          </div>

          {/* No. WhatsApp */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 font-sans">Nomor WhatsApp *</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 text-sm font-sans">+62</span>
              <input
                type="text"
                placeholder="8123456789"
                {...register('phone')}
                className={`w-full pl-11 pr-3 py-2 border rounded-xl outline-none transition font-sans text-sm ${errors.phone ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
              />
            </div>
            {errors.phone && <span className="text-[10px] text-red-500">{errors.phone.message}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 font-sans">Email <span className="text-slate-400 font-normal">(Opsional)</span></label>
            <input
              type="email"
              placeholder="Contoh: budi@gmail.com"
              {...register('email')}
              className={`px-3 py-2 border rounded-xl outline-none transition font-sans text-sm ${errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
            />
            {errors.email && <span className="text-[10px] text-red-500">{errors.email.message}</span>}
          </div>

          {/* Subjek */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 font-sans">Subjek Konsultasi *</label>
            <select
              {...register('subject')}
              className="px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-amber-500 transition font-sans text-sm bg-white"
            >
              <option value={LeadSubject.PRICE_INQUIRY}>{SUBJECT_LABELS[LeadSubject.PRICE_INQUIRY]}</option>
              <option value={LeadSubject.NEGOTIATION}>{SUBJECT_LABELS[LeadSubject.NEGOTIATION]}</option>
              <option value={LeadSubject.SCHEDULE_SURVEY}>{SUBJECT_LABELS[LeadSubject.SCHEDULE_SURVEY]}</option>
              <option value={LeadSubject.OTHER}>{SUBJECT_LABELS[LeadSubject.OTHER]}</option>
            </select>
            {errors.subject && <span className="text-[10px] text-red-500">{errors.subject.message}</span>}
          </div>

          {/* Pesan */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700 font-sans">Pesan Konsultasi *</label>
            <textarea
              placeholder="Tulis pesan atau pertanyaan Anda di sini..."
              rows={3}
              {...register('message')}
              className={`px-3 py-2 border rounded-xl outline-none transition font-sans text-sm ${errors.message ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:ring-1 focus:ring-amber-500'}`}
            />
            {errors.message && <span className="text-[10px] text-red-500">{errors.message.message}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 mt-2 py-2.5 bg-green-600 hover:bg-green-700 text-white font-sans font-semibold rounded-xl shadow transition duration-150 active:scale-98 disabled:opacity-50"
          >
            <Send size={16} />
            {isSubmitting ? 'Mengirim Data...' : 'Kirim & Hubungi WhatsApp'}
          </button>
        </form>
      </div>
    </div>
  );
}
