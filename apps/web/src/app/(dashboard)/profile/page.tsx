'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Compass,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  UserRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useCurrentActiveRole } from '@/lib/active-role';
import { PARTNER_BANK_OPTIONS } from '@/lib/partner-escrow-store';
import { useSavedBankAccounts } from '@/lib/partner-bank-accounts-store';

interface PersonalProfileState {
  full_name: string;
  display_name: string;
  occupation: string;
  bio: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  social_or_website: string;
  full_address: string;
  district: string;
  city: string;
  province: string;
  postal_code: string;
  google_maps_url: string;
  /** Pengaturan Privasi Personal Member */
  privacy_hide_address_public: boolean;
  privacy_hide_phone_public: boolean;
  privacy_use_display_name_only: boolean;
  privacy_escrow_notifications: boolean;
  updated_at?: string;
}

const PROFILE_STORAGE_KEY = 'racik-personal-profile-v1';

const DEFAULT_PROFILE: PersonalProfileState = {
  full_name: 'Member Racik Nusantara',
  display_name: 'Sahabat Racik',
  occupation: 'Pelaku Agrikultur & Penggiat Produk Lokal',
  bio: 'Tertarik mempelajari pertanian organik berkelanjutan, produk UMKM daerah, dan kemitraan ekonomi lokal.',
  email: 'member@racikmedia.id',
  phone: '0812-3456-7890',
  emergency_contact_name: 'Keluarga Terdekat',
  emergency_contact_phone: '0813-9876-5432',
  social_or_website: '',
  full_address: 'Jl. Merdeka No. 47, RT 02 / RW 05, Kel. Lebakgede',
  district: 'Kec. Coblong',
  city: 'Kota Bandung',
  province: 'Jawa Barat',
  postal_code: '40132',
  google_maps_url: 'https://maps.google.com/?q=-6.8915,107.6107',
  privacy_hide_address_public: true,
  privacy_hide_phone_public: true,
  privacy_use_display_name_only: false,
  privacy_escrow_notifications: true,
};

interface ApiProfileData {
  id: string;
  status: string;
  kyc_tier: string;
  individual_profiles: {
    full_name: string;
    display_name?: string;
    bio?: string;
    province?: string;
    city?: string;
  } | null;
}

const ROLE_DISPLAY: Record<string, string> = {
  member: 'Member / Buyer',
  author: 'Author (Penulis)',
  seller: 'Seller (Mitra Penjual)',
  distributor: 'Distributor Regional',
  'service-provider': 'Penyedia Jasa Ahli',
  moderator: 'Moderator Editorial',
  admin: 'Admin Administrasi',
  master_admin: 'Master Admin',
};

function isSafeMapsHref(raw: string): boolean {
  if (!raw.trim()) return false;
  try {
    const parsed = new URL(raw.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function ProfilePage() {
  const { session, user } = useAuth();
  const activeRole = useCurrentActiveRole();
  const queryClient = useQueryClient();

  const authHeader = session ? { Authorization: `Bearer ${session.access_token}` } : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    enabled: !!session,
    queryFn: () => apiClient.get<ApiProfileData>('/users/me', authHeader),
  });

  const [form, setForm] = useState<PersonalProfileState>(DEFAULT_PROFILE);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // ── State Rekening Bank Tersimpan ──
  const {
    accounts: savedBankAccounts,
    addBankAccount,
    setDefaultBankAccount,
    removeBankAccount,
  } = useSavedBankAccounts();
  const [bankNameInput, setBankNameInput] = useState(PARTNER_BANK_OPTIONS[0]);
  const [bankNumberInput, setBankNumberInput] = useState('');
  const [bankHolderInput, setBankHolderInput] = useState('');
  const [bankLabelInput, setBankLabelInput] = useState('');
  const [bankDefaultCheck, setBankDefaultCheck] = useState(true);
  const [bankFeedback, setBankFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // ── State Penggantian Email (Validasi Ulang) ──
  const [newEmailInput, setNewEmailInput] = useState('');
  const [emailVerifyPassword, setEmailVerifyPassword] = useState('');
  const [emailConfirmChecked, setEmailConfirmChecked] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // ── State Penggantian Password (Validasi Ulang) ──
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Load dari localStorage + sinkronkan jika API profile tersedia
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersonalProfileState>;
        setForm((prev) => ({
          ...prev,
          ...parsed,
          email: parsed.email || session?.user?.email || user?.email || prev.email,
        }));
      } else if (session?.user?.email || user?.email) {
        setForm((prev) => ({
          ...prev,
          email: session?.user?.email || user?.email || prev.email,
        }));
      }
    } catch {
      // Abaikan error parse lokal
    }
  }, [session?.user?.email, user?.email]);

  useEffect(() => {
    const profile = data?.data?.individual_profiles;
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      full_name: profile.full_name || prev.full_name,
      display_name: profile.display_name || prev.display_name,
      bio: profile.bio || prev.bio,
      province: profile.province || prev.province,
      city: profile.city || prev.city,
    }));
  }, [data?.data?.individual_profiles]);

  const mutation = useMutation({
    mutationFn: (body: {
      full_name: string;
      display_name?: string;
      bio?: string;
      province?: string;
      city?: string;
    }) => apiClient.patch('/users/me', body, authHeader),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  function updateField<K extends keyof PersonalProfileState>(
    key: K,
    value: PersonalProfileState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleDetectBrowserLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('Browser tidak mendukung deteksi lokasi otomatis. Silakan tempel tautan Google Maps.');
      return;
    }
    setGpsStatus('Mengambil titik koordinat lokasi...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const url = `https://maps.google.com/?q=${lat},${lng}`;
        updateField('google_maps_url', url);
        setGpsStatus(`Titik lokasi terdeteksi (${lat}, ${lng}).`);
      },
      () => {
        setGpsStatus('Izin lokasi ditolak browser. Anda tetap dapat menempelkan tautan Google Maps secara manual.');
      },
    );
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const updatedState: PersonalProfileState = {
      ...form,
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedState));
    }

    if (session) {
      try {
        await mutation.mutateAsync({
          full_name: form.full_name,
          display_name: form.display_name,
          bio: form.bio,
          province: form.province,
          city: form.city,
        });
      } catch {
        // Tetap tersimpan di localStorage agar data profil & privasi lengkap tidak hilang
      }
    }

    setSavedNotice(
      'Seluruh data diri, alamat lengkap, titik Google Maps, kontak, dan preferensi privasi berhasil disimpan.',
    );
    setTimeout(() => setSavedNotice(null), 5000);
  }

  const mapsLinkValid = isSafeMapsHref(form.google_maps_url);

  const financeHref =
    activeRole === 'distributor'
      ? '/distributor/finance'
      : activeRole === 'service-provider'
        ? '/service-provider/finance'
        : activeRole === 'seller'
          ? '/seller/finance'
          : null;

  function handleSaveNewBankAccount(e: React.FormEvent) {
    e.preventDefault();
    const res = addBankAccount({
      bankName: bankNameInput,
      accountNumber: bankNumberInput,
      accountHolder: bankHolderInput,
      label: bankLabelInput,
      isDefault: bankDefaultCheck,
    });
    if (!res.ok) {
      setBankFeedback({ type: 'error', text: res.error });
      return;
    }
    setBankNumberInput('');
    setBankHolderInput('');
    setBankLabelInput('');
    setBankFeedback({
      type: 'success',
      text: `Rekening ${res.account.bankName} (${res.account.accountNumber}) berhasil disimpan dan siap dipilih otomatis di halaman Tarik Dana.`,
    });
  }

  async function handleChangeEmailWithValidation(e: React.FormEvent) {
    e.preventDefault();
    setEmailFeedback(null);

    const candidateEmail = newEmailInput.trim().toLowerCase();
    const currentEmail = (session?.user?.email || user?.email || form.email || '').trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) {
      setEmailFeedback({ type: 'error', text: 'Masukkan format alamat email baru yang valid.' });
      return;
    }
    if (candidateEmail === currentEmail) {
      setEmailFeedback({
        type: 'error',
        text: 'Email baru tidak boleh sama dengan email yang sedang terdaftar.',
      });
      return;
    }
    if (emailVerifyPassword.length < 6) {
      setEmailFeedback({
        type: 'error',
        text: 'Validasi gagal: masukkan password saat ini minimal 6 karakter sebelum mengganti email.',
      });
      return;
    }
    if (!emailConfirmChecked) {
      setEmailFeedback({
        type: 'error',
        text: 'Centang kotak konfirmasi validasi penggantian email terlebih dahulu.',
      });
      return;
    }

    setEmailSubmitting(true);
    try {
      if (session?.user?.email) {
        const reauth = await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: emailVerifyPassword,
        });
        if (reauth.error) {
          setEmailFeedback({
            type: 'error',
            text: 'Validasi ulang gagal: password saat ini tidak sesuai.',
          });
          return;
        }
        const updated = await supabase.auth.updateUser({ email: candidateEmail });
        if (updated.error) {
          setEmailFeedback({
            type: 'error',
            text: updated.error.message || 'Gagal memproses penggantian email di server autentikasi.',
          });
          return;
        }
        setEmailFeedback({
          type: 'success',
          text: `Validasi ulang berhasil. Tautan konfirmasi penggantian email telah dikirim ke ${candidateEmail}.`,
        });
      } else {
        const nextForm: PersonalProfileState = {
          ...form,
          email: candidateEmail,
          updated_at: new Date().toISOString(),
        };
        setForm(nextForm);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextForm));
        }
        setEmailFeedback({
          type: 'success',
          text: `Validasi ulang berhasil (Mode Dev). Email profil diperbarui menjadi ${candidateEmail}.`,
        });
      }
      setNewEmailInput('');
      setEmailVerifyPassword('');
      setEmailConfirmChecked(false);
    } finally {
      setEmailSubmitting(false);
    }
  }

  async function handleChangePasswordWithValidation(e: React.FormEvent) {
    e.preventDefault();
    setPasswordFeedback(null);

    if (currentPasswordInput.length < 6) {
      setPasswordFeedback({
        type: 'error',
        text: 'Validasi gagal: masukkan password saat ini terlebih dahulu (minimal 6 karakter).',
      });
      return;
    }
    if (
      newPasswordInput.length < 8 ||
      !/[A-Za-z]/.test(newPasswordInput) ||
      !/[0-9]/.test(newPasswordInput)
    ) {
      setPasswordFeedback({
        type: 'error',
        text: 'Password baru wajib minimal 8 karakter serta mengandung kombinasi huruf dan angka.',
      });
      return;
    }
    if (newPasswordInput === currentPasswordInput) {
      setPasswordFeedback({
        type: 'error',
        text: 'Password baru harus berbeda dari password saat ini.',
      });
      return;
    }
    if (newPasswordInput !== confirmNewPasswordInput) {
      setPasswordFeedback({
        type: 'error',
        text: 'Konfirmasi password baru tidak cocok.',
      });
      return;
    }

    setPasswordSubmitting(true);
    try {
      if (session?.user?.email) {
        const reauth = await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: currentPasswordInput,
        });
        if (reauth.error) {
          setPasswordFeedback({
            type: 'error',
            text: 'Validasi ulang gagal: password saat ini salah.',
          });
          return;
        }
        const updated = await supabase.auth.updateUser({ password: newPasswordInput });
        if (updated.error) {
          setPasswordFeedback({
            type: 'error',
            text: updated.error.message || 'Gagal memperbarui password pada server autentikasi.',
          });
          return;
        }
        setPasswordFeedback({
          type: 'success',
          text: 'Validasi ulang berhasil dan password akun Supabase Anda telah diperbarui.',
        });
      } else {
        setPasswordFeedback({
          type: 'success',
          text: 'Validasi ulang berhasil (Mode Dev). Kriteria keamanan password terverifikasi untuk sesi produksi.',
        });
      }
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmNewPasswordInput('');
    } finally {
      setPasswordSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Profil */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-2xl font-black text-white shadow shrink-0">
            {form.full_name?.[0]?.toUpperCase() || 'M'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isLoading ? 'Memuat Profil…' : form.full_name || 'Profil Saya'}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900 border border-emerald-200">
                <UserCheck className="h-3.5 w-3.5" />
                {ROLE_DISPLAY[activeRole] ?? activeRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Kelola informasi personal, alamat lengkap, koordinat Google Maps, kontak resmi, serta pengaturan privasi akun Anda untuk seluruh aktivitas platform.
            </p>
          </div>
        </div>

        <Link
          href={`/kebijakan?role=${encodeURIComponent(activeRole)}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 shrink-0 transition"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Kebijakan Privasi Peran Saya
        </Link>
      </div>

      {savedNotice && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. Data Diri Personal */}
        <div className="card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UserRound className="h-4 w-4 text-emerald-600" />
              1. Data Diri Personal
            </h2>
            <p className="text-xs text-slate-500">
              Identitas pribadi untuk seluruh role (digunakan juga saat pengajuan mitra KYB atau verifikasi akun).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                className="input-base"
                placeholder="Nama lengkap sesuai identitas"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Tampil / Samaran Publik
              </label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => updateField('display_name', e.target.value)}
                className="input-base"
                placeholder="Nama tampilan publik"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pekerjaan / Bidang Aktivitas
              </label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                className="input-base"
                placeholder="Misal: Petani Hortikultura / Penulis / Pengusaha"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tentang Diri / Bio Singkat
            </label>
            <textarea
              rows={2}
              value={form.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              className="input-base"
              placeholder="Ceritakan singkat latar belakang atau minat Anda di Racik Media..."
            />
          </div>
        </div>

        {/* 2. Alamat Lengkap & Google Maps */}
        <div className="card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-600" />
              2. Alamat Lengkap &amp; Titik Google Maps
            </h2>
            <p className="text-xs text-slate-500">
              Alamat tujuan pengiriman default dan koordinat lokasi untuk mempermudah kurir serta layanan On-Site Penyedia Jasa.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Jalan Lengkap (Jalan, Nomor, RT/RW, Desa/Kelurahan) *
            </label>
            <textarea
              rows={2}
              required
              value={form.full_address}
              onChange={(e) => updateField('full_address', e.target.value)}
              className="input-base"
              placeholder="Contoh: Jl. Merdeka No. 47, RT 02 / RW 05, Kel. Lebakgede"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => updateField('district', e.target.value)}
                className="input-base"
                placeholder="Kecamatan"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="input-base"
                placeholder="Kota/Kabupaten"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => updateField('province', e.target.value)}
                className="input-base"
                placeholder="Provinsi"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={form.postal_code}
                onChange={(e) => updateField('postal_code', e.target.value)}
                className="input-base"
                placeholder="Kode Pos"
              />
            </div>
          </div>

          {/* Tautan Google Maps */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-extrabold text-sky-950 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-sky-600" />
                Tautan Google Maps / Koordinat Pinpoint Lokasi
              </label>
              <button
                type="button"
                onClick={handleDetectBrowserLocation}
                className="inline-flex items-center gap-1 rounded-lg bg-sky-600 hover:bg-sky-700 px-3 py-1.5 text-[11px] font-bold text-white transition"
              >
                <Navigation className="h-3.5 w-3.5" />
                Deteksi Koordinat Saya
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={form.google_maps_url}
                onChange={(e) => updateField('google_maps_url', e.target.value)}
                placeholder="https://maps.google.com/?q=-6.8915,107.6107"
                className="input-base flex-1 font-mono text-xs"
              />
              {mapsLinkValid && (
                <a
                  href={form.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-sky-300 bg-white hover:bg-sky-100 px-3.5 py-2 text-xs font-bold text-sky-900 shrink-0 transition"
                >
                  Buka di Google Maps <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            {gpsStatus && <p className="text-[11px] font-medium text-sky-800">{gpsStatus}</p>}
          </div>
        </div>

        {/* 3. Kontak Resmi & Kontak Darurat */}
        <div className="card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-600" />
              3. Kontak Aktif &amp; Kontak Darurat
            </h2>
            <p className="text-xs text-slate-500">
              Informasi kontak untuk koordinasi kurir, notifikasi transaksi Escrow, dan verifikasi keamanan akun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email Terdaftar *
              </label>
              <input
                type="email"
                readOnly
                value={form.email}
                className="input-base bg-slate-50 text-slate-600 cursor-not-allowed"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Penggantian email memerlukan validasi password ulang pada bagian{' '}
                <a href="#keamanan-akun" className="font-bold text-indigo-700 underline">
                  Keamanan Akun
                </a>{' '}
                di bawah.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Nomor Telepon / WhatsApp Aktif *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Kontak Darurat / Penerima Cadangan
              </label>
              <input
                type="text"
                value={form.emergency_contact_name}
                onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor HP Kontak Darurat
              </label>
              <input
                type="tel"
                value={form.emergency_contact_phone}
                onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tautan Website / Portofolio / Media Sosial (Opsional)
            </label>
            <input
              type="text"
              value={form.social_or_website}
              onChange={(e) => updateField('social_or_website', e.target.value)}
              placeholder="Contoh: https://instagram.com/kebunkami"
              className="input-base"
            />
          </div>
        </div>

        {/* 4. Pengaturan Privasi Personal Member */}
        <div className="card space-y-4 border-emerald-200 bg-emerald-50/30">
          <div className="border-b border-emerald-100 pb-3">
            <h2 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-700" />
              4. Privasi &amp; Perlindungan Data Personal Member
            </h2>
            <p className="text-xs text-slate-600">
              Kendalikan informasi pribadi mana yang disembunyikan dari publik dan hanya dibuka ketika terjadi transaksi resmi atau verifikasi Admin.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                key: 'privacy_hide_address_public' as const,
                title: 'Sembunyikan Alamat Lengkap & Titik Google Maps dari Publik',
                desc: 'Alamat dan pinpoint Google Maps hanya dibuka ke Seller, Distributor, atau Penyedia Jasa saat Anda melakukan pemesanan/kontrak resmi.',
              },
              {
                key: 'privacy_hide_phone_public' as const,
                title: 'Sembunyikan Nomor WhatsApp & Kontak Darurat dari Halaman Umum',
                desc: 'Mencegah penyalahgunaan nomor telepon pribadi oleh pihak tidak berkepentingan di luar transaksi Escrow.',
              },
              {
                key: 'privacy_use_display_name_only' as const,
                title: 'Gunakan Nama Tampil / Samaran pada Komentar & Ulasan Artikel',
                desc: 'Nama lengkap asli hanya tersimpan di profil akun dan invoice resmi, sementara ulasan publik memakai Nama Tampil.',
              },
              {
                key: 'privacy_escrow_notifications' as const,
                title: 'Aktifkan Notifikasi Keamanan Login, Escrow & Pengingat Data (2 Tahun)',
                desc: 'Kirimkan pemberitahuan bila ada perubahan status pesanan, pembaruan berkas legalitas, atau akses akun baru.',
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-white p-3.5 cursor-pointer hover:bg-emerald-50/40 transition"
              >
                <input
                  type="checkbox"
                  checked={form[item.key]}
                  onChange={(e) => updateField(item.key, e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-emerald-600 shrink-0"
                />
                <div>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <EyeOff className="h-3.5 w-3.5 text-emerald-600" />
                    {item.title}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            Data pribadi dilindungi oleh Kebijakan Privasi Platform Racik Media Nusantara.
          </p>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary px-6 py-3 text-sm font-extrabold"
          >
            {mutation.isPending ? 'Menyimpan…' : 'Simpan Profil & Pengaturan Privasi'}
          </button>
        </div>
      </form>

      {/* 5. Rekening Bank untuk Tarik Dana */}
      <div id="rekening-bank" className="card space-y-5 border-amber-200 scroll-mt-20">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-amber-600" />
              5. Nomor Rekening Bank (Permudah Tarik Dana ke Bank)
            </h2>
            <p className="text-xs text-slate-500">
              Simpan rekening bank tujuan Anda agar terisi otomatis dan dapat dipilih cepat saat mencairkan saldo di halaman Keuangan / Saldo.
            </p>
          </div>
          {financeHref && (
            <Link
              href={financeHref}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 shrink-0 transition"
            >
              Ke Halaman Tarik Dana
            </Link>
          )}
        </div>

        {bankFeedback && (
          <div
            className={`rounded-xl border px-3.5 py-2.5 text-xs font-bold flex items-center gap-2 ${
              bankFeedback.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-rose-300 bg-rose-50 text-rose-900'
            }`}
          >
            {bankFeedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{bankFeedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveNewBankAccount} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Bank *</label>
              <select
                value={bankNameInput}
                onChange={(e) => setBankNameInput(e.target.value)}
                className="input-base bg-white"
              >
                {PARTNER_BANK_OPTIONS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Rekening *</label>
              <input
                type="text"
                inputMode="numeric"
                value={bankNumberInput}
                onChange={(e) => setBankNumberInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Contoh: 1234567890"
                className="input-base font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Atas Nama Pemilik *</label>
              <input
                type="text"
                value={bankHolderInput}
                onChange={(e) => setBankHolderInput(e.target.value)}
                placeholder="Sesuai buku tabungan"
                className="input-base"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Label (Opsional)</label>
              <input
                type="text"
                value={bankLabelInput}
                onChange={(e) => setBankLabelInput(e.target.value)}
                placeholder="Misal: Rekening Utama Toko"
                className="input-base"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="inline-flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={bankDefaultCheck}
                onChange={(e) => setBankDefaultCheck(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Jadikan rekening utama default saat Tarik Dana
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 font-extrabold text-white shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              Tambah Nomor Rekening
            </button>
          </div>
        </form>

        {savedBankAccounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            Belum ada nomor rekening tersimpan. Tambahkan rekening Anda di atas untuk mempercepat pencairan dana ke bank.
          </div>
        ) : (
          <div className="space-y-2">
            {savedBankAccounts.map((acc) => (
              <div
                key={acc.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs ${
                  acc.isDefault
                    ? 'border-emerald-300 bg-emerald-50/60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span className="font-extrabold text-slate-900">{acc.bankName}</span>
                    <span className="font-mono font-bold text-slate-800">{acc.accountNumber}</span>
                    {acc.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                        Rekening Utama
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">
                    Pemilik: <strong>{acc.accountHolder}</strong>
                    {acc.label ? ` • ${acc.label}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!acc.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultBankAccount(acc.id)}
                      className="rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-800 transition"
                    >
                      Jadikan Utama
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeBankAccount(acc.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 px-2.5 py-1.5 font-bold text-rose-700 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Penggantian Email & Password (Dengan Validasi Ulang) */}
      <div id="keamanan-akun" className="card space-y-5 border-indigo-200 scroll-mt-20">
        <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-600" />
              6. Keamanan Akun: Ganti Email &amp; Password (Validasi Ulang)
            </h2>
            <p className="text-xs text-slate-500">
              Demi keamanan akun, penggantian email maupun password wajib divalidasi ulang menggunakan password saat ini sebelum perubahan diterapkan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700"
          >
            {showPasswords ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPasswords ? 'Sembunyikan Sandi' : 'Tampilkan Sandi'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
          {/* Sub-form A: Validasi Ulang & Ganti Email */}
          <form
            onSubmit={handleChangeEmailWithValidation}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5"
          >
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-indigo-600" />
                Ganti Alamat Email
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Email saat ini: <strong className="text-slate-800">{form.email}</strong>
              </p>
            </div>

            {emailFeedback && (
              <div
                className={`rounded-xl border px-3 py-2 font-bold flex items-start gap-2 ${
                  emailFeedback.type === 'success'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-rose-300 bg-rose-50 text-rose-900'
                }`}
              >
                {emailFeedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{emailFeedback.text}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Baru *</label>
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                placeholder="nama-baru@domain.com"
                className="input-base bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password Saat Ini (Validasi Ulang) *
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={emailVerifyPassword}
                onChange={(e) => setEmailVerifyPassword(e.target.value)}
                placeholder="Masukkan password saat ini untuk verifikasi"
                className="input-base bg-white"
              />
            </div>

            <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={emailConfirmChecked}
                onChange={(e) => setEmailConfirmChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-indigo-600 shrink-0"
              />
              <span className="text-[11px] text-slate-600 leading-relaxed">
                Saya mengonfirmasi penggantian email dan memahami tautan verifikasi akan dikirim untuk mengaktifkan email baru.
              </span>
            </label>

            <button
              type="submit"
              disabled={emailSubmitting}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2.5 font-extrabold text-white shadow-sm transition"
            >
              {emailSubmitting ? 'Memvalidasi…' : 'Validasi Ulang & Ganti Email'}
            </button>
          </form>

          {/* Sub-form B: Validasi Ulang & Ganti Password */}
          <form
            onSubmit={handleChangePasswordWithValidation}
            className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5"
          >
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-emerald-700" />
                Ganti Password Akun
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Wajib minimal 8 karakter dan mengandung kombinasi huruf serta angka.
              </p>
            </div>

            {passwordFeedback && (
              <div
                className={`rounded-xl border px-3 py-2 font-bold flex items-start gap-2 ${
                  passwordFeedback.type === 'success'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-rose-300 bg-rose-50 text-rose-900'
                }`}
              >
                {passwordFeedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{passwordFeedback.text}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password Saat Ini (Validasi Ulang) *
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                placeholder="Masukkan password saat ini"
                className="input-base bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password Baru *</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Minimal 8 karakter (huruf + angka)"
                className="input-base bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Konfirmasi Password Baru *
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmNewPasswordInput}
                onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                placeholder="Ulangi password baru"
                className="input-base bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2.5 font-extrabold text-white shadow-sm transition"
            >
              {passwordSubmitting ? 'Memvalidasi…' : 'Validasi Ulang & Simpan Password Baru'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
