'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  MapPin,
  PackageX,
  RotateCw,
  Search,
  SlidersHorizontal,
  Star,
  Store,
  Truck,
} from 'lucide-react';
import { demoProducts } from '@/lib/demo-data';
import { useCurrentActiveRole } from '@/lib/active-role';
import { useManagedSellerProducts } from '@/lib/seller-products-store';
import { useManagedDistributorSupplies } from '@/lib/distributor-supply-store';
import { useMemberBookmarks } from '@/lib/bookmarks-store';
import {
  applySalesAlgorithm,
  useAlgorithmSettings,
} from '@/lib/algorithm-settings-store';
import { REGIONAL_MARKETPLACE_PRODUCTS } from '@/lib/marketplace-regional-catalog';

export interface ProductItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  categoryLabel?: string;
  images: string[];
  partnerRole?: 'seller' | 'distributor';
  locationArea?: string;
  fullAddress?: string;
  vendor: {
    id: string;
    storeName: string;
    rating?: number;
    city?: string;
    isVerified?: boolean;
  };
  stock: number;
  soldCount?: number;
  createdAt: string;
}

const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80';

interface CatalogResponse {
  data: ProductItem[];
  isDemo?: boolean;
  meta?: {
    total: number;
    page: number;
    lastPage: number;
  };
}

const CATEGORIES = [
  { id: 'all', label: 'Semua Kategori' },
  { id: 'bibit', label: 'Bibit & Benih' },
  { id: 'pupuk', label: 'Pupuk & Nutrisi' },
  { id: 'alat', label: 'Peralatan & Mesin' },
  { id: 'hasil_tani', label: 'Hasil Tani & Pangan' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
  { value: 'popular', label: 'Terlaris / Terpopuler' },
];

export default function MarketplacePage() {
  const activeRole = useCurrentActiveRole();
  const { products: sellerProducts } = useManagedSellerProducts();
  const { supplies: distributorSupplies } = useManagedDistributorSupplies();
  const { isBookmarked, toggleBookmark } = useMemberBookmarks();
  const { settings } = useAlgorithmSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [storeFilter, setStoreFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const pageSize = settings.pageSize || 50;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const store = params.get('store');
    if (store) {
      setStoreFilter(store);
    }
  }, []);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const localPartnerCatalog: ProductItem[] = useMemo(() => {
    const fromSeller: ProductItem[] = sellerProducts.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.shortSummary || p.description,
      price: p.price,
      category: p.category,
      categoryLabel: p.categoryLabel,
      images: [p.coverImage],
      partnerRole: 'seller',
      locationArea: p.locationArea,
      fullAddress: p.fullAddress,
      vendor: {
        id: p.id,
        storeName: p.storeName,
        rating: p.rating,
        city: p.locationArea,
        isVerified: true,
      },
      stock: p.stock,
      soldCount: p.soldCount,
      createdAt: new Date().toISOString(),
    }));

    const fromDistributor: ProductItem[] = distributorSupplies.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.shortSummary || d.description,
      price: d.price,
      category: d.category,
      categoryLabel: d.categoryLabel,
      images: [d.coverImage],
      partnerRole: 'distributor',
      locationArea: d.coverageRegion,
      fullAddress: d.warehouseAddress,
      vendor: {
        id: d.id,
        storeName: d.distributorName,
        rating: d.rating,
        city: d.coverageRegion,
        isVerified: true,
      },
      stock: d.stock,
      soldCount: d.soldCount,
      createdAt: new Date().toISOString(),
    }));

    const fromRegional: ProductItem[] = REGIONAL_MARKETPLACE_PRODUCTS.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.shortSummary || r.description,
      price: r.price,
      category: r.category,
      categoryLabel: r.categoryLabel,
      images: r.images,
      partnerRole: r.partnerRole,
      locationArea: r.locationArea,
      fullAddress: r.fullAddress,
      vendor: r.vendor,
      stock: r.stock,
      soldCount: r.soldCount,
      createdAt: r.createdAt,
    }));

    const seenIds = new Set(
      [...fromSeller, ...fromDistributor, ...fromRegional].map((i) => i.id),
    );
    const fromDemo: ProductItem[] = demoProducts
      .filter((d) => !seenIds.has(d.id))
      .map((d) => ({
        ...d,
        partnerRole: 'seller',
        locationArea: 'Jakarta Timur, DKI Jakarta',
        fullAddress: 'Hub Logistik Racik Official Store, Jakarta Timur, DKI Jakarta',
      }));

    return [...fromSeller, ...fromDistributor, ...fromRegional, ...fromDemo];
  }, [sellerProducts, distributorSupplies]);

  const { data, isLoading, isError, error, refetch } = useQuery<CatalogResponse>({
    queryKey: [
      'marketplace-catalog',
      {
        search: searchTerm,
        category: selectedCategory,
        store: storeFilter,
        sortBy,
        page,
        pageSize,
        antiDuplication: settings.antiDuplication,
        maxItemsPerStorePerPage: settings.maxItemsPerStorePerPage,
        aiSmartRanking: settings.aiSmartRanking,
        aiRatingWeight: settings.aiRatingWeight,
        aiSlaSpeedWeight: settings.aiSlaSpeedWeight,
        aiFairExposureWeight: settings.aiFairExposureWeight,
        count: localPartnerCatalog.length,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (storeFilter) params.append('store', storeFilter);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        const response = await fetch(`${API_BASE_URL}/marketplace/catalog?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!response.ok) {
          throw new Error('Gagal memuat katalog produk marketplace');
        }
        const remoteJson: CatalogResponse = await response.json();
        // Jika backend aktif namun hanya mengembalikan data seed kecil (< 10), gabungkan agar etalase 50/halaman tetap berjalan
        if (remoteJson?.data && remoteJson.data.length >= 10) {
          const rankedRemote = applySalesAlgorithm(remoteJson.data, settings, {
            getId: (i) => i.id,
            getTitle: (i) => i.title,
            getDescription: (i) => i.description ?? '',
            getStoreName: (i) => i.vendor?.storeName || 'Racik Official',
            getRating: (i) => i.vendor?.rating ?? 4.8,
            getPopularityScore: (i) => i.soldCount ?? 50,
            preserveOrder: sortBy !== 'newest',
          });
          return { ...remoteJson, data: rankedRemote };
        }
        throw new Error('Gunakan katalog terkurasi lokal');
      } catch (err) {
        if (
          process.env.NODE_ENV !== 'development' &&
          localPartnerCatalog.length === 0
        ) {
          throw err;
        }

        const filtered = localPartnerCatalog.filter((product) => {
          const matchesStore =
            !storeFilter ||
            product.vendor.storeName.toLowerCase().includes(storeFilter.toLowerCase());
          const matchesCategory =
            selectedCategory === 'all' || product.category === selectedCategory;
          const matchesSearch =
            !searchTerm ||
            `${product.title} ${product.description ?? ''} ${product.fullAddress ?? ''} ${product.locationArea ?? ''} ${product.vendor.storeName}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          return matchesStore && matchesCategory && matchesSearch;
        });

        if (sortBy === 'price_asc') filtered.sort((a, b) => a.price - b.price);
        if (sortBy === 'price_desc') filtered.sort((a, b) => b.price - a.price);
        if (sortBy === 'popular') filtered.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));

        const curated = applySalesAlgorithm(filtered, settings, {
          getId: (i) => i.id,
          getTitle: (i) => i.title,
          getDescription: (i) => i.description ?? '',
          getStoreName: (i) => i.vendor?.storeName || 'Racik Official',
          getRating: (i) => i.vendor?.rating ?? 4.8,
          getPopularityScore: (i) => i.soldCount ?? 50,
          preserveOrder: sortBy !== 'newest',
        });

        const totalPages = Math.max(1, Math.ceil(curated.length / pageSize));
        const safePage = Math.min(Math.max(1, page), totalPages);
        const start = (safePage - 1) * pageSize;

        return {
          data: curated.slice(start, start + pageSize),
          isDemo: true,
          meta: {
            total: curated.length,
            page: safePage,
            lastPage: totalPages,
          },
        };
      }
    },
    staleTime: 1000 * 60 * 2,
  });

  const products = data?.data || [];
  const meta = data?.meta;
  const totalItems = meta?.total ?? products.length;
  const totalPages = meta?.lastPage ?? 1;
  const validPage = Math.min(Math.max(1, page), totalPages);

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  }

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);

  const isSellerRole = activeRole === 'seller';
  const isDistributorRole = activeRole === 'distributor';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header Marketplace — Tema & Animasi Seragam dengan Dashboard Lainnya */}
        <div className="dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border border-emerald-300/60 p-6 sm:p-7 text-white shadow-xl">
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full bg-teal-400/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-sm">
                Marketplace Racik Media
              </h1>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                Temukan produk lokal dari Seller dan pasokan Distributor terpercaya dengan garansi Rekening Bersama (Escrow).
              </p>
            </div>

            {isSellerRole ? (
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/dashboard?layer=marketplace&from=seller"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-extrabold shadow-md transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                  Dashboard Member
                </Link>
                <Link
                  href="/seller/products"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-extrabold shadow-lg transition-all"
                >
                  <Store className="w-4 h-4" />
                  Kelola Produk Toko Saya
                </Link>
              </div>
            ) : isDistributorRole ? (
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/dashboard?layer=marketplace&from=distributor"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-white bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-extrabold shadow-md transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                  Dashboard Member
                </Link>
                <Link
                  href="/distributor/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs sm:text-sm font-extrabold shadow-lg transition-all"
                >
                  <Truck className="w-4 h-4" />
                  Kelola Pasokan Distributor
                </Link>
              </div>
            ) : (
              <Link
                href="/seller/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-white bg-white hover:bg-emerald-50 text-slate-900 text-xs sm:text-sm font-extrabold shadow-lg transition-all shrink-0"
                title="Ajukan aktivasi akun Member menjadi Seller atau Distributor ke Role Admin"
              >
                <Store className="w-4 h-4 text-emerald-700" />
                Buka Toko (Ajukan Seller / Distributor)
              </Link>
            )}
          </div>
        </div>

        {/* Filter & Search Bar Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
          {storeFilter && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-900">
              <span>
                Menampilkan Etalase Toko: <strong>{storeFilter}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setStoreFilter('');
                  setPage(1);
                }}
                className="rounded-lg bg-white border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                Tampilkan Semua Toko
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari pupuk, benih, kopi, nama toko seller/distributor..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="md:col-span-5 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Produk */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3 border border-slate-200 animate-pulse space-y-3"
              >
                <div className="w-full aspect-square bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-semibold text-red-900">Gagal Mengambil Data Produk</h3>
            <p className="text-xs text-red-600 max-w-md mx-auto">
              {(error as Error)?.message || 'Terjadi gangguan koneksi ke server API.'}
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" /> Coba Lagi
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <PackageX className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-semibold text-slate-800">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada produk yang cocok dengan pencarian &quot;{searchTerm}&quot; atau filter yang dipilih.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((item) => {
              const bmkCat =
                item.partnerRole === 'distributor' ? 'distributor_hub' : 'seller_store';
              const followed = isBookmarked(bmkCat, item.id);
              const detailHref = `/marketplace/${encodeURIComponent(item.id)}`;
              const displayAddress =
                item.fullAddress || item.locationArea || item.vendor?.city || 'Indonesia';
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Klik Gambar = Lihat Detail */}
                    <Link
                      href={detailHref}
                      title={`Lihat detail produk: ${item.title}`}
                      className="block w-full aspect-square relative bg-slate-100 overflow-hidden cursor-pointer"
                    >
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No Image
                        </div>
                      )}
                      {item.stock <= 0 && (
                        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                          Habis
                        </span>
                      )}
                    </Link>

                    <div className="p-3.5 space-y-2">
                      {/* Klik Judul & Deskripsi Barang = Lihat Detail */}
                      <Link
                        href={detailHref}
                        title={`Lihat detail produk: ${item.title}`}
                        className="block space-y-1 group/title cursor-pointer"
                      >
                        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover/title:text-emerald-600 transition-colors">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </Link>

                      <p className="text-base font-bold text-emerald-700">
                        {formatRupiah(item.price)}
                      </p>

                      {/* Klik Alamat / Nama Toko Seller / Distributor = Lihat Detail */}
                      <Link
                        href={detailHref}
                        title={`Lihat detail toko & alamat: ${displayAddress}`}
                        className="block pt-2 border-t border-slate-100 space-y-1.5 group/loc cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 gap-1.5">
                          <span className="truncate font-semibold text-slate-700 group-hover/loc:text-emerald-700 transition-colors">
                            {item.vendor?.storeName || 'Racik Official'}
                          </span>
                          <span className="flex items-center gap-1 text-amber-500 font-semibold shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {item.vendor?.rating ? item.vendor.rating.toFixed(1) : '5.0'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2 py-1 text-[10px] text-slate-500 group-hover/loc:bg-emerald-50 group-hover/loc:border-emerald-200 group-hover/loc:text-emerald-800 transition-colors">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{displayAddress}</span>
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="px-3.5 pb-3.5 flex items-center gap-2">
                    <Link
                      href={detailHref}
                      className="flex-1 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white transition"
                    >
                      Lihat Produk
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        toggleBookmark({
                          category: bmkCat,
                          targetId: item.id,
                          title: item.vendor?.storeName || item.title,
                          subtitle: `${item.partnerRole === 'distributor' ? 'Distributor' : 'Toko Seller'} • ${item.title}`,
                          href: detailHref,
                        })
                      }
                      title={
                        followed
                          ? 'Hapus penanda / berhenti mengikuti toko'
                          : 'Tandai / Follow toko ini ke Bookmark'
                      }
                      className={`rounded-xl border p-2 transition ${
                        followed
                          ? 'border-amber-400 bg-amber-50 text-amber-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${followed ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigasi Etalase Marketplace (< . 2 . 3 . 4 . 5 . 6 >) dengan Pembatasan 50 Barang per Etalase */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Menampilkan{' '}
              <strong className="text-slate-900">
                {(validPage - 1) * pageSize + 1} - {Math.min(validPage * pageSize, totalItems)}
              </strong>{' '}
              dari <strong className="text-slate-900">{totalItems}</strong> barang seller &amp; distributor • Halaman{' '}
              <strong className="text-emerald-700">{validPage}</strong> dari {totalPages}
              <span className="hidden md:inline ml-1 text-slate-400">
                (Dibatasi {pageSize} etalase per halaman • Bebas duplikasi toko &amp; produk)
              </span>
            </div>

            <nav
              aria-label="Navigasi Halaman Etalase Marketplace"
              className="inline-flex items-center gap-1 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-sm text-xs font-bold"
            >
              <button
                type="button"
                onClick={() => handlePageChange(validPage - 1)}
                disabled={validPage <= 1}
                aria-label="Halaman Sebelumnya"
                className={`inline-flex items-center justify-center w-8 h-8 rounded-xl transition ${
                  validPage <= 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isActive = p === validPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-xl transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(validPage + 1)}
                disabled={validPage >= totalPages}
                aria-label="Halaman Berikutnya"
                className={`inline-flex items-center justify-center w-8 h-8 rounded-xl transition ${
                  validPage >= totalPages
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
