/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, AlertTriangle, ShieldCheck, Settings, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../services/auth-store';
import { getApiMode, setApiMode, getApiUrl, setApiUrl } from '../../services/api-client';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Connection settings states for preview user convenience
  const [apiMode, setLocalApiMode] = useState<'mock' | 'live'>(getApiMode());
  const [apiUrl, setLocalApiUrl] = useState(getApiUrl());
  const [showConfig, setShowConfig] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@suhumobil.com',
      password: ''
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      // For mock mode or live mode
      // If mock, password needs to match 'secret123'
      // If credentials match 'admin@suhumobil.com' with blank password, we let them know they need 'secret123' in mock.
      const pass = values.password;
      await login(values.email, pass);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setErrorMsg(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveConfig = () => {
    setApiMode(apiMode);
    setApiUrl(apiUrl);
    alert('Konfigurasi koneksi API berhasil disimpan!');
    setShowConfig(false);
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-900 min-h-screen flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <Settings size={14} /> Konfigurasi API
        </button>
      </div>

      {/* DEV API CONFIGURATION PANEL PANEL */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl space-y-4 border border-slate-100">
            <h3 className="font-display font-bold text-slate-900 text-base">Konfigurasi Jalur REST API</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mode Eksekusi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLocalApiMode('mock')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition ${apiMode === 'mock' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Demo Sandbox (Mock)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocalApiMode('live')}
                    className={`py-1.5 rounded-lg text-xs font-bold transition ${apiMode === 'live' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}
                  >
                    Koneksi Live API
                  </button>
                </div>
              </div>

              {apiMode === 'live' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Base URL API Backend</label>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setLocalApiUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition"
              >
                Simpan & Muat Ulang
              </button>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-lg transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Box */}
      <div className="w-full max-w-md bg-slate-950 p-8 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-mono uppercase tracking-widest mx-auto">
            <ShieldCheck size={12} /> SuhuMobil Secure Console
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Login Portal Admin</h2>
          <p className="text-slate-400 text-xs font-light">Masukkan kredensial Anda untuk mengelola bursa mobil</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-red-400 text-xs flex gap-2.5 items-start">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Akses Ditolak</span>
              <p className="font-sans leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 font-sans">E-mail Portal Admin</label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="admin@suhumobil.com"
                {...register('email')}
                className={`w-full bg-slate-900 border text-white pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm transition font-sans ${errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'}`}
              />
              <Mail size={16} className="absolute left-3.5 text-slate-500" />
            </div>
            {errors.email && <span className="text-[10px] text-red-500">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 font-sans">Sandi Rahasia</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password..."
                {...register('password')}
                className={`w-full bg-slate-900 border text-white pl-10 pr-12 py-2.5 rounded-xl outline-none text-sm transition font-sans ${errors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'}`}
              />
              <KeyRound size={16} className="absolute left-3.5 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-slate-300 focus:outline-none transition p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="text-[10px] text-red-500">{errors.password.message}</span>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-sans font-bold text-sm rounded-xl shadow-lg transition duration-150 disabled:opacity-50"
          >
            {isSubmitting ? 'Memverifikasi Sesi...' : 'Masuk Dashboard'}
          </button>
        </form>

        {getApiMode() === 'mock' && (
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-300">💡 Akses Sandbox Demo:</p>
            <p>Gunakan e-mail <code className="text-amber-500 font-mono">admin@suhumobil.com</code> dan kata sandi <code className="text-amber-500 font-mono">secret123</code> untuk login.</p>
          </div>
        )}
      </div>
    </div>
  );
}
