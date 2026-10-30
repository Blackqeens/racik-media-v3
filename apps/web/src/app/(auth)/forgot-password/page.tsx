'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Forgot password page — Supabase password reset email.
 * Ref: user-lifecycle.md §password_reset
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        // URL yang dibuka user setelah klik link di email
        // Supabase akan append token ke URL ini
        redirectTo: `${window.location.origin}/update-password`,
      },
    );

    if (authError) {
      setError('Gagal mengirim email. Pastikan email Anda benar.');
      setLoading(false);
      return;
    }

    // Selalu tampilkan sukses — jangan bocorkan apakah email terdaftar atau tidak
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="card space-y-4 text-center">
        <div className="text-4xl">✉️</div>
        <h1 className="text-xl font-bold text-gray-900">Email terkirim!</h1>
        <p className="text-sm text-gray-500">
          Jika <strong>{email}</strong> terdaftar di sistem kami, Anda akan
          menerima link reset password dalam beberapa menit.
        </p>
        <p className="text-xs text-gray-400">Cek juga folder spam.</p>
        <Link href="/login" className="block text-sm text-primary-600 hover:underline mt-2">
          ← Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500 mt-1">
          Masukkan email Anda dan kami akan mengirim link reset password.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input-base"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Mengirim...' : 'Kirim Link Reset'}
        </button>
      </form>

      <div className="text-center">
        <Link href="/login" className="text-sm text-primary-600 hover:underline">
          ← Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
