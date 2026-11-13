'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Layers,
  MapPin,
  PackageCheck,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { formatRelativeTime, formatRupiah } from '@/lib/utils';
import {
  useLocalOrders,
  type LocalOrderRecord,
  type OrderPartnerRole,
} from '@/lib/orders-store';

interface PartnerTransactionManagerProps {
  partnerRole: OrderPartnerRole;
}

const COURIER_PRESETS: Record<OrderPartnerRole, string[]> = {
  seller: [
    'JNE Express Reguler',
    'SiCepat Kargo Pertanian',
    'J&T Express',
    'Pos Indonesia Kargo',
    'Kurir Reguler Nusantara',
  ],
  distributor: [
    'Armada CDD Box Internal Distributor',
    'Truk Cold Box Regional Nusantara',
    'Pickup Blind Van Hub Wilayah',
    'Kargo Logistik Antarprovinsi',
  ],
  service_provider: [
    'Tahap 1: Penjadwalan & Uji Sampel Awal (30%)',
    'Tahap 2: Pelaksanaan Lapangan / Analisis Lab (70%)',
    'Tahap 3: Penyerahan Laporan Final & Dokumentasi (100%)',
  ],
};

function generateSampleResi(role: OrderPartnerRole, orderId: string): string {
  const rand = Math.floor(100000 + Math.random() * 899999);
  if (role === 'distributor') return `SJ-DIST-${rand}`;
  if (role === 'service_provider') return `BA-SRV-${rand}`;
  const suffix = orderId.slice(-3).replace(/[^A-Z0-9]/gi, '7');
  return `RM-RESI-${suffix}${rand}`;
}

export function PartnerTransactionManager({ partnerRole }: PartnerTransactionManagerProps) {
  const {
    orders,
    markPaid,
    updateTracking,
    updateServiceProgress,
    markCompleted,
    resetDemoOrders,
  } = useLocalOrders();

  const [resiDrafts, setResiDrafts] = useState<Record<string, string>>({});
  const [courierDrafts, setCourierDrafts] = useState<Record<string, string>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const roleOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (ord.target_partner_role) {
        return ord.target_partner_role === partnerRole;
      }
      // Order baru dari Checkout tanpa label spesifik masuk ke Seller secara default
      return partnerRole === 'seller';
    });
  }, [orders, partnerRole]);

  const counts = useMemo(() => {
    return {
      escrowHeld: roleOrders.filter((o) => o.status === 'escrow_held').length,
      inFulfillment: roleOrders.filter((o) => o.status === 'in_fulfillment').length,
      completed: roleOrders.filter((o) => o.status === 'completed').length,
    };
  }, [roleOrders]);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg((prev) => (prev === msg ? null : prev));
    }, 5000);
  };

  const isService = partnerRole === 'service_provider';
  const roleLabel =
    partnerRole === 'seller'
      ? 'Seller'
      : partnerRole === 'distributor'
        ? 'Distributor'
        : 'Penyedia Jasa';

  const accentBadgeClass =
    partnerRole === 'seller'
      ? 'bg-amber-50 border-amber-200 text-amber-900'
      : partnerRole === 'distributor'
        ? 'bg-cyan-50 border-cyan-200 text-cyan-900'
        : 'bg-sky-50 border-sky-200 text-sky-900';

  const accentButtonClass =
    partnerRole === 'seller'
      ? 'bg-amber-600 hover:bg-amber-700'
      : partnerRole === 'distributor'
        ? 'bg-cyan-600 hover:bg-cyan-700'
        : 'bg-sky-600 hover:bg-sky-700';

  function handleSubmitTrackingOrMilestone(order: LocalOrderRecord) {
    if (isService) {
      const milestoneVal =
        courierDrafts[order.id] ??
        order.milestone_progress ??
        COURIER_PRESETS.service_provider[1];
      const reportCode =
        (resiDrafts[order.id] ?? order.service_report_ref ?? '').trim() ||
        generateSampleResi('service_provider', order.id);

      updateServiceProgress(order.id, {
        milestone_progress: milestoneVal,
        service_report_ref: reportCode,
        shipment_note: noteDrafts[order.id] ?? order.shipment_note,
      });
      showFeedback(
        `Progres & Kode Laporan "${reportCode}" untuk ${order.id} tersimpan! Klien dapat langsung melihatnya di /orders/${order.id}.`,
      );
      return;
    }

    const resiVal = (resiDrafts[order.id] ?? order.tracking_number ?? '').trim();
    if (!resiVal) {
      showFeedback('Mohon isi Nomor Resi pengiriman terlebih dahulu (atau klik "Buat Resi Otomatis").');
      return;
    }
    const courierVal =
      courierDrafts[order.id] ??
      order.courier_name ??
      COURIER_PRESETS[partnerRole][0];

    updateTracking(order.id, {
      tracking_number: resiVal,
      courier_name: courierVal,
      shipment_note: noteDrafts[order.id] ?? order.shipment_note,
    });
    showFeedback(
      `Nomor Resi "${resiVal}" (${courierVal}) berhasil dikirim untuk pesanan #${order.id} dan otomatis tampil di halaman Pembeli!`,
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>
              {isService
                ? 'Proses Transaksi & Kontrak Milestone Penyedia Jasa (3 Demo + Order Aktif)'
                : `Pesanan Masuk, Input Nomor Resi & 3 Demo Proses Transaksi (${roleLabel})`}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isService
              ? 'Uji siklus kontrak jasa: (1) Dibayar ke Escrow → (2) Input Laporan & Update Tahap Milestone → (3) Selesai & Pencairan Escrow.'
              : `Kelola pesanan pembeli & uji alur lengkap: (1) Dana Masuk Escrow → (2) Input Nomor Resi & Kurir ${roleLabel} → (3) Pembeli Konfirmasi Terima & Escrow Cair.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-900">
            Siap Proses: {counts.escrowHeld}
          </span>
          <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-900">
            Dikirim/Berjalan: {counts.inFulfillment}
          </span>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
            Selesai: {counts.completed}
          </span>
          <button
            type="button"
            onClick={() => {
              resetDemoOrders();
              showFeedback(`3 demo proses transaksi ${roleLabel} berhasil direset ke kondisi awal.`);
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition"
            title="Reset ulang skenario 3 demo transaksi"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset 3 Demo
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="space-y-4">
        {roleOrders.map((order) => {
          const currentResi = resiDrafts[order.id] ?? order.tracking_number ?? order.service_report_ref ?? '';
          const currentCourier =
            courierDrafts[order.id] ??
            (isService
              ? order.milestone_progress || COURIER_PRESETS.service_provider[0]
              : order.courier_name || COURIER_PRESETS[partnerRole][0]);
          const currentNote = noteDrafts[order.id] ?? order.shipment_note ?? '';

          const statusBadge =
            order.status === 'completed'
              ? {
                  label: 'Selesai • Dana Escrow Cair',
                  cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                }
              : order.status === 'in_fulfillment'
                ? {
                    label: isService
                      ? 'Progres Berjalan • Laporan Terkirim'
                      : 'Dalam Pengiriman • Nomor Resi Aktif',
                    cls: 'bg-blue-100 text-blue-800 border-blue-300',
                  }
                : order.status === 'escrow_held'
                  ? {
                      label: isService
                        ? 'Escrow Aman • Menunggu Update Progres'
                        : 'Dibayar ke Escrow • Menunggu Nomor Resi',
                      cls: 'bg-amber-100 text-amber-900 border-amber-300',
                    }
                  : {
                      label: 'Menunggu Pembayaran Pembeli',
                      cls: 'bg-slate-100 text-slate-700 border-slate-300',
                    };

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 hover:border-slate-300 transition"
            >
              {/* Baris Header Transaksi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md border px-2.5 py-0.5 text-[11px] font-mono font-extrabold ${accentBadgeClass}`}
                  >
                    #{order.id}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${statusBadge.cls}`}
                  >
                    {statusBadge.label}
                  </span>
                  {order.isDemoScenario ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                      <Sparkles className="h-3 w-3" /> Demo Transaksi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      <BadgeCheck className="h-3 w-3" /> Order Checkout Pembeli
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {formatRelativeTime(order.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-emerald-700">
                    Escrow: {formatRupiah(order.gross_amount)}
                  </span>
                  <Link
                    href={`/orders/${encodeURIComponent(order.id)}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition"
                    title="Lihat bagaimana status & nomor resi tampil di sisi Pembeli (Member)"
                  >
                    Cek Sisi Pembeli <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Detail Barang & Tujuan Pembeli */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-xl bg-white border border-slate-200 p-3 text-xs">
                <div className="md:col-span-6 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {isService ? 'Layanan & Tahap Milestone' : 'Item Pesanan'}
                  </span>
                  {order.order_items.map((item) => (
                    <p key={item.id} className="font-bold text-slate-900">
                      {item.name || `Item #${item.entity_id}`} ×{item.quantity}{' '}
                      <span className="font-normal text-slate-500">
                        ({formatRupiah(item.subtotal)})
                      </span>
                    </p>
                  ))}
                  {order.notes && (
                    <p className="text-[11px] text-slate-500">{order.notes}</p>
                  )}
                </div>

                <div className="md:col-span-6 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {isService ? 'Klien & Lokasi Pelaksanaan' : 'Pembeli & Alamat Tujuan'}
                  </span>
                  {order.shipping_address ? (
                    <>
                      <p className="font-bold text-slate-900">
                        {order.shipping_address.recipient_name} ({order.shipping_address.phone})
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

              {/* Form Input Nomor Resi (Seller / Distributor) atau Progres Milestone (Penyedia Jasa) */}
              {order.status === 'pending_payment' ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-amber-900 flex items-center gap-1.5 font-semibold">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Pesanan ini menunggu pembayaran dari pembeli sebelum resi dapat diinput.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      markPaid(order.id);
                      showFeedback(`Pembayaran #${order.id} disimulasikan LUNAS masuk ke Escrow!`);
                    }}
                    className="rounded-lg bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-[11px] font-bold text-white transition"
                  >
                    Simulasikan Pembeli Sudah Bayar
                  </button>
                </div>
              ) : order.status === 'completed' ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <PackageCheck className="h-4 w-4 text-emerald-600" />
                      {isService
                        ? `Selesai • Kode Laporan: ${order.service_report_ref || order.tracking_number || '-'}`
                        : `Terkirim & Diterima • Nomor Resi: ${order.tracking_number || '-'} (${order.courier_name || order.shipping_courier})`}
                    </p>
                    {order.shipment_note && (
                      <p className="text-[11px] text-emerald-800">Catatan: {order.shipment_note}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-extrabold text-white">
                    <ShieldCheck className="h-3.5 w-3.5" /> Dana Escrow Cair ke {roleLabel}
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      {isService ? (
                        <>
                          <Layers className="h-4 w-4 text-sky-600" />
                          Update Progres Milestone &amp; Nomor Berita Acara Jasa
                        </>
                      ) : (
                        <>
                          <Truck className="h-4 w-4 text-emerald-600" />
                          Opsi Input Nomor Resi Pengiriman ({roleLabel})
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const autoCode = generateSampleResi(partnerRole, order.id);
                        setResiDrafts((prev) => ({ ...prev, [order.id]: autoCode }));
                      }}
                      className="rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-800 transition"
                    >
                      {isService ? 'Buat Kode Laporan Otomatis' : 'Buat Nomor Resi Otomatis'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 text-xs">
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        {isService ? 'Tahap Milestone Jasa' : 'Ekspedisi / Armada Kurir'}
                      </label>
                      <select
                        value={currentCourier}
                        onChange={(e) =>
                          setCourierDrafts((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      >
                        {COURIER_PRESETS[partnerRole].map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        {isService ? 'Nomor Berita Acara / Laporan *' : 'Nomor Resi / Surat Jalan *'}
                      </label>
                      <input
                        type="text"
                        value={currentResi}
                        onChange={(e) =>
                          setResiDrafts((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        placeholder={
                          isService
                            ? 'Contoh: BA-SRV-2026-0912'
                            : partnerRole === 'distributor'
                              ? 'Contoh: SJ-ARMADA-2026-4412'
                              : 'Contoh: RM-JNE-882910441'
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        {isService ? 'Catatan Hasil Pengerjaan' : 'Catatan Pengiriman'}
                      </label>
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) =>
                          setNoteDrafts((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
                        placeholder={
                          isService
                            ? 'Ringkasan progres untuk klien...'
                            : 'Info kemasan / estimasi tiba...'
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {order.tracking_number ? (
                      <p className="text-[11px] font-semibold text-blue-800">
                        Tersimpan saat ini: <code className="font-mono font-bold">{order.tracking_number}</code>{' '}
                        ({order.courier_name})
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        Belum ada {isService ? 'kode laporan' : 'nomor resi'} yang dikirim ke pembeli.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {order.status === 'in_fulfillment' && (
                        <button
                          type="button"
                          onClick={() => {
                            markCompleted(order.id);
                            showFeedback(
                              `Pesanan #${order.id} disimulasikan selesai & diterima pembeli — Dana Escrow cair!`,
                            );
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800 transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Simulasikan Pembeli Konfirmasi Selesai
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSubmitTrackingOrMilestone(order)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition ${accentButtonClass}`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        {isService
                          ? 'Simpan & Kirim Progres Jasa'
                          : order.tracking_number
                            ? 'Perbarui Nomor Resi'
                            : 'Kirim Nomor Resi ke Pembeli'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

