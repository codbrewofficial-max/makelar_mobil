/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Users2,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  LayoutTemplate,
  ImagePlus,
  DatabaseBackup,
  History
} from 'lucide-react';
import { useAuthStore } from '../../services/auth-store';
// 🗑️ import { getApiMode } from '../../services/api-client'; DIHAPUS (Bug Fix #3, addendum 09) — sudah tidak ada mode mock.

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkAuth, logout, isLoading } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth().then((currentUser) => {
      if (!currentUser) {
        navigate('/admin/login');
      }
    });
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center text-white font-sans gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-medium font-mono">Memeriksa Keamanan Sesi...</span>
      </div>
    );
  }

  if (!user) return null; // Let the navigate effect handle it

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem keamanan SuhuMobil?')) {
      await logout();
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { label: 'Ringkasan Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin/dashboard' },
    { label: 'Katalog Mobil', icon: <Car size={18} />, path: '/admin/cars' },
    { label: 'Insights Sistem', icon: <TrendingUp size={18} />, path: '/admin/insights' },
    { label: 'Daftar Prospek (Leads)', icon: <Users2 size={18} />, path: '/admin/leads' },
    { label: 'Artikel & Edukasi', icon: <FileText size={18} />, path: '/admin/articles' },
    { label: 'Konten Halaman', icon: <LayoutTemplate size={18} />, path: '/admin/content' }, // 🆕 addendum 09
    { label: 'Media Library', icon: <ImagePlus size={18} />, path: '/admin/media' }, // 🆕 addendum 09
    { label: 'Profil Perusahaan', icon: <Briefcase size={18} />, path: '/admin/business-profile' },
    { label: 'Kurator Utama', icon: <ShieldCheck size={18} />, path: '/admin/curators' },
    { label: 'Backup & Restore', icon: <DatabaseBackup size={18} />, path: '/admin/backup' }, // 🆕 addendum 09
    { label: 'Log Aktivitas', icon: <History size={18} />, path: '/admin/audit-logs' }, // 🆕 addendum 09
    { label: 'Pengaturan Website', icon: <Settings size={18} />, path: '/admin/settings' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 text-white border-r border-slate-900 flex flex-col justify-between transform transition-transform duration-200 lg:translate-x-0 lg:static lg:flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
          {/* Brand header */}
          <div className="h-16 border-b border-slate-900 flex items-center px-6 gap-2 bg-slate-950 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-base">S</div>
            <div>
              <h2 className="font-display font-bold text-sm tracking-tight">SuhuMobil Admin</h2>
              <p className="text-[10px] text-slate-500 font-mono">Console Panel v1.5</p>
            </div>
          </div>

          {/* User info bar */}
          <div className="p-4 mx-4 my-3 bg-slate-900/60 rounded-xl border border-slate-900 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-amber-500"><User size={16} /></div>
            <div className="truncate">
              <span className="font-semibold text-xs block text-slate-200 truncate">{user.name}</span>
              <span className="text-[10px] uppercase font-mono text-amber-500">{user.role}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 py-2 flex-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={12} className={`opacity-50 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-900 space-y-3 bg-slate-950">
          {/* 🗑️ Blok "Mode Server API" DIHAPUS (Bug Fix #3, addendum 09) — sudah tidak ada mode mock/live toggle. */}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 border border-slate-900 hover:border-red-500/20 bg-slate-950 hover:bg-red-950/20 text-slate-400 hover:text-red-400 text-xs font-bold rounded-xl transition duration-150"
          >
            <LogOut size={14} /> Keluar Portal
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-400">
              <span>Admin Console</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-sans tracking-wide">
                {menuItems.find(item => location.pathname.startsWith(item.path))?.label || 'Detail'}
              </span>
            </div>
          </div>

          {/* Quick links to public website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-semibold bg-white transition shadow-sm"
          >
            Situs Publik <ArrowUpRight size={12} />
          </a>
        </header>

        {/* SCROLLABLE INNER PAGE AREA */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay to close sidebar on mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}
    </div>
  );
}
