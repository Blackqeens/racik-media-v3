'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  MapPin,
  Package,
  QrCode,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import {
  getLocalOrderById,
  markLocalOrderPaid,
  type LocalOrderRecord,
} from '@/lib/orders-store';

export default function CheckoutPaymentPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id ? decodeURIComponent(params.id) : '';

  const [order, setOrder] = useState<LocalOrderRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'account' | 'amount' | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoaded(true);
      return;
    }
    const found = getLocalOrderById(orderId);
    setOrder(found);
    setLoaded(true);

    const sync = () => {
      setOrder(getLocalOrderById(orderId));
    };
    window.addEventListener('racik-member-orders-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('racik-member-orders-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, [orderId]);

  function handleCopy(text: string, which: 'account' | 'amount') {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(which);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleConfirmPayment() {
    if (!order) return;
    setConfirming(true);
    setTimeout(() => {
      const updated = markLocalOrderPaid(order.id);
      if (updated) {
        setOrder(updated);
      }
      setConfirming(false);
    }, 450);
  }

  if (!loaded) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 space-y-4 animate-pulse">
        <div className="h-8 w-1/3 rounded bg-slate-200" />
        <div className="h-52 w-full rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
          <CreditCard className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Invoice Pembayaran Tidak Ditemukan</h1>
        <p className="text-sm text-slate-500">
          Nomor pesanan <code>{orderId}</code> tidak tersedia atau sudah kedaluwarsa.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/orders" className="btn-primary text-xs">
            Lihat Daftar Pesanan Saya
          </Link>
          <Link
            href="/marketplace"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
          >
            Kembali ke Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isPaid =
    order.status === 'escrow_held' ||
    order.status === 'in_fulfillment' ||
    order.status === 'completed';

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Lihat Semua Riwayat Pesanan
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Pembayaran Pesanan #{order.id}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Saluran Pembayaran: <strong>{order.payment_channel}</strong> • Dilindungi Rekening Bersama Escrow
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold border ${
            isPaid
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-amber-100 text-amber-950 border-amber-300'
          }`}
        >
          {isPaid ? (
            <>
              <BadgeCheck className="h-4 w-4 text-emerald-700" />
              Lunas • Dana Aman di Escrow
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-amber-700" />
              Menunggu Pembayaran
            </>
          )}
        </span>
      </div>

      {/* Banner Hasil Pembayaran */}
      {isPaid ? (
        <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-emerald-950">
                Pembayaran Berhasil Diverifikasi &amp; Dana Masuk ke Rekening Bersama (Escrow)!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
                Pesanan Anda senilai <strong>{formatRupiah(order.gross_amount)}</strong> telah diteruskan ke mitra Seller/Distributor untuk dikemas dan dikirim melalui <strong>{order.shipping_courier}</strong>. Dana akan ditahan aman sampai Anda mengonfirmasi barang tiba dengan baik.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={`/orders/${encodeURIComponent(order.id)}`}
              className="btn-primary inline-flex items-center gap-1.5 text-xs font-extrabold"
            >
              <Truck className="h-4 w-4" />
              Lacak &amp; Kelola Pesanan Ini
            </Link>
            <Link
              href="/orders"
              className="rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 transition"
            >
              Buka Riwayat Pesanan Saya
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition"
            >
              Kembali ke Dashboard Member
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kartu Instruksi Pembayaran Kiri */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Metode Pembayaran Terpilih
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {order.payment_channel}
                  </h2>
                </div>
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>

              {/* Nomor VA / Rekening / QRIS */}
              <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    {order.payment_method === 'ewallet'
                      ? 'Kode Referensi QRIS / E-Wallet'
                      : order.payment_method === 'bank_transfer'
                        ? 'Nomor Rekening Escrow Tujuan'
                        : 'Nomor Virtual Account'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.payment_account_number, 'account')}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[11px] font-bold text-white transition"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedKey === 'account' ? 'Tersalin!' : 'Salin Nomor'}
                  </button>
                </div>

                <p className="font-mono text-xl sm:text-2xl font-black tracking-wider text-amber-300">
                  {order.payment_account_number}
                </p>

                {order.payment_method === 'ewallet' && (
                  <div className="mt-3 flex items-center gap-4 rounded-xl bg-white p-3 text-slate-900">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-50">
                      <QrCode className="h-14 w-14 text-slate-900" />
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-extrabold text-slate-900">
                        Scan QRIS Racik Media Nusantara
                      </p>
                      <p className="text-slate-600">
                        Mendukung GoPay, OVO, DANA, ShopeePay, dan Mobile Banking seluruh Indonesia.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-white/15 pt-3 text-xs">
                  <span className="text-slate-300">Total Tagihan Persis</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-emerald-300">
                      {formatRupiah(order.gross_amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(String(order.gross_amount), 'amount')}
                      className="rounded-md bg-white/15 hover:bg-white/25 px-2 py-0.5 text-[10px] font-bold"
                    >
                      {copiedKey === 'amount' ? 'Tersalin!' : 'Salin'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-950 space-y-1.5">
                <p className="font-extrabold">Langkah Penyelesaian Pembayaran:</p>
                <ol className="list-decimal pl-4 space-y-1 text-amber-900">
                  <li>Salin nomor pembayaran dan lakukan transfer sesuai total tagihan di atas.</li>
                  <li>
                    Setelah mentransfer atau memindai QRIS, klik tombol hijau{' '}
                    <strong>&ldquo;Konfirmasi &amp; Selesaikan Pembayaran&rdquo;</strong> di bawah ini agar pesanan langsung masuk ke tahap proses penjual &amp; Escrow.
                  </li>
                </ol>
              </div>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 px-5 text-sm font-extrabold text-white shadow-lg transition inline-flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                {confirming
                  ? 'Memverifikasi Pembayaran ke Escrow…'
                  : 'Konfirmasi & Selesaikan Pembayaran Sekarang'}
              </button>
            </div>
          </div>

          {/* Ringkasan Pesanan & Alamat Kanan */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                Rincian Item &amp; Pengiriman
              </h3>

              <div className="space-y-2.5 text-xs">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span className="text-slate-700 font-semibold">
                      {item.name || `Produk #${item.entity_id.slice(0, 8)}`} ×{item.quantity}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal Barang</span>
                  <span>{formatRupiah(order.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ongkos Kirim ({order.shipping_courier})</span>
                  <span>
                    {order.shipping_cost === 0 ? 'Gratis' : formatRupiah(order.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1">
                  <span>Total Pembayaran</span>
                  <span className="text-emerald-700">{formatRupiah(order.gross_amount)}</span>
                </div>
              </div>

              {order.shipping_address && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    Tujuan Pengiriman
                  </p>
                  <p className="font-semibold text-slate-800">
                    {order.shipping_address.recipient_name} ({order.shipping_address.phone})
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {order.shipping_address.address}, {order.shipping_address.city}{' '}
                    {order.shipping_address.postal_code}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

