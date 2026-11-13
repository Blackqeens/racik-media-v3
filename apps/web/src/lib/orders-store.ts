'use client';

import { useEffect, useState } from 'react';
import { demoOrders } from '@/lib/demo-data';

export type OrderPaymentMethod = 'bank_transfer' | 'virtual_account' | 'ewallet';
export type OrderStatus =
  | 'pending_payment'
  | 'escrow_held'
  | 'in_fulfillment'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type OrderPartnerRole = 'seller' | 'distributor' | 'service_provider';

export interface LocalOrderShippingAddress {
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
}

export interface LocalOrderItem {
  id: string;
  entity_type: string;
  entity_id: string;
  name?: string;
  vendor_name?: string;
  image_url?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type OrderPaymentStatus =
  | 'unpaid'
  | 'pending_escrow'
  | 'released_to_seller'
  | 'withdrawn';

export interface LocalOrderRecord {
  id: string;
  order_type: string;
  target_partner_role?: OrderPartnerRole;
  status: OrderStatus;
  /** Jembatan kolom status_pembayaran (pending_escrow | released_to_seller | withdrawn) */
  status_pembayaran?: OrderPaymentStatus;
  subtotal_amount: number;
  shipping_cost: number;
  gross_amount: number;
  shipping_courier: string;
  currency: string;
  payment_method: OrderPaymentMethod;
  payment_channel: string;
  payment_account_number: string;
  payment_expires_at: string;
  paid_at?: string;
  /** Diisi oleh Role Seller / Distributor / Jasa saat konfirmasi pengiriman */
  tracking_number?: string;
  pickup_contact?: string;
  courier_name?: string;
  shipped_at?: string;
  delivered_at?: string;
  auto_release_at?: string;
  completed_at?: string;
  shipment_note?: string;
  /** Diisi oleh Role Penyedia Jasa saat mengerjakan kontrak milestone */
  milestone_progress?: string;
  service_report_ref?: string;
  shipping_address?: LocalOrderShippingAddress;
  notes?: string;
  created_at: string;
  order_items: LocalOrderItem[];
  isLocal?: boolean;
  isDemoScenario?: boolean;
}

const STORAGE_KEY = 'racik-member-orders-v2';
const LEGACY_V1_KEY = 'racik-member-orders-v1';
const UPDATE_EVENT = 'racik-member-orders-updated';

const hoursAgoIso = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const hoursFromNowIso = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

/**
 * 9 Skenario Demo Proses Transaksi (3 Seller + 3 Distributor + 3 Penyedia Jasa)
 * agar pengujian alur Pembayaran -> Escrow -> Input Resi / Progres -> Selesai berjalan nyata.
 */
export const INITIAL_PARTNER_DEMO_ORDERS: LocalOrderRecord[] = [
  // ── 3 DEMO TRANSAKSI ROLE SELLER ──
  {
    id: 'SLR-DEMO-101',
    order_type: 'product_retail',
    target_partner_role: 'seller',
    status: 'escrow_held',
    subtotal_amount: 88000,
    shipping_cost: 15000,
    gross_amount: 103000,
    shipping_courier: 'Kurir Reguler Nusantara (2–4 Hari)',
    currency: 'IDR',
    payment_method: 'virtual_account',
    payment_channel: 'BCA Virtual Account',
    payment_account_number: '39010812445511',
    payment_expires_at: hoursFromNowIso(20),
    paid_at: hoursAgoIso(2),
    shipping_address: {
      recipient_name: 'Dewi Anggraini',
      phone: '081299004411',
      address: 'Jl. Kemang Timur No. 22, Kec. Mampang Prapatan',
      city: 'Jakarta Selatan',
      postal_code: '12730',
    },
    notes: 'Demo Seller #1 — Sudah dibayar ke Escrow, menunggu Seller input Nomor Resi pengiriman.',
    created_at: hoursAgoIso(2),
    order_items: [
      {
        id: 'slr-101-item-1',
        entity_type: 'catalog_item',
        entity_id: 'prd-kopi-gayo',
        name: 'Kopi Arabika Gayo Single Origin 100g',
        vendor_name: 'Koperasi Tani Takengon',
        quantity: 4,
        unit_price: 22000,
        subtotal: 88000,
      },
    ],
    isLocal: true,
    isDemoScenario: true,
  },
  {
    id: 'SLR-DEMO-102',
    order_type: 'product_retail',
    target_partner_role: 'seller',
    status: 'in_fulfillment',
    subtotal_amount: 130000,
    shipping_cost: 15000,
    gross_amount: 145000,
    shipping_courier: 'Kurir Reguler Nusantara (2–4 Hari)',
    currency: 'IDR',
    payment_method: 'ewallet',
    payment_channel: 'QRIS / GoPay',
    payment_account_number: 'QRIS-RM-992104',
    payment_expires_at: hoursFromNowIso(12),
    paid_at: hoursAgoIso(18),
    tracking_number: 'RM-JNE-882910441',
    courier_name: 'JNE Express Reguler',
    shipped_at: hoursAgoIso(10),
    shipment_note: 'Paket dikemas bubble wrap tebal & kardus segel aman.',
    shipping_address: {
      recipient_name: 'Raka Pratama',
      phone: '081377881122',
      address: 'Jl. Buah Batu No. 114, Kec. Lengkong',
      city: 'Kota Bandung',
      postal_code: '40265',
    },
    notes: 'Demo Seller #2 — Nomor Resi sudah diinput Seller, paket sedang dalam perjalanan ke Pembeli.',
    created_at: hoursAgoIso(19),
    order_items: [
      {
        id: 'slr-102-item-1',
        entity_type: 'catalog_item',
        entity_id: 'prd-madu-hutan',
        name: 'Madu Hutan Liar Murni Kalimantan 250ml',
        vendor_name: 'Rumah Madu Kapuas',
        quantity: 2,
        unit_price: 65000,
        subtotal: 130000,
      },
    ],
    isLocal: true,
    isDemoScenario: true,
  },
  {
    id: 'SLR-DEMO-103',
    order_type: 'product_retail',
    target_partner_role: 'seller',
    status: 'completed',
    subtotal_amount: 250000,
    shipping_cost: 0,
    gross_amount: 250000,
    shipping_courier: 'Ambil Sendiri di Toko / Hub Mitra',
    currency: 'IDR',
    payment_method: 'bank_transfer',
    payment_channel: 'Bank Mandiri Escrow',
    payment_account_number: '124-000-9876-543',
    payment_expires_at: hoursAgoIso(24),
    paid_at: hoursAgoIso(52),
    tracking_number: 'RM-SIC-55019288',
    courier_name: 'SiCepat Kargo Pertanian',
    shipped_at: hoursAgoIso(46),
    shipment_note: 'Diterima lengkap dengan sertifikat daya tumbuh benih.',
    shipping_address: {
      recipient_name: 'Kelompok Tani Subur',
      phone: '081511223344',
      address: 'Desa Sukawargi, Kec. Cisurupan',
      city: 'Kab. Garut',
      postal_code: '44163',
    },
    notes: 'Demo Seller #3 — Transaksi selesai, barang dikonfirmasi pembeli & dana Escrow cair ke Seller.',
    created_at: hoursAgoIso(54),
    order_items: [
      {
        id: 'slr-103-item-1',
        entity_type: 'catalog_item',
        entity_id: 'prd-benih-cabai',
        name: 'Benih Cabai Rawit Merah Unggul (Kemasan 10g)',
        vendor_name: 'Racik Seed Lab',
        quantity: 10,
        unit_price: 25000,
        subtotal: 250000,
      },
    ],
    isLocal: true,
    isDemoScenario: true,
  },

  // ── 3 DEMO TRANSAKSI ROLE DISTRIBUTOR ──
  {
    id: 'DST-DEMO-201',
    order_type: 'product_wholesale',
    target_partner_role: 'distributor',
    status: 'escrow_held',
    subtotal_amount: 4500000,
    shipping_cost: 28000,
    gross_amount: 4528000,
    shipping_courier: 'Kurir Kargo / Ekspres Agro (1–2 Hari)',
    currency: 'IDR',
    payment_method: 'bank_transfer',
    payment_channel: 'Bank Mandiri Escrow',
    payment_account_number: '124-000-9876-543',
    payment_expires_at: hoursFromNowIso(18),
    paid_at: hoursAgoIso(3),
    shipping_address: {
      recipient_name: 'Koperasi Tani Priangan',
      phone: '081122008899',
      address: 'Jl. Raya Garut–Tasikmalaya Km 14, Gudang Koperasi',
      city: 'Kab. Garut',
      postal_code: '44181',
    },
    notes: 'Demo Distributor #1 — Pembayaran batch masuk Escrow, menunggu Distributor terbitkan Nomor Resi / Surat Jalan.',
    created_at: hoursAgoIso(3),
    order_items: [
      {
        id: 'dst-201-item-1',
        entity_type: 'catalog_item',
        entity_id: 'prd-kompos-organik',
        name: 'Kompos Organik Matang Kaya Mikroba (Kemasan 5 Kg / Partai)',
        vendor_name: 'Tani Lestari Nusantara (Distributor Jabar)',
        quantity: 100,
        unit_price: 45000,
        subtotal: 4500000,
      },
    ],
    isLocal: true,
    isDemoScenario: true,
  },
  {
    id: 'DST-DEMO-202',
    order_type: 'product_wholesale',
    target_partner_role: 'distributor',
    status: 'in_fulfillment',
    subtotal_amount: 1600000,
    shipping_cost: 28000,
    gross_amount: 1628000,
    shipping_courier: 'Armada Box Distributor Regional',
    currency: 'IDR',
    payment_method: 'virtual_account',
    payment_channel: 'Mandiri Virtual Account',
    payment_account_number: '89022104992811',
    payment_expires_at: hoursFromNowIso(10),
    paid_at: hoursAgoIso(22),
    tracking_number: 'SJ-ARMADA-2026-4412',
    courier_name: 'Armada CDD Box Internal Distributor (N 8492 UB)',
    shipped_at: hoursAgoIso(12),
    shipment_note: 'Beras vakum dimuat ke truk pangan tertutup, estimasi tiba sore ini.',
    shipping_address: {
      recipient_name: 'Sentra Pangan Sehat Depok',
      phone: '081288773300',
      address: 'Jl. Margonda Raya No. 210, Gudang Transit Blok B',
      city: 'Kota Depok',
      postal_code: '16424',
    },
    notes: 'Demo Distributor #2 — Resi Surat Jalan sudah terbit, armada sedang dalam perjalanan ke gudang pembeli.',
    created_at: hoursAgoIso(24),
    order_items: [
      {
        id: 'dst-202-item-1',
        entity_type: 'catalog_item',
        entity_id: 'prd-beras-merah',
        name: 'Beras Merah Organik Cianjur (Pasokan Gudang 1 Kg)',
        vendor_name: 'Sawah Berkah Agro (Distributor Pangan)',
        quantity: 50,
        unit_price: 32000,
        subtotal: 1600000,
      },
    ],
    isLocal: true,
    isDemoScenario: true,
  },
  {
    id: 'DST-DEMO-203',
    order_type: 'product_wholesale',
    target_partner_role: 'distributor',
    status: 'completed',
    subtotal_amount: 1360000,
    shipping_cost: 0,
    gross_amount: 1360000,
    shipping_courier: 'Ambil Sendiri di Toko / Hub Mitra',
    currency: 'IDR',
    payment_method: 'virtual_account',
    payment_channel: 'BRI Virtual Account',
    payment_account_number: '88810912837411',
    payment_expires_at: hoursAgoIso(36),
    paid_at: hoursAgoIso(72),
    tracking_number: 'SJ-HUB-JKT-3910',
    courier_name: 'Pickup Blind Van Hub Jakarta Timur',
    shipped_at: hoursAgoIso(68),
    shipment_note: '20 unit sprayer lolos QC & POD ditandatangani penerima.',
    shipping_address: {
      recipient_name: 'Toko Tani Makmur Bekasi',
      phone: '081399001199',
      address: 'Jl. Ahmad Yani No. 55, Bekasi Selatan',
      city: 'Kota Bekasi',
      postal_code: '17141',
    },
    notes: 'Demo Distributor #3 — Pengiriman selesai, POD sah & dana Escrow cair ke Distributor.',
    created_at: hoursAgoIso(75),
    order_items: [
      {
        id: 'dst-203-item-1',
        entity_type: 'catalog_item',
        entity_id: 'prd-sprayer-tangan',
        name: 'Sprayer Tekanan Manual Praktis 2 Liter (Stok Hub Jakarta)',
        vendor_name: 'Racik Official Store (Hub Logistik Timur)',
        quantity: 20,
        unit_price: 68000,
        subtotal: 1360000,
      },
    ],
    isLocal: true,
    isDemoScenario: true,
  },

  // ── 3 DEMO TRANSAKSI ROLE PENYEDIA JASA ──
  {
    id: 'SRV-DEMO-301',
    order_type: 'service_geolocated',
    target_partner_role: 'service_provider',
    status: 'escrow_held',
    subtotal_amount: 540000,
    shipping_cost: 0,
    gross_amount: 540000,
    shipping_courier: 'Kunjungan On-Site / Pengambilan Sampel Lahan',
    currency: 'IDR',
    payment_method: 'virtual_account',
    payment_channel: 'BNI Virtual Account',
    payment_account_number: '88081445566778',
    payment_expires_at: hoursFromNowIso(22),
    paid_at: hoursAgoIso(4),
    milestone_progress: 'Tahap 1: Jadwal Kunjungan & Pengambilan 3 Sampel Tanah (50%)',
    service_report_ref: '',
    shipping_address: {
      recipient_name: 'Kelompok Tani Harapan Jaya',
      phone: '081244556677',
      address: 'Desa Simpang, Kec. Cikajang, Lahan Blok C',
      city: 'Kab. Garut',
      postal_code: '44171',
    },
    notes: 'Demo Penyedia Jasa #1 — Kontrak dibayar ke Escrow, menunggu Penyedia Jasa mengisi kode laporan & update progres.',
    created_at: hoursAgoIso(4),
    order_items: [
      {
        id: 'srv-301-item-1',
        entity_type: 'service_listing',
        entity_id: 'srv-03-uji-tanah',
        name: 'Pemeriksaan Kesuburan Tanah & Formulasi Pemupukan Presisi (3 Sampel)',
        vendor_name: 'Dr. Sarah Amalia',
        quantity: 3,
        unit_price: 180000,
        subtotal: 540000,
      },
    ],
    isLocal: true,
    isDemoScenario: true,
  },
  {
    id: 'SRV-DEMO-302',
    order_type: 'service_remote',
    target_partner_role: 'service_provider',
    status: 'in_fulfillment',
    subtotal_amount: 750000,
    shipping_cost: 0,
    gross_amount: 750000,
    shipping_courier: 'Pengiriman Sampel Biji ke Lab Sensori Bandung',
    currency: 'IDR',
    payment_method: 'ewallet',
    payment_channel: 'QRIS / DANA',
    payment_account_number: 'QRIS-RM-778192',
    payment_expires_at: hoursFromNowIso(8),
    paid_at: hoursAgoIso(28),
    milestone_progress: 'Tahap 2: Sample Roasting & Penilaian SCA Cupping Sheet (80%)',
    service_report_ref: 'LAB-CUPPING-2026-0912',
    tracking_number: 'LAB-CUPPING-2026-0912',
    courier_name: 'Lab Sensori Racik Nusantara (Digital & Sampel)',
    shipped_at: hoursAgoIso(6),
    shipment_note: 'Lembar hasil cupping sementara telah diunggah untuk ditinjau klien.',
    shipping_address: {
      recipient_name: 'Koperasi Kopi Gayo Mandiri',
      phone: '081366778899',
      address: 'Jl. Lebe Kader No. 9, Takengon',
      city: 'Kab. Aceh Tengah',
      postal_code: '24552',
    },
    notes: 'Demo Penyedia Jasa #2 — Laporan progres & kode referensi jasa sudah dikirim ke klien, menunggu konfirmasi selesai.',
    created_at: hoursAgoIso(30),
    order_items: [
      {
        id: 'srv-302-item-1',
        entity_type: 'service_listing',
        entity_id: 'srv-02-uji-kopi',
        name: 'Kurasi Cita Rasa & Uji Organoleptik Kopi Nusantara',
        vendor_name: 'Ir. Bayu Wicaksono',
        quantity: 1,
        unit_price: 750000,
        subtotal: 750000,
      },
    ],
    isLocal: true,
    isDemoScenario: true,
  },
  {
    id: 'SRV-DEMO-303',
    order_type: 'service_geolocated',
    target_partner_role: 'service_provider',
    status: 'completed',
    subtotal_amount: 1500000,
    shipping_cost: 0,
    gross_amount: 1500000,
    shipping_courier: 'Workshop On-Site Sentra Rotan Cirebon',
    currency: 'IDR',
    payment_method: 'bank_transfer',
    payment_channel: 'Bank BCA Escrow',
    payment_account_number: '124-000-9876-543',
    payment_expires_at: hoursAgoIso(40),
    paid_at: hoursAgoIso(96),
    milestone_progress: 'Tahap 3: Evaluasi Karya & Sertifikat Workshop Selesai (100%)',
    service_report_ref: 'BA-SRV-ROTAN-2026-004',
    tracking_number: 'BA-SRV-ROTAN-2026-004',
    courier_name: 'Pendampingan On-Site Maestro Tegalwangi',
    shipped_at: hoursAgoIso(72),
    shipment_note: 'Seluruh 3 tahap milestone selesai disetujui klien.',
    shipping_address: {
      recipient_name: 'Paguyuban Pengrajin Kriya Muda',
      phone: '081722334455',
      address: 'Jl. Ki Ageng Tapa No. 42, Tegalwangi',
      city: 'Kab. Cirebon',
      postal_code: '45154',
    },
    notes: 'Demo Penyedia Jasa #3 — Seluruh milestone selesai & dana Escrow cair penuh ke Penyedia Jasa.',
    created_at: hoursAgoIso(98),
    order_items: [
      {
        id: 'srv-303-item-1',
        entity_type: 'service_listing',
        entity_id: 'srv-01-pelatihan-rotan',
        name: 'Pelatihan & Workshop Kriya Anyaman Rotan Tradisi',
        vendor_name: 'Ki Anom Tegalwangi',
        quantity: 1,
        unit_price: 1500000,
        subtotal: 1500000,
      },
    ],
    isLocal: true,
    isDemoScenario: true,
  },
];

export function buildPaymentAccountInfo(method: OrderPaymentMethod, channel?: string) {
  if (method === 'virtual_account') {
    const bank = channel || 'BCA Virtual Account';
    const prefix = bank.includes('Mandiri')
      ? '89022'
      : bank.includes('BRI')
        ? '88810'
        : bank.includes('BNI')
          ? '88081'
          : '39010';
    const randomSuffix = String(Math.floor(10000000 + Math.random() * 89999999));
    return {
      payment_channel: bank,
      payment_account_number: `${prefix}${randomSuffix}`,
    };
  }
  if (method === 'bank_transfer') {
    const bank = channel || 'Bank Mandiri (Escrow PT Racik Media Nusantara)';
    return {
      payment_channel: bank,
      payment_account_number: '124-000-9876-543',
    };
  }
  const wallet = channel || 'QRIS / GoPay / OVO / DANA';
  return {
    payment_channel: wallet,
    payment_account_number: `QRIS-RM-${Math.floor(100000 + Math.random() * 899999)}`,
  };
}

export function getLocalOrders(): LocalOrderRecord[] {
  if (typeof window === 'undefined') return INITIAL_PARTNER_DEMO_ORDERS;
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as LocalOrderRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // Migrasi aman order v1 milik user + gabungkan 9 transaksi demo Seller/Distributor/Jasa
    const rawV1 = window.localStorage.getItem(LEGACY_V1_KEY);
    let legacyList: LocalOrderRecord[] = [];
    if (rawV1) {
      const parsedV1 = JSON.parse(rawV1) as LocalOrderRecord[];
      if (Array.isArray(parsedV1)) {
        legacyList = parsedV1.map((o) => ({
          ...o,
          target_partner_role: o.target_partner_role || 'seller',
        }));
      }
    }

    const seen = new Set(legacyList.map((o) => o.id));
    const seeded = [
      ...legacyList,
      ...INITIAL_PARTNER_DEMO_ORDERS.filter((d) => !seen.has(d.id)),
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  } catch {
    return INITIAL_PARTNER_DEMO_ORDERS;
  }
}

export function saveLocalOrder(order: LocalOrderRecord): LocalOrderRecord[] {
  if (typeof window === 'undefined') return [order];
  const current = getLocalOrders();
  const exists = current.some((o) => o.id === order.id);
  const next = exists
    ? current.map((o) => (o.id === order.id ? order : o))
    : [order, ...current];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(UPDATE_EVENT));
  return next;
}

export function getLocalOrderById(orderId: string): LocalOrderRecord | null {
  const raw = orderId.trim();
  const normalized = raw.replace(/\s+/g, '-');
  const found = getLocalOrders().find(
    (o) =>
      o.id === raw ||
      o.id === normalized ||
      o.id.replace(/\s+/g, '-') === normalized ||
      o.id.toLowerCase() === raw.toLowerCase() ||
      o.id.toLowerCase() === normalized.toLowerCase(),
  );
  if (found) return found;

  const fallbackDemo = demoOrders.find(
    (d) =>
      d.id === raw ||
      d.id === normalized ||
      d.id.replace(/\s+/g, '-') === normalized ||
      d.id.toLowerCase() === raw.toLowerCase() ||
      d.id.toLowerCase() === normalized.toLowerCase(),
  );
  if (!fallbackDemo) return null;

  return {
    id: fallbackDemo.id,
    order_type: fallbackDemo.order_type,
    target_partner_role: 'seller',
    status: fallbackDemo.status as OrderStatus,
    subtotal_amount: fallbackDemo.gross_amount,
    shipping_cost: 0,
    gross_amount: fallbackDemo.gross_amount,
    shipping_courier: 'Kurir Reguler Nusantara',
    currency: fallbackDemo.currency || 'IDR',
    payment_method: 'virtual_account',
    payment_channel: 'BCA Virtual Account',
    payment_account_number: '39010812994411',
    payment_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    notes: fallbackDemo.notes,
    created_at: fallbackDemo.created_at,
    order_items: fallbackDemo.order_items,
    isLocal: true,
  };
}

export function deriveOrderPaymentStatus(order: LocalOrderRecord): OrderPaymentStatus {
  if (order.status_pembayaran === 'withdrawn') return 'withdrawn';
  if (order.status === 'completed') return 'released_to_seller';
  if (order.status === 'escrow_held' || order.status === 'in_fulfillment') {
    return 'pending_escrow';
  }
  return 'unpaid';
}

export function markLocalOrderPaid(orderId: string): LocalOrderRecord | null {
  const existing = getLocalOrderById(orderId);
  if (!existing) return null;
  const updated: LocalOrderRecord = {
    ...existing,
    status: 'escrow_held',
    status_pembayaran: 'pending_escrow',
    paid_at: new Date().toISOString(),
  };
  saveLocalOrder(updated);
  return updated;
}

/**
 * Seller, Distributor, atau Penyedia Jasa mengisi Nomor Resi Kurir atau Nomor Kontak Armada Pickup.
 * Status otomatis berubah menjadi 'in_fulfillment' (Sedang Dikirim, dana masih tertahan/locked)
 * dan langsung terbaca di halaman Detail Pesanan Pembeli (/orders/[id]).
 */
export function updatePartnerTrackingNumber(
  orderId: string,
  payload: {
    tracking_number?: string;
    pickup_contact?: string;
    courier_name: string;
    shipment_note?: string;
  },
): LocalOrderRecord | null {
  const existing = getLocalOrderById(orderId);
  if (!existing) return null;
  const shippedAt = new Date();
  const autoReleaseAt = new Date(shippedAt.getTime() + 48 * 60 * 60 * 1000);
  const trackingVal = payload.tracking_number?.trim() || existing.tracking_number || '';
  const pickupVal = payload.pickup_contact?.trim() || existing.pickup_contact || '';
  const updated: LocalOrderRecord = {
    ...existing,
    status: existing.status === 'completed' ? 'completed' : 'in_fulfillment',
    status_pembayaran:
      existing.status === 'completed'
        ? deriveOrderPaymentStatus(existing)
        : 'pending_escrow',
    tracking_number: trackingVal || (pickupVal ? `ARMADA-${pickupVal}` : undefined),
    pickup_contact: pickupVal || undefined,
    courier_name: payload.courier_name.trim(),
    shipment_note: payload.shipment_note?.trim() || existing.shipment_note,
    shipped_at: shippedAt.toISOString(),
    auto_release_at: existing.auto_release_at || autoReleaseAt.toISOString(),
  };
  saveLocalOrder(updated);
  return updated;
}

/**
 * Penyedia Jasa mengisi Nomor Laporan Progres / Berita Acara & memajukan tahap milestone.
 */
export function updateServiceMilestoneProgress(
  orderId: string,
  payload: {
    milestone_progress: string;
    service_report_ref: string;
    pickup_contact?: string;
    shipment_note?: string;
  },
): LocalOrderRecord | null {
  const existing = getLocalOrderById(orderId);
  if (!existing) return null;
  const shippedAt = new Date();
  const autoReleaseAt = new Date(shippedAt.getTime() + 48 * 60 * 60 * 1000);
  const updated: LocalOrderRecord = {
    ...existing,
    status: existing.status === 'completed' ? 'completed' : 'in_fulfillment',
    status_pembayaran:
      existing.status === 'completed'
        ? deriveOrderPaymentStatus(existing)
        : 'pending_escrow',
    milestone_progress: payload.milestone_progress.trim(),
    service_report_ref: payload.service_report_ref.trim(),
    tracking_number: payload.service_report_ref.trim(),
    pickup_contact: payload.pickup_contact?.trim() || existing.pickup_contact,
    courier_name: existing.shipping_courier,
    shipment_note: payload.shipment_note?.trim() || existing.shipment_note,
    shipped_at: shippedAt.toISOString(),
    auto_release_at: existing.auto_release_at || autoReleaseAt.toISOString(),
  };
  saveLocalOrder(updated);
  return updated;
}

export function markLocalOrderCompleted(orderId: string): LocalOrderRecord | null {
  const existing = getLocalOrderById(orderId);
  if (!existing) return null;
  const nowIso = new Date().toISOString();
  const updated: LocalOrderRecord = {
    ...existing,
    status: 'completed',
    status_pembayaran:
      existing.status_pembayaran === 'withdrawn' ? 'withdrawn' : 'released_to_seller',
    delivered_at: existing.delivered_at || nowIso,
    completed_at: nowIso,
  };
  saveLocalOrder(updated);
  return updated;
}

export function resetPartnerDemoOrders(): LocalOrderRecord[] {
  if (typeof window !== 'undefined') {
    const existingCustom = getLocalOrders().filter((o) => !o.isDemoScenario);
    const next = [...existingCustom, ...INITIAL_PARTNER_DEMO_ORDERS];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(UPDATE_EVENT));
    return next;
  }
  return INITIAL_PARTNER_DEMO_ORDERS;
}

export function useLocalOrders() {
  const [orders, setOrders] = useState<LocalOrderRecord[]>(INITIAL_PARTNER_DEMO_ORDERS);

  useEffect(() => {
    const sync = () => setOrders(getLocalOrders());
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    orders,
    saveOrder: saveLocalOrder,
    markPaid: markLocalOrderPaid,
    updateTracking: updatePartnerTrackingNumber,
    updateServiceProgress: updateServiceMilestoneProgress,
    markCompleted: markLocalOrderCompleted,
    resetDemoOrders: resetPartnerDemoOrders,
  };
}
