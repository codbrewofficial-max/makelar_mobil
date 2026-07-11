/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, ShieldCheck, Phone, MapPin } from 'lucide-react';
import { settingsService } from '../services/settings.service';
import { contentSectionsService } from '../services/content-sections.service';
import { BusinessProfile } from '../types';
import Watermark from './Watermark';
import WhatsappFAB from './WhatsappFAB';

const DEFAULT_FOOTER_CONTENT = {
  general: {
    description: 'Platform mobil bekas terkurasi & terpercaya.',
    copyrightText: `© ${new Date().getFullYear()} SuhuMobil. Hak cipta dilindungi undang-undang.`,
  },
};

export default function PublicLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [profile, setProfile] = useState<BusinessProfile>({
    name: 'SuhuMobil',
    tagline: 'Kondisi Jujur, Kurasi Maksimun, Transaksi Aman'
  });
  const [footerContent, setFooterContent] = useState<typeof DEFAULT_FOOTER_CONTENT>(DEFAULT_FOOTER_CONTENT);

  useEffect(() => {
    settingsService.getPublicSettings()
      .then(res => {
        if (res.success && res.data.businessProfile) {
          setProfile(res.data.businessProfile);
        }
      })
      .catch(err => console.error('Error fetching layout business profile:', err));
  }, []);

  useEffect(() => {
    contentSectionsService.getPublicContent('footer')
      .then(res => {
        if (res.success) {
          setFooterContent(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(err => console.error('Error fetching footer content:', err));
  }, []);

  // Close mobile navigation on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 group select-none">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-base group-hover:bg-amber-400 transition">S</div>
            )}
            <div>
              <span className="font-display font-bold text-slate-900 tracking-tight leading-none block">{profile.name}</span>
              <span className="text-[9px] text-amber-600 font-semibold tracking-wider uppercase font-mono mt-0.5 block">Suhu Verifikasi</span>
            </div>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-wider uppercase">
            <NavLink to="/cars" className={({ isActive }) => `hover:text-amber-500 transition-colors border-b-2 py-1 ${isActive ? 'text-amber-600 border-amber-500 font-extrabold' : 'text-slate-600 border-transparent'}`}>Cari Mobil</NavLink>
            <NavLink to="/articles" className={({ isActive }) => `hover:text-amber-500 transition-colors border-b-2 py-1 ${isActive ? 'text-amber-600 border-amber-500 font-extrabold' : 'text-slate-600 border-transparent'}`}>Tips Otomotif</NavLink>
            <NavLink to="/about" className={({ isActive }) => `hover:text-amber-500 transition-colors border-b-2 py-1 ${isActive ? 'text-amber-600 border-amber-500 font-extrabold' : 'text-slate-600 border-transparent'}`}>Tentang Kami</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `hover:text-amber-500 transition-colors border-b-2 py-1 ${isActive ? 'text-amber-600 border-amber-500 font-extrabold' : 'text-slate-600 border-transparent'}`}>Hubungi Kami</NavLink>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin/login"
              className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl transition flex items-center gap-1"
            >
              Console Admin <ArrowUpRight size={12} />
            </Link>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile slide down navigation bar */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-3 shadow-lg absolute left-0 right-0 top-16 z-50 animate-fade-in text-xs font-semibold uppercase tracking-wider">
            <NavLink to="/cars" className={({ isActive }) => `block py-2.5 px-3 rounded-xl transition ${isActive ? 'text-amber-600 bg-amber-50/50 font-bold border-l-4 border-amber-500 pl-2' : 'text-slate-600 hover:text-amber-500'}`}>Cari Mobil</NavLink>
            <NavLink to="/articles" className={({ isActive }) => `block py-2.5 px-3 rounded-xl transition ${isActive ? 'text-amber-600 bg-amber-50/50 font-bold border-l-4 border-amber-500 pl-2' : 'text-slate-600 hover:text-amber-500'}`}>Tips Otomotif</NavLink>
            <NavLink to="/about" className={({ isActive }) => `block py-2.5 px-3 rounded-xl transition ${isActive ? 'text-amber-600 bg-amber-50/50 font-bold border-l-4 border-amber-500 pl-2' : 'text-slate-600 hover:text-amber-500'}`}>Tentang Kami</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `block py-2.5 px-3 rounded-xl transition ${isActive ? 'text-amber-600 bg-amber-50/50 font-bold border-l-4 border-amber-500 pl-2' : 'text-slate-600 hover:text-amber-500'}`}>Hubungi Kami</NavLink>

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <Link
                to="/admin/login"
                className="w-full text-center py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition block"
              >
                Portal Admin
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* CORE CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-850 shrink-0">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 mb-10">

          {/* Col 1: Branding info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-base">S</div>
              <div>
                <h3 className="font-display font-bold text-base tracking-tight text-white">{profile.name}</h3>
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider font-mono">Suhu Verifikasi</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-light max-w-sm leading-relaxed">
              &ldquo;{profile.tagline}&rdquo;
            </p>
            {profile.address && (
              <p className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed font-light">
                <MapPin size={14} className="text-amber-500 shrink-0 mt-0.5" />
                {profile.address}
              </p>
            )}
          </div>

          {/* Col 2: Quick navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-amber-400">Peta Navigasi</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-400">
              <Link to="/cars" className="hover:text-white transition-colors">Katalog Mobil Bekas</Link>
              <Link to="/articles" className="hover:text-white transition-colors">Tips & Jurnal Kurasi</Link>
              <Link to="/about" className="hover:text-white transition-colors">Tentang Kami</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Hubungi Kami / Cari Mobil</Link>
            </div>
          </div>

          {/* Col 3: Safe credentials */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-amber-400">Sertifikasi & Garansi</h4>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full">
                <ShieldCheck size={10} /> Garansi 5 Jaminan
              </span>
              <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                Semua mobil bekas di showroom bursa kami bergaransi bebas banjir, bebas tabrakan fatal, kelengkapan surat terjamin sah, nomor rangka mesin akurat, dan odometer asli.
              </p>
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            {footerContent.general.copyrightText}
          </div>

          {/* Watermark in bottom footer */}
          <div className="flex items-center">
            <Watermark variant="footer" />
          </div>
        </div>
      </footer>

      {/* FLOAT ACTION WHATSAPP BUTTON */}
      <WhatsappFAB />
    </div>
  );
}
