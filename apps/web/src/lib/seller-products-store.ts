'use client';

import { useEffect, useState } from 'react';
import {
  getEditorialArchive,
  updateEditorialArchiveItem,
  type EditorialArchiveItem,
} from '@/lib/editorial-archive';

export interface ManagedSellerProduct {
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
  storeName: string;
  locationArea: string;
  fullAddress: string;
  operatingHours: string;
  contactPhone: string;
  shippingEstimate: string;
  badge: string;
  rating: number;
  moderationStatus: 'published_homepage' | 'pending_review' | 'revision_needed';
  updatedAt: string;
}

const STORAGE_KEY = 'racik-seller-products-v1';
const UPDATE_EVENT = 'racik-seller-products-updated';

export const SELLER_CATEGORY_OPTIONS = [
  { id: 'hasil_tani', label: 'Kopi, Madu & Hasil Tani' },
  { id: 'bibit', label: 'Bibit & Benih Unggul' },
  { id: 'pupuk', label: 'Pupuk & Nutrisi Organik' },
  { id: 'alat', label: 'Kriya, Kerajinan & Peralatan' },
  { id: 'herbal', label: 'Herbal & Pangan Olahan' },
];

export const INITIAL_SELLER_PRODUCTS: ManagedSellerProduct[] = [
  {
    id: 'prd-kopi-gayo',
    title: 'Kopi Arabika Gayo Single Origin 100g',
    shortSummary:
      'Biji kopi arabika dipetik merah dari dataran tinggi Gayo dengan cita rasa asam lembut dan aroma karamel pekat.',
    description:
      'Kopi Arabika Gayo asli dari ketinggian 1.400 mdpl di Aceh Tengah. Diproses secara semi-washed oleh petani anggota koperasi, menghasilkan seduhan bersih dengan aroma rempah manis dan cokelat hitam. Cocok untuk seduh manual V60 maupun espresso.',
    category: 'hasil_tani',
    categoryLabel: 'Kopi, Madu & Hasil Tani',
    price: 22000,
    unitLabel: 'kemasan 100g',
    stock: 120,
    soldCount: 520,
    coverImage: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&q=80',
    storeName: 'Koperasi Tani Takengon',
    locationArea: 'Takengon, Aceh Tengah',
    fullAddress: 'Jl. Lebe Kader No. 18, Kec. Bebesen, Kab. Aceh Tengah, Provinsi Aceh 24552',
    operatingHours: 'Senin - Sabtu (08:00 - 17:00 WIB)',
    contactPhone: '0812-6000-1122',
    shippingEstimate: 'Dikirim H+1 • Kemasan Valve Kedap Udara',
    badge: 'Produk Unggulan',
    rating: 4.9,
    moderationStatus: 'published_homepage',
    updatedAt: 'Hari ini • 09:30 WIB',
  },
  {
    id: 'prd-madu-hutan',
    title: 'Madu Hutan Liar Murni Kalimantan 250ml',
    shortSummary:
      'Madu murni hasil panen lebah liar Apis dorsata pada pohon sialang hutan tropis tanpa pemanasan buatan.',
    description:
      'Dipanen secara lestari oleh kelompok masyarakat adat hutan Kapuas Hulu. Mengandung enzim diastase aktif, polen bunga hutan multiflora, dan dikemas higienis dalam botol kaca steril tanpa campuran gula atau pengawet.',
    category: 'herbal',
    categoryLabel: 'Herbal & Pangan Olahan',
    price: 65000,
    unitLabel: 'botol 250ml',
    stock: 45,
    soldCount: 310,
    coverImage: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
    storeName: 'Rumah Madu Kapuas',
    locationArea: 'Kapuas Hulu, Kalimantan Barat',
    fullAddress: 'Dusun Sialang Lestari Blok B-4, Kec. Putussibau Selatan, Kab. Kapuas Hulu, Kalbar 78711',
    operatingHours: 'Senin - Sabtu (08:00 - 16:30 WIB)',
    contactPhone: '0813-4500-7788',
    shippingEstimate: 'Packing Kayu & Bubble Wrap Berlapis',
    badge: 'Organik Alami',
    rating: 4.9,
    moderationStatus: 'published_homepage',
    updatedAt: 'Kemarin • 15:10 WIB',
  },
  {
    id: 'prd-benih-cabai',
    title: 'Benih Cabai Rawit Merah Unggul (Kemasan 10g)',
    shortSummary:
      'Benih cabai produktif untuk kebun rumah dan budidaya presisi dengan daya tumbuh di atas 85%.',
    description:
      'Benih cabai rawit merah varietas lokal tahan layu bakteri dan adaptif di dataran rendah maupun menengah. Telah melewati uji kecambah laboratorium dan dikemas kedap udara aluminium foil.',
    category: 'bibit',
    categoryLabel: 'Bibit & Benih Unggul',
    price: 25000,
    unitLabel: 'sachet 10g',
    stock: 80,
    soldCount: 240,
    coverImage: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&q=80',
    storeName: 'Racik Seed Lab',
    locationArea: 'Batu & Malang, Jawa Timur',
    fullAddress: 'Jl. Panglima Sudirman No. 55, Kec. Batu, Kota Batu, Jawa Timur 65311',
    operatingHours: 'Senin - Minggu (07:30 - 16:00 WIB)',
    contactPhone: '0811-3300-8899',
    shippingEstimate: 'Ready Stock • Kirim Hari yang Sama',
    badge: 'Benih Terpilih',
    rating: 5.0,
    moderationStatus: 'published_homepage',
    updatedAt: '2 hari lalu',
  },
  {
    id: 'prd-tas-rotan',
    title: 'Tas Anyam Rotan Natural Artisan Cirebon',
    shortSummary:
      'Anyaman rotan alami dengan lapisan ramah lingkungan dan furing kain blacu buatan pengrajin lokal.',
    description:
      'Tas selempang rotan buatan tangan pengrajin Sentra Tegalwangi Cirebon dengan struktur kokoh, ringan, anyaman rapat bernilai seni tinggi, dan dilengkapi kancing kulit sintetis premium.',
    category: 'alat',
    categoryLabel: 'Kriya, Kerajinan & Peralatan',
    price: 135000,
    unitLabel: 'pcs',
    stock: 25,
    soldCount: 190,
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    storeName: 'Galeri Rotan Tegalwangi',
    locationArea: 'Tegalwangi, Kab. Cirebon',
    fullAddress: 'Jl. Ki Ageng Tapa No. 42, Desa Tegalwangi, Kec. Weru, Kab. Cirebon, Jawa Barat 45154',
    operatingHours: 'Senin - Sabtu (09:00 - 17:00 WIB)',
    contactPhone: '0812-2345-6789',
    shippingEstimate: 'Kardus Pelindung Khusus Kriya',
    badge: 'Handcrafted',
    rating: 4.8,
    moderationStatus: 'published_homepage',
    updatedAt: '3 hari lalu',
  },
  {
    id: 'prd-vco-kelapa',
    title: 'Minyak Kelapa Murni (VCO) Cold Pressed 500ml',
    shortSummary:
      'Diekstrak tanpa pemanasan tinggi untuk menjaga nutrisi asam laurat alami dan kemurnian minyak kelapa.',
    description:
      'Virgin Coconut Oil hasil ekstraksi dingin (cold pressed) dari kelapa tua pilihan petani Kulon Progo. Jernih, beraroma segar kelapa alami, tidak tengik, dan kaya asam laurat untuk kesehatan serta kuliner.',
    category: 'herbal',
    categoryLabel: 'Herbal & Pangan Olahan',
    price: 45000,
    unitLabel: 'botol 500ml',
    stock: 50,
    soldCount: 270,
    coverImage: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
    storeName: 'Sentra VCO Kulon Progo',
    locationArea: 'Wates, Kulon Progo, DIY',
    fullAddress: 'Jl. Khudori No. 27, Kec. Wates, Kab. Kulon Progo, D.I. Yogyakarta 55651',
    operatingHours: 'Senin - Sabtu (08:00 - 16:00 WIB)',
    contactPhone: '0815-7744-2211',
    shippingEstimate: 'Segel Botol Food-Grade + Kardus',
    badge: 'Cold Pressed',
    rating: 4.8,
    moderationStatus: 'published_homepage',
    updatedAt: '4 hari lalu',
  },
];

export function getManagedSellerProducts(): ManagedSellerProduct[] {
  if (typeof window === 'undefined') return INITIAL_SELLER_PRODUCTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_SELLER_PRODUCTS;
    const parsed = JSON.parse(raw) as ManagedSellerProduct[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SELLER_PRODUCTS;
  } catch {
    return INITIAL_SELLER_PRODUCTS;
  }
}

function syncProductToEditorialArchive(item: ManagedSellerProduct) {
  const existing = getEditorialArchive().find((e) => e.id === item.id);
  const slugBase = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const archivePayload: EditorialArchiveItem = {
    id: item.id,
    slug: existing?.slug || `${slugBase || 'produk'}-${item.id}`,
    entityType: 'product_description',
    sourceRole: 'seller',
    submitterName: item.storeName,
    submitterOrigin: item.locationArea,
    title: item.title,
    excerpt: item.shortSummary,
    body: `${item.description}\n\nAlamat Toko / Lokasi Produksi: ${item.fullAddress}\nJam Operasional: ${item.operatingHours}`,
    category: item.category,
    categoryLabel: item.categoryLabel,
    image: item.coverImage,
    publishedAt: new Date().toISOString(),
    productPrice: item.price,
    stock: item.stock,
    soldCount: item.soldCount,
    rating: item.rating,
    badge: item.badge || 'Produk Seller',
    // Setiap hasil Tambah / Edit Seller wajib masuk antrean kurasi Moderator terlebih dahulu
    status: 'pending_review',
    publishedToHomepage: false,
    writingVerified: false,
    imageThemeVerified: false,
    moderatorNotes:
      'Diajukan / disunting dari Dashboard Seller. Menunggu pemeriksaan deskripsi & kesesuaian gambar oleh Role Moderator.',
  };

  updateEditorialArchiveItem(archivePayload);
}

export function useManagedSellerProducts() {
  const [products, setProducts] = useState<ManagedSellerProduct[]>(INITIAL_SELLER_PRODUCTS);

  useEffect(() => {
    const sync = () => setProducts(getManagedSellerProducts());
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const upsertProduct = (saved: ManagedSellerProduct) => {
    const submittedItem: ManagedSellerProduct = {
      ...saved,
      moderationStatus: 'pending_review',
      updatedAt: 'Baru saja (Diajukan ke Moderator)',
    };
    const current = getManagedSellerProducts();
    const exists = current.some((p) => p.id === submittedItem.id);
    const next = exists
      ? current.map((p) => (p.id === submittedItem.id ? submittedItem : p))
      : [submittedItem, ...current];

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(UPDATE_EVENT));
    }
    setProducts(next);
    syncProductToEditorialArchive(submittedItem);
  };

  return {
    products,
    upsertProduct,
  };
}

