'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  MessageSquare,
  Newspaper,
  Package,
  PenLine,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  Truck,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRelativeTime, formatRupiah } from '@/lib/utils';
import { useEditorialArchive } from '@/lib/editorial-archive';
import { useManagedSellerProducts } from '@/lib/seller-products-store';
import { useManagedDistributorSupplies } from '@/lib/distributor-supply-store';
import { useManagedServices } from '@/lib/service-provider-store';
import { useLocalOrders } from '@/lib/orders-store';
import {
  openOrCreatePartnerChatThread,
  usePartnerChats,
} from '@/lib/partner-chat-store';
import { PartnerChatWorkspace } from '@/components/chat/PartnerChatWorkspace';
import { DashboardSectionDivider } from '@/components/commerce/DashboardSectionDivider';
import { demoArticles } from '@/lib/demo-data';

interface RecentOrder {
  id: string;
  status: string;
  gross_amount: number;
  created_at: string;
}

interface ContentItem {
  id: string;
  title: string;
  status: string;
  content_type: string;
  created_at: string;
  updated_at: string;
}

type MemberLayer = 'articles' | 'marketplace' | 'events' | 'services' | 'chat';
type MarketplaceSourceFilter = 'all' | 'seller' | 'distributor';
type EventTypeFilter = 'all' | 'online' | 'offline';
type ServiceModeFilter = 'all' | 'onsite' | 'hybrid' | 'online';

const DEMO_ARTICLE_IMAGES = [
  'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&q=80',
  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
];

export default function DashboardPage() {
  const { session } = useAuth();

  // ── Navigasi Ber-Layer (Tanpa Harus Scroll Panjang ke Bawah) ──
  const [activeLayer, setActiveLayer] = useState<MemberLayer>('articles');
  const [selectedChatThreadId, setSelectedChatThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const layer = params.get('layer');
    const threadId = params.get('threadId');
    if (
      layer === 'articles' ||
      layer === 'marketplace' ||
      layer === 'events' ||
      layer === 'services' ||
      layer === 'chat'
    ) {
      setActiveLayer(layer);
    }
    if (threadId) {
      setSelectedChatThreadId(threadId);
    }
  }, []);

  // Sub-filter di dalam tiap Layer
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [marketplaceSourceFilter, setMarketplaceSourceFilter] =
    useState<MarketplaceSourceFilter>('all');
  const [marketplaceCategoryFilter, setMarketplaceCategoryFilter] = useState<string>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('all');
  const [serviceModeFilter, setServiceModeFilter] = useState<ServiceModeFilter>('all');

  // ── Sumber Data Lengkap Platform: Artikel, Event, Seller, Distributor & Penyedia Jasa ──
  const { items: editorialItems } = useEditorialArchive();
  const { products: sellerProducts } = useManagedSellerProducts();
  const { supplies: distributorSupplies } = useManagedDistributorSupplies();
  const { services } = useManagedServices();
  const { orders: localOrders } = useLocalOrders();
  const { threads: chatThreads } = usePartnerChats();
  const unreadChatCount = chatThreads.reduce((sum, t) => sum + t.unreadByMember, 0);

  // ── Fetch Aktivitas Pribadi Member (jika login) ──
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['dashboard-orders'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ items: RecentOrder[]; total: number }>('/users/me/orders?limit=5', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const { data: contentData } = useQuery({
    queryKey: ['dashboard-content'],
    enabled: !!session,
    queryFn: () =>
      apiClient.get<{ total: number; items: ContentItem[] }>('/users/me/content?limit=5', {
        Authorization: `Bearer ${session!.access_token}`,
      }),
  });

  const apiOrders = ordersData?.data?.items ?? [];
  const seenOrderIds = new Set(localOrders.map((o) => o.id));
  const recentOrders = [
    ...localOrders.map((o) => ({
      id: o.id,
      status: o.status,
      gross_amount: o.gross_amount,
      created_at: o.created_at,
    })),
    ...apiOrders.filter((o) => !seenOrderIds.has(o.id)),
  ].slice(0, 5);
  const activeOrders = Math.max(ordersData?.data?.total ?? 0, localOrders.length);
  const recentContent = contentData?.data?.items ?? [];

  const userDisplayName =
    (session?.user?.user_metadata?.full_name as string | undefined) ||
    session?.user?.email?.split('@')[0] ||
    'Sahabat Racik Media';

  // ── 1. DATA ARTIKEL ──
  const allArticles = useMemo(() => {
    const archiveArticles = editorialItems
      .filter((item) => item.entityType === 'article')
      .map((item) => ({
        id: item.id,
        slug: item.slug || item.id,
        title: item.title,
        excerpt: item.excerpt,
        image: item.image,
        categoryLabel: item.categoryLabel || 'Artikel & Jurnal',
        authorName: item.submitterName,
        sourceRole: item.sourceRole,
        readTimeMinutes: item.readTimeMinutes ?? 5,
      }));

    const seenIds = new Set(archiveArticles.map((a) => a.id));
    const extraDemo = demoArticles
      .filter((d) => !seenIds.has(d.id))
      .map((d, idx) => ({
        id: d.id,
        slug: d.slug || d.id,
        title: d.title,
        excerpt: d.excerpt,
        image: DEMO_ARTICLE_IMAGES[idx % DEMO_ARTICLE_IMAGES.length],
        categoryLabel: 'Panduan Praktis',
        authorName: d.author_name || 'Tim Racik Media',
        sourceRole: 'author' as const,
        readTimeMinutes: 4,
      }));

    return [...archiveArticles, ...extraDemo];
  }, [editorialItems]);

  const articleCategories = useMemo(
    () => Array.from(new Set(allArticles.map((a) => a.categoryLabel))),
    [allArticles],
  );

  // ── 2. DATA MARKETPLACE GABUNGAN (SELLER + DISTRIBUTOR) ──
  const allMarketplaceItems = useMemo(() => {
    const sellerCards = sellerProducts.map((p) => ({
      id: p.id,
      roleOrigin: 'seller' as const,
      roleLabel: 'Mitra Seller',
      title: p.title,
      shortSummary: p.shortSummary || p.description,
      categoryLabel: p.categoryLabel,
      coverImage: p.coverImage,
      partnerName: p.storeName,
      locationLabel: p.locationArea,
      stock: p.stock,
      unitLabel: p.unitLabel,
      soldCount: p.soldCount,
      rating: p.rating,
      price: p.price,
    }));

    const distributorCards = distributorSupplies.map((d) => ({
      id: d.id,
      roleOrigin: 'distributor' as const,
      roleLabel: 'Distributor Regional',
      title: d.title,
      shortSummary: d.shortSummary || d.description,
      categoryLabel: d.categoryLabel,
      coverImage: d.coverImage,
      partnerName: d.distributorName,
      locationLabel: d.coverageRegion,
      stock: d.stock,
      unitLabel: d.unitLabel,
      soldCount: d.soldCount,
      rating: d.rating,
      price: d.price,
    }));

    return [...sellerCards, ...distributorCards];
  }, [sellerProducts, distributorSupplies]);

  const marketplaceCategories = useMemo(
    () => Array.from(new Set(allMarketplaceItems.map((m) => m.categoryLabel))),
    [allMarketplaceItems],
  );

  // ── 3. DATA AGENDA & EVENT ──
  const allEvents = useMemo(
    () => editorialItems.filter((item) => item.entityType === 'event'),
    [editorialItems],
  );

  // ── 4. DATA PENYEDIA JASA ──
  const activeServices = useMemo(
    () => services.filter((srv) => srv.status === 'active'),
    [services],
  );

  // ── FILTERING BERDASARKAN PENCARIAN & KATEGORI TIAP LAYER ──
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    return allArticles.filter((a) => {
      if (articleCategoryFilter !== 'all' && a.categoryLabel !== articleCategoryFilter) {
        return false;
      }
      if (!normalizedQuery) return true;
      return `${a.title} ${a.excerpt} ${a.categoryLabel} ${a.authorName}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [allArticles, articleCategoryFilter, normalizedQuery]);

  const filteredMarketplace = useMemo(() => {
    return allMarketplaceItems.filter((m) => {
      if (marketplaceSourceFilter !== 'all' && m.roleOrigin !== marketplaceSourceFilter) {
        return false;
      }
      if (marketplaceCategoryFilter !== 'all' && m.categoryLabel !== marketplaceCategoryFilter) {
        return false;
      }
      if (!normalizedQuery) return true;
      return `${m.title} ${m.shortSummary} ${m.categoryLabel} ${m.partnerName} ${m.locationLabel}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [allMarketplaceItems, marketplaceSourceFilter, marketplaceCategoryFilter, normalizedQuery]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      if (eventTypeFilter !== 'all' && evt.eventType !== eventTypeFilter) {
        return false;
      }
      if (!normalizedQuery) return true;
      return `${evt.title} ${evt.excerpt} ${evt.categoryLabel} ${evt.submitterName} ${evt.location ?? ''}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [allEvents, eventTypeFilter, normalizedQuery]);

  const filteredServices = useMemo(() => {
    return activeServices.filter((s) => {
      if (serviceModeFilter !== 'all' && s.serviceMode !== serviceModeFilter) {
        return false;
      }
      if (!normalizedQuery) return true;
      return `${s.title} ${s.shortSummary} ${s.categoryLabel} ${s.provider.name} ${s.locationArea}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeServices, serviceModeFilter, normalizedQuery]);

  function switchLayer(layer: MemberLayer) {
    setActiveLayer(layer);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* ── HERO DASHBOARD MEMBER — Ucapan Selamat Datang di Racik Media + Pemilih Layer Cepat ── */}
      <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-emerald-300/60 p-6 sm:p-7 text-white shadow-xl">
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 lg:items-center gap-6">
          <div className="lg:col-span-7 min-w-0 space-y-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
              Selamat Datang di Racik Media Nusantara
            </h1>

            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Pilih layer di bawah untuk langsung mengakses{' '}
              <strong className="text-amber-200">Artikel &amp; Jurnal</strong>,{' '}
              <strong className="text-white underline decoration-amber-400/80 underline-offset-2">
                Marketplace Seller &amp; Distributor
              </strong>
              , <strong className="text-emerald-200">Agenda Event</strong>, maupun{' '}
              <strong className="text-sky-200">Layanan Penyedia Jasa</strong> tanpa perlu menggulir jauh ke bawah.
            </p>
          </div>

          <div className="lg:col-span-5 min-w-0 flex flex-col gap-2.5 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/orders"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-emerald-50 px-3 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition text-center leading-snug"
              >
                <Truck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Pesanan Saya ({activeOrders})</span>
              </Link>
              <Link
                href="/bookmarks"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-white bg-white hover:bg-emerald-50 px-3 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition text-center leading-snug"
              >
                <Bookmark className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Bookmark Tersimpan</span>
              </Link>
            </div>
            <Link
              href="/articles/write"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2.5 text-xs sm:text-[13px] font-extrabold text-white shadow-lg transition text-center leading-snug"
            >
              <PenLine className="h-4 w-4 shrink-0" />
              <span>Tulis Ide &amp; Cerita Baru ke Moderator</span>
            </Link>
          </div>
        </div>

        {/* Statistik Ringkas — Klik Langsung Pindah ke Layer Tujuan */}
        <div className="relative z-10 mt-6 border-t border-white/25 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 sm:divide-x sm:divide-white/25">
          <button
            type="button"
            onClick={() => switchLayer('articles')}
            className={`flex flex-col items-center justify-center px-2 text-center transition hover:opacity-100 ${
              activeLayer === 'articles' ? 'opacity-100 scale-[1.02]' : 'opacity-85'
            }`}
          >
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Layer Artikel &amp; Jurnal
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-white">
              {allArticles.length} Karya
            </p>
          </button>

          <button
            type="button"
            onClick={() => switchLayer('marketplace')}
            className={`flex flex-col items-center justify-center px-2 text-center transition hover:opacity-100 ${
              activeLayer === 'marketplace' ? 'opacity-100 scale-[1.02]' : 'opacity-85'
            }`}
          >
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Layer Marketplace
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-amber-300">
              {allMarketplaceItems.length} Barang
            </p>
          </button>

          <button
            type="button"
            onClick={() => switchLayer('events')}
            className={`flex flex-col items-center justify-center px-2 text-center transition hover:opacity-100 ${
              activeLayer === 'events' ? 'opacity-100 scale-[1.02]' : 'opacity-85'
            }`}
          >
            <p className="text-xs sm:text-sm font-bold tracking-wide text-white whitespace-nowrap">
              Layer Agenda Event
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-300">
              {allEvents.length} Acara
            </p>
          </button>

          <button
            type="button"
            onClick={() => switchLayer('services')}
            className={`flex flex-col items-center justify-center px-2 text-center transition hover:opacity-100 ${
              activeLayer === 'services' ? 'opacity-100 scale-[1.02]' : 'opacity-85'
            }`}
          >
            <p className="text-xs sm:text-sm font-extrabold tracking-wide text-sky-200 whitespace-nowrap">
              Layer Penyedia Jasa
            </p>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-sky-200">
              {activeServices.length} Jasa Ahli
            </p>
          </button>
        </div>
      </div>

      {/* ── NAVIGASI LAYER UTAMA + PENCARIAN CEPAT ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        {/* Layer Switcher Utama: 5 Layer Terpisah Termasuk Chat Mitra */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {[
            {
              id: 'articles' as const,
              label: 'Artikel Saja',
              count: `${allArticles.length} Karya`,
              icon: Newspaper,
              activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-md',
              idleClass: 'bg-emerald-50/60 text-emerald-950 border-emerald-200 hover:bg-emerald-100/70',
            },
            {
              id: 'marketplace' as const,
              label: 'Marketplace Seller / Distributor',
              count: `${allMarketplaceItems.length} Barang`,
              icon: Store,
              activeClass: 'bg-amber-600 text-white border-amber-600 shadow-md',
              idleClass: 'bg-amber-50/60 text-amber-950 border-amber-200 hover:bg-amber-100/70',
            },
            {
              id: 'events' as const,
              label: 'Event & Pelatihan Saja',
              count: `${allEvents.length} Acara`,
              icon: Calendar,
              activeClass: 'bg-indigo-600 text-white border-indigo-600 shadow-md',
              idleClass: 'bg-indigo-50/60 text-indigo-950 border-indigo-200 hover:bg-indigo-100/70',
            },
            {
              id: 'services' as const,
              label: 'Penyedia Jasa Saja',
              count: `${activeServices.length} Jasa Ahli`,
              icon: BriefcaseBusiness,
              activeClass: 'bg-sky-600 text-white border-sky-600 shadow-md',
              idleClass: 'bg-sky-50/60 text-sky-950 border-sky-200 hover:bg-sky-100/70',
            },
            {
              id: 'chat' as const,
              label: 'Chat & Tanya Mitra',
              count:
                unreadChatCount > 0
                  ? `${chatThreads.length} Chat (${unreadChatCount} baru)`
                  : `${chatThreads.length} Obrolan Aktif`,
              icon: MessageSquare,
              activeClass: 'bg-teal-700 text-white border-teal-700 shadow-md',
              idleClass: 'bg-teal-50/70 text-teal-950 border-teal-200 hover:bg-teal-100/70',
            },
          ].map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => switchLayer(layer.id)}
                className={`rounded-xl border px-3.5 py-2.5 text-left transition flex items-center justify-between gap-2 ${
                  isActive ? layer.activeClass : layer.idleClass
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs font-extrabold truncate">{layer.label}</span>
                    <span
                      className={`block text-[10px] font-semibold ${
                        isActive ? 'text-white/90' : 'text-slate-500'
                      }`}
                    >
                      {layer.count}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Input Pencarian + Sub-Kategori Sesuai Layer Aktif */}
        {activeLayer !== 'chat' && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeLayer === 'articles'
                  ? 'Cari judul artikel, kategori, atau nama penulis...'
                  : activeLayer === 'marketplace'
                    ? 'Cari barang jual Seller, pasokan Distributor, atau lokasi...'
                    : activeLayer === 'events'
                      ? 'Cari judul webinar, workshop lapangan, atau lokasi...'
                      : 'Cari layanan ahli, uji lab tanah, atau nama praktisi...'
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Filter Sub-Kategori Per Layer */}
          <div className="flex flex-wrap items-center gap-1.5">
            {activeLayer === 'articles' && (
              <>
                <button
                  type="button"
                  onClick={() => setArticleCategoryFilter('all')}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                    articleCategoryFilter === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Kategori ({allArticles.length})
                </button>
                {articleCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setArticleCategoryFilter(cat)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                      articleCategoryFilter === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </>
            )}

            {activeLayer === 'marketplace' && (
              <>
                {[
                  { id: 'all', label: `Semua (${allMarketplaceItems.length})` },
                  { id: 'seller', label: `Barang Seller (${sellerProducts.length})` },
                  { id: 'distributor', label: `Pasokan Distributor (${distributorSupplies.length})` },
                ].map((src) => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() =>
                      setMarketplaceSourceFilter(src.id as MarketplaceSourceFilter)
                    }
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                      marketplaceSourceFilter === src.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
                <select
                  value={marketplaceCategoryFilter}
                  onChange={(e) => setMarketplaceCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">Semua Kategori Produk</option>
                  {marketplaceCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </>
            )}

            {activeLayer === 'events' && (
              <>
                {[
                  { id: 'all', label: `Semua Event (${allEvents.length})` },
                  { id: 'online', label: 'Webinar Online' },
                  { id: 'offline', label: 'Workshop Lapangan (Offline)' },
                ].map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setEventTypeFilter(ev.id as EventTypeFilter)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                      eventTypeFilter === ev.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {ev.label}
                  </button>
                ))}
              </>
            )}

            {activeLayer === 'services' && (
              <>
                {[
                  { id: 'all', label: `Semua Mode (${activeServices.length})` },
                  { id: 'onsite', label: 'Kunjungan On-Site' },
                  { id: 'hybrid', label: 'Hybrid (Online & Sampel)' },
                  { id: 'online', label: 'Online' },
                ].map((sv) => (
                  <button
                    key={sv.id}
                    type="button"
                    onClick={() => setServiceModeFilter(sv.id as ServiceModeFilter)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                      serviceModeFilter === sv.id
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sv.label}
                  </button>
                ))}
              </>
            )}
          </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          LAYER 1: ARTIKEL SAJA (Keterangan Kategori Seperti "Kerajinan & Seni" Di Kolom Penulis)
         ════════════════════════════════════════════════════════════════════════ */}
      {activeLayer === 'articles' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-emerald-600" />
                Layer Artikel, Jurnal &amp; Cerita Komunitas ({filteredArticles.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan khusus kumpulan artikel &amp; jurnal — pilih kategori di atas untuk menyaring tanpa harus menggulir jauh.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/articles/write"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
              >
                <PenLine className="h-3.5 w-3.5" />
                Tulis Artikel / Cerita
              </Link>
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
              >
                Lihat Direktori Penuh
              </Link>
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Tidak ada artikel yang cocok dengan filter kategori atau kata kunci pencarian Anda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div>
                    {/* Gambar bersih tanpa label menumpuk di atas foto */}
                    <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>

                      {/* Kolom Penulis — memuat Nama Penulis, Peran & Kategori (misal: Kerajinan & Seni) */}
                      <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="flex items-center gap-1.5 min-w-0">
                            <UserRound className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              <strong>Penulis:</strong> {article.authorName}
                            </span>
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                              article.sourceRole === 'author'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {article.sourceRole === 'author' ? 'Karya Author' : 'Komunitas'}
                          </span>
                        </div>

                        <p className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span className="font-semibold text-slate-800">
                            Kategori: {article.categoryLabel}
                          </span>
                        </p>

                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <span>Estimasi baca {article.readTimeMinutes} menit</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60">
                    <Link
                      href={`/articles/${encodeURIComponent(article.slug)}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Baca Artikel Lengkap
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          LAYER 2: MARKETPLACE SELLER & DISTRIBUTOR SAJA
         ════════════════════════════════════════════════════════════════════════ */}
      {activeLayer === 'marketplace' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Store className="h-5 w-5 text-amber-600" />
                Layer Marketplace Seller &amp; Pasokan Distributor ({filteredMarketplace.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Belanja langsung produk produsen Seller atau stok grosir gudang Distributor dengan perlindungan Rekening Bersama (Escrow).
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900 transition shrink-0"
            >
              Buka Halaman Marketplace <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {filteredMarketplace.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Tidak ada produk Seller/Distributor yang cocok dengan filter Anda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarketplace.map((item) => {
                const isSeller = item.roleOrigin === 'seller';
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:shadow-md transition ${
                      isSeller ? 'hover:border-amber-300' : 'hover:border-cyan-300'
                    }`}
                  >
                    <div>
                      <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-4 space-y-2.5">
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.shortSummary}
                        </p>

                        <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                          <div className="flex items-center justify-between gap-1.5">
                            <p className="flex items-center gap-1.5 min-w-0">
                              {isSeller ? (
                                <Store className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              ) : (
                                <Truck className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                              )}
                              <span className="truncate font-semibold text-slate-800">
                                {item.partnerName}
                              </span>
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold shrink-0 ${
                                isSeller
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-cyan-100 text-cyan-900'
                              }`}
                            >
                              {item.roleLabel}
                            </span>
                          </div>

                          <p className="flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Kategori: {item.categoryLabel}</span>
                          </p>

                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{item.locationLabel}</span>
                          </p>

                          <p className="flex items-center gap-1.5 text-slate-500">
                            <Package className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>
                              Stok: <strong className="text-slate-800">{item.stock}</strong>{' '}
                              {item.unitLabel} • {item.soldCount} terjual • ★ {item.rating.toFixed(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {isSeller ? 'Harga Seller' : 'Harga Distributor'}
                        </span>
                        <span
                          className={`text-sm font-extrabold ${
                            isSeller ? 'text-emerald-700' : 'text-cyan-800'
                          }`}
                        >
                          {formatRupiah(item.price)}
                          <span className="text-[10px] font-normal text-slate-500">
                            /{item.unitLabel}
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/marketplace/${encodeURIComponent(item.id)}`}
                          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm transition ${
                            isSeller
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-cyan-600 hover:bg-cyan-700'
                          }`}
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                          Detail &amp; Beli
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            const thread = openOrCreatePartnerChatThread({
                              partnerId: item.id,
                              partnerName: item.partnerName,
                              partnerRole: isSeller ? 'seller' : 'distributor',
                              partnerLocation: item.locationLabel,
                              subjectTitle: item.title,
                              subjectId: item.id,
                            });
                            setSelectedChatThreadId(thread.id);
                            setActiveLayer('chat');
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-900 transition"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-emerald-700" />
                          Chat {isSeller ? 'Seller' : 'Distributor'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          LAYER 3: AGENDA & EVENT SAJA
         ════════════════════════════════════════════════════════════════════════ */}
      {activeLayer === 'events' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Layer Agenda Event, Webinar &amp; Pelatihan Lapangan ({filteredEvents.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan seluruh agenda pelatihan tani, cupping kopi, dan workshop kriya terkurasi di platform Racik Media.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 text-xs font-bold text-indigo-900 transition shrink-0"
            >
              Buka Halaman Event Penuh <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Tidak ada event yang cocok dengan filter atau pencarian Anda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition"
                >
                  <div>
                    <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                      <img
                        src={evt.image}
                        alt={evt.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {evt.excerpt}
                      </p>

                      <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                        <div className="flex items-center justify-between gap-1.5">
                          <p className="flex items-center gap-1.5 min-w-0">
                            <UserRound className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">
                              <strong>Narasumber:</strong> {evt.submitterName}
                            </span>
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                              evt.eventType === 'online'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {evt.eventType === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>

                        <p className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>Kategori: {evt.categoryLabel}</span>
                        </p>

                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{evt.location || 'Zoom / Lokasi Mitra'}</span>
                        </p>

                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>
                            {evt.startTime || '09:00 WIB'} • {evt.registeredAttendeesCount ?? 0}/
                            {evt.maxAttendees ?? 100} peserta
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Biaya Pendaftaran</span>
                      <span className="text-sm font-extrabold text-indigo-700">
                        {!evt.price || evt.price === 0 ? 'Gratis' : formatRupiah(evt.price)}
                      </span>
                    </div>

                    <Link
                      href="/events"
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Lihat Detail &amp; Ikut Event
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          LAYER 4: PENYEDIA JASA SAJA
         ════════════════════════════════════════════════════════════════════════ */}
      {activeLayer === 'services' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-sky-600" />
                Layer Layanan Ahli &amp; Konsultasi Penyedia Jasa ({filteredServices.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pesan pendampingan lahan, uji laboratorium tanah, kurasi cita rasa kopi, hingga instalasi greenhouse IoT dengan sistem termin milestone aman.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 text-xs font-bold text-sky-900 transition shrink-0"
            >
              Direktori Penyedia Jasa <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {filteredServices.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Tidak ada layanan Penyedia Jasa yang cocok dengan filter Anda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition"
                >
                  <div>
                    <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                      <img
                        src={srv.coverImage}
                        alt={srv.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{srv.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {srv.shortSummary || srv.description}
                      </p>

                      <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="inline-flex items-center gap-1.5 truncate">
                            <Wrench className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                            <strong className="truncate text-slate-800">{srv.provider.name}</strong>
                          </span>
                          <span className="inline-flex items-center gap-1 shrink-0">
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 uppercase">
                              {srv.serviceMode}
                            </span>
                            <span className="inline-flex items-center gap-0.5 font-extrabold text-amber-600">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                              {srv.provider.rating.toFixed(1)}
                            </span>
                          </span>
                        </div>

                        <p className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>Kategori: {srv.categoryLabel}</span>
                        </p>

                        <p className="flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{srv.locationArea}</span>
                        </p>

                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Layers className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                          <span>
                            {srv.durationEstimate} • {srv.totalCompletedJobs} proyek selesai
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 truncate pr-2">Mulai Dari</span>
                      <span className="text-sm font-extrabold text-sky-800 shrink-0">
                        {formatRupiah(srv.priceStartingFrom)}
                        <span className="text-[10px] font-normal text-slate-500">
                          /{srv.priceUnit}
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Link
                        href={`/services/${encodeURIComponent(srv.id)}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition"
                      >
                        <BriefcaseBusiness className="h-3.5 w-3.5" />
                        Detail &amp; Pesan
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const thread = openOrCreatePartnerChatThread({
                            partnerId: srv.provider.id || srv.id,
                            partnerName: srv.provider.name,
                            partnerRole: 'service_provider',
                            partnerLocation: srv.locationArea,
                            subjectTitle: srv.title,
                            subjectId: srv.id,
                          });
                          setSelectedChatThreadId(thread.id);
                          setActiveLayer('chat');
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 px-3 py-2 text-xs font-bold text-teal-900 transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-teal-700" />
                        Tanya Detail Jasa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          LAYER 5: CHAT LANGSUNG MEMBER KE SELLER, DISTRIBUTOR & PENYEDIA JASA
         ════════════════════════════════════════════════════════════════════════ */}
      {activeLayer === 'chat' && (
        <PartnerChatWorkspace
          viewerRole="member"
          viewerName={userDisplayName}
          initialThreadId={selectedChatThreadId}
        />
      )}

      {/* ── BAGIAN BAWAH: AKTIVITAS PESANAN & TULISAN MEMBER + HAK & RUANG LINGKUP ROLE MEMBER DI BAWAH ── */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              Pesanan &amp; Naskah Artikel Pribadi Anda
            </h2>
            <Link href="/orders" className="text-xs font-bold text-emerald-700 hover:underline">
              Kelola Pesanan →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kolom Pesanan Terbaru Member */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">Pesanan Terbaru</span>
                <Link
                  href="/marketplace"
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  Belanja →
                </Link>
              </div>
              {loadingOrders && recentOrders.length === 0 ? (
                <div className="h-12 bg-slate-200/70 rounded-lg animate-pulse" />
              ) : recentOrders.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Belum ada transaksi berjalan. Anda dapat memilih barang Seller/Distributor atau jasa ahli dengan jaminan Escrow.
                </p>
              ) : (
                <div className="divide-y divide-slate-200/70">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={
                        order.status === 'pending_payment'
                          ? `/checkout/payment/${encodeURIComponent(order.id)}`
                          : `/orders/${encodeURIComponent(order.id)}`
                      }
                      className="flex items-center justify-between py-2 text-xs hover:text-emerald-700"
                    >
                      <div>
                        <span className="font-bold text-slate-900">
                          {formatRupiah(order.gross_amount)}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {formatRelativeTime(order.created_at)}
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {order.status === 'pending_payment'
                          ? 'Bayar Sekarang →'
                          : order.status === 'escrow_held'
                            ? 'Escrow Aman'
                            : order.status === 'in_fulfillment'
                              ? 'Dikirim (Resi Aktif)'
                              : order.status === 'completed'
                                ? 'Selesai'
                                : order.status.replace(/_/g, ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Kolom Karya Tulis Member */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">
                  Artikel &amp; Cerita Saya
                </span>
                <Link
                  href="/articles/write"
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  Tulis Ide →
                </Link>
              </div>
              {recentContent.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Punya cerita lapangan atau inspirasi komunitas? Kirimkan draf tulisan Anda untuk dikurasi Role Moderator.
                </p>
              ) : (
                <div className="divide-y divide-slate-200/70">
                  {recentContent.map((art) => (
                    <Link
                      key={art.id}
                      href={`/articles/write?draft=${art.id}`}
                      className="flex items-center justify-between py-2 text-xs hover:text-emerald-700"
                    >
                      <span className="truncate font-semibold text-slate-800 pr-2">{art.title}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 shrink-0">
                        {art.status.replace(/_/g, ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DashboardSectionDivider tone="emerald" />

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/70 pb-3">
            <h2 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              Hak &amp; Ruang Lingkup Role Member
            </h2>
            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-0.5 text-[11px] font-bold text-emerald-900">
              Literasi, Pembelian &amp; Kolaborasi Komunitas
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-700 leading-relaxed">
            <div className="rounded-xl border border-emerald-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Akses Penuh Literasi</span>
              </div>
              <p>
                Membaca seluruh artikel, jurnal riset, dan kisah komunitas daerah di Racik Media Nusantara.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <ShoppingBag className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Belanja Aman Ber-Escrow</span>
              </div>
              <p>
                Membeli produk eceran Seller, stok Distributor, serta memesan layanan Penyedia Jasa dengan perlindungan dana Rekening Bersama.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <PenLine className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Kontribusi Penulisan</span>
              </div>
              <p>
                Menulis ide &amp; cerita untuk ditinjau oleh <em>Role Moderator</em> sebelum tayang di Homepage.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/80 bg-white p-3.5 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-violet-600 shrink-0" />
                <span>Naik Peran Jadi Mitra</span>
              </div>
              <p>
                Dapat mengajukan verifikasi KYB ke <em>Role Admin</em> untuk menjadi Seller, Distributor, atau Penyedia Jasa resmi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
