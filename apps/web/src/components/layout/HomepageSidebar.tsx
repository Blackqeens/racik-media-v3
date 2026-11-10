'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  Home,
  LogIn,
  LogOut,
  Newspaper,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  UserPlus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore, selectCartCount } from '@/stores/cart.store';

/**
 * HomepageSidebar — Sidebar khusus untuk beranda ('/') Racik Media.
 * Hanya berisi navigasi eksplorasi beranda & halaman publik,
 * TANPA akses ke Dashboard Utama (sesuai aturan pemisahan Homepage).
 */
export function HomepageSidebar() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const hasRealSession = !!session?.user?.id;

  const cartItems = useCartStore((s) => s.items);
  const cartCount = selectCartCount(cartItems);

  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('top');

  // Inisialisasi state awal sidebar dari localStorage
  useEffect(() => {
    const saved = window.localStorage.getItem('racik-homepage-sidebar-expanded');
    if (saved === 'true' || saved === 'false') {
      setExpanded(saved === 'true');
    }
    const frameId = window.requestAnimationFrame(() => setSidebarReady(true));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  // Dengarkan klik tombol hamburger di HomepageNavbar
  useEffect(() => {
    function handleNavbarToggle() {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        setMobileOpen((prev) => !prev);
      } else {
        setExpanded((current) => {
          const next = !current;
          window.localStorage.setItem('racik-homepage-sidebar-expanded', String(next));
          return next;
        });
      }
    }

    window.addEventListener('racik-sidebar-toggle', handleNavbarToggle);
    return () => window.removeEventListener('racik-sidebar-toggle', handleNavbarToggle);
  }, []);

  // Scroll spy untuk menandai section beranda yang sedang aktif
  useEffect(() => {
    const sectionIds = ['articles', 'marketplace', 'services-showcase', 'events', 'more-stories'];

    function handleScroll() {
      if (window.scrollY < 300) {
        setActiveSection('top');
        return;
      }
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180 && rect.bottom >= 180) {
            setActiveSection(id);
            break;
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollToSection(sectionId: string) {
    setMobileOpen(false);
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('top');
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 76;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  }

  function toggleDesktopExpand() {
    setExpanded((current) => {
      const next = !current;
      window.localStorage.setItem('racik-homepage-sidebar-expanded', String(next));
      return next;
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push('/login');
    router.refresh();
  }

  const sectionItems = [
    { id: 'top', label: 'Sorotan Utama', icon: Home },
    { id: 'articles', label: 'Jurnal & Artikel', icon: Newspaper },
    { id: 'marketplace', label: 'Etalase Pasar', icon: Store },
    { id: 'services-showcase', label: 'Layanan Ahli', icon: BriefcaseBusiness },
    { id: 'events', label: 'Agenda Komunitas', icon: Calendar },
    { id: 'more-stories', label: 'Cerita Nusantara', icon: Sparkles },
  ];

  const pageLinks = [
    { label: 'Halaman Marketplace', href: '/marketplace', icon: Compass },
    { label: 'Halaman Layanan Jasa', href: '/services', icon: BriefcaseBusiness },
    { label: 'Indeks Artikel', href: '/articles', icon: Newspaper },
    { label: 'Jadwal Event', href: '/events', icon: Calendar },
    { label: 'Cerita Kami', href: '/cerita-kami', icon: BookOpen },
    { label: 'Kebijakan Platform', href: '/kebijakan', icon: ShieldCheck },
    {
      label: 'Keranjang Belanja',
      href: '/cart',
      icon: ShoppingCart,
      badge: cartCount > 0 ? (cartCount > 99 ? '99+' : String(cartCount)) : null,
    },
  ];

  const isWide = expanded || mobileOpen;

  return (
    <>
      {/* Backdrop gelap khusus layar mobile saat sidebar dibuka */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-[64px] z-20 bg-slate-950/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Navigasi Beranda"
        className={`fixed bottom-0 left-0 top-[64px] z-30 shrink-0 border-r border-gray-200 bg-white shadow-xl md:sticky md:top-[64px] md:z-20 md:h-[calc(100vh-64px)] md:self-start md:shadow-none ${
          sidebarReady ? 'transition-all duration-300 ease-in-out' : 'transition-none'
        } ${
          mobileOpen ? 'translate-x-0 w-[224px]' : '-translate-x-full md:translate-x-0'
        } ${expanded ? 'md:w-[220px]' : 'md:w-[64px]'}`}
      >
        <nav className="flex h-full flex-col overflow-y-auto overflow-x-hidden px-1.5 pb-3 pt-2">
          {/* Header kecil + tombol ciutkan di desktop */}
          <div className="mb-1 flex items-center justify-between px-2">
            {isWide && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Eksplorasi Beranda
              </span>
            )}
            <button
              type="button"
              onClick={toggleDesktopExpand}
              className="hidden h-7 w-7 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 md:inline-flex ml-auto"
              title={expanded ? 'Ciutkan sidebar' : 'Lebarkan sidebar'}
              aria-label={expanded ? 'Ciutkan sidebar' : 'Lebarkan sidebar'}
            >
              {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {/* Section 1: Lompat ke Bagian di Beranda */}
          <div className="space-y-0.5">
            {sectionItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  title={!isWide ? item.label : undefined}
                  className={`group relative flex h-9 w-full items-center rounded-lg text-left text-xs font-medium transition ${
                    isWide ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
                  } ${
                    active
                      ? 'bg-emerald-50 font-semibold text-emerald-800'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-700' : 'text-gray-500'}`}
                  />
                  {isWide && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Divider Halaman Publik */}
          <div className="my-2.5 border-t border-gray-100 px-2">
            {isWide && (
              <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Halaman Publik
              </p>
            )}
          </div>

          {/* Section 2: Tautan Halaman Publik */}
          <div className="space-y-0.5">
            {pageLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={!isWide ? item.label : undefined}
                  className={`group relative flex h-9 items-center rounded-lg text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 ${
                    isWide ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-gray-500" />
                  {isWide && <span className="truncate">{item.label}</span>}
                  {item.badge && (
                    <span
                      className={`rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-emerald-800 ${
                        isWide ? 'ml-auto' : 'absolute right-1 top-1'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider Akun (Masuk / Daftar saja, tanpa akses Dashboard Utama) */}
          <div className="my-2.5 border-t border-gray-100 px-2">
            {isWide && (
              <p className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Autentikasi
              </p>
            )}
          </div>

          <div className="mt-auto space-y-1 pt-1">
            {!loading && hasRealSession ? (
              <button
                onClick={handleLogout}
                type="button"
                title={!isWide ? 'Keluar' : undefined}
                className={`flex h-9 w-full items-center rounded-lg text-xs font-semibold text-rose-600 transition hover:bg-rose-50 ${
                  isWide ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
                }`}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {isWide && <span>Keluar</span>}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  title={!isWide ? 'Masuk' : undefined}
                  className={`flex h-9 items-center rounded-lg text-xs font-medium text-gray-700 transition hover:bg-gray-100 ${
                    isWide ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
                  }`}
                >
                  <LogIn className="h-4 w-4 shrink-0 text-gray-500" />
                  {isWide && <span className="truncate">Masuk</span>}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  title={!isWide ? 'Daftar Akun' : undefined}
                  className={`flex h-9 items-center rounded-lg bg-emerald-50 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 ${
                    isWide ? 'gap-2.5 px-2.5' : 'justify-center px-1.5'
                  }`}
                >
                  <UserPlus className="h-4 w-4 shrink-0 text-emerald-600" />
                  {isWide && <span className="truncate">Daftar Akun</span>}
                </Link>
              </>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

