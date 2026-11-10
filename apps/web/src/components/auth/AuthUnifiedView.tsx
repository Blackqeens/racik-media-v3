'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthUnifiedViewProps {
  initialMode: 'login' | 'register';
}

export function AuthUnifiedView({ initialMode }: AuthUnifiedViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // State Notifikasi
  const [notification, setNotification] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  // State Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // State Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const localAuthBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setLoginEmail(emailParam);
    }
    const modeParam = searchParams.get('mode');
    if (modeParam === 'register') {
      setMode('register');
    } else if (modeParam === 'login') {
      setMode('login');
    }
    if (searchParams.get('error') === 'oauth_failed') {
      setNotification({
        message: 'Autentikasi Google dibatalkan atau gagal diverifikasi. Silakan coba lagi.',
        type: 'error',
      });
    }
  }, [searchParams]);

  function handleSwitchMode(targetMode: 'login' | 'register') {
    setNotification(null);
    setMode(targetMode);
    const nextParam = searchParams.get('next');
    const query = nextParam ? `?next=${encodeURIComponent(nextParam)}` : '';
    const targetPath = targetMode === 'register' ? `/register${query}` : `/login${query}`;
    window.history.replaceState(null, '', targetPath);
  }

  // Validasi aturan password registrasi
  const hasLength = regPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasCombo = hasUpper && hasLower && hasNumber;
  const isRulesMet = hasLength && hasCombo;
  const isConfirmTyped = regConfirmPassword.length > 0;
  const isMatched = isConfirmTyped && regConfirmPassword === regPassword;

  async function handleSocialAuth(provider: 'google' | 'facebook' | 'instagram') {
    setNotification(null);
    if (provider === 'instagram') {
      setNotification({
        message: 'Login Instagram segera hadir. Silakan gunakan Google atau Email.',
        type: 'error',
      });
      return;
    }

    try {
      const nextParam = searchParams.get('next');
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      if (nextParam) {
        callbackUrl.searchParams.set('next', nextParam);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams:
            provider === 'google'
              ? {
                  access_type: 'offline',
                  prompt: 'select_account',
                }
              : undefined,
        },
      });
      if (error) {
        setNotification({
          message: `Gagal menghubungkan autentikasi dengan ${provider}: ${error.message}`,
          type: 'error',
        });
      }
    } catch (err: unknown) {
      setNotification({
        message: err instanceof Error ? err.message : 'Gagal menghubungkan akun sosial.',
        type: 'error',
      });
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setNotification(null);

    if (localAuthBypass && !loginEmail.trim() && !loginPassword) {
      router.replace('/dashboard');
      router.refresh();
      return;
    }

    setLoginLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) {
        if (localAuthBypass) {
          router.replace('/dashboard');
          router.refresh();
          return;
        }
        const lower = error.message.toLowerCase();
        if (lower.includes('email not confirmed') || lower.includes('confirm signup')) {
          setNotification({
            message: 'Email belum dikonfirmasi. Silakan cek kotak masuk email Anda atau klik Kirim ulang di bawah.',
            type: 'error',
          });
        } else {
          setNotification({
            message: 'Akun dan/atau password Anda salah, silakan coba lagi.',
            type: 'error',
          });
        }
        setLoginLoading(false);
        return;
      }

      if (data?.session) {
        const nextUrl = searchParams.get('next') || '/dashboard';
        router.replace(nextUrl);
        router.refresh();
      }
    } catch {
      setNotification({
        message: 'Terjadi kesalahan sistem saat login. Silakan coba lagi.',
        type: 'error',
      });
      setLoginLoading(false);
    }
  }

  async function handleResendConfirmation() {
    setNotification(null);
    if (!loginEmail.trim()) {
      setNotification({
        message: 'Masukkan alamat email Anda terlebih dahulu pada kolom Email di atas.',
        type: 'error',
      });
      return;
    }

    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: loginEmail.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setNotification({ message: error.message, type: 'error' });
      } else {
        setNotification({
          message: 'Email konfirmasi telah dikirim ulang. Silakan periksa kotak masuk atau folder spam Anda.',
          type: 'success',
        });
      }
    } catch {
      setNotification({
        message: 'Gagal mengirim ulang email konfirmasi.',
        type: 'error',
      });
    } finally {
      setResendLoading(false);
    }
  }

  async function handleManualSignUp(e: React.FormEvent) {
    e.preventDefault();
    setNotification(null);

    if (regPassword !== regConfirmPassword) {
      setNotification({
        message: 'Password tidak sama. Silakan periksa kembali.',
        type: 'error',
      });
      return;
    }

    setRegLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: regName.trim(),
          },
        },
      });

      if (error) {
        const errText = error.message.toLowerCase();
        if (
          errText.includes('already registered') ||
          errText.includes('user already exists') ||
          errText.includes('sudah terdaftar')
        ) {
          setNotification({
            message: 'Akun anda sudah terdaftar, silakan dengan email yang lain.',
            type: 'error',
          });
        } else {
          setNotification({
            message: error.message || 'Pendaftaran belum berhasil. Silakan coba lagi.',
            type: 'error',
          });
        }
        setRegLoading(false);
        return;
      }

      if (data?.session) {
        setNotification({
          message: 'Akun berhasil dibuat! Mengalihkan ke dashboard...',
          type: 'success',
        });
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1200);
      } else {
        setNotification({
          message: 'Pendaftaran berhasil! Silakan periksa email Anda untuk konfirmasi akun.',
          type: 'success',
        });
        setRegLoading(false);
      }
    } catch {
      setNotification({
        message: 'Terjadi kesalahan sistem saat pendaftaran.',
        type: 'error',
      });
      setRegLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-[550px] w-full flex-col justify-between gap-5 rounded-[24px] border border-slate-200 bg-white p-7 sm:p-9"
      style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.07)' }}
    >
      {/* Switch Tabs — Masuk & Daftar Member saling terhubung */}
      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/90 p-1">
        <button
          type="button"
          onClick={() => handleSwitchMode('login')}
          className={`flex-1 rounded-full py-2.5 px-3 text-[13px] font-semibold transition-all ${
            mode === 'login'
              ? 'text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)]'
              : 'bg-transparent text-slate-500 hover:text-slate-700'
          }`}
          style={
            mode === 'login'
              ? { background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }
              : undefined
          }
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => handleSwitchMode('register')}
          className={`flex-1 rounded-full py-2.5 px-3 text-[13px] font-semibold transition-all ${
            mode === 'register'
              ? 'text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)]'
              : 'bg-transparent text-slate-500 hover:text-slate-700'
          }`}
          style={
            mode === 'register'
              ? { background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }
              : undefined
          }
        >
          Daftar Member
        </button>
      </div>

      {/* Notifikasi Error / Sukses */}
      {notification && (
        <div
          role="alert"
          className={`rounded-xl border p-3.5 text-xs font-medium ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PANEL 1: MASUK (LOG IN)
          ═══════════════════════════════════════════════════════════════════ */}
      {mode === 'login' ? (
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900">
              Selamat datang kembali 👋
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Masuk untuk melanjutkan pengalaman Anda di Racik media.
            </p>
          </div>

          {/* Social Logins (Google, Facebook, Instagram) */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              className="flex w-full items-center justify-center gap-2.5 rounded-full border-[1.5px] border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#4285F4] hover:bg-blue-50/50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Masuk dengan Akun Google
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialAuth('facebook')}
                className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#1877F2] hover:bg-blue-50/40"
              >
                <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
              <button
                type="button"
                onClick={() => handleSocialAuth('instagram')}
                className="flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#E1306C] hover:bg-pink-50/40"
              >
                <svg className="h-4 w-4 shrink-0 text-[#E1306C]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </button>
            </div>
          </div>

          {/* Divider ATAU EMAIL */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-[11px] font-medium uppercase text-slate-400">atau email</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Form Login */}
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3.5">
            <div>
              <label htmlFor="login-email" className="mb-1 block text-xs font-semibold text-slate-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Alamat email Anda"
                required={!localAuthBypass}
                className="w-full rounded-[14px] border-[1.5px] border-slate-200 bg-[#fafafa] px-4 py-[11px] text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-[3px] focus:ring-emerald-500/15"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Kata sandi"
                required={!localAuthBypass}
                className="w-full rounded-[14px] border-[1.5px] border-slate-200 bg-[#fafafa] px-4 py-[11px] text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-[3px] focus:ring-emerald-500/15"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-1 w-full rounded-full py-[13px] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
              }}
            >
              {loginLoading ? 'Memverifikasi…' : 'Masuk ke Akun'}
            </button>
          </form>

          {/* Footer Konfirmasi Email */}
          <div className="pt-1 text-center text-xs text-slate-500">
            <p>
              Belum menerima email konfirmasi?{' '}
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendLoading}
                className="font-semibold text-emerald-700 hover:underline disabled:opacity-50"
              >
                {resendLoading ? 'Mengirim...' : 'Kirim ulang'}
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════
           PANEL 2: DAFTAR MEMBER (REGISTRASI)
           ═══════════════════════════════════════════════════════════════════ */
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div className="text-center">
            <h2 className="font-serif text-xl font-bold text-slate-900">
              Mari Bergabung Bersama Kami
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Buat akun Anda untuk mulai menjelajah Racik media.
            </p>
          </div>

          {/* Divider ATAU ISI FORMULIR */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-[11px] font-medium uppercase text-slate-400">
              atau isi formulir
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* 4 Kolom Formulir Pendaftaran */}
          <form onSubmit={handleManualSignUp} className="flex flex-col gap-3.5">
            {/* Kolom 1: Nama Lengkap */}
            <div>
              <label htmlFor="reg-name" className="mb-1 block text-xs font-semibold text-slate-700">
                Nama Lengkap
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Nama lengkap Anda"
                className="w-full rounded-[14px] border-[1.5px] border-slate-200 bg-[#fafafa] px-4 py-[11px] text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-[3px] focus:ring-emerald-500/15"
              />
            </div>

            {/* Kolom 2: Alamat Email Aktif */}
            <div>
              <label htmlFor="reg-email" className="mb-1 block text-xs font-semibold text-slate-700">
                Alamat Email Aktif
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-[14px] border-[1.5px] border-slate-200 bg-[#fafafa] px-4 py-[11px] text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-[3px] focus:ring-emerald-500/15"
              />
            </div>

            {/* Kolom 3: Kata Sandi (Password) */}
            <div>
              <label htmlFor="reg-pass" className="mb-1 block text-xs font-semibold text-slate-700">
                Kata Sandi (Password)
              </label>
              <input
                id="reg-pass"
                type="password"
                required
                autoComplete="new-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full rounded-[14px] border-[1.5px] border-slate-200 bg-[#fafafa] px-4 py-[11px] text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-[3px] focus:ring-emerald-500/15"
              />

              {/* Box Aturan Kata Sandi (Muncul saat mulai diisi) */}
              {regPassword.length > 0 && (
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-[11px] font-bold text-slate-700">
                    Aturan Kriteria &amp; Batasan Kata Sandi:
                  </p>
                  <div className="space-y-1.5 text-[11px]">
                    <div
                      className={`flex items-start gap-2 ${
                        hasLength ? 'font-semibold text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      <span className={`font-bold ${hasLength ? 'text-emerald-600' : ''}`}>
                        {hasLength ? '✓' : '✕'}
                      </span>
                      <span>
                        <strong>Panjang Karakter:</strong> Minimal 8 karakter.
                      </span>
                    </div>
                    <div
                      className={`flex items-start gap-2 ${
                        hasCombo ? 'font-semibold text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      <span className={`font-bold ${hasCombo ? 'text-emerald-600' : ''}`}>
                        {hasCombo ? '✓' : '✕'}
                      </span>
                      <span>
                        <strong>Kombinasi Karakter:</strong> Mengandung Huruf Besar (A-Z), Huruf Kecil (a-z), dan Angka (0-9).
                      </span>
                    </div>
                  </div>
                  <div
                    className={`mt-2 text-[11px] ${
                      isRulesMet ? 'font-semibold text-emerald-700' : 'font-medium text-amber-700'
                    }`}
                  >
                    {isRulesMet
                      ? '✓ Kriteria kata sandi memenuhi standar keamanan.'
                      : 'Lengkapi kriteria kata sandi di atas.'}
                  </div>
                </div>
              )}
            </div>

            {/* Kolom 4: Kata Sandi ulang (Password) */}
            <div>
              <label
                htmlFor="reg-pass-confirm"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Kata Sandi ulang (Password)
              </label>
              <input
                id="reg-pass-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi"
                className={`w-full rounded-[14px] border-[1.5px] px-4 py-[11px] text-sm outline-none transition ${
                  isConfirmTyped && !isMatched
                    ? 'border-red-500 bg-slate-800 text-slate-50'
                    : 'border-slate-200 bg-[#fafafa] text-slate-800 focus:border-emerald-500 focus:bg-white focus:ring-[3px] focus:ring-emerald-500/15'
                }`}
              />
              {isConfirmTyped && !isMatched && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">⚠️ Password tidak sama</p>
              )}
            </div>

            {/* Tombol Daftar Sekarang (Muncul saat aturan terpenuhi & password cocok) */}
            {isRulesMet && isMatched && (
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full rounded-full py-[13px] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  {regLoading ? 'Mendaftarkan akun…' : 'Daftar Sekarang →'}
                </button>
              </div>
            )}
          </form>

          <p className="pt-1 text-center text-xs text-slate-500">
            Setiap pengguna baru akan otomatis mendapatkan role <strong>pengguna/member</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

