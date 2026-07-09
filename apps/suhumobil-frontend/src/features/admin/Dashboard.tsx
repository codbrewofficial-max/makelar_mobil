/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Car,
  Users2,
  FileText,
  Database,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(res => {
        if (res.success) {
          setStats(res.data);
        }
      })
      .catch(err => console.error('Error fetching dashboard stats:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="h-28 bg-white border border-slate-200 rounded-2xl" />
        ))}
        <div className="md:col-span-2 lg:col-span-3 h-[250px] bg-white border border-slate-200 rounded-2xl" />
        <div className="lg:col-span-1 h-[250px] bg-white border border-slate-200 rounded-2xl" />
      </div>
    );
  }

  // Calculate storage percentage
  const storagePercentage = stats.storageQuotaMb > 0
    ? Math.min(100, Number(((stats.storageUsedMb / stats.storageQuotaMb) * 100).toFixed(1)))
    : 0;

  const isStorageWarning = storagePercentage >= 90;

  return (
    <div className="space-y-8 font-sans text-slate-800">
      {/* Welcome Block */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden border border-slate-850 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none translate-x-20 -translate-y-20" />
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <Sparkles size={12} /> Konsol Terverifikasi
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Selamat Datang, Admin</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
            Semua unit dan prospek dalam pantauan sistem terpadu SuhuMobil. Gunakan menu panel samping untuk mengelola inventori mobil bekas, menindaklanjuti calon pembeli, serta mempublikasikan ulasan edukasi otomotif.
          </p>
        </div>
      </div>

      {/* OVERVIEW STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Cars Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Katalog Unit</span>
            <div className="text-2xl font-display font-bold text-slate-900">{stats.totalCars} <span className="text-xs text-slate-400 font-sans font-normal">unit</span></div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">{stats.publishedCars}</span> dipublikasikan &middot; <span className="font-semibold text-amber-600">{stats.soldCars}</span> terjual
            </div>
          </div>
          <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 shrink-0">
            <Car size={20} />
          </div>
        </div>

        {/* Total Leads Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Leads (Prospek)</span>
            <div className="text-2xl font-display font-bold text-slate-900">{stats.totalLeads} <span className="text-xs text-slate-400 font-sans font-normal">pengirim</span></div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="font-bold text-blue-600">{stats.newLeads} baru</span> perlu dihubungi segera
            </div>
          </div>
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Users2 size={20} />
          </div>
        </div>

        {/* Articles Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Artikel Edukasi</span>
            <div className="text-2xl font-display font-bold text-slate-900">{stats.totalArticles} <span className="text-xs text-slate-400 font-sans font-normal">tulisan</span></div>
            <div className="text-[11px] text-slate-500">
              <span className="font-bold text-emerald-600">{stats.publishedArticles} terpublikasi</span> di situs publik
            </div>
          </div>
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <FileText size={20} />
          </div>
        </div>

        {/* Media Storage Capacity Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Penyimpanan Media R2</span>
            <div className="text-2xl font-display font-bold text-slate-900">{stats.storageUsedMb} <span className="text-xs text-slate-400 font-sans font-normal">MB</span></div>
            <div className="text-[11px] text-slate-500">
              Kuota maksimum: <span className="font-semibold text-slate-700">{stats.storageQuotaMb} MB</span> (1 GB)
            </div>
          </div>
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Database size={20} />
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: MEDIA BUCKET & QUICK ACTIONS */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Card: Storage capacity bar chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <Database size={18} className="text-amber-500" /> Analisis Media Bucket Cloudflare R2
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-sans">Kapasitas Disk Digunakan</span>
                <span className="font-mono font-bold text-slate-800">{storagePercentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${storagePercentage}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${isStorageWarning ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-amber-500 to-amber-600'}`}
                />
              </div>
            </div>

            {/* Disk alerts */}
            {isStorageWarning ? (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 text-red-800 text-xs">
                <AlertOctagon size={16} className="shrink-0 text-red-500 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">⚠️ Warning: Kuota Storage Penuh</span>
                  <p className="font-sans leading-relaxed text-red-700">Disk di atas 90%. Hapus foto lama, mobil terhapus, atau hubungi Developer Anda untuk menambah kuota (storage_quota_gb).</p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3 text-emerald-800 text-xs">
                <TrendingUp size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                <div className="space-y-0.5 font-sans">
                  <span className="font-bold">Kapasitas R2 Aman & Sehat</span>
                  <p className="leading-relaxed text-emerald-700">Sistem kompresi Sharp otomatis WebP memangkas ukuran rata-rata foto hingga di bawah 300 KB.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Quick Actions Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-base text-slate-900">Aksi Pintas Cepat</h3>
          <div className="flex flex-col gap-2.5">
            <Link
              to="/admin/cars/new"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-between group transition shadow-sm"
            >
              <span>Tambah Mobil Bekas</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/admin/leads"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-between group transition shadow-sm"
            >
              <span>Follow Up Prospek ({stats.newLeads})</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/admin/articles/new"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-between group transition"
            >
              <span>Tulis Artikel Baru</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
