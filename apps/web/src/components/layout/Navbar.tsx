'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Palette,
  PenLine,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore, selectCartCount } from '@/stores/cart.store';

type DropdownName = 'article' | 'theme' | 'user' | null;
type ThemeName = 'light' | 'dark' | 'ocean' | 'sunset' | 'lavender';

/*
 * EDIT MANUAL - DAFTAR TEMA
 * Setiap item menentukan satu pilihan warna pada menu Tema:
 *
 * id:
 *   Nama teknis tema. Nilai ini disimpan ke localStorage dan dipakai sebagai
 *   data-theme pada HTML. Contoh tema baru: 'forest' atau 'rose'.
 *
 * label:
 *   Nama tema yang terlihat oleh pengguna pada dropdown.
 *
 * swatch:
 *   Warna kotak preview pada menu. Gunakan class Tailwind, seperti:
 *   bg-white, bg-slate-800, bg-sky-500, bg-emerald-600, atau bg-[#HEXCOLOR].
 *
 * Untuk menambah tema:
 * 1. Tambahkan nama baru pada ThemeName, misalnya 'forest'.
 * 2. Tambahkan objek tema pada array themes di bawah.
 * 3. Tambahkan CSS html[data-theme="forest"] pada globals.css.
 *
 * Contoh:
 * { id: 'forest', label: 'Hutan', swatch: 'bg-emerald-700' }
 */
const themes: { id: ThemeName; label: string; swatch: string }[] = [
  { id: 'light', label: 'Terang', swatch: 'bg-white border border-gray-300' },
  { id: 'dark', label: 'Gelap', swatch: 'bg-slate-800' },
  { id: 'ocean', label: 'Samudra', swatch: 'bg-sky-500' },
  { id: 'sunset', label: 'Senja', swatch: 'bg-amber-500' },
  { id: 'lavender', label: 'Lavender', swatch: 'bg-purple-500' },
];

const roleLabels: Record<string, string> = {
  member: 'Member',
  author: 'Author',
  seller: 'Seller',
  distributor: 'Distributor',
  service_provider: 'Penyedia Jasa',
  moderator: 'Moderator',
  admin: 'Admin',
};

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, session, loading } = useAuth();
  const cartItems = useCartStore((s) => s.items);
  const cartCount = selectCartCount(cartItems);
  const [openDropdown, setOpenDropdown] = useState<DropdownName>(null);
  const [theme, setTheme] = useState<ThemeName>('light');
  const [roles, setRoles] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('racik-theme') as ThemeName | null;
    if (saved && themes.some((item) => item.id === saved)) {
      setTheme(saved);
      document.documentElement.dataset.theme = saved === 'light' ? '' : saved;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setRoles([]);
      return;
    }

    supabase
      .from('user_roles')
      .select('role_type, status')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .then(({ data }) => {
        setRoles((data ?? []).map((item) => item.role_type).filter(Boolean));
      });
  }, [session?.user.id]);

  const fullName =
    (session?.user?.user_metadata?.full_name as string) ||
    session?.user?.email?.split('@')[0] ||
    'Pengguna';
  const displayName = fullName.split(' ')[0];
  const initial = (fullName[0] || 'U').toUpperCase();
  const activeRole = roles.includes('admin')
    ? 'admin'
    : roles.includes('moderator')
      ? 'moderator'
      : roles.includes('seller')
        ? 'seller'
        : roles.includes('author')
          ? 'author'
          : roles.includes('distributor')
            ? 'distributor'
            : roles.includes('service_provider')
              ? 'service_provider'
              : 'member';

  function toggleDropdown(name: Exclude<DropdownName, null>) {
    setOpenDropdown((current) => (current === name ? null : name));
  }

  function changeTheme(nextTheme: ThemeName) {
    // EDIT MANUAL - AKSI SAAT TEMA DIPILIH:
    // nextTheme dipakai untuk menyimpan tema terakhir dan memberi atribut
    // data-theme pada tag <html>. Tema 'light' mengosongkan atribut agar CSS
    // kembali memakai warna default. Untuk custom tema lain, CSS harus ada di
    // html[data-theme="nama-tema"] pada globals.css.
    setTheme(nextTheme);
    window.localStorage.setItem('racik-theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme === 'light' ? '' : nextTheme;
    setOpenDropdown(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpenDropdown(null);
    router.push('/login');
    router.refresh();
  }

  const roleMenu = {
    member: [
      ['Dashboard Member', '/dashboard'],
      ['Profil Saya', '/profile'],
      ['Pesanan Saya', '/orders'],
      ['Artikel Tersimpan', '/bookmarks'],
    ],
    seller: [
      ['Dashboard Seller', '/seller/dashboard'],
      ['Produk Saya', '/seller/products'],
      ['Pesanan Masuk', '/seller/orders'],
      ['Laporan Seller', '/seller/reports'],
    ],
    author: [
      ['Dashboard Author', '/author/dashboard'],
      ['Tulis Artikel', '/articles/write'],
    ],
    distributor: [
      ['Dashboard Distributor', '/distributor/dashboard'],
    ],
    service_provider: [
      ['Dashboard Penyedia Jasa', '/service-provider/dashboard'],
    ],
    moderator: [
      ['Dashboard Moderasi', '/admin/dashboard'],
      ['Antrean Moderasi', '/admin/moderation'],
    ],
    admin: [
      ['Dashboard Admin', '/admin/dashboard'],
      ['Moderasi', '/admin/moderation'],
      ['Verifikasi Seller', '/admin/seller-verification'],
      ['Laporan Keuangan', '/admin/financial-report'],
    ],
  } as const;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm" data-theme={theme}>
      <nav ref={navRef} className="mx-auto flex h-[64px] max-w-[1440px] items-center gap-2 px-3 sm:px-4">
        {/* EDIT MANUAL - TOMBOL SIDEBAR:
            - Ubah h-[40px]/w-[40px] untuk ukuran lingkaran tombol tiga garis.
            - Ubah Menu h-[20px]/w-[20px] untuk ukuran ikon tiga garis.
            - Ubah px-3 pada <nav> untuk menggeser semua tombol logo/menu secara horizontal.
            - Nama posisi: h=tinggi tombol, w=lebar tombol, px=jarak kiri-kanan navbar.
            - Jangan menambah margin kiri pada tombol agar pusat ikon tetap sejajar dengan rail sidebar 64px.
        */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('racik-sidebar-toggle'))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-300"
          aria-label="Buka atau sembunyikan sidebar"
          title="Buka atau sembunyikan sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="h-6 w-px shrink-0 bg-gray-200" aria-hidden="true" />
        {/* EDIT MANUAL - LOGO NAVBAR:
            - Ubah mr/ml pada Link untuk jarak logo dengan tombol menu dan menu Artikel.
            - Ubah text-lg untuk ukuran tulisan Racik Media.
            - Sembunyikan bagian "Media" pada mobile lewat kelas hidden sm:inline.
        */}
        <Link href="/" className="ml-1 mr-1 shrink-0 text-lg font-bold text-primary-700">
          Racik<span className="hidden sm:inline"> Media</span>
        </Link>

        {/* EDIT MANUAL - DROPDOWN ARTIKEL:
            Menu, lebar popup, dan jarak popup dapat diubah pada blok "Artikel" ini.
        */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => toggleDropdown('article')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              openDropdown === 'article'
                ? 'border-transparent bg-primary-700 text-white shadow-lg'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-700'
            }`}
          >
            <PenLine className="h-4 w-4" />
            Artikel
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {openDropdown === 'article' && (
            <div className="absolute left-0 top-[calc(100%+8px)] w-[220px] rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
              <Link href="/articles" className="block px-4 py-2.5 text-xs hover:bg-primary-50 hover:text-primary-700">
                <span className="block font-semibold text-gray-800">Membaca</span>
                <span className="mt-1 block text-gray-500">Jelajahi artikel dan jurnal lokal</span>
              </Link>
              <Link href="/bookmarks" className="block px-4 py-2.5 text-xs hover:bg-primary-50 hover:text-primary-700">
                <span className="block font-semibold text-gray-800">Artikel tersimpan</span>
                <span className="mt-1 block text-gray-500">Lanjutkan membaca favorit Anda</span>
              </Link>
              <Link href="/articles/write" className="block px-4 py-2.5 text-xs hover:bg-primary-50 hover:text-primary-700">
                <span className="block font-semibold text-gray-800">Menulis</span>
                <span className="mt-1 block text-gray-500">Buat dan publikasikan tulisan</span>
              </Link>
            </div>
          )}
        </div>

        {/* EDIT MANUAL - PENCARIAN:
            - h-10 = tinggi kolom pencarian.
            - rounded-lg = sudut kolom.
            - placeholder="..." = teks panduan pencarian.
            - mx-1 = jarak dari menu Artikel dan area sebelah kanan.
        */}
        <div className="mx-1 hidden min-w-0 flex-1 md:flex">
          <label className="flex h-10 w-full items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
            <span className="sr-only">Cari</span>
            <input
              type="search"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder="Cari produk lokal berkualitas..."
            />
          </label>
        </div>

        {/* EDIT MANUAL - TEMA:
            - daftar tema ada pada variabel themes.
            - warna tema, dropdown, dan teks tema dapat diedit pada blok ini.
            - w-[330px] mengatur lebar dropdown tema.
            - grid-cols-5 mengatur jumlah tema dalam satu baris.
            - h-8/w-8 mengatur ukuran kotak warna preview.
            - rounded-lg mengatur sudut kotak warna dan tombol tema.
            - tema aktif memiliki border-primary-500 dan background primary-50.
        */}
        <div className="relative ml-auto hidden md:block">
          <button
            type="button"
            onClick={() => toggleDropdown('theme')}
            className="flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:border-primary-300 hover:text-primary-700"
            aria-label="Pilih tema"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden lg:inline">Tema</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {openDropdown === 'theme' && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[330px] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Tema tampilan</p>
              <div className="grid grid-cols-5 gap-2">
                {themes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeTheme(item.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-[10px] font-semibold transition ${
                      theme === item.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className={`h-8 w-8 rounded-lg ${item.swatch}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* EDIT MANUAL - IKON KERANJANG DAN NOTIFIKASI:
            Ubah p-2 untuk area klik, h-5/w-5 untuk ukuran ikon, dan rounded-lg untuk sudut hover.
        */}
        <Link href="/cart" className="relative hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-primary-700 sm:block" aria-label="Keranjang">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Link>
        <button type="button" className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-primary-700 sm:block" aria-label="Notifikasi">
          <Bell className="h-5 w-5" />
        </button>

        {/* EDIT MANUAL - PORTAL PENGGUNA:
            - roleLabels mengatur nama role yang ditampilkan.
            - roleMenu mengatur menu dropdown tiap role.
            - ukuran lingkaran avatar/portal dapat diubah pada blok auth di bawah.
        */}
        {!loading && (
          isAuthenticated ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => toggleDropdown('user')}
                className="flex h-10 items-center gap-2 rounded-full px-2 transition hover:bg-primary-50"
                aria-label="Portal pengguna"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 to-sky-300 text-xs font-bold text-primary-900">
                  {initial}
                </span>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 lg:block">{displayName}</span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-gray-400 lg:block" />
              </button>
              {openDropdown === 'user' && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[260px] rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                  <div className="mb-1 border-b border-gray-100 px-4 pb-3">
                    <p className="truncate text-sm font-semibold text-gray-800">{fullName}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(roles.length ? roles : ['member']).map((role) => (
                        <span key={role} className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">
                          {roleLabels[role] ?? role}
                        </span>
                      ))}
                    </div>
                  </div>
                  {roleMenu[activeRole].map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpenDropdown(null)}
                      className="flex px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      {label}
                    </Link>
                  ))}
                  {roles.length > 1 && (
                    <div className="mx-4 my-1 border-t border-gray-100 pt-2">
                      <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">Pindah peran</p>
                      {roles.map((role) => (
                        <Link
                          key={role}
                          href={
                            role === 'admin'
                              ? '/admin/dashboard'
                              : role === 'moderator'
                                ? '/admin/dashboard'
                                : role === 'seller'
                                  ? '/seller/dashboard'
                                  : role === 'author'
                                    ? '/author/dashboard'
                                    : role === 'distributor'
                                      ? '/distributor/dashboard'
                                      : role === 'service_provider'
                                        ? '/service-provider/dashboard'
                                        : '/dashboard'
                          }
                          onClick={() => setOpenDropdown(null)}
                          className="block py-1.5 text-xs text-primary-700 hover:underline"
                        >
                          Buka dashboard {roleLabels[role] ?? role}
                        </Link>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 border-t border-gray-100 px-4 py-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 px-3 text-sm font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-50">
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">Masuk</span>
            </Link>
          )
        )}

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="rounded-lg p-2 text-gray-600 md:hidden"
          aria-label="Buka menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <div className="grid gap-2">
            <Link href="/marketplace" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Marketplace</Link>
            <Link href="/articles" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Artikel</Link>
            <Link href="/articles/write" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Menulis artikel</Link>
            <Link href="/cart" className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Keranjang ({cartCount})</Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50">
                Buka dashboard {roleLabels[activeRole] ?? activeRole}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
