'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Store,
  Star,
  ShoppingCart,
  Check,
  PackageX,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useEditorialArchive } from '@/lib/editorial-archive';

export interface HomepageProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  categoryLabel: string;
  image: string;
  vendor: {
    id: string;
    storeName: string;
    origin: string;
    rating: number;
    isVerified: boolean;
  };
  stock: number;
  soldCount: number;
  badge?: string;
}

// Data produk gabungan katalog autentik Racik Media & Project 2
const HOMEPAGE_PRODUCTS: HomepageProduct[] = [
  {
    id: 'prd-kopi-gayo',
    title: 'Kopi Arabika Gayo Single Origin 100g',
    description: 'Biji kopi arabika dipetik merah dari dataran tinggi Gayo dengan cita rasa asam lembut dan aroma karamel pekat.',
    price: 22000,
    category: 'hasil_tani',
    categoryLabel: 'Kopi & Rempah',
    image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&q=80',
    vendor: {
      id: 'ven-gayo',
      storeName: 'Koperasi Tani Takengon',
      origin: 'Aceh Tengah',
      rating: 4.9,
      isVerified: true,
    },
    stock: 120,
    soldCount: 520,
    badge: 'Produk Unggulan',
  },
  {
    id: 'prd-madu-hutan',
    title: 'Madu Hutan Liar Murni Kalimantan 250ml',
    description: 'Madu murni hasil panen lebah liar Apis dorsata pada pohon sialang hutan tropis tanpa pemanasan buatan.',
    price: 65000,
    category: 'hasil_tani',
    categoryLabel: 'Herbal Alami',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80',
    vendor: {
      id: 'ven-kapuas',
      storeName: 'Rumah Madu Kapuas',
      origin: 'Kalimantan Barat',
      rating: 4.9,
      isVerified: true,
    },
    stock: 45,
    soldCount: 310,
    badge: 'Organik Alami',
  },
  {
    id: 'prd-benih-cabai',
    title: 'Benih Cabai Rawit Merah Unggul (Kemasan 10g)',
    description: 'Benih cabai produktif untuk kebun rumah dan budidaya presisi. Daya tumbuh di atas 85%.',
    price: 25000,
    category: 'bibit',
    categoryLabel: 'Bibit & Benih',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80',
    vendor: {
      id: 'ven-racik',
      storeName: 'Racik Seed Lab',
      origin: 'Jawa Timur',
      rating: 5.0,
      isVerified: true,
    },
    stock: 80,
    soldCount: 240,
    badge: 'Benih Terpilih',
  },
  {
    id: 'prd-kompos-organik',
    title: 'Kompos Organik Matang Kaya Mikroba (5 Kg)',
    description: 'Kompos fermentasi matang tanpa bau menyengat, memperbaiki struktur tanah dan kesuburan tanaman.',
    price: 45000,
    category: 'pupuk',
    categoryLabel: 'Pupuk & Nutrisi',
    image: 'https://images.unsplash.com/photo-1585336261026-7f516a5a87d0?w=600&q=80',
    vendor: {
      id: 'ven-pupuk-organik',
      storeName: 'Tani Lestari Nusantara',
      origin: 'Bandung Barat',
      rating: 4.8,
      isVerified: true,
    },
    stock: 60,
    soldCount: 185,
    badge: 'Kaya Hara',
  },
  {
    id: 'prd-tas-rotan',
    title: 'Tas Anyam Rotan Natural Artisan Cirebon',
    description: 'Anyaman rotan alami dengan lapisan ramah lingkungan dan furing kain blacu buatan pengrajin lokal.',
    price: 135000,
    category: 'alat',
    categoryLabel: 'Peralatan & Seni',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    vendor: {
      id: 'ven-cirebon',
      storeName: 'Galeri Rotan Tegalwangi',
      origin: 'Cirebon',
      rating: 4.8,
      isVerified: true,
    },
    stock: 25,
    soldCount: 190,
    badge: 'Handcrafted',
  },
  {
    id: 'prd-beras-merah',
    title: 'Beras Merah Organik Cianjur 1 Kg',
    description: 'Beras merah kaya serat alami yang ditanam tanpa pestisida kimia sintetis, aman untuk pola makan sehat.',
    price: 32000,
    category: 'hasil_tani',
    categoryLabel: 'Pangan Organik',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
    vendor: {
      id: 'ven-cianjur',
      storeName: 'Sawah Berkah Agro',
      origin: 'Cianjur',
      rating: 4.9,
      isVerified: true,
    },
    stock: 90,
    soldCount: 530,
    badge: 'Bebas Pestisida',
  },
  {
    id: 'prd-sprayer-tangan',
    title: 'Sprayer Tekanan Manual Praktis 2 Liter',
    description: 'Penyemprot manual dengan nozzle kuningan yang dapat diatur untuk penyiraman lembut atau semprotan hama.',
    price: 68000,
    category: 'alat',
    categoryLabel: 'Peralatan Berkebun',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    vendor: {
      id: 'ven-racik',
      storeName: 'Racik Official Store',
      origin: 'Jakarta',
      rating: 4.7,
      isVerified: true,
    },
    stock: 30,
    soldCount: 145,
    badge: 'Tahan Karat',
  },
  {
    id: 'prd-vco-kelapa',
    title: 'Minyak Kelapa Murni (VCO) Cold Pressed 500ml',
    description: 'Diekstrak tanpa pemanasan tinggi untuk menjaga nutrisi asam laurat alami dan kemurnian minyak kelapa.',
    price: 45000,
    category: 'hasil_tani',
    categoryLabel: 'Herbal & Pangan',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80',
    vendor: {
      id: 'ven-jogja',
      storeName: 'Sentra VCO Kulon Progo',
      origin: 'Yogyakarta',
      rating: 4.8,
      isVerified: true,
    },
    stock: 50,
    soldCount: 270,
    badge: 'Cold Pressed',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Semua Produk' },
  { id: 'bibit', label: 'Bibit & Benih' },
  { id: 'pupuk', label: 'Pupuk & Nutrisi' },
  { id: 'alat', label: 'Peralatan & Kerajinan' },
  { id: 'hasil_tani', label: 'Hasil Panen & Rempah' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Terlaris / Populer' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
];

/**
 * HomepageMarketplace — Page section marketplace khusus homepage.
 * Mengadopsi arsitektur, layout, filter, dan kartu produk dari `apps/web/src/app/marketplace/page.tsx`
 * dengan integrasi langsung ke Keranjang Belanja (Zustand `useCartStore`).
 */
export function HomepageMarketplace() {
  const { items: archiveItems } = useEditorialArchive();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const addItem = useCartStore((s) => s.addItem);

  const curatedProducts: HomepageProduct[] = useMemo(() => {
    const fromArchive = archiveItems
      .filter((i) => i.entityType === 'product_description' && i.publishedToHomepage)
      .map((i) => ({
        id: i.id,
        title: i.title,
        description: i.excerpt,
        price: i.productPrice ?? 35000,
        category: i.category,
        categoryLabel: i.categoryLabel,
        image: i.image,
        vendor: {
          id: `ven-${i.id}`,
          storeName: i.submitterName,
          origin: i.submitterOrigin ?? 'Nusantara',
          rating: i.rating ?? 4.9,
          isVerified: true,
        },
        stock: i.stock ?? 50,
        soldCount: i.soldCount ?? 120,
        badge: i.badge,
      }));
    return fromArchive.length > 0 ? fromArchive : HOMEPAGE_PRODUCTS;
  }, [archiveItems]);

  const filteredProducts = useMemo(() => {
    let result = curatedProducts.filter((product) => {
      const matchCat = selectedCategory === 'all' || product.category === selectedCategory;
      const matchSearch =
        !searchTerm ||
        `${product.title} ${product.description} ${product.vendor.storeName} ${product.categoryLabel}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      result = [...result].sort((a, b) => b.soldCount - a.soldCount);
    }

    return result;
  }, [curatedProducts, searchTerm, selectedCategory, sortBy]);

  function handleAddToCart(e: React.MouseEvent, product: HomepageProduct) {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.title,
      price: product.price,
      imageUrl: product.image,
      vendorName: product.vendor.storeName,
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section id="marketplace" className="w-full px-4 sm:px-6 lg:px-10 py-12 bg-white">
      {/* Header & Sub-header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-sans font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Pasar Racik Tepat Guna
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Garansi Escrow
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Etalase Produk Nusantara Pilihan
          </h2>
          <p className="font-sans text-sm text-gray-500 mt-1 max-w-2xl">
            Beli benih unggul, pupuk organik, dan karya tangan pengrajin daerah langsung dari
            produsen terverifikasi tanpa perantara.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/seller/register"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition"
          >
            <Store className="h-3.5 w-3.5" />
            Buka Toko
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <span>Semua Produk</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar (Sesuai Marketplace Page) */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Input Pencarian */}
          <div className="md:col-span-8 relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari benih, pupuk organik, madu hutan, rotan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* Pengurutan / Sort */}
          <div className="md:col-span-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kategori Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Produk */}
      {filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center space-y-3">
          <PackageX className="h-10 w-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-semibold text-gray-800">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tidak ada produk yang cocok dengan kata kunci &quot;{searchTerm}&quot; pada kategori yang
            dipilih.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Reset Pencarian & Kategori
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => {
            const isAdded = !!addedIds[p.id];
            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-3 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div>
                  {/* Gambar Produk 1:1 */}
                  <Link
                    href={`/marketplace/${p.id}`}
                    className="relative block w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3"
                  >
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {p.badge && (
                      <span className="absolute top-2 left-2 bg-emerald-700/90 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm">
                        {p.badge}
                      </span>
                    )}
                  </Link>

                  {/* Kategori & Asal Daerah */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                    <span className="uppercase tracking-wider font-semibold text-emerald-700">
                      {p.categoryLabel}
                    </span>
                    <span>{p.vendor.origin}</span>
                  </div>

                  {/* Judul Produk */}
                  <h3 className="font-serif text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/marketplace/${p.id}`}>{p.title}</Link>
                  </h3>

                  {/* Harga */}
                  <p className="font-sans text-base font-bold text-gray-900 mt-1.5">
                    {formatRupiah(p.price)}
                  </p>

                  {/* Info Toko & Rating */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="truncate max-w-[110px] font-medium text-gray-600">
                      {p.vendor.storeName}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-600 shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {p.vendor.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi Keranjang & Detail */}
                <div className="mt-3.5 pt-1">
                  <button
                    onClick={(e) => handleAddToCart(e, p)}
                    type="button"
                    className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      isAdded
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Ditambahkan!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>+ Keranjang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Banner Promosi Seller */}
      <div className="mt-12 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs uppercase tracking-widest text-emerald-300 font-semibold">
            Pemberdayaan Ekonomi Daerah
          </p>
          <h3 className="font-serif text-xl sm:text-2xl font-bold">
            Punya produk pertanian, pangan, atau kerajinan lokal?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Buka toko gratis dan jangkau pembeli di seluruh Indonesia dengan sistem transaksi aman
            bergaransi.
          </p>
        </div>
        <Link
          href="/seller/register"
          className="shrink-0 px-6 py-3 rounded-xl bg-white text-emerald-900 font-semibold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition"
        >
          Daftar Toko Sekarang
        </Link>
      </div>
    </section>
  );
}

