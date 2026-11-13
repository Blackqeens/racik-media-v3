'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Package,
  PackageCheck,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  Wallet,
} from 'lucide-react';
import { formatRelativeTime, formatRupiah } from '@/lib/utils';
import {
  type LocalOrderRecord,
  type OrderPartnerRole,
} from '@/lib/orders-store';
import {
  calculatePlatformFee,
  getPartnerRoleMeta,
  usePartnerEscrowFinance,
} from '@/lib/partner-escrow-store';

export type StoreOrderTabKey = 'to_ship' | 'shipping' | 'completed';

interface PartnerStoreOrdersViewProps {
  partnerRole: OrderPartnerRole;
}

const SHIPPING_CHANNEL_PRESETS: Record<OrderPartnerRole, string[]> = {
  seller: [
    'JNE Express Reguler',
    'SiCepat Kargo Pertanian',
    'J&T Express',
    'Pos Indonesia Kargo',
    'Armada Pickup Toko / Kurir Lokal',
  ],
  distributor: [
    'Armada CDD Box Internal Distributor',
    'Truk Cold Box Regional Nusantara',
    'Pickup Blind Van Hub Wilayah',
    'Kargo Logistik Antarprovinsi',
  ],
  service_provider: [
    'Tim Lapangan On-Site Mitra',
    'Kurir Pengambilan Sampel / Lab',
    'Pelaksanaan Sesi Online / Konsultasi',
  ],
};

function generateTrackingCode(role: OrderPartnerRole, mode: 'resi' | 'armada'): string {
  const rand = Math.floor(100000 + Math.random() * 899999);
  if (mode === 'armada') {
    const num = Math.floor(1000 + Math.random() * 8999);
    return `0812-${num}-${rand.toString().slice(0, 4)}`;
  }
  if (role === 'distributor') return `SJ-DIST-${rand}`;
  if (role === 'service_provider') return `BA-SRV-${rand}`;
  return `RM-RESI-${rand}`;
}

export function PartnerStoreOrdersView({ partnerRole }: PartnerStoreOrdersViewProps) {
  const meta = getPartnerRoleMeta(partnerRole);
  const {
    summary,
    markPaid,
    updateTracking,
    updateServiceProgress,
    markCompleted,
    resetDemoOrders,
  } = usePartnerEscrowFinance(partnerRole);

  const [activeTab, setActiveTab] = useState<StoreOrderTabKey>('to_ship');
  const [inputModeByOrder, setInputModeByOrder] = useState<Record<string, 'resi' | 'armada'>>({});
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});
  const [courierDrafts, setCourierDrafts] = useState<Record<string, string>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const isService = partnerRole === 'service_provider';

  const tabOrders = useMemo(() => {
    if (activeTab === 'to_ship') return summary.toShipOrders;
    if (activeTab === 'shipping') return summary.shippingOrders;
    return summary.completedOrders;
  }, [activeTab, summary]);

  function notify(type: 'success' | 'error', text: string) {
    setFeedback({ type, text });
    window.setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  }

  function handleConfirmShipment(order: LocalOrderRecord) {
    const mode = inputModeByOrder[order.id] ?? 'resi';
    const rawCode = (
      trackingDrafts[order.id] ??
      (mode === 'armada' ? order.pickup_contact : order.tracking_number) ??
      ''
    ).trim();

    if (!rawCode) {
      notify(
        'error',
        mode === 'armada'
          ? 'Mohon isi nomor kontak armada pickup terlebih dahulu.'
          : isService
            ? 'Mohon isi nomor laporan / kode referensi pelaksanaan terlebih dahulu.'
            : 'Mohon isi nomor resi kurir terlebih dahulu.',
      );
      return;
    }

    const courierName =
      courierDrafts[order.id] ??
      order.courier_name ??
      SHIPPING_CHANNEL_PRESETS[partnerRole][0];
    const note = noteDrafts[order.id] ?? order.shipment_note;

    if (isService) {
      updateServiceProgress(order.id, {
        milestone_progress: `${courierName} (Dalam Pelaksanaan)`,
        service_report_ref: mode === 'resi' ? rawCode : `TIM-${rawCode}`,
        pickup_contact: mode === 'armada' ? rawCode : order.pickup_contact,
        shipment_note: note,
      });
    } else {
      updateTracking(order.id, {
        tracking_number: mode === 'resi' ? rawCode : undefined,
        pickup_contact: mode === 'armada' ? rawCode : undefined,
        courier_name: courierName,
        shipment_note: note,
      });
    }

    setActiveTab('shipping');
    notify(
      'success',
      `Pengiriman pesanan #${order.id} dikonfirmasi. Status berpindah ke "Sedang Dikirim" (uang tetap tertahan aman sampai barang diterima).`,
    );
  }

  const tabs: Array<{
    key: StoreOrderTabKey;
    title: string;
    moneyStatus: string;
    count: number;
    amount: number;
    activeStyle: string;
    badgeStyle: string;
  }> = [
    {
      key: 'to_ship',
      title: 'Perlu Dikirim',
      moneyStatus: 'Status Uang: Aman di Rekber Platform',
      count: summary.toShipOrders.length,
      amount: summary.toShipAmount,
      activeStyle: 'border-amber-500 bg-amber-50/90 text-amber-950 shadow-sm',
      badgeStyle: 'bg-amber-200 text-amber-950',
    },
    {
      key: 'shipping',
      title: 'Sedang Dikirim',
      moneyStatus: 'Status Uang: Tertahan / Locked',
      count: summary.shippingOrders.length,
      amount: summary.shippingAmount,
      activeStyle: 'border-blue-500 bg-blue-50/90 text-blue-950 shadow-sm',
      badgeStyle: 'bg-blue-200 text-blue-950',
    },
    {
      key: 'completed',
      title: 'Selesai',
      moneyStatus: `Status Uang: Dilepas ke ${meta.roleLabel}`,
      count: summary.completedOrders.length,
      amount: summary.completedGrossTotal,
      activeStyle: 'border-emerald-500 bg-emerald-50/90 text-emerald-950 shadow-sm',
      badgeStyle: 'bg-emerald-200 text-emerald-950',
    },
  ];

  const heroTheme =
    partnerRole === 'distributor'
      ? {
          border: 'border-cyan-300/60',
          orbA: 'bg-cyan-400/30',
          orbB: 'bg-emerald-400/30',
          sparkle: 'text-cyan-300',
        }
      : partnerRole === 'service_provider'
        ? {
            border: 'border-sky-300/60',
            orbA: 'bg-sky-400/30',
            orbB: 'bg-emerald-400/30',
            sparkle: 'text-sky-300',
          }
        : {
            border: 'border-amber-300/60',
            orbA: 'bg-amber-400/30',
            orbB: 'bg-emerald-400/30',
            sparkle: 'text-amber-300',
          };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Utama Pesanan Toko — Tema & Animasi Hero Seragam dengan Dashboard Utama */}
      <div
        className={`dashboard-hero-slow relative isolate overflow-hidden rounded-2xl border p-6 sm:p-7 text-white shadow-xl ${heroTheme.border}`}
      >
        <div
          aria-hidden="true"
          className={`dashboard-hero-orb-a pointer-events-none absolute -left-16 -top-20 -z-10 h-72 w-72 rounded-full blur-3xl ${heroTheme.orbA}`}
        />
        <div
          aria-hidden="true"
          className={`dashboard-hero-orb-b pointer-events-none absolute -bottom-24 right-8 -z-10 h-80 w-80 rounded-full blur-3xl ${heroTheme.orbB}`}
        />
        <div
          aria-hidden="true"
          className="dashboard-hero-grid-drift pointer-events-none absolute inset-0 -z-10 opacity-20"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2.5 max-w-2xl">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight drop-shadow-sm">
              Pesanan Toko ({meta.roleLabel})
            </h1>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              Pantau transaksi secara linier dengan perpindahan uang pembeli: kirim pesanan saat dana aman di Rekber, pantau saat tertahan selama pengiriman, dan terima saldo bersih begitu barang selesai diterima.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`${meta.basePath}/finance`}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-md transition hover:bg-emerald-50"
            >
              <Wallet className="h-4 w-4 text-emerald-700" />
              <span>Keuangan / Saldo ({formatRupiah(summary.availableBalance)})</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
            </Link>
            <button
              type="button"
              onClick={() => {
                resetDemoOrders();
                notify('success', `Data simulasi 3 tahap escrow ${meta.roleLabel} telah direset.`);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-slate-950/40 hover:bg-slate-950/60 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo
            </button>
          </div>
        </div>

        {/* 3 Kunci Transparansi Escrow */}
        <div className="relative z-10 mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-white/25 pt-4 text-xs">
          <div className="rounded-xl border border-white/15 bg-slate-950/45 px-3.5 py-2.5 backdrop-blur-sm">
            <p className="font-extrabold text-amber-300">1. Kapan barang harus dikirim?</p>
            <p className="mt-0.5 text-white/90">
              Segera setelah pesanan muncul di tab <strong>Perlu Dikirim</strong> (pembayaran sudah masuk Rekber).
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-slate-950/45 px-3.5 py-2.5 backdrop-blur-sm">
            <p className="font-extrabold text-sky-300">2. Di mana posisi uang saat ini?</p>
            <p className="mt-0.5 text-white/90">
              Tertahan aman sebesar <strong>{formatRupiah(summary.pendingEscrowBalance)}</strong> di penampungan Rekber platform.
            </p>
          </div>
          <div className="rounded-xl border border-white/15 bg-slate-950/45 px-3.5 py-2.5 backdrop-blur-sm">
            <p className="font-extrabold text-emerald-300">3. Kapan uang bisa dicairkan?</p>
            <p className="mt-0.5 text-white/90">
              Otomatis masuk <strong>Saldo Siap Dicairkan</strong> setelah pembeli konfirmasi atau kurir delivered H+2.
            </p>
          </div>
        </div>
      </div>

      {/* Notifikasi Aksi */}
      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-bold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-rose-300 bg-rose-50 text-rose-900'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Banner opsional hanya jika ada order checkout belum dibayar */}
      {summary.unpaidOrders.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-950">
            <Clock className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Ada <strong>{summary.unpaidOrders.length} pesanan checkout baru</strong> yang masih menunggu pembayaran pembeli sebelum masuk ke tab <strong>Perlu Dikirim</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              markPaid(summary.unpaidOrders[0].id);
              setActiveTab('to_ship');
              notify(
                'success',
                `Pembayaran #${summary.unpaidOrders[0].id} masuk ke Rekber Platform dan siap dikirim!`,
              );
            }}
            className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-[11px] font-bold text-white transition"
          >
            Simulasikan Pembeli Bayar (#{summary.unpaidOrders[0].id})
          </button>
        </div>
      )}

      {/* ── HANYA 3 TAB STATUS UTAMA ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" role="tablist" aria-label="Status Pesanan Toko">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-start rounded-2xl border-2 p-4 text-left transition ${
                isActive
                  ? tab.activeStyle
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">
                  Tahap {idx + 1}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${tab.badgeStyle}`}>
                  {tab.count} Pesanan
                </span>
              </div>
              <p className="mt-1 text-base font-extrabold">{tab.title}</p>
              <p className="mt-0.5 text-[11px] font-semibold opacity-90">{tab.moneyStatus}</p>
              <p className="mt-2 text-xs font-mono font-bold">
                Total: {formatRupiah(tab.amount)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Daftar Pesanan pada Tab Aktif */}
      <div className="space-y-4">
        {tabOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-2">
            <Package className="mx-auto h-10 w-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">
              Belum ada pesanan pada tab &quot;{tabs.find((t) => t.key === activeTab)?.title}&quot;.
            </p>
            <p className="text-xs text-slate-500">
              Pindahkan pesanan dari tahap sebelumnya atau klik &quot;Reset Demo&quot; untuk melihat simulasi transaksi.
            </p>
          </div>
        ) : (
          tabOrders.map((order) => {
            const inputMode = inputModeByOrder[order.id] ?? 'resi';
            const draftCode =
              trackingDrafts[order.id] ??
              (inputMode === 'armada' ? order.pickup_contact ?? '' : order.tracking_number ?? order.service_report_ref ?? '');
            const draftCourier =
              courierDrafts[order.id] ??
              order.courier_name ??
              SHIPPING_CHANNEL_PRESETS[partnerRole][0];
            const draftNote = noteDrafts[order.id] ?? order.shipment_note ?? '';
            const feeSplit = calculatePlatformFee(order.gross_amount);

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4"
              >
                {/* Header Order Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md border px-2.5 py-0.5 font-mono text-xs font-extrabold ${meta.badgeTone}`}
                    >
                      #{order.id}
                    </span>

                    {activeTab === 'to_ship' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-950">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Aman di Rekber Platform
                      </span>
                    )}
                    {activeTab === 'shipping' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-950">
                        <Lock className="h-3.5 w-3.5" />
                        Tertahan / Locked di Rekber
                      </span>
                    )}
                    {activeTab === 'completed' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-950">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Dilepas ke {meta.roleLabel}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      {formatRelativeTime(order.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Nilai Rekber
                      </p>
                      <p className="text-sm font-black text-emerald-700">
                        {formatRupiah(order.gross_amount)}
                      </p>
                    </div>
                    <Link
                      href={`/orders/${encodeURIComponent(order.id)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition"
                    >
                      Cek Sisi Pembeli <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Detail Produk & Alamat Pembeli */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
                  <div className="md:col-span-6 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {isService ? 'Detail Layanan & Kontrak' : 'Komoditas / Produk Dipesan'}
                    </p>
                    {order.order_items.map((item) => (
                      <p key={item.id} className="font-bold text-slate-900">
                        {item.name || `Item #${item.entity_id}`} ×{item.quantity}{' '}
                        <span className="font-semibold text-slate-500">
                          ({formatRupiah(item.subtotal)})
                        </span>
                      </p>
                    ))}
                    <p className="text-[11px] text-slate-500">
                      Metode bayar pembeli: <strong>{order.payment_channel}</strong>
                    </p>
                  </div>

                  <div className="md:col-span-6 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {isService ? 'Klien & Lokasi Pelaksanaan' : 'Penerima & Tujuan Kirim'}
                    </p>
                    {order.shipping_address ? (
                      <>
                        <p className="font-bold text-slate-900">
                          {order.shipping_address.recipient_name} • {order.shipping_address.phone}
                        </p>
                        <p className="text-slate-600 flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>
                            {order.shipping_address.address}, {order.shipping_address.city}{' '}
                            {order.shipping_address.postal_code}
                          </span>
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-500">Mengikuti alamat profil pembeli</p>
                    )}
                  </div>
                </div>

                {/* ── AKSI TAB 1: PERLU DIKIRIM ── */}
                {activeTab === 'to_ship' && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">
                          Siapkan Komoditas &amp; Konfirmasi Pengiriman
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Masukkan nomor resi kurir atau nomor kontak armada pickup untuk memindahkan pesanan ke status <strong>Sedang Dikirim</strong>.
                        </p>
                      </div>

                      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() =>
                            setInputModeByOrder((prev) => ({ ...prev, [order.id]: 'resi' }))
                          }
                          className={`rounded-lg px-2.5 py-1 transition ${
                            inputMode === 'resi'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {isService ? 'Kode Laporan / Resi' : 'Nomor Resi Kurir'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setInputModeByOrder((prev) => ({ ...prev, [order.id]: 'armada' }))
                          }
                          className={`rounded-lg px-2.5 py-1 transition ${
                            inputMode === 'armada'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {isService ? 'Kontak Tim Lapangan' : 'Kontak Armada Pickup'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          {isService ? 'Saluran / Tim Pelaksana' : 'Ekspedisi / Armada'}
                        </label>
                        <select
                          value={draftCourier}
                          onChange={(e) =>
                            setCourierDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-600 focus:outline-none"
                        >
                          {SHIPPING_CHANNEL_PRESETS[partnerRole].map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-500">
                            {inputMode === 'armada'
                              ? 'Nomor Kontak Armada Pickup *'
                              : isService
                                ? 'Nomor Laporan / Resi *'
                                : 'Nomor Resi Kurir *'}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setTrackingDrafts((prev) => ({
                                ...prev,
                                [order.id]: generateTrackingCode(partnerRole, inputMode),
                              }))
                            }
                            className="text-[10px] font-bold text-indigo-700 hover:underline"
                          >
                            Isi Contoh
                          </button>
                        </div>
                        <input
                          type="text"
                          value={draftCode}
                          onChange={(e) =>
                            setTrackingDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))
                          }
                          placeholder={
                            inputMode === 'armada'
                              ? 'Contoh: 0812-8899-4411 (Sopir Budi)'
                              : meta.trackingHint
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Catatan Pengiriman (Opsional)
                        </label>
                        <input
                          type="text"
                          value={draftNote}
                          onChange={(e) =>
                            setNoteDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))
                          }
                          placeholder="Contoh: Kemasan aman / estimasi tiba"
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleConfirmShipment(order)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition ${meta.primaryBtn}`}
                      >
                        <Truck className="h-4 w-4" />
                        {meta.confirmButtonLabel}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── AKSI TAB 2: SEDANG DIKIRIM ── */}
                {activeTab === 'shipping' && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-extrabold text-blue-950 flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>
                          {order.courier_name || order.shipping_courier} —{' '}
                          <code className="rounded bg-white px-2 py-0.5 font-mono font-bold text-blue-900 border border-blue-200">
                            {order.tracking_number || order.service_report_ref || '-'}
                          </code>
                        </span>
                      </p>
                      {order.pickup_contact && (
                        <p className="text-blue-900 flex items-center gap-1.5 font-semibold">
                          <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                          Kontak Armada Pickup: <span className="font-mono">{order.pickup_contact}</span>
                        </p>
                      )}
                      {order.shipment_note && (
                        <p className="text-[11px] text-slate-600">Catatan: {order.shipment_note}</p>
                      )}
                      <p className="text-[11px] text-blue-800">
                        Dana <strong>{formatRupiah(order.gross_amount)}</strong> dikunci platform hingga pembeli menekan &quot;Barang Diterima dengan Aman&quot; atau otomatis selesai <strong>H+2</strong> setelah kurir menyatakan delivered.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link
                        href={`/orders/${encodeURIComponent(order.id)}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-blue-300 bg-white hover:bg-blue-100 px-3 py-2 text-[11px] font-bold text-blue-900 transition"
                      >
                        Pantau Status Resi <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          markCompleted(order.id);
                          setActiveTab('completed');
                          notify(
                            'success',
                            `Pesanan #${order.id} selesai! Dana bersih ${formatRupiah(feeSplit.netAmount)} telah dilepas ke Saldo Siap Dicairkan.`,
                          );
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-[11px] font-extrabold text-white shadow-sm transition"
                      >
                        <PackageCheck className="h-3.5 w-3.5" />
                        Simulasikan: Barang Diterima dengan Aman
                      </button>
                    </div>
                  </div>
                )}

                {/* ── AKSI TAB 3: SELESAI ── */}
                {activeTab === 'completed' && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <PackageCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          Dilepas ke Saldo {meta.roleLabel} • Resi/Bukti:{' '}
                          <code className="font-mono font-bold">
                            {order.tracking_number || order.service_report_ref || '-'}
                          </code>
                        </span>
                      </p>
                      <p className="text-[11px] text-emerald-900">
                        Bruto <strong>{formatRupiah(feeSplit.grossAmount)}</strong> − Biaya Platform 5% (
                        <strong>{formatRupiah(feeSplit.platformFee)}</strong>) ={' '}
                        <strong className="text-emerald-700">
                          {formatRupiah(feeSplit.netAmount)} Bersih
                        </strong>{' '}
                        masuk ke dompet digital {meta.roleLabel}.
                      </p>
                    </div>

                    <Link
                      href={`${meta.basePath}/finance`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition shrink-0"
                    >
                      <Wallet className="h-4 w-4" />
                      Lihat di Keuangan / Saldo
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

