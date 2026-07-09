/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Award, Milestone, Users } from 'lucide-react';
import { settingsService } from '../../services/settings.service';
import { BusinessProfile } from '../../types';
import RichTextRenderer from '../../components/RichTextRenderer';

export default function About() {
  const [profile, setProfile] = useState<BusinessProfile>({
    name: 'SuhuMobil',
    tagline: 'Kondisi Jujur, Kurasi Maksimun, Transaksi Aman',
    description: '<p>Loading business profile...</p>'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    settingsService.getPublicSettings()
      .then(res => {
        if (res.success && res.data.businessProfile) {
          setProfile(res.data.businessProfile);
        }
      })
      .catch(err => console.error('Error fetching about page business profile:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Intro Branding Header */}
        <div className="text-center space-y-4">
          {profile.logoUrl && (
            <img
              src={profile.logoUrl}
              alt="SuhuMobil Logo"
              className="w-24 h-24 rounded-2xl object-cover shadow border border-slate-100 mx-auto"
            />
          )}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">{profile.name}</h1>
            <p className="text-amber-600 font-display font-medium text-sm sm:text-base tracking-wide">
              &ldquo;{profile.tagline}&rdquo;
            </p>
          </div>
        </div>

        {/* Description Text Renderer */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm leading-relaxed text-slate-700">
          <h2 className="font-display font-bold text-xl text-slate-900 mb-4 pb-2 border-b border-slate-100">Kisah Kami</h2>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 rounded" />
              <div className="h-4 w-4/5 bg-slate-200 rounded" />
            </div>
          ) : (
            <RichTextRenderer content={profile.description} />
          )}
        </div>

        {/* Corporate Values Bento Box */}
        <div className="grid sm:grid-cols-2 gap-6 pt-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 self-start"><ShieldAlert size={20} /></div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900">Kurasi 100% Jujur</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">Kami menolak menyembunyikan minus kendaraan demi mengejar komisi penjualan cepat.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 self-start"><Award size={20} /></div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900">Sertifikat Suhu Verifikasi</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">Setiap sasis, mesin, dan komponen kelistrikan diuji oleh kurator berpengalaman 25 tahun.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 self-start"><Milestone size={20} /></div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900">Dukungan Transaksi</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">Dari negosiasi, balik nama, hingga surat keabsahan kendaraan lengkap kita bantu kawal sampai tuntas.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 self-start"><Users size={20} /></div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900">Kepuasan Pelanggan</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">Hubungan kami berlanjut bahkan setelah mobil masuk garasi rumah Anda untuk purna jual.</p>
            </div>
          </div>
        </div>

        {/* Footer address card if present */}
        {profile.address && (
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow border border-slate-800 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-amber-400">Kantor Inspeksi Fisik</h3>
              <p className="text-slate-300 font-light text-sm max-w-md">{profile.address}</p>
            </div>
            {profile.phone && (
              <div className="shrink-0 font-mono text-sm tracking-wider font-semibold text-amber-400 border-l-2 border-amber-500 pl-4 py-1">
                WA: +{profile.phone}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
