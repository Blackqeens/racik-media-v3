'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

/**
 * Profile page — load profil user, update via PATCH /users/me.
 * Ref: user-lifecycle.md §profile_update, identity domain
 */

const profileSchema = z.object({
  full_name:    z.string().min(1, 'Nama lengkap wajib diisi').max(255),
  display_name: z.string().max(100).optional(),
  bio:          z.string().optional(),
  province:     z.string().optional(),
  city:         z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileData {
  id: string;
  status: string;
  kyc_tier: string;
  individual_profiles: {
    full_name: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    province?: string;
    city?: string;
  } | null;
}

export default function ProfilePage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const authHeader = session ? { Authorization: `Bearer ${session.access_token}` } : undefined;

  // ── Fetch profil ───────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    enabled: !!session,
    queryFn: () => apiClient.get<ProfileData>('/users/me', authHeader),
  });

  const profile = data?.data?.individual_profiles;

  // ── Form ───────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  // Isi form dengan data yang sudah ada saat data siap
  useEffect(() => {
    if (profile) {
      reset({
        full_name:    profile.full_name ?? '',
        display_name: profile.display_name ?? '',
        bio:          profile.bio ?? '',
        province:     profile.province ?? '',
        city:         profile.city ?? '',
      });
    }
  }, [profile, reset]);

  // ── Mutation PATCH ─────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (body: ProfileForm) =>
      apiClient.patch('/users/me', body, authHeader),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  async function onSubmit(values: ProfileForm) {
    await mutation.mutateAsync(values);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600 shrink-0">
          {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLoading ? 'Memuat…' : (profile?.full_name ?? 'Profil Saya')}
          </h1>
          <p className="text-sm text-gray-400">
            {data?.data?.kyc_tier?.replace('_', ' ')} &middot; {data?.data?.status}
          </p>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Informasi Pribadi</h2>

        {/* Pesan sukses */}
        {mutation.isSuccess && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Profil berhasil diperbarui.
          </div>
        )}
        {/* Pesan error */}
        {mutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            Gagal menyimpan. Silakan coba lagi.
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                {...register('full_name')}
                type="text"
                className="input-base"
                placeholder="Nama lengkap"
                disabled={isLoading}
              />
              {errors.full_name && (
                <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tampil</label>
              <input
                {...register('display_name')}
                type="text"
                className="input-base"
                placeholder="Nama publik Anda"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              className="input-base"
              placeholder="Ceritakan sedikit tentang diri Anda…"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
              <input
                {...register('province')}
                type="text"
                className="input-base"
                placeholder="Provinsi"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
              <input
                {...register('city')}
                type="text"
                className="input-base"
                placeholder="Kota/Kabupaten"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty || isLoading}
            className="btn-primary"
          >
            {isSubmitting ? 'Menyimpan…' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
