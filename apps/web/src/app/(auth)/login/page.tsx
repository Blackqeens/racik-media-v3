'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    setUnconfirmedEmail(null);
    setConfirmationSent(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        const confirmationRequired =
          error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('confirm signup');

        if (confirmationRequired) {
          setUnconfirmedEmail(values.email.trim());
          setErrorMessage('Email belum dikonfirmasi. Buka email konfirmasi atau kirim ulang link.');
        } else {
          setErrorMessage(
            error.message === 'Invalid login credentials'
              ? 'Email atau password salah'
              : error.message
          );
        }
        setIsLoading(false);
        return;
      }

      if (data?.session) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          setErrorMessage('Sesi login belum tersimpan. Silakan coba masuk kembali.');
          setIsLoading(false);
          return;
        }

        router.replace('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat login');
      setIsLoading(false);
    }
  };

  async function resendConfirmation() {
    if (!unconfirmedEmail) return;

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: unconfirmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setConfirmationSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-emerald-600/30">
            RM
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Masuk ke Racik Media
          </h2>
          <p className="text-xs text-slate-500">
            Akses dashboard pertanian, status escrow, dan transaksi Anda.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {unconfirmedEmail && (
          <button
            type="button"
            onClick={resendConfirmation}
            disabled={confirmationSent}
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 disabled:opacity-60"
          >
            {confirmationSent ? 'Link konfirmasi sudah dikirim' : 'Kirim ulang email konfirmasi'}
          </button>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="nama@email.com"
                {...register('email')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Lupa sandi?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sedang Masuk...
              </>
            ) : (
              <>
                Masuk ke Akun <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link ke Register */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Belum memiliki akun?{' '}
            <Link href="/register" className="text-emerald-600 font-bold hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
