'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Cpu,
  FileCheck2,
  Headphones,
  LifeBuoy,
  Power,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AiSkill {
  id: string;
  name: string;
  roleTarget: 'admin';
  category: string;
  description: string;
  capability: string[];
  isEnabled: boolean;
  autonomyLevel: 'assistant' | 'semi_autonomous' | 'autonomous';
  lastUpdated: string;
}

const DEFAULT_AI_SKILLS: AiSkill[] = [
  {
    id: 'ai-skill-kyb',
    name: 'AI Verifikasi Mitra & Analisis Legalitas KYB',
    roleTarget: 'admin',
    category: 'Verifikasi & Kepatuhan Hukum',
    description:
      'Memberikan asisten AI cerdas kepada Admin untuk membaca dokumen NIB, KTP, dan sertifikasi halal mitra secara otomatis serta mendeteksi potensi dokumen manipulatif.',
    capability: [
      'Ekstraksi OCR otomatis dokumen NIB & Izin Usaha',
      'Pengecekan keabsahan legalitas format OSS',
      'Pemberian rekomendasi skor kelayakan (Skor 0 - 100)',
    ],
    isEnabled: true,
    autonomyLevel: 'semi_autonomous',
    lastUpdated: '14 Nov 2026, 03:15 WIB',
  },
  {
    id: 'ai-skill-escrow',
    name: 'AI Deteksi Anomali Escrow & Pencegahan Fraud',
    roleTarget: 'admin',
    category: 'Keuangan & Pengawasan Escrow',
    description:
      'Memberikan akses ke Admin untuk memonitor pola transaksi mencurigakan, hold otomatis pencairan saldo yang tidak wajar, dan notifikasi eskalasi instan.',
    capability: [
      'Pendeteksi pesanan fiktif & circular transaction',
      'Validasi sinkronisasi nomor resi logistik otomatis',
      'Pemberian sinyal peringatan risiko tinggi ke Admin',
    ],
    isEnabled: true,
    autonomyLevel: 'assistant',
    lastUpdated: '14 Nov 2026, 02:40 WIB',
  },
  {
    id: 'ai-skill-helpdesk',
    name: 'AI Auto-Drafting & Analisis Tiket Helpdesk Member',
    roleTarget: 'admin',
    category: 'Layanan Pengaduan & Dukungan',
    description:
      'Membantu staf Admin merumuskan jawaban cepat, solutif, dan ramah sesuai standar operasional (SOP) Racik Media Nusantara untuk membalas tiket pertanyaan member.',
    capability: [
      'Analisis sentimen & urgensi komplain pembeli',
      'Penyusunan draf jawaban otomatis sesuai panduan sistem',
      'Kompilasi riwayat pesanan member saat mengajukan bantuan',
    ],
    isEnabled: true,
    autonomyLevel: 'semi_autonomous',
    lastUpdated: '14 Nov 2026, 03:00 WIB',
  },
  {
    id: 'ai-skill-dispute',
    name: 'AI Mediasi Sengketa & Audit Percakapan Transaksi',
    roleTarget: 'admin',
    category: 'Resolusi Sengketa & Arbitrase',
    description:
      'Menganalisis riwayat obrolan member dengan seller/jasa serta bukti foto saat terjadi klaim komplain untuk menghasilkan saran putusan arbitrase yang adil.',
    capability: [
      'Rangkuman kronologi kejadian berdasarkan chat',
      'Rekomendasi persentase pengembalian dana escrow',
      'Pencatatan berita acara sengketa otomatis',
    ],
    isEnabled: false,
    autonomyLevel: 'assistant',
    lastUpdated: '13 Nov 2026, 21:10 WIB',
  },
  {
    id: 'ai-skill-duplicate',
    name: 'AI Pengawasan Algoritma Etalase & Anti-Spamming',
    roleTarget: 'admin',
    category: 'Kualitas Etalase & Marketplace',
    description:
      'Membantu Admin mendeteksi duplikasi judul produk, manipulasi harga grosir distributor, atau spamming jasa yang melanggar batas 50 item per halaman.',
    capability: [
      'Deteksi kemiripan semantik antar judul & deskripsi produk',
      'Pencegahan produk ganda dari toko yang sama',
      'Audit kesesuaian kategori komoditas daerah',
    ],
    isEnabled: true,
    autonomyLevel: 'autonomous',
    lastUpdated: '14 Nov 2026, 01:20 WIB',
  },
];

const STORAGE_KEY = 'racik-master-ai-skills-v1';

export default function MasterAdminAiSkillsPage() {
  const [skills, setSkills] = useState<AiSkill[]>(DEFAULT_AI_SKILLS);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AiSkill[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSkills(parsed);
        }
      }
    } catch {
      // Abaikan error parse
    }
  }, []);

  function saveSkills(newSkills: AiSkill[]) {
    setSkills(newSkills);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSkills));
      setSavedMessage('Otoritas Skill AI berhasil diperbarui!');
      setTimeout(() => setSavedMessage(null), 3000);
    }
  }

  function toggleSkill(id: string) {
    const next = skills.map((s) => {
      if (s.id !== id) return s;
      const updated = !s.isEnabled;
      return {
        ...s,
        isEnabled: updated,
        lastUpdated: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB',
      };
    });
    saveSkills(next);
  }

  function changeAutonomy(id: string, level: AiSkill['autonomyLevel']) {
    const next = skills.map((s) => (s.id === id ? { ...s, autonomyLevel: level } : s));
    saveSkills(next);
  }

  const activeCount = skills.filter((s) => s.isEnabled).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Hero Header Master Admin AI Skills */}
        <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border-2 border-purple-400 p-6 sm:p-7 text-white shadow-xl">
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full blur-3xl bg-purple-400/30"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full blur-3xl bg-indigo-400/30"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
          />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-xs">
                  <Sparkles className="h-4 w-4 text-purple-200" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-purple-200">
                  Otoritas Master Admin &gt; Admin Operasional
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                Pemberian Akses &amp; Otoritas Skill AI (Bantuan Admin)
              </h1>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                Kelola distribusi modul kecerdasan buatan (AI) untuk membantu staf Admin dalam mempercepat verifikasi seller, deteksi kecurangan escrow, mediasi sengketa, dan otomasi helpdesk.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-900 shadow-md transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Dashboard Master Admin</span>
              </Link>
            </div>
          </div>

          {/* Ringkasan Distribusi Skill AI */}
          <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 border-t border-white/25 pt-5 sm:divide-x sm:divide-white/25">
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-white/90">
                Total Modul Skill AI
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-white">{skills.length}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-emerald-200">
                Akses Diberikan (Aktif)
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-300">{activeCount}</p>
            </div>
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-amber-200">
                Nonaktif / Dibatasi
              </p>
              <p className="mt-1 text-2xl sm:text-3xl font-black text-amber-300">
                {skills.length - activeCount}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center px-2 text-center">
              <p className="text-xs sm:text-sm font-bold tracking-wide text-purple-200">
                Penerima Bantuan
              </p>
              <p className="mt-1 text-base sm:text-lg font-black text-white">
                Admin Operasional
              </p>
            </div>
          </div>
        </div>

        {savedMessage && (
          <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-900 shadow-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* Daftar Modul AI Skills untuk Admin */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-700" />
                <span>Katalog Bantuan Skill AI untuk Role Admin</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Aktifkan skill untuk memberikan kemampuan analitis dan otomasi langsung ke antarmuka kerja Admin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`rounded-2xl border-2 p-5 transition-all shadow-sm ${
                  skill.isEnabled
                    ? 'border-purple-300 bg-white ring-1 ring-purple-200'
                    : 'border-slate-300 bg-slate-100/70 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-purple-100 border border-purple-300 px-3 py-0.5 text-[10px] font-black text-purple-950">
                        {skill.category}
                      </span>
                      <span className="rounded-full bg-slate-200 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        Target: Admin Operasional
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          skill.isEnabled
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-400'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {skill.isEnabled ? '✓ Akses Diberikan' : '✕ Akses Dinonaktifkan'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Bot className="h-4.5 w-4.5 text-purple-700" />
                      <span>{skill.name}</span>
                    </h3>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-3xl">
                      {skill.description}
                    </p>

                    <div className="pt-1">
                      <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                        Kemampuan Skill AI:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs text-slate-700">
                        {skill.capability.map((cap, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-600 shrink-0" />
                            <span className="truncate">{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pengaturan Status & Tingkat Otonomi */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-5">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">
                        Tingkat Otonomi Skill:
                      </label>
                      <select
                        disabled={!skill.isEnabled}
                        value={skill.autonomyLevel}
                        onChange={(e) =>
                          changeAutonomy(
                            skill.id,
                            e.target.value as AiSkill['autonomyLevel'],
                          )
                        }
                        className="rounded-lg border-2 border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 disabled:opacity-40 focus:border-purple-600 focus:outline-none"
                      >
                        <option value="assistant">Asisten (Hanya Saran / Rekomendasi)</option>
                        <option value="semi_autonomous">Semi-Otonom (Draft Otomatis Butuh Review)</option>
                        <option value="autonomous">Penuh Otonom (Eksekusi Otomatis Terpantau)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-sm transition cursor-pointer ${
                        skill.isEnabled
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Power className="h-4 w-4" />
                      <span>{skill.isEnabled ? 'Cabut Akses Admin' : 'Berikan Akses ke Admin'}</span>
                    </button>

                    <span className="text-[10px] text-slate-400">
                      Pembaruan: {skill.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

