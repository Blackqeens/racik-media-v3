'use client';

import { useEffect, useState } from 'react';
import {
  getEditorialArchive,
  updateEditorialArchiveItem,
  type EditorialArchiveItem,
} from '@/lib/editorial-archive';

export interface ManagedDistributorSupply {
  id: string;
  title: string;
  shortSummary: string;
  description: string;
  category: string;
  categoryLabel: string;
  price: number;
  unitLabel: string;
  stock: number;
  soldCount: number;
  coverImage: string;
  distributorName: string;
  coverageRegion: string;
  warehouseAddress: string;
  operatingHours: string;
  contactPhone: string;
  fleetInfo: string;
  badge: string;
  rating: number;
  moderationStatus: 'published_homepage' | 'pending_review' | 'revision_needed';
  updatedAt: string;
}

const STORAGE_KEY = 'racik-distributor-supplies-v1';
const UPDATE_EVENT = 'racik-distributor-supplies-updated';

export const DISTRIBUTOR_CATEGORY_OPTIONS = [
  { id: 'pupuk', label: 'Pasokan Pupuk & Kompos Partai' },
  { id: 'hasil_tani', label: 'Distribusi Pangan & Beras Organik' },
  { id: 'alat', label: 'Peralatan & Sarana Pertanian' },
  { id: 'bibit', label: 'Distribusi Bibit & Benih Wilayah' },
  { id: 'logistik', label: 'Jalur Cold Chain & Pergudangan' },
];

export const INITIAL_DISTRIBUTOR_SUPPLIES: ManagedDistributorSupply[] = [
  {
    id: 'prd-kompos-organik',
    title: 'Kompos Organik Matang Kaya Mikroba (Kemasan 5 Kg / Partai)',
    shortSummary:
      'Kompos fermentasi matang tanpa bau menyengat, memperbaiki struktur tanah dan siap pasok armada wilayah Jawa Barat.',
    description:
      'Didistribusikan langsung dari instalasi pengomposan terpadu Bandung Barat. Memiliki rasio C/N ideal, remah, bebas biji gulma, serta diperkaya Trichoderma alami untuk kebutuhan koperasi tani dan toko saprotan regional.',
    category: 'pupuk',
    categoryLabel: 'Pasokan Pupuk & Kompos Partai',
    price: 45000,
    unitLabel: 'sak 5 kg',
    stock: 460,
    soldCount: 185,
    coverImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80',
    distributorName: 'Tani Lestari Nusantara (Distributor Jabar)',
    coverageRegion: 'Bandung Barat, Garut, Sumedang & Jabodetabek',
    warehouseAddress: 'Komplek Pergudangan Agro Lembang Kav. 12, Kab. Bandung Barat, Jawa Barat 40391',
    operatingHours: 'Senin - Sabtu (07:00 - 17:00 WIB)',
    contactPhone: '0811-2200-4411',
    fleetInfo: 'Armada Engkel & CDD Box 8 Ton (Kirim Maks. 24 Jam)',
    badge: 'Siap Pasok Wilayah',
    rating: 4.8,
    moderationStatus: 'published_homepage',
    updatedAt: 'Hari ini • 08:45 WIB',
  },
  {
    id: 'prd-beras-merah',
    title: 'Beras Merah Organik Cianjur (Pasokan Gudang 1 Kg & Karung 25 Kg)',
    shortSummary:
      'Beras merah kaya serat alami tanpa pestisida kimia sintetis dengan kontrol kelembapan gudang berstandar pangan.',
    description:
      'Beras merah pecah kulit dari lereng Gunung Gede Cianjur yang disimpan di gudang kontrol suhu & kelembapan. Indeks glikemik rendah, pulen saat ditanak, dan dikemas vakum agar tahan distribusi antarpulau.',
    category: 'hasil_tani',
    categoryLabel: 'Distribusi Pangan & Beras Organik',
    price: 32000,
    unitLabel: 'pack vakum 1 kg',
    stock: 320,
    soldCount: 530,
    coverImage: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
    distributorName: 'Sawah Berkah Agro (Distributor Pangan)',
    coverageRegion: 'Cianjur, Sukabumi, Jabodetabek & Jawa Tengah',
    warehouseAddress: 'Jl. Raya Bandung Km 9, Gudang Pangan Cianjur Blok C-2, Kab. Cianjur, Jabar 43281',
    operatingHours: 'Senin - Sabtu (08:00 - 17:30 WIB)',
    contactPhone: '0812-8877-3344',
    fleetInfo: '2 Truk Box Pangan Tertutup + Cold Transit',
    badge: 'Bebas Pestisida',
    rating: 4.9,
    moderationStatus: 'published_homepage',
    updatedAt: 'Kemarin • 16:20 WIB',
  },
  {
    id: 'prd-sprayer-tangan',
    title: 'Sprayer Tekanan Manual Praktis 2 Liter (Stok Hub Jakarta)',
    shortSummary:
      'Penyemprot manual dengan nozzle kuningan tahan karat, tersedia dalam stok karton grosir maupun eceran cepat.',
    description:
      'Tabung HDPE tebal tahan tekanan dengan pompa ergonomis dan ujung nozzle kuningan anti-karat untuk aplikasi pupuk daun maupun pestisida nabati. Siap didistribusikan ke reseller dan kelompok tani seluruh Jabodetabek & Sumatera.',
    category: 'alat',
    categoryLabel: 'Peralatan & Sarana Pertanian',
    price: 68000,
    unitLabel: 'unit',
    stock: 210,
    soldCount: 145,
    coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    distributorName: 'Racik Official Store (Hub Logistik Timur)',
    coverageRegion: 'DKI Jakarta, Bekasi, Tangerang & Lampung',
    warehouseAddress: 'Kawasan Pergudangan Cakung Industri Blok A-9, Jakarta Timur 13910',
    operatingHours: 'Senin - Jumat (08:30 - 17:00 WIB)',
    contactPhone: '0813-9900-5511',
    fleetInfo: 'Pickup Blind Van & Ekspedisi Kargo Darat',
    badge: 'Stok Hub Jakarta',
    rating: 4.7,
    moderationStatus: 'published_homepage',
    updatedAt: '2 hari lalu',
  },
  {
    id: 'dist-pupuk-hayati-jatim',
    title: 'Distribusi Pupuk Hayati Trichoderma Cair 20 Liter (Jerigen Grosir)',
    shortSummary:
      'Pasokan skala besar pupuk hayati cair pencegah layu fusarium untuk mitra distributor sub-wilayah Jawa Timur.',
    description:
      'Dikirim langsung menggunakan armada tangki & boks berinsulasi suhu dari sentra formulasi Malang ke gudang transit Surabaya dan sekitarnya. Menjamin viabilitas mikroba aktif minimal 90 hari penyimpanan.',
    category: 'logistik',
    categoryLabel: 'Jalur Cold Chain & Pergudangan',
    price: 420000,
    unitLabel: 'jerigen 20 L',
    stock: 95,
    soldCount: 88,
    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    distributorName: 'PT Lumbung Pangan Nusantara (Hub Jatim)',
    coverageRegion: 'Surabaya, Sidoarjo, Malang & Tapal Kuda',
    warehouseAddress: 'Kawasan Pergudangan Margomulyo Permai Blok D-14, Kota Surabaya, Jawa Timur 60186',
    operatingHours: 'Senin - Sabtu (07:00 - 18:00 WIB)',
    contactPhone: '0811-3111-9090',
    fleetInfo: '4 Truk CDD + 2 Unit Cold Storage Box',
    badge: 'Cold Storage',
    rating: 4.9,
    moderationStatus: 'published_homepage',
    updatedAt: '3 hari lalu',
  },
];

export function getManagedDistributorSupplies(): ManagedDistributorSupply[] {
  if (typeof window === 'undefined') return INITIAL_DISTRIBUTOR_SUPPLIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DISTRIBUTOR_SUPPLIES;
    const parsed = JSON.parse(raw) as ManagedDistributorSupply[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DISTRIBUTOR_SUPPLIES;
  } catch {
    return INITIAL_DISTRIBUTOR_SUPPLIES;
  }
}

function syncSupplyToEditorialArchive(item: ManagedDistributorSupply) {
  const existing = getEditorialArchive().find((e) => e.id === item.id);
  const slugBase = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const archivePayload: EditorialArchiveItem = {
    id: item.id,
    slug: existing?.slug || `${slugBase || 'pasokan'}-${item.id}`,
    entityType: 'product_description',
    sourceRole: 'distributor',
    submitterName: item.distributorName,
    submitterOrigin: item.coverageRegion,
    title: item.title,
    excerpt: item.shortSummary,
    body: `${item.description}\n\nAlamat Gudang Distribusi: ${item.warehouseAddress}\nArmada & SLA: ${item.fleetInfo}\nJam Operasional: ${item.operatingHours}`,
    category: item.category,
    categoryLabel: item.categoryLabel,
    image: item.coverImage,
    publishedAt: new Date().toISOString(),
    productPrice: item.price,
    stock: item.stock,
    soldCount: item.soldCount,
    rating: item.rating,
    badge: item.badge || 'Pasokan Distributor',
    status: 'pending_review',
    publishedToHomepage: false,
    writingVerified: false,
    imageThemeVerified: false,
    moderatorNotes:
      'Diajukan / disunting dari Dashboard Distributor. Menunggu pemeriksaan deskripsi pasokan & kesesuaian gambar oleh Role Moderator.',
  };

  updateEditorialArchiveItem(archivePayload);
}

export function useManagedDistributorSupplies() {
  const [supplies, setSupplies] = useState<ManagedDistributorSupply[]>(INITIAL_DISTRIBUTOR_SUPPLIES);

  useEffect(() => {
    const sync = () => setSupplies(getManagedDistributorSupplies());
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const upsertSupply = (saved: ManagedDistributorSupply) => {
    const submittedItem: ManagedDistributorSupply = {
      ...saved,
      moderationStatus: 'pending_review',
      updatedAt: 'Baru saja (Diajukan ke Moderator)',
    };
    const current = getManagedDistributorSupplies();
    const exists = current.some((s) => s.id === submittedItem.id);
    const next = exists
      ? current.map((s) => (s.id === submittedItem.id ? submittedItem : s))
      : [submittedItem, ...current];

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(UPDATE_EVENT));
    }
    setSupplies(next);
    syncSupplyToEditorialArchive(submittedItem);
  };

  return {
    supplies,
    upsertSupply,
  };
}

