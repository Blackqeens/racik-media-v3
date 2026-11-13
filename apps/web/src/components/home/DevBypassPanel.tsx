'use client';

import Link from 'next/link';
import {
  LayoutDashboard,
  Store,
  ShieldCheck,
  PenLine,
  Truck,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
} from 'lucide-react';
import { useState } from 'react';

/**
 * DevBypassPanel — Panel pengembangan untuk bypass akses ke semua dashboard.
 * Menyimpan role aktif ke localStorage ('racik-dev-role') agar Navbar & Sidebar
 * otomatis menyesuaikan nama user, badge role, dan menu sesuai role yang dipilih.
 */

const ROLE_DASHBOARDS = [
  {
    roleKey: 'member',
    role: 'Buyer / Member',
    desc: 'Dashboard pembeli — pesanan, bookmark, profil',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    pages: [
      { label: 'Dashboard Member', href: '/dashboard' },
      { label: 'Pesanan Saya', href: '/orders' },
      { label: 'Bookmark', href: '/bookmarks' },
      { label: 'Profil Saya', href: '/profile' },
      { label: 'Keranjang', href: '/cart' },
      { label: 'Checkout', href: '/checkout' },
    ],
  },
  {
    roleKey: 'seller',
    role: 'Seller / Penjual',
    desc: 'Dashboard penjual — produk, toko, pendaftaran',
    href: '/seller/dashboard',
    icon: Store,
    color: 'bg-emerald-600',
    hoverColor: 'hover:bg-emerald-700',
    pages: [
      { label: 'Dashboard Toko', href: '/seller/dashboard' },
      { label: 'Daftar Produk', href: '/seller/products' },
      { label: 'Tambah Produk', href: '/seller/products/new' },
      { label: 'Registrasi Seller', href: '/seller/register' },
    ],
  },
  {
    roleKey: 'service_provider',
    role: 'Expert / Penyedia Jasa',
    desc: 'Dashboard jasa — layanan, kontrak milestone',
    href: '/service-provider/dashboard',
    icon: BriefcaseBusiness,
    color: 'bg-violet-600',
    hoverColor: 'hover:bg-violet-700',
    pages: [
      { label: 'Dashboard Jasa', href: '/service-provider/dashboard' },
      { label: 'Daftar Layanan', href: '/services' },
    ],
  },
  {
    roleKey: 'distributor',
    role: 'Distributor',
    desc: 'Dashboard distribusi — logistik, pengiriman',
    href: '/distributor/dashboard',
    icon: Truck,
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700',
    pages: [
      { label: 'Dashboard Distributor', href: '/distributor/dashboard' },
    ],
  },
  {
    roleKey: 'moderator',
    role: 'Moderator (Naungan Penulis)',
    desc: 'Otoritas penuh arsip tulisan, naungan author, analisis gambar tema & publikasi homepage',
    href: '/admin/moderation',
    icon: ClipboardCheck,
    color: 'bg-teal-600',
    hoverColor: 'hover:bg-teal-700',
    pages: [
      { label: 'Panel Arsip & Moderasi', href: '/admin/moderation' },
      { label: 'Koleksi Artikel', href: '/articles' },
      { label: 'Koleksi Event', href: '/events' },
      { label: 'Tulis Ide & Cerita', href: '/articles/write' },
    ],
  },
  {
    roleKey: 'admin',
    role: 'Admin (Administrasi & Legalitas)',
    desc: 'Pengelolaan dokumen administrasi seller/distributor, pengajuan member → mitra, komplain & penyelesaian masalah',
    href: '/admin/administration',
    icon: FileCheck2,
    color: 'bg-indigo-600',
    hoverColor: 'hover:bg-indigo-700',
    pages: [
      { label: 'Dashboard Admin (Administrasi)', href: '/admin/administration' },
      { label: 'Pengajuan Member → Seller/Distributor', href: '/admin/seller-verification' },
      { label: 'Komplain & Penyelesaian Masalah', href: '/admin/administration?tab=complaints' },
      { label: 'Dokumen & Legalitas Mitra', href: '/admin/administration?tab=legality' },
    ],
  },
  {
    roleKey: 'master_admin',
    role: 'Master Admin',
    desc: 'Pusat kendali lintas role — pengawasan strategis, rekening bersama escrow & laporan keuangan',
    href: '/admin/dashboard',
    icon: ShieldCheck,
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
    pages: [
      { label: 'Master Admin Dashboard', href: '/admin/dashboard' },
      { label: 'Delegasi Admin Administrasi', href: '/admin/administration' },
      { label: 'Delegasi Moderasi Konten', href: '/admin/moderation' },
      { label: 'Laporan Keuangan & Escrow', href: '/admin/financial-report' },
    ],
  },
];

function activateDevRole(roleKey: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('racik-dev-role', roleKey);
    if (roleKey === 'seller' || roleKey === 'distributor' || roleKey === 'service_provider') {
      const originRole = roleKey === 'service_provider' ? 'service-provider' : roleKey;
      window.localStorage.setItem('racik-partner-origin-role', originRole);
    } else {
      window.localStorage.removeItem('racik-partner-origin-role');
    }
    if (roleKey === 'master_admin') {
      window.localStorage.setItem('racik-dev-master', 'true');
    } else {
      window.localStorage.removeItem('racik-dev-master');
    }
    window.dispatchEvent(new Event('racik-dev-role-change'));
  }
}

export function DevBypassPanel() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-10 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-700">
          🔧 Dev Mode — Bypass Akses
        </span>
        <h2 className="mt-3 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
          Pilih Role & Akses Dashboard
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Klik salah satu role untuk langsung mengatur sesi role aktif dan masuk ke dashboard terkait.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_DASHBOARDS.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedRole === item.role;

          return (
            <div
              key={item.role}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Card Header — klik untuk expand sub-pages */}
              <button
                type="button"
                onClick={() => setExpandedRole(isExpanded ? null : item.role)}
                className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-gray-50"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">{item.role}</h3>
                  <p className="mt-0.5 text-xs text-gray-500 leading-snug">{item.desc}</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Expanded Sub-pages */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-2 space-y-1">
                  {item.pages.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      onClick={() => activateDevRole(item.roleKey)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                      {page.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Access Button */}
              <div className="border-t border-gray-100 px-4 py-3">
                <Link
                  href={item.href}
                  onClick={() => activateDevRole(item.roleKey)}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${item.color} ${item.hoverColor}`}
                >
                  <Icon className="h-4 w-4" />
                  Masuk sebagai {item.role.split(' / ')[0]}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Halaman Publik */}
      <div className="mx-auto mt-8 max-w-5xl">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Halaman Publik (tanpa login)
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: 'Marketplace', href: '/marketplace' },
            { label: 'Layanan Jasa', href: '/services' },
            { label: 'Artikel', href: '/articles' },
            { label: 'Events', href: '/events' },
            { label: 'Cerita Kami', href: '/cerita-kami' },
            { label: 'Kebijakan', href: '/kebijakan' },
            { label: 'Login', href: '/login' },
            { label: 'Register', href: '/register' },
            { label: 'Forgot Password', href: '/forgot-password' },
          ].map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {page.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
