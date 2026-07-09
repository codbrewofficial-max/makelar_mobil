/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, AlertTriangle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../services/auth-store';

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

  // 🗑️ State apiMode/apiUrl/showConfig DIHAPUS (Bug Fix #3, addendum 09 Section 5).

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setErrorMsg(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🗑️ Fungsi handleSaveConfig DIHAPUS (Bug Fix #3, addendum 09 Section 5).

  return (
    <div className="font-sans text-slate-800 bg-slate-900 min-h-screen flex flex-col justify-center items-center p-6 relative">
      {/* 🗑️ Tombol "Konfigurasi API" + panel modal-nya DIHAPUS seluruhnya (Bug Fix #3). */}

      {/* Main Login Box */}
      <div className="w-full max-w-md bg-slate-950 p-8 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-mono uppercase tracking-widest mx-auto">
            <ShieldCheck size={12} /> SuhuMobil Secure Console
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Login Portal Admin</h2>
          <p className="text-slate-400 text-xs font-light">Masukkan kredensial Anda untuk mengelola bursa mobil.</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email</label>
            <div className="relative flex items-center">
              <input
                type="email"
                placeholder="admin@suhumobil.com"
                {...register('email')}
                className={`w-full pl-10 pr-3 py-2.5 bg-slate-900 border rounded-xl outline-none text-sm text-white placeholder:text-slate-600 transition ${errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'}`}
              />
              <Mail size={16} className="absolute left-3.5 text-slate-500" />
            </div>
            {errors.email && <span className="text-[10px] text-red-500">{errors.email.message}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-900 border rounded-xl outline-none text-sm text-white placeholder:text-slate-600 transition ${errors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'}`}
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

        {/* 🗑️ Blok "💡 Akses Sandbox Demo" DIHAPUS (Bug Fix #3, addendum 09 Section 5). */}
      </div>
    </div>
  );
}
