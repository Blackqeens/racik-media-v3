'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  Globe,
  Image as ImageIcon,
  Lock,
  Mail,
  PenLine,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Store,
  Truck,
  UserCheck,
  UserRound,
} from 'lucide-react';

export type PolicyRoleKey =
  | 'member'
  | 'seller'
  | 'distributor'
  | 'service-provider'
  | 'moderator'
  | 'admin'
  | 'master_admin';

interface RolePolicySpec {
  key: PolicyRoleKey;
  roleTitle: string;
  shortLabel: string;
  badgeText: string;
  accentColor: string;
  summary: string;
  scopeResponsibilities: string[];
  strictBoundaries: string[];
  workflowCoordination: {
    title: string;
    detail: string;
  }[];
}

const ROLE_POLICIES: Record<PolicyRoleKey, RolePolicySpec> = {
  member: {
    key: 'member',
    roleTitle: 'Role Member / Pembeli (Buyer)',
    shortLabel: 'Member / Buyer',
    badgeText: 'KEBIJAKAN RUANG LINGKUP & BATASAN ROLE MEMBER',
    accentColor: 'emerald',
    summary:
      'Member adalah pengguna terdaftar yang memiliki hak berbelanja produk lokal, memesan layanan jasa, menyimpan bookmark, mengajukan tulisan komunitas, serta mengajukan kenaikan status menjadi Seller atau Distributor.',
    scopeResponsibilities: [
      'Melakukan transaksi pembelian produk marketplace dan pemesanan layanan jasa melalui perlindungan Rekening Bersama (Escrow).',
      'Memeriksa kondisi pesanan saat tiba dan menekan konfirmasi penerimaan barang atau mengajukan komplain disertai bukti foto/video unboxing.',
      'Menulis ide, cerita, atau ulasan komunitas melalui menu "Tulis Ide & Cerita" untuk diajukan ke antrean kurasi Role Moderator.',
      'Mengajukan permohonan kenaikan role menjadi Seller (Penjual) atau Distributor dengan melampirkan berkas KTP, NPWP, NIB, dan foto tempat usaha untuk diverifikasi oleh Role Admin.',
    ],
    strictBoundaries: [
      'TIDAK DAPAT langsung mempublikasikan artikel atau tulisan ke Homepage tanpa pemeriksaan dan pengesahan dari Role Moderator.',
      'TIDAK DAPAT membuka etalase toko atau mengunggah produk dagangan sebelum pengajuan Member → Seller disetujui secara resmi oleh Role Admin.',
      'TIDAK DAPAT mengakses halaman pengelolaan administrasi mitra, moderasi arsip, maupun laporan keuangan internal platform.',
      'DILARANG melakukan transaksi di luar sistem Rekening Bersama (Escrow) yang menggugurkan perlindungan jaminan uang kembali.',
    ],
    workflowCoordination: [
      {
        title: 'Koordinasi Pengajuan Seller/Distributor (Ke Role Admin)',
        detail:
          'Seluruh berkas identitas (KTP, NPWP, NIB) dan foto lokasi usaha yang diunggah Member diperiksa keabsahannya oleh Role Admin.',
      },
      {
        title: 'Koordinasi Komplain Pesanan (Ke Role Admin)',
        detail:
          'Jika barang rusak atau tidak sesuai, Member mengajukan tiket komplain yang akan dimediasi dan diputuskan solusinya oleh Role Admin.',
      },
      {
        title: 'Koordinasi Penulisan Artikel (Ke Role Moderator)',
        detail:
          'Setiap draf tulisan atau hasil editan Member otomatis masuk ke Dashboard Moderator untuk dianalisis tata tulis dan kesesuaian gambarnya.',
      },
    ],
  },
  seller: {
    key: 'seller',
    roleTitle: 'Role Seller (Mitra Penjual & Produsen Lokal)',
    shortLabel: 'Seller / Penjual',
    badgeText: 'KEBIJAKAN RUANG LINGKUP & BATASAN ROLE SELLER',
    accentColor: 'amber',
    summary:
      'Seller adalah mitra produsen, petani, pengrajin, atau pelaku UMKM yang telah lulus verifikasi administrasi & legalitas (KYB) oleh Role Admin untuk memasarkan produk asli Nusantara.',
    scopeResponsibilities: [
      'Mengelola katalog produk toko, ketersediaan stok, harga jual, serta memproses pesanan pembeli tepat waktu sesuai standar SLA.',
      'Menjaga keaslian mutu produk sesuai izin edar yang didaftarkan (P-IRT, Halal, SNI, atau Indikasi Geografis) dan memperbarui dokumen legalitas yang hampir habis masa berlakunya.',
      'Menyunting (Edit) deskripsi produk, foto produk, maupun cerita di balik produk untuk diajukan ke antrean kurasi Role Moderator.',
      'Merenspons dan mengikuti proses mediasi Role Admin apabila terdapat komplain dari Member/Pembeli maupun kendala pasokan dengan Distributor.',
    ],
    strictBoundaries: [
      'TIDAK DAPAT menayangkan langsung perubahan hasil "Edit" deskripsi produk atau artikel promosi ke Homepage — setiap perubahan wajib disahkan oleh Role Moderator.',
      'TIDAK DAPAT mencairkan dana Escrow secara sepihak sebelum barang berstatus diterima (Delivered) atau diselesaikan melalui verifikasi POD oleh Role Admin.',
      'TIDAK DAPAT mengubah status legalitas NIB/MoU sendiri tanpa audit dan pengesahan berkas oleh Role Admin.',
      'DILARANG menjual produk tiruan, melanggar hak kekayaan intelektual, atau memanipulasi berat/spesifikasi komoditas.',
    ],
    workflowCoordination: [
      {
        title: 'Kepatuhan Dokumen & Legalitas (Diawasi Role Admin)',
        detail:
          'Kontrak MoU kemitraan, NIB, NPWP, dan sertifikat mutu Seller diaudit secara berkala oleh Role Admin.',
      },
      {
        title: 'Kurasi Deskripsi Produk & Artikel (Diawasi Role Moderator)',
        detail:
          'Saat Seller menambah atau mengedit deskripsi produk, draf tersebut masuk ke Dashboard Moderator untuk verifikasi kesesuaian gambar dan teks sebelum tampil di Homepage.',
      },
      {
        title: 'Penyelesaian Komplain & Pencairan (Role Admin & Master Admin)',
        detail:
          'Sengketa barang rusak atau keterlambatan konfirmasi pembeli ditangani oleh Role Admin, sedangkan pencairan akhir buku besar Escrow diawasi Master Admin.',
      },
    ],
  },
  distributor: {
    key: 'distributor',
    roleTitle: 'Role Distributor (Mitra Logistik & Distribusi Wilayah)',
    shortLabel: 'Distributor',
    badgeText: 'KEBIJAKAN RUANG LINGKUP & BATASAN ROLE DISTRIBUTOR',
    accentColor: 'cyan',
    summary:
      'Distributor adalah mitra badan usaha logistik dan pergudangan regional yang mengelola rantai pasok partai besar, penyimpanan gudang (termasuk cold storage), dan pengiriman antardaerah.',
    scopeResponsibilities: [
      'Mengelola stok gudang transit regional, manifest pengiriman, armada distribusi, dan pembaruan status pengiriman pesanan.',
      'Memastikan dokumen legalitas badan usaha (Akta Perseroan, SK Kemenkumham, NIB Pergudangan, Tanda Daftar Gudang, dan SLA Armada) selalu aktif di bawah pengawasan Role Admin.',
      'Mengajukan permohonan adendum jadwal distribusi disertai bukti resmi kepada Role Admin apabila terjadi kendala cuaca ekstrem / keadaan kahar (force majeure).',
      'Mengajukan informasi jadwal distribusi atau liputan kegiatan rantai pasok ke Role Moderator untuk kurasi publikasi.',
    ],
    strictBoundaries: [
      'TIDAK DAPAT mengubah ketentuan kontrak distribusi (MoU) atau kuota wilayah secara sepihak tanpa persetujuan Role Admin.',
      'TIDAK DAPAT mempublikasikan tulisan, agenda, atau pengumuman langsung ke Homepage tanpa melalui kurasi Role Moderator.',
      'TIDAK DAPAT mengakses data keuangan internal Seller lain di luar manifest pengiriman yang ditugaskan.',
      'DILARANG mengalihkan muatan komoditas mitra kepada pihak ketiga yang tidak terdaftar dalam manifest resmi platform.',
    ],
    workflowCoordination: [
      {
        title: 'Audit Legalitas Gudang & MoU (Bersama Role Admin)',
        detail:
          'Berkas PDF Akta, NIB Gudang, dan foto fasilitas gudang diperiksa kesesuaiannya oleh Role Admin.',
      },
      {
        title: 'Mediasi Kendala Pasokan (Bersama Role Admin & Seller)',
        detail:
          'Jika terjadi keterlambatan jalur logistik atau selisih tonase, Role Admin memediasi kesepakatan antara Distributor dan Seller.',
      },
    ],
  },
  'service-provider': {
    key: 'service-provider',
    roleTitle: 'Role Penyedia Jasa (Expert & Layanan Keahlian)',
    shortLabel: 'Penyedia Jasa',
    badgeText: 'KEBIJAKAN RUANG LINGKUP & BATASAN ROLE PENYEDIA JASA',
    accentColor: 'sky',
    summary:
      'Penyedia Jasa (Expert) adalah praktisi ahli, konsultan agronomi, desainer kemasan, maupun teknisi pengolahan yang menawarkan layanan profesional berbasis tahapan kerja (Milestone Escrow).',
    scopeResponsibilities: [
      'Mengelola katalog layanan keahlian, menambah layanan jasa baru, menyusun ruang lingkup kerja (Scope of Work), serta menetapkan paket harga & estimasi durasi.',
      'Menyunting (Edit) deskripsi layanan, metode pelaksanaan, dan portofolio gambar untuk diajukan ke antrean kurasi Role Moderator.',
      'Melaksanakan kontrak proyek jasa sesuai tahapan (Milestone) yang disepakati bersama pengguna jasa dan mengunggah laporan capaian kerja.',
      'Menulis artikel edukasi atau panduan teknis sesuai bidang keahlian untuk dikurasi oleh Role Moderator.',
    ],
    strictBoundaries: [
      'TIDAK DAPAT menayangkan langsung layanan baru atau hasil "Edit" deskripsi jasa ke Homepage sebelum disetujui oleh Role Moderator.',
      'TIDAK DAPAT mencairkan dana tahap Milestone sebelum tahapan kerja diverifikasi selesai.',
      'TIDAK DAPAT mengakses panel administrasi mitra, moderasi arsip publik, maupun kontrol keuangan Master Admin.',
      'DILARANG menawarkan jasa yang melanggar regulasi hukum atau menggunakan gambar portofolio yang tidak sesuai dengan tema keahlian.',
    ],
    workflowCoordination: [
      {
        title: 'Kurasi Katalog Layanan Jasa (Ke Role Moderator)',
        detail:
          'Setiap penambahan atau pengeditan layanan di Dashboard Penyedia Jasa wajib diperiksa kelayakan penulisan dan gambarnya oleh Role Moderator sebelum tayang di Homepage.',
      },
      {
        title: 'Perlindungan Kontrak Milestone (Escrow Platform)',
        detail:
          'Dana proyek ditahan aman di Rekening Bersama dan dicairkan bertahap sesuai progres pengerjaan yang terverifikasi.',
      },
    ],
  },
  moderator: {
    key: 'moderator',
    roleTitle: 'Role Moderator (Otoritas Arsip Tulisan, Naungan Author & Kurasi Homepage)',
    shortLabel: 'Moderator (& Author)',
    badgeText: 'KEBIJAKAN RUANG LINGKUP & BATASAN ROLE MODERATOR',
    accentColor: 'indigo',
    summary:
      'Role Moderator memegang otoritas penuh atas seluruh arsip tulisan di Racik Media Nusantara. Fungsi kepenulisan (Author) berada sepenuhnya di bawah naungan Moderator untuk menjamin mutu redaksi, kesesuaian gambar dengan tema, dan ketertiban tayangan Homepage.',
    scopeResponsibilities: [
      'Menaungi seluruh aktivitas kepenulisan (Author) serta menerima seluruh pengajuan tulisan, artikel, agenda event, deskripsi produk Seller/Distributor, dan deskripsi layanan Penyedia Jasa.',
      'Membaca isi naskah secara menyeluruh, menganalisis kebenaran tata tulis/struktur bahasa, serta memverifikasi apakah gambar sampul sudah sesuai dengan tema tulisan.',
      'Mengedit langsung judul, ringkasan, isi lengkap, maupun mengganti URL gambar pada naskah yang diajukan agar memenuhi standar tayangan publik.',
      'Memegang hak eksklusif untuk Mempublikasikan naskah ke Homepage, Menarik (Unpublish) tayangan dari Homepage, atau Mengembalikan draf untuk direvisi.',
      'Memantau tampilan beranda secara langsung melalui fitur "Lihat Live Homepage (Mode Preview)" dengan proteksi penguncian penuh.',
    ],
    strictBoundaries: [
      'TIDAK MENGURUS dokumen legalitas perusahaan (KTP, NPWP, NIB, Akta) atau persetujuan pengajuan Member menjadi Seller/Distributor — wewenang tersebut adalah milik Role Admin.',
      'TIDAK MENANGANI mediasi komplain kerusakan barang, sengketa pengiriman logistik, atau klaim asuransi transaksi — wewenang tersebut adalah milik Role Admin.',
      'TIDAK MENGELOLA pencairan dana Rekening Bersama (Escrow) atau laporan keuangan strategis yang menjadi wewenang Master Admin.',
    ],
    workflowCoordination: [
      {
        title: 'Gerbang Tunggal Publikasi Homepage',
        detail:
          'Seluruh role (Member, Seller, Distributor, Penyedia Jasa) wajib tunduk pada skema penulisan Moderator; hasil edit mereka selalu masuk ke Dashboard Moderator terlebih dahulu.',
      },
      {
        title: 'Pemisahan Tegas dengan Role Admin',
        detail:
          'Moderator fokus 100% pada kualitas naskah, artikel, event, dan visual Homepage, sementara urusan administrasi mitra & komplain ditangani oleh Role Admin.',
      },
    ],
  },
  admin: {
    key: 'admin',
    roleTitle: 'Role Admin (Administrasi Mitra, Pengajuan Seller/Distributor, Komplain & Legalitas)',
    shortLabel: 'Admin (Administrasi & Legalitas)',
    badgeText: 'KEBIJAKAN RUANG LINGKUP & BATASAN ROLE ADMIN',
    accentColor: 'violet',
    summary:
      'Role Admin menjalankan fungsi administrasi operasional, verifikasi legalitas mitra (KYB), dan penyelesaian komplain agar beban kerja tidak menumpuk pada Master Admin.',
    scopeResponsibilities: [
      'Memeriksa dan memutuskan pengajuan Member menjadi Seller atau Distributor (verifikasi NIK KTP, NPWP, NIB OSS, Izin Edar PIRT/Halal, serta kelayakan toko/gudang).',
      'Memeriksa kesesuaian berkas pendukung yang diajukan: melihat berkas Gambar (foto KTP, foto gudang/roastery, bukti foto komplain) langsung di Dashboard Admin, serta membuka berkas PDF (NIB, Akta, Sertifikat, MoU) di Tab Baru terisolasi untuk mencocokkan isi dokumen.',
      'Menangani komplain dari pihak Member, Seller, maupun Distributor (barang rusak, keterlambatan konfirmasi selesai, sengketa jadwal distribusi) serta menetapkan keputusan mediasi dan penyelesaian masalah.',
      'Mengelola dan mengaudit arsip dokumen administrasi serta masa berlaku legalitas mitra aktif (Kontrak MoU Seller/Distributor, NIB, dan Sertifikat Mutu).',
    ],
    strictBoundaries: [
      'TIDAK MEMILIKI akses untuk mengubah konfigurasi sistem inti, mengambil alih otoritas lintas role Master Admin, atau mencairkan dana strategis di luar prosedur penyelesaian tiket komplain.',
      'TIDAK MENGAMBIL ALIH tugas kurasi redaksi dan publikasi artikel/event ke Homepage yang berada di bawah otoritas penuh Role Moderator.',
      'Pada saat membuka berkas PDF di Tab Baru terisolasi, Admin hanya memeriksa isi dokumen untuk memastikan kesesuaian pengajuan dan kembali melalui tab awal browser (tanpa pintasan navigasi liar).',
    ],
    workflowCoordination: [
      {
        title: 'Meringankan Beban Operasional Master Admin',
        detail:
          'Seluruh pemeriksaan berkas pendaftaran Seller/Distributor, audit MoU, dan mediasi komplain harian diselesaikan di Dashboard Admin (/admin/administration).',
      },
      {
        title: 'Eskalasi Kasus Strategis ke Master Admin',
        detail:
          'Apabila ditemukan pelanggaran hukum berat atau sengketa bernilai besar yang memerlukan pembekuan dana Escrow, Role Admin melakukan eskalasi ke Master Admin.',
      },
    ],
  },
  master_admin: {
    key: 'master_admin',
    roleTitle: 'Role Master Admin (Pusat Kendali Utama, Pengawasan Lintas Role & Keuangan Escrow)',
    shortLabel: 'Master Admin',
    badgeText: 'KEBIJAKAN RUANG LINGKUP & BATASAN MASTER ADMIN',
    accentColor: 'purple',
    summary:
      'Master Admin adalah pemegang otoritas tertinggi platform yang mengawasi kesehatan ekosistem lintas role, mengelola Laporan Keuangan & Rekening Bersama (Escrow), serta mendelegasikan operasional harian kepada Role Admin dan Role Moderator.',
    scopeResponsibilities: [
      'Mengawasi metrik strategis seluruh ekosistem (pertumbuhan pengguna, total transaksi GMV, kesehatan Rekening Bersama Escrow, dan kepatuhan lintas role).',
      'Mengelola Laporan Keuangan & pengesahan pencairan Rekening Bersama (Escrow) bernilai strategis di halaman Laporan Keuangan (/admin/financial-report).',
      'Mendelegasikan tugas administrasi mitra, verifikasi pengajuan Seller/Distributor, pengelolaan dokumen legalitas, dan mediasi komplain kepada Role Admin (/admin/administration).',
      'Mendelegasikan pengelolaan penuh arsip tulisan, jurnal, event, dan kurasi tayangan Homepage kepada Role Moderator (/admin/moderation).',
      'Memiliki akses supervisi lintas dashboard melalui pemilih role resmi di Sidebar Master Admin untuk keperluan audit sistem.',
    ],
    strictBoundaries: [
      'Tidak lagi dibebani pekerjaan teknis harian pemeriksaan satu per satu berkas KTP/NIB atau mediasi komplain rutin karena telah didelegasikan secara terstruktur kepada Role Admin.',
      'Tetap menjaga integritas jejak audit (Audit Trail) pada setiap persetujuan keuangan dan pengawasan lintas dashboard.',
    ],
    workflowCoordination: [
      {
        title: 'Delegasi Administrasi & Legalitas → Role Admin',
        detail:
          'Pengelolaan dokumen Seller/Distributor, pengajuan Member → Mitra, dan penyelesaian komplain didelegasikan ke Role Admin.',
      },
      {
        title: 'Delegasi Redaksi & Publikasi Homepage → Role Moderator',
        detail:
          'Kurasi seluruh arsip tulisan, pemeriksaan gambar tema, dan publikasi ke Homepage didelegasikan ke Role Moderator.',
      },
    ],
  },
};

const ROLE_ORDER: PolicyRoleKey[] = [
  'admin',
  'master_admin',
  'moderator',
  'seller',
  'distributor',
  'service-provider',
  'member',
];

function normalizePolicyRole(raw: string | null | undefined): PolicyRoleKey {
  if (!raw) return 'member';
  const cleaned = raw.toLowerCase().trim();
  if (cleaned === 'admin') return 'admin';
  if (cleaned === 'master_admin' || cleaned === 'super_admin') return 'master_admin';
  if (cleaned === 'moderator' || cleaned === 'author') return 'moderator';
  if (cleaned === 'seller') return 'seller';
  if (cleaned === 'distributor') return 'distributor';
  if (cleaned === 'service-provider' || cleaned === 'service_provider' || cleaned === 'expert') {
    return 'service-provider';
  }
  return 'member';
}

export default function KebijakanPage() {
  const [selectedRole, setSelectedRole] = useState<PolicyRoleKey>('member');
  const [viewMode, setViewMode] = useState<'role' | 'full'>('role');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromUrlAndStorage = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const roleParam = params.get('role');
      const savedDevRole = window.localStorage.getItem('racik-dev-role');

      if (viewParam === 'full') {
        setViewMode('full');
      } else {
        setViewMode('role');
      }

      if (roleParam) {
        setSelectedRole(normalizePolicyRole(roleParam));
      } else if (savedDevRole) {
        setSelectedRole(normalizePolicyRole(savedDevRole));
      } else {
        setSelectedRole('member');
      }
    };

    syncFromUrlAndStorage();
    window.addEventListener('popstate', syncFromUrlAndStorage);
    window.addEventListener('racik-dev-role-change', syncFromUrlAndStorage);
    return () => {
      window.removeEventListener('popstate', syncFromUrlAndStorage);
      window.removeEventListener('racik-dev-role-change', syncFromUrlAndStorage);
    };
  }, []);

  function handleSelectRolePolicy(roleKey: PolicyRoleKey) {
    setSelectedRole(roleKey);
    setViewMode('role');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('role', roleKey);
      url.searchParams.delete('view');
      window.history.replaceState({}, '', url.toString());
    }
  }

  function handleSwitchViewMode(mode: 'role' | 'full') {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (mode === 'full') {
        url.searchParams.set('view', 'full');
      } else {
        url.searchParams.delete('view');
        url.searchParams.set('role', selectedRole);
      }
      window.history.replaceState({}, '', url.toString());
    }
  }

  const activePolicy = ROLE_POLICIES[selectedRole] ?? ROLE_POLICIES.member;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── HERO HEADER KEBIJAKAN (ANIMASI CSS SLOW, KONTRAS TINGGI) ── */}
        <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-indigo-300/60 p-6 sm:p-7 text-white shadow-xl">
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-6">
            <div className="lg:col-span-7 min-w-0 space-y-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                {viewMode === 'role'
                  ? `Ruang Lingkup & Batasan Tanggung Jawab: ${activePolicy.roleTitle}`
                  : 'Kebijakan Penuh Platform: Privasi, Escrow, Administrasi & Tata Kelola Seluruh Role'}
              </h1>

              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                {viewMode === 'role' ? (
                  <>
                    Halaman <strong>Kebijakan Sidebar</strong> ini menjelaskan secara spesifik{' '}
                    <strong className="text-amber-200">
                      ruang lingkup kewenangan, tugas wajib, serta batasan tanggung jawab
                    </strong>{' '}
                    sesuai role Anda. Anda dapat memilih role di bawah ini untuk melihat batasan tiap role, atau mengakses{' '}
                    <strong className="text-emerald-300">Seluruh Kebijakan Penuh Web di bagian Footer</strong>.
                  </>
                ) : (
                  <>
                    Menampilkan <strong>Seluruh Kebijakan Penuh Racik Media Nusantara</strong> yang diakses melalui Footer: mencakup Perlindungan Data Privasi, Ketentuan Rekening Bersama (Escrow), Matriks Ruang Lingkup 7 Role, Otoritas Admin Administrasi &amp; Legalitas, serta Otoritas Moderator.
                  </>
                )}
              </p>
            </div>

            {/* Tombol Beralih Mode Kebijakan Role vs Kebijakan Penuh */}
            <div className="lg:col-span-5 min-w-0 flex flex-col gap-2.5 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSwitchViewMode('role')}
                  className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-xs font-extrabold shadow-md transition text-center leading-snug ${viewMode === 'role'
                      ? 'border-white bg-white text-slate-950'
                      : 'border-white/50 bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <UserCheck className="h-4 w-4 text-indigo-700 shrink-0" />
                  <span>Kebijakan Sesuai Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchViewMode('full')}
                  className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-xs font-extrabold shadow-md transition text-center leading-snug ${viewMode === 'full'
                      ? 'border-white bg-white text-slate-950'
                      : 'border-white/50 bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Kebijakan Penuh Web</span>
                </button>
              </div>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2.5 text-xs sm:text-[13px] font-extrabold text-white shadow-lg transition text-center leading-snug"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span>Kembali ke Beranda</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── PEMILIH KEBIJAKAN SESUAI ROLE (SETIAP ROLE DAPAT MEMILIH KEBIJAKAN ROLE) ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Pilih Kebijakan Ruang Lingkup &amp; Batasan Tanggung Jawab Sesuai Role:
              </h2>
              <p className="text-xs text-slate-500">
                Setiap role memiliki batasan kewenangan yang tegas agar tidak membebani satu pihak dan mencegah penyalahgunaan akses.
              </p>
            </div>
            {viewMode === 'full' && (
              <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 text-[11px] font-bold">
                Mode Tampilan: Seluruh Kebijakan Penuh
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {ROLE_ORDER.map((roleKey) => {
              const item = ROLE_POLICIES[roleKey];
              const isSelected = viewMode === 'role' && selectedRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleSelectRolePolicy(roleKey)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition border ${isSelected
                      ? 'bg-indigo-900 text-white border-indigo-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-900'
                    }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-400'
                      }`}
                  />
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MODE 1: TAMPILAN KEBIJAKAN SPESIFIK SESUAI ROLE YANG DIPILIH (DARI SIDEBAR) ── */}
        {viewMode === 'role' && (
          <div className="space-y-6">
            {/* Ringkasan Mandat Role */}
            <section className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-900 text-white">
                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                      Mandat Resmi &amp; Kedudukan Role
                    </span>
                    <h2 className="font-serif text-xl font-bold text-slate-900">
                      {activePolicy.roleTitle}
                    </h2>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{activePolicy.summary}</p>
            </section>

            {/* Grid 2 Kolom: Ruang Lingkup Tanggung Jawab vs Batasan Tegas Kewenangan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kolom Kiri: Ruang Lingkup & Tanggung Jawab Utama */}
              <section className="rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      1. Ruang Lingkup &amp; Tanggung Jawab Utama
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hak akses dan kewajiban operasional yang dipegang oleh {activePolicy.shortLabel}.
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {activePolicy.scopeResponsibilities.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 text-xs text-slate-800 leading-relaxed"
                    >
                      <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Kolom Kanan: Batasan Tanggung Jawab & Larangan Keras */}
              <section className="rounded-2xl border-2 border-rose-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-800">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      2. Batasan Tanggung Jawab &amp; Larangan Akses
                    </h3>
                    <p className="text-xs text-slate-500">
                      Batas tegas kewenangan yang tidak boleh dilampaui oleh {activePolicy.shortLabel}.
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {activePolicy.strictBoundaries.map((bound, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl bg-rose-50/50 border border-rose-100 p-3 text-xs text-slate-800 leading-relaxed"
                    >
                      <Lock className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{bound}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Alur Koordinasi & Hubungan Antar-Role */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    3. Alur Koordinasi &amp; Pendelegasian Lintas Role
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tata cara kerja sama antara {activePolicy.shortLabel} dengan role lainnya di platform.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activePolicy.workflowCoordination.map((coord, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5"
                  >
                    <p className="text-xs font-extrabold text-indigo-950">{coord.title}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{coord.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Banner Akses ke Kebijakan Penuh di Footer — Tema Seragam dengan Hero Dashboard */}
            <section className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-indigo-300/60 p-6 text-white shadow-xl">
              <div
                aria-hidden="true"
                className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-emerald-400/30 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-sm">
                    Ingin Membaca Seluruh Kebijakan Penuh di Web Ini?
                  </h3>
                  <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                    Kebijakan pada menu Sidebar ini difokuskan pada <strong className="text-amber-200">ruang lingkup &amp; batasan tanggung jawab sesuai role Anda</strong>. Untuk membaca <strong className="text-emerald-300">Kebijakan Penuh Seluruh Web</strong> (Kebijakan Privasi, Syarat &amp; Ketentuan Escrow, Matriks Lengkap 7 Role, dan Penyelesaian Sengketa), Anda dapat mengklik menu <strong>Kebijakan Penuh di bagian Footer</strong> bawah halaman atau tombol di samping.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchViewMode('full')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg transition shrink-0"
                >
                  <BookOpen className="h-4 w-4" />
                  Lihat Seluruh Kebijakan Penuh Web
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── MODE 2: SELURUH KEBIJAKAN PENUH WEB (DIAKSES DARI FOOTER / TOMBOL FULL) ── */}
        {viewMode === 'full' && (
          <div className="space-y-8">
            {/* Section 1: Matriks Lengkap Ruang Lingkup & Batasan Seluruh Role */}
            <section
              id="matriks-role"
              className="rounded-3xl border border-indigo-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-indigo-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                    1. Matriks Lengkap Ruang Lingkup &amp; Batasan Tanggung Jawab Seluruh Role
                  </h2>
                  <p className="text-xs text-gray-500">
                    Pembagian wewenang 7 role utama di Racik Media Nusantara agar tata kelola seimbang dan aman.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {ROLE_ORDER.map((roleKey) => {
                  const spec = ROLE_POLICIES[roleKey];
                  return (
                    <div
                      key={roleKey}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                            {spec.badgeText}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">{spec.roleTitle}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectRolePolicy(roleKey)}
                          className="rounded-xl bg-white border border-slate-300 hover:border-indigo-400 px-3 py-1.5 text-xs font-bold text-indigo-900 transition"
                        >
                          Fokus Kebijakan {spec.shortLabel} →
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{spec.summary}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="rounded-xl border border-emerald-200 bg-white p-3.5 space-y-1.5">
                          <p className="text-[11px] font-extrabold uppercase text-emerald-800">
                            ✓ Ruang Lingkup &amp; Kewenangan:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                            {spec.scopeResponsibilities.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl border border-rose-200 bg-white p-3.5 space-y-1.5">
                          <p className="text-[11px] font-extrabold uppercase text-rose-800">
                            ✕ Batasan Tanggung Jawab:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
                            {spec.strictBoundaries.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 2: Peran Role Admin (Administrasi, Pengajuan Mitra, Komplain & Legalitas) */}
            <section
              id="peran-admin"
              className="rounded-3xl border border-violet-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-violet-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                    2. Otoritas Role Admin — Administrasi Dokumen, Pengajuan Mitra, Komplain &amp; Legalitas
                  </h2>
                  <p className="text-xs text-gray-500">
                    Pemisahan fungsi administrasi harian dari Master Admin untuk mempercepat layanan mitra.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-1.5">
                  <p className="font-bold text-violet-950">
                    A. Verifikasi Pengajuan Member → Seller/Distributor
                  </p>
                  <p className="leading-relaxed">
                    Role Admin memeriksa kelengkapan KTP, NPWP, NIB, dan foto lokasi kebun/gudang. Berkas gambar diperiksa langsung di Dashboard Admin, sedangkan dokumen PDF dibuka di tab baru terisolasi untuk mencocokkan keabsahan isi dokumen.
                  </p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-1.5">
                  <p className="font-bold text-violet-950">
                    B. Mediasi Komplain &amp; Penyelesaian Masalah
                  </p>
                  <p className="leading-relaxed">
                    Setiap komplain dari Member, Seller, atau Distributor (barang rusak, keterlambatan konfirmasi pesanan, atau penyesuaian jadwal distribusi) ditangani dan diputuskan solusinya oleh Role Admin.
                  </p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-1.5">
                  <p className="font-bold text-violet-950">
                    C. Audit Dokumen Administrasi &amp; Legalitas
                  </p>
                  <p className="leading-relaxed">
                    Role Admin memantau masa berlaku Kontrak MoU Kemitraan, NIB OSS, serta sertifikat mutu (PIRT, Halal, SNI) seluruh Seller dan Distributor.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Otoritas Role Moderator & Ruang Lingkup Edit */}
            <section
              id="peran-moderator"
              className="rounded-3xl border border-indigo-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-indigo-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                    3. Otoritas Role Moderator, Naungan Penulis (Author) &amp; Ruang Lingkup &quot;Edit&quot;
                  </h2>
                  <p className="text-xs text-gray-500">
                    Kendali penuh atas arsip tulisan, pemeriksaan gambar tema, dan penayangan ke Homepage.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
                  <h3 className="font-extrabold uppercase tracking-wider text-amber-950">
                    Hak Edit bagi Member, Seller, Distributor &amp; Penyedia Jasa
                  </h3>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li>
                      Seluruh role tetap memiliki tombol <strong>Edit</strong> untuk menyunting tulisan, event, atau deskripsi produk/jasa mereka.
                    </li>
                    <li>
                      Hasil <em>Edit</em> tersebut <strong>tidak langsung tayang di Homepage</strong>, melainkan masuk ke antrean <strong>Dashboard Moderator</strong> untuk diperiksa kembali.
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
                  <h3 className="font-extrabold uppercase tracking-wider text-emerald-950">
                    Kewenangan Eksklusif Role Moderator
                  </h3>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li>
                      Menaungi seluruh penulis (Author), menganalisis kebenaran tata tulis, dan memastikan gambar sesuai dengan tema tulisan.
                    </li>
                    <li>
                      Mengedit isi naskah secara langsung dan memegang keputusan tunggal untuk <strong>Mempublikasikan ke Homepage</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4: Kebijakan Privasi & Perlindungan Data */}
            <section
              id="privasi"
              className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                    4. Kebijakan Privasi &amp; Perlindungan Data Pengguna
                  </h2>
                  <p className="text-xs text-gray-500">
                    Pengumpulan, penggunaan, dan keamanan data pribadi serta dokumen legalitas mitra.
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  Kami mengumpulkan informasi penting akun (nama, alamat email terdaftar, alamat pengiriman pesanan, serta dokumen KYB mitra) semata-mata untuk memfasilitasi transaksi marketplace, verifikasi legalitas oleh Role Admin, serta pengelolaan akun anggota.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
                  <li>Data pribadi dan dokumen hukum mitra tidak pernah dijual atau dialihkan ke pihak ketiga yang tidak berwenang.</li>
                  <li>Penyimpanan sesi dan autentikasi dilindungi secara kriptografis melalui Supabase Auth.</li>
                  <li>Seluruh akses dashboard diproteksi sesuai verifikasi role resmi pada basis data.</li>
                </ul>
              </div>
            </section>

            {/* Section 5: Syarat & Ketentuan Transaksi (Escrow) */}
            <section
              id="syarat"
              className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                    5. Ketentuan Transaksi &amp; Rekening Bersama (Escrow)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Jaminan keamanan pembayaran bagi Member, Seller, Distributor, dan Penyedia Jasa.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-1.5">
                  <p className="font-bold text-gray-900">
                    Produk Marketplace (Seller &amp; Distributor)
                  </p>
                  <p className="leading-relaxed">
                    Dana pembeli ditahan aman di Rekening Bersama (Escrow) hingga barang tiba dalam kondisi baik dan diverifikasi oleh pembeli atau disahkan melalui bukti POD oleh Role Admin.
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-1.5">
                  <p className="font-bold text-gray-900">
                    Layanan Jasa Keahlian (Kontrak Milestone)
                  </p>
                  <p className="leading-relaxed">
                    Pembayaran jasa dicairkan secara bertahap sesuai capaian target pengerjaan (Milestone) yang telah disepakati kedua belah pihak.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
