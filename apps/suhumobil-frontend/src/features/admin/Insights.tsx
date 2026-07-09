/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  MousePointer,
  Calendar,
  Share2,
  MessageSquare,
  Clock,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  BarChart2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { trackingService } from '../../services/tracking.service';
import { SystemInsight, TrackingLog } from '../../types';
import { formatDate } from '../../utils/format';

export default function Insights() {
  const [insight, setInsight] = useState<SystemInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'visit' | 'click' | 'lead'>('all');

  const fetchInsights = async (showRefresher = false) => {
    if (showRefresher) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const res = await trackingService.getSystemInsight();
      if (res.success) {
        setInsight(res.data);
      } else {
        setError('Gagal memuat data analitik sistem.');
      }
    } catch (err) {
      console.error('Error fetching system insights:', err);
      setError('Terjadi kesalahan koneksi saat memuat analitik.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 font-sans animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-96 bg-slate-100 rounded" />
          </div>
          <div className="h-10 w-24 bg-slate-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-50 rounded-2xl border" />
          <div className="h-80 bg-slate-50 rounded-2xl border" />
        </div>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4 max-w-lg mx-auto mt-10 font-sans">
        <AlertCircle className="text-red-500 mx-auto" size={40} />
        <h3 className="font-bold text-slate-900">Gagal Memuat Insights</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{error || 'Database analitik tidak merespon.'}</p>
        <button
          onClick={() => fetchInsights()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow active:scale-95"
        >
          Coba Muat Ulang
        </button>
      </div>
    );
  }

  // Aggregate daily trend for the AreaChart (over the last 14 days)
  // We'll extract dates from our logs and map them to count Visits, Clicks, and Leads
  const getTrendData = () => {
    const logs = insight.recentLogs || [];
    const trendMap: Record<string, { date: string; Kunjungan: number; SalinLink: number; Prospek: number }> = {};
    
    // Initialize last 14 days
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      const key = d.toDateString();
      trendMap[key] = { date: dateStr, Kunjungan: 0, SalinLink: 0, Prospek: 0 };
    }

    // Populate with actual logs counts
    logs.forEach(l => {
      const logDate = new Date(l.timestamp);
      const key = logDate.toDateString();
      if (trendMap[key]) {
        if (l.type === 'visit') trendMap[key].Kunjungan++;
        if (l.type === 'click') trendMap[key].SalinLink++;
        if (l.type === 'lead') trendMap[key].Prospek++;
      }
    });

    return Object.values(trendMap);
  };

  const trendData = getTrendData();

  // Prepare chart data for source performance
  const sourceChartData = insight.bySource.map(s => ({
    name: s.source.toUpperCase(),
    Kunjungan: s.visits,
    'Tautan Disalin': s.clicks,
    Prospek: s.leads
  }));

  // Filter logs for the Activity feed
  const filteredLogs = insight.recentLogs.filter(l => {
    if (activeTab === 'all') return true;
    return l.type === activeTab;
  });

  // Helper for source-specific badges
  const getSourceBadgeStyle = (src: string) => {
    switch (src.toLowerCase()) {
      case 'whatsapp':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'instagram':
        return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'tiktok':
        return 'bg-slate-900 text-white border-slate-800';
      case 'facebook':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'telegram':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Helper for event rendering
  const renderLogEvent = (log: TrackingLog) => {
    const isVisit = log.type === 'visit';
    const isClick = log.type === 'click';
    const isLead = log.type === 'lead';
    
    let icon = <Clock size={12} />;
    let desc = '';
    
    if (isVisit) {
      icon = <Users size={12} className="text-blue-500" />;
      desc = log.carId 
        ? `Pengunjung masuk melihat unit ${log.carTitle || 'katalog'}`
        : `Pengunjung mendarat di website utama`;
    } else if (isClick) {
      icon = <Share2 size={12} className="text-amber-500" />;
      desc = `Tautan promosi unit ${log.carTitle || 'katalog'} disalin`;
    } else if (isLead) {
      icon = <CheckCircle2 size={12} className="text-emerald-500" />;
      desc = `Prospek terkonversi (Tanya WA) untuk unit ${log.carTitle || 'katalog'}`;
    }

    return (
      <div key={log.id} className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/40 px-3 -mx-3 rounded-lg transition">
        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
            {desc}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border leading-none ${getSourceBadgeStyle(log.source)}`}>
              {log.source}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} &middot; {new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const conversionRate = insight.totalVisits > 0 
    ? ((insight.totalLeads / insight.totalVisits) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Analitik Insights Sistem</h1>
          <p className="text-xs text-slate-500 mt-0.5">Sistem pelacakan real-time referral link sosial media & konversi prospek</p>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={isRefreshing}
          className="px-3.5 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-sans font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm bg-white active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-amber-500' : 'text-slate-500'} />
          {isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}
        </button>
      </div>

      {/* CORE STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visits Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100 shrink-0">
            <Users size={22} className="text-slate-800" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengunjung</span>
            <div className="text-2xl font-display font-bold text-slate-950 mt-0.5">{insight.totalVisits}</div>
            <span className="text-[9px] text-emerald-600 font-sans font-medium flex items-center gap-0.5 mt-0.5">
              ● Live Tracking Actived
            </span>
          </div>
        </div>

        {/* Share Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100 shrink-0">
            <Share2 size={20} className="text-slate-800" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tautan Disalin</span>
            <div className="text-2xl font-display font-bold text-slate-950 mt-0.5">{insight.totalClicks}</div>
            <span className="text-[9px] text-slate-400 font-sans">Referral Links Generated</span>
          </div>
        </div>

        {/* Leads Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-100 shrink-0">
            <MessageSquare size={20} className="text-slate-800" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prospek Terkonversi</span>
            <div className="text-2xl font-display font-bold text-slate-950 mt-0.5">{insight.totalLeads}</div>
            <span className="text-[9px] text-slate-400 font-sans">WA Inquiry Leads</span>
          </div>
        </div>

        {/* Conv Rate Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/10 shrink-0">
            <TrendingUp size={22} className="text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rasio Konversi</span>
            <div className="text-2xl font-display font-bold text-slate-950 mt-0.5">{conversionRate}%</div>
            <span className="text-[9px] text-slate-400 font-sans">Pengunjung ke Prospek (Leads)</span>
          </div>
        </div>
      </div>

      {/* DOUBLE CHARTS SYSTEM VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spline Area Chart: Daily Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Trend Kunjungan & Konversi harian</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Analisis performa kunjungan harian vs konversi prospek baru 15 hari terakhir</p>
          </div>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Kunjungan" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorVisits)" />
                <Area type="monotone" dataKey="Prospek" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Source Breakdown Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Performa Efektivitas Kanal Media Sosial</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Bandingkan seberapa banyak trafik, share link, dan prospek yang dihasilkan setiap media sosial</p>
          </div>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Kunjungan" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tautan Disalin" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Prospek" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LOWER DETAILED TABLES & REALTIME LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Referral breakdown table */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">Data Rincian Kinerja Sumber Kampanye</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Metrik detail kunjungan, aktivitas salin tautan, dan konversi prospek akhir</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Nama Kanal</th>
                  <th className="py-2.5 px-4 text-center">Kunjungan</th>
                  <th className="py-2.5 px-4 text-center">Link Clicks</th>
                  <th className="py-2.5 px-4 text-center">Prospek</th>
                  <th className="py-2.5 px-4 text-right">Tingkat Konversi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {insight.bySource.map(s => {
                  const rate = s.visits > 0 ? ((s.leads / s.visits) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={s.source} className="hover:bg-slate-50/50 transition">
                      <td className="py-2.5 px-4 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border font-bold ${getSourceBadgeStyle(s.source)}`}>
                          {s.source}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">{s.visits}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-blue-600">{s.clicks}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-600">{s.leads}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-900 font-bold">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Top Shared Units Catalog */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <h4 className="font-display font-bold text-xs text-slate-900">Unit Terpopuler Berdasarkan Kunjungan Tautan</h4>
              <p className="text-[10px] text-slate-400">Unit kendaraan yang paling sering dikunjungi via social share</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[9px] font-mono font-bold text-slate-400 uppercase">
                    <th className="py-2 px-2">Nama Unit Mobil</th>
                    <th className="py-2 px-2 text-center w-24">Visits</th>
                    <th className="py-2 px-2 text-center w-24">Clicks</th>
                    <th className="py-2 px-2 text-right w-24">Total Respon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {insight.byCar && insight.byCar.length > 0 ? (
                    insight.byCar.map(car => (
                      <tr key={car.carId} className="hover:bg-slate-50/40">
                        <td className="py-2 px-2 font-medium text-slate-800 truncate max-w-xs">{car.carTitle}</td>
                        <td className="py-2 px-2 text-center font-mono">{car.visits}</td>
                        <td className="py-2 px-2 text-center font-mono text-blue-500">{car.clicks}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">{car.visits + car.clicks}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400 font-sans italic">Belum ada aktivitas pelacakan unit spesifik.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right timeline feed: Realtime Activity Logs */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[460px]">
          <div className="shrink-0 pb-3 border-b border-slate-100">
            <h3 className="font-display font-bold text-sm text-slate-900">Aktivitas Pelacakan Terkini</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Alur log mentah sistem pelacak masuk secara waktu nyata</p>

            {/* Filter buttons */}
            <div className="flex gap-1.5 mt-3">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2 py-1 text-[9px] font-bold rounded-lg transition font-sans ${activeTab === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setActiveTab('visit')}
                className={`px-2 py-1 text-[9px] font-bold rounded-lg transition font-sans ${activeTab === 'visit' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Kunjungan
              </button>
              <button
                onClick={() => setActiveTab('click')}
                className={`px-2 py-1 text-[9px] font-bold rounded-lg transition font-sans ${activeTab === 'click' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Share
              </button>
              <button
                onClick={() => setActiveTab('lead')}
                className={`px-2 py-1 text-[9px] font-bold rounded-lg transition font-sans ${activeTab === 'lead' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                Prospek
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 pr-1 select-none">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(renderLogEvent)
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-1">
                <AlertCircle size={24} className="text-slate-300" />
                <span className="text-xs font-semibold text-slate-400">Tidak ada log</span>
                <span className="text-[10px] text-slate-400 font-sans">Kriteria log pelacakan kosong.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
