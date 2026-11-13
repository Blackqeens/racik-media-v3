'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { demoProducts } from '@/lib/demo-data';
import { getEditorialArchive } from '@/lib/editorial-archive';
import { getManagedSellerProducts } from '@/lib/seller-products-store';
import { getManagedDistributorSupplies } from '@/lib/distributor-supply-store';
import { findRegionalMarketplaceProduct } from '@/lib/marketplace-regional-catalog';
import {
  ShieldCheck,
  Star,
  ChevronRight,
  ShoppingCart,
  Zap,
  RotateCw,
  AlertCircle,
  Plus,
  Minus,
  CheckCircle2,
  Eye,
  Lock,
  ArrowLeft,
  Store,
  Truck,
  MessageSquare,
  MapPin,
  Clock,
  Bookmark,
  X,
  ExternalLink,
} from 'lucide-react';
import { openOrCreatePartnerChatThread, type ChatPartnerRole } from '@/lib/partner-chat-store';
import { PartnerChatModal } from '@/components/chat/PartnerChatWorkspace';
import { useMemberBookmarks } from '@/lib/bookmarks-store';

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  excerpt?: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  stock: number;
  soldCount?: number;
  weightGram?: number;
  partnerRole?: 'seller' | 'distributor';
  fullAddress?: string;
  operatingHours?: string;
  fleetInfo?: string;
  vendor: {
    id: string;
    storeName: string;
    rating: number;
    city?: string;
    isVerified?: boolean;
    joinedAt?: string;
  };
  createdAt: string;
  isDemo?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [returnHref, setReturnHref] = useState('/admin/moderation');
  const [showStorePreview, setShowStorePreview] = useState(false);
  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { addItem, updateQuantity, items: cartItems } = useCart();
  const { isBookmarked, toggleBookmark } = useMemberBookmarks();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    setIsLivePreview(searchParams.get('mode') === 'live-preview');
    const from = searchParams.get('from');
    if (from && from.startsWith('/')) {
      setReturnHref(from);
    }
  }, []);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Fetch product detail (utamakan dari Arsip Editorial Homepage agar semua produk Homepage tampil Live penuh)
  const { data: product, isLoading, isError, error, refetch } = useQuery<ProductDetail>({
    queryKey: ['marketplace-product', productId],
    queryFn: async () => {
      const archiveItems = getEditorialArchive();
      const matchedEditorial = archiveItems.find(
        (item) => item.entityType === 'product_description' && item.id === productId,
      );

      if (matchedEditorial) {
        return {
          id: matchedEditorial.id,
          title: matchedEditorial.title,
          description: `${matchedEditorial.excerpt}\n\n${matchedEditorial.body}`,
          excerpt: matchedEditorial.excerpt,
          price: matchedEditorial.productPrice ?? 75000,
          category: matchedEditorial.categoryLabel || 'Produk Nusantara',
          images: [matchedEditorial.image],
          stock: matchedEditorial.stock ?? 25,
          soldCount: matchedEditorial.soldCount ?? 40,
          vendor: {
            id: matchedEditorial.id,
            storeName: matchedEditorial.submitterName,
            rating: matchedEditorial.rating ?? 4.9,
            city: matchedEditorial.submitterOrigin ?? 'Nusantara',
            isVerified: true,
          },
          createdAt: matchedEditorial.publishedAt,
          isDemo: false,
        };
      }

      const matchedSeller = getManagedSellerProducts().find((p) => p.id === productId);
      if (matchedSeller) {
        return {
          id: matchedSeller.id,
          title: matchedSeller.title,
          description: `${matchedSeller.shortSummary}\n\n${matchedSeller.description}\n\nAlamat Toko / Kebun: ${matchedSeller.fullAddress}\nJam Operasional: ${matchedSeller.operatingHours}`,
          excerpt: matchedSeller.shortSummary,
          price: matchedSeller.price,
          category: matchedSeller.categoryLabel || 'Produk Seller',
          images: [matchedSeller.coverImage],
          stock: matchedSeller.stock,
          soldCount: matchedSeller.soldCount,
          partnerRole: 'seller',
          fullAddress: matchedSeller.fullAddress,
          operatingHours: matchedSeller.operatingHours,
          vendor: {
            id: matchedSeller.id,
            storeName: matchedSeller.storeName,
            rating: matchedSeller.rating ?? 4.9,
            city: matchedSeller.locationArea,
            isVerified: true,
          },
          createdAt: new Date().toISOString(),
          isDemo: false,
        };
      }

      const matchedDistributor = getManagedDistributorSupplies().find((d) => d.id === productId);
      if (matchedDistributor) {
        return {
          id: matchedDistributor.id,
          title: matchedDistributor.title,
          description: `${matchedDistributor.shortSummary}\n\n${matchedDistributor.description}\n\nAlamat Gudang Distribusi: ${matchedDistributor.warehouseAddress}\nArmada & SLA: ${matchedDistributor.fleetInfo}\nJam Operasional: ${matchedDistributor.operatingHours}`,
          excerpt: matchedDistributor.shortSummary,
          price: matchedDistributor.price,
          category: matchedDistributor.categoryLabel || 'Pasokan Distributor',
          images: [matchedDistributor.coverImage],
          stock: matchedDistributor.stock,
          soldCount: matchedDistributor.soldCount,
          partnerRole: 'distributor',
          fullAddress: matchedDistributor.warehouseAddress,
          operatingHours: matchedDistributor.operatingHours,
          fleetInfo: matchedDistributor.fleetInfo,
          vendor: {
            id: matchedDistributor.id,
            storeName: matchedDistributor.distributorName,
            rating: matchedDistributor.rating ?? 4.8,
            city: matchedDistributor.coverageRegion,
            isVerified: true,
          },
          createdAt: new Date().toISOString(),
          isDemo: false,
        };
      }

      const matchedRegional = findRegionalMarketplaceProduct(productId);
      if (matchedRegional) {
        return {
          id: matchedRegional.id,
          title: matchedRegional.title,
          description: `${matchedRegional.shortSummary}\n\n${matchedRegional.description}\n\nAlamat ${matchedRegional.partnerRole === 'distributor' ? 'Gudang Distribusi' : 'Toko / Kebun'}: ${matchedRegional.fullAddress}${matchedRegional.fleetInfo ? `\nArmada & SLA: ${matchedRegional.fleetInfo}` : ''}${matchedRegional.shippingEstimate ? `\nPengiriman: ${matchedRegional.shippingEstimate}` : ''}\nJam Operasional: ${matchedRegional.operatingHours}`,
          excerpt: matchedRegional.shortSummary,
          price: matchedRegional.price,
          category: matchedRegional.categoryLabel,
          images: matchedRegional.images,
          stock: matchedRegional.stock,
          soldCount: matchedRegional.soldCount,
          partnerRole: matchedRegional.partnerRole,
          fullAddress: matchedRegional.fullAddress,
          operatingHours: matchedRegional.operatingHours,
          fleetInfo: matchedRegional.fleetInfo,
          vendor: matchedRegional.vendor,
          createdAt: matchedRegional.createdAt,
          isDemo: false,
        };
      }

      try {
        const res = await fetch(`${API_BASE_URL}/marketplace/catalog/${productId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error('Produk tidak ditemukan atau gagal dimuat');
        }

        const json = await res.json();
        return json.data || json;
      } catch (err) {
        const fallback = demoProducts.find((item) => item.id === productId);
        if (process.env.NODE_ENV !== 'development' || !fallback) throw err;
        return { ...fallback, isDemo: true };
      }
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 3,
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (isLivePreview || !product) return;
    if (type === 'inc' && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (isLivePreview || !product || product.stock <= 0) return;

    try {
      const existing = cartItems.find((i) => i.productId === product.id);
      if (existing) {
        updateQuantity(product.id, existing.quantity + quantity);
      } else {
        addItem({
          productId: product.id,
          name: product.title,
          price: product.price,
          imageUrl: product.images?.[0] || '',
          vendorName: product.vendor?.storeName || 'Racik Official',
        });
        if (quantity > 1) {
          updateQuantity(product.id, quantity);
        }
      }

      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2500);
    } catch (err) {
      console.error('Failed to update cart', err);
    }
  };

  const handleBuyNow = () => {
    if (isLivePreview) return;
    handleAddToCart();
    router.push('/checkout');
  };

  const backToHomepageHref = `/?mode=live-preview&from=${encodeURIComponent(returnHref)}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-6 space-y-4">
              <div className="w-full aspect-square bg-slate-200 rounded-2xl" />
            </div>
            <div className="md:col-span-6 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-10 bg-slate-200 rounded w-1/2" />
              <div className="h-28 bg-slate-200 rounded-xl" />
              <div className="h-12 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Produk Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            {(error as Error)?.message || 'Produk mungkin telah dihapus atau URL tidak valid.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" /> Muat Ulang
            </button>
            <Link
              href={isLivePreview ? backToHomepageHref : '/marketplace'}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
            >
              {isLivePreview ? 'Kembali ke Live Homepage' : 'Kembali ke Katalog'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0 ? product.images : ['/placeholder-product.svg'];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Keterangan Mode Live Homepage (Mode Preview) */}
        {isLivePreview ? (
          <div className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-4 sm:p-5 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-300">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                      <Lock className="h-3 w-3" /> MODE LIVE HOMEPAGE (MODE PREVIEW)
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-200">
                      Tampilan Detail Produk Live Penuh • Akses Mengubah & Transaksi Dibatasi
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-indigo-100 leading-relaxed">
                    Anda sedang melihat halaman <strong>Live Detail Produk</strong> ukuran penuh. Sesuai aturan Mode Live Preview, tombol transaksi (Keranjang & Beli Sekarang) serta pengubahan data dikunci.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={backToHomepageHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 border border-white/25 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/25 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Live Homepage
                </Link>
                <Link
                  href={returnHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300 transition shadow-sm"
                >
                  Kembali ke Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/marketplace" className="hover:text-emerald-600 transition-colors">
              Marketplace
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="capitalize text-slate-400">{product.category || 'Katalog'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 font-medium truncate max-w-[200px] sm:max-w-md">
              {product.title}
            </span>
          </nav>
        )}

        {product.isDemo && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Produk pratinjau lokal karena API belum tersedia. Data contoh ini tidak tersimpan ke database.
          </p>
        )}

        {/* Grid Detail Produk Ukuran Penuh */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          {/* SISI KIRI: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="w-full aspect-square relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={images[selectedImageIndex]}
                alt={product.title}
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=900&q=80';
                }}
                className="w-full h-full object-cover transition-all"
              />
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                    Stok Habis
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-emerald-600 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Banner Escrow Protection */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 mt-6">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-emerald-950">100% Proteksi Rekening Bersama Escrow</p>
                <p className="text-emerald-800 leading-relaxed">
                  Dana Anda ditahan aman oleh sistem Racik Media dan baru diteruskan ke vendor setelah pesanan tiba dan Anda konfirmasi puas.
                </p>
              </div>
            </div>
          </div>

          {/* SISI KANAN: Info & Action Flow */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold uppercase tracking-wider">
                  {product.category || 'Umum'}
                </span>
                <span className="text-[11px] text-slate-400">ID: {product.id}</span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {product.title}
                </h1>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-emerald-700">
                    {formatRupiah(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatRupiah(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Vendor */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {product.vendor?.storeName?.charAt(0) || 'V'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {product.vendor?.storeName || 'Official Store'}
                      </span>
                      {product.vendor?.isVerified !== false && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0" />
                      )}
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-800 uppercase shrink-0">
                        {product.partnerRole === 'distributor' ? 'Distributor' : 'Seller'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                      {product.vendor?.rating ? product.vendor.rating.toFixed(1) : '5.0'} Rating Toko
                      {product.vendor?.city ? ` • ${product.vendor.city}` : ''}
                    </span>
                  </div>
                </div>

                {isLivePreview ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-[11px] font-semibold text-slate-400 cursor-not-allowed shrink-0">
                    <Lock className="w-3 h-3" /> Mode Preview
                  </span>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const role: ChatPartnerRole =
                          product.partnerRole === 'distributor' ? 'distributor' : 'seller';
                        const thread = openOrCreatePartnerChatThread({
                          partnerId: product.vendor?.id || product.id,
                          partnerName: product.vendor?.storeName || 'Official Store',
                          partnerRole: role,
                          partnerLocation: product.vendor?.city || 'Nusantara',
                          subjectTitle: product.title,
                          subjectId: product.id,
                        });
                        setActiveChatThreadId(thread.id);
                        setIsChatOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold text-white transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat {product.partnerRole === 'distributor' ? 'Distributor' : 'Toko'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowStorePreview(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {product.partnerRole === 'distributor' ? (
                        <Truck className="w-3.5 h-3.5 text-cyan-700" />
                      ) : (
                        <Store className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                      Kunjungi Toko
                    </button>
                  </div>
                )}
              </div>

              {/* Deskripsi Produk */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Deskripsi Produk (Terkurasi Moderator)
                </h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {product.description || 'Tidak ada deskripsi detail untuk produk ini.'}
                </div>
              </div>
            </div>

            {/* Bagian Bawah: Quantity Selector & Checkout Actions */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              {isLivePreview && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Mode Live Homepage (Mode Preview):</strong> Akses mengubah jumlah & transaksi pembelian dibatasi pada mode pratinjau ini.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Jumlah Pesanan:</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => handleQuantityChange('dec')}
                      disabled={isLivePreview || quantity <= 1 || product.stock <= 0}
                      className="p-2 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <span className="w-12 text-center text-xs font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange('inc')}
                      disabled={isLivePreview || quantity >= product.stock || product.stock <= 0}
                      className="p-2 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">
                    Tersedia {product.stock} unit
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isLivePreview || product.stock <= 0}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLivePreview ? <Lock className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {isLivePreview
                    ? 'Keranjang (Mode Preview)'
                    : isAddedToCart
                      ? 'Ditambahkan ✓'
                      : 'Keranjang'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isLivePreview || product.stock <= 0}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLivePreview ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-white" />}
                  {isLivePreview ? 'Beli Dibatasi (Mode Preview)' : 'Beli Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Pratinjau Profil & Etalase Toko Seller / Distributor */}
      {showStorePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">
                  {product.vendor?.storeName?.charAt(0) || 'T'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm sm:text-base font-bold">
                      {product.vendor?.storeName}
                    </h3>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200 uppercase shrink-0">
                      {product.partnerRole === 'distributor' ? 'Distributor' : 'Seller Terverifikasi'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {(product.vendor?.rating ?? 4.9).toFixed(1)} Rating •{' '}
                    {product.vendor?.city || 'Indonesia'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStorePreview(false)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
                aria-label="Tutup pratinjau toko"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Info Lokasi, Jam Operasional & Armada */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5 text-xs text-slate-700">
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Alamat / Wilayah:</strong>{' '}
                    {product.fullAddress || product.vendor?.city || 'Terverifikasi Admin Racik Media'}
                  </span>
                </p>
                {product.operatingHours && (
                  <p className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Jam Operasional:</strong> {product.operatingHours}
                    </span>
                  </p>
                )}
                {product.fleetInfo && (
                  <p className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Armada &amp; SLA:</strong> {product.fleetInfo}
                    </span>
                  </p>
                )}
              </div>

              {/* Aksi Toko: Chat Langsung, Follow / Bookmark, Lihat di Marketplace */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const role: ChatPartnerRole =
                      product.partnerRole === 'distributor' ? 'distributor' : 'seller';
                    const thread = openOrCreatePartnerChatThread({
                      partnerId: product.vendor?.id || product.id,
                      partnerName: product.vendor?.storeName || 'Official Store',
                      partnerRole: role,
                      partnerLocation: product.vendor?.city || 'Nusantara',
                      subjectTitle: product.title,
                      subjectId: product.id,
                    });
                    setShowStorePreview(false);
                    setActiveChatThreadId(thread.id);
                    setIsChatOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat Toko Sekarang
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const storeName = product.vendor?.storeName || 'Official Store';
                    const bmCategory =
                      product.partnerRole === 'distributor' ? 'distributor_hub' : 'seller_store';
                    toggleBookmark({
                      targetId: product.vendor?.id || product.id,
                      category: bmCategory,
                      title: storeName,
                      subtitle: `${product.partnerRole === 'distributor' ? 'Distributor' : 'Toko Seller'} • ${product.vendor?.city || 'Indonesia'}`,
                      href: `/marketplace?store=${encodeURIComponent(storeName)}`,
                    });
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                    isBookmarked(
                      product.partnerRole === 'distributor' ? 'distributor_hub' : 'seller_store',
                      product.vendor?.id || product.id,
                    )
                      ? 'border-amber-400 bg-amber-50 text-amber-800'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  {isBookmarked(
                    product.partnerRole === 'distributor' ? 'distributor_hub' : 'seller_store',
                    product.vendor?.id || product.id,
                  )
                    ? 'Toko Diikuti ✓'
                    : 'Ikuti / Tandai Toko'}
                </button>

                <Link
                  href={`/marketplace?store=${encodeURIComponent(product.vendor?.storeName || '')}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800 transition ml-auto"
                >
                  <span>Lihat Etalase Toko di Marketplace</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Etalase Produk dari Toko Ini */}
              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Produk Lainnya dari {product.vendor?.storeName}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ...getManagedSellerProducts().map((p) => ({
                      id: p.id,
                      title: p.title,
                      price: p.price,
                      image: p.coverImage,
                      storeName: p.storeName,
                    })),
                    ...getManagedDistributorSupplies().map((d) => ({
                      id: d.id,
                      title: d.title,
                      price: d.price,
                      image: d.coverImage,
                      storeName: d.distributorName,
                    })),
                    ...demoProducts.map((dp) => ({
                      id: dp.id,
                      title: dp.title,
                      price: dp.price,
                      image: dp.images[0] || '',
                      storeName: dp.vendor.storeName,
                    })),
                  ]
                    .filter(
                      (item, idx, arr) =>
                        item.storeName.toLowerCase() ===
                          (product.vendor?.storeName || '').toLowerCase() &&
                        arr.findIndex((x) => x.id === item.id) === idx,
                    )
                    .map((item) => (
                      <Link
                        key={item.id}
                        href={`/marketplace/${encodeURIComponent(item.id)}`}
                        onClick={() => setShowStorePreview(false)}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 hover:border-emerald-400 transition"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-12 w-12 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900">{item.title}</p>
                          <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                            {formatRupiah(item.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PartnerChatModal
        isOpen={isChatOpen}
        threadId={activeChatThreadId}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
