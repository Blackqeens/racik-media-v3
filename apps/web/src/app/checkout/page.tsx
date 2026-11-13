'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRupiah } from '@/lib/utils';
import {
  buildPaymentAccountInfo,
  saveLocalOrder,
  type LocalOrderRecord,
  type OrderPartnerRole,
  type OrderPaymentMethod,
} from '@/lib/orders-store';
import { getManagedDistributorSupplies } from '@/lib/distributor-supply-store';

/**
 * Checkout page — alamat pengiriman, pilihan kurir, metode pembayaran & ringkasan order.
 * Tersambung ke /checkout/payment/[id] (halaman pembayaran Escrow) dan API /orders.
 */

const PAYMENT_METHODS: {
  value: OrderPaymentMethod;
  label: string;
  desc: string;
  channels: string[];
}[] = [
  {
    value: 'bank_transfer',
    label: 'Transfer Bank (Manual / Kliring)',
    desc: 'Transfer langsung ke Rekening Bersama PT Racik Media Nusantara.',
    channels: ['Bank Mandiri Escrow', 'Bank BCA Escrow', 'Bank BRI Escrow'],
  },
  {
    value: 'virtual_account',
    label: 'Virtual Account (Verifikasi Otomatis)',
    desc: 'Pembayaran instan melalui nomor Virtual Account bank pilihan Anda.',
    channels: ['BCA Virtual Account', 'Mandiri Virtual Account', 'BRI Virtual Account', 'BNI Virtual Account'],
  },
  {
    value: 'ewallet',
    label: 'E-Wallet & QRIS Nasional',
    desc: 'Scan QRIS atau bayar cepat via GoPay, OVO, DANA, atau ShopeePay.',
    channels: ['QRIS Racik Media (Semua E-Wallet)', 'GoPay', 'OVO', 'DANA'],
  },
];

const SHIPPING_OPTIONS = [
  {
    id: 'reguler',
    label: 'Kurir Reguler Nusantara (2–4 Hari)',
    cost: 15000,
  },
  {
    id: 'ekspres',
    label: 'Kurir Kargo / Ekspres Agro (1–2 Hari)',
    cost: 28000,
  },
  {
    id: 'pickup',
    label: 'Ambil Sendiri di Toko / Hub Mitra',
    cost: 0,
  },
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, count, clearCart } = useCart();
  const { session } = useAuth();

  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [shippingId, setShippingId] = useState<string>('reguler');
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>('virtual_account');
  const [paymentChannel, setPaymentChannel] = useState<string>('BCA Virtual Account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedShipping =
    SHIPPING_OPTIONS.find((s) => s.id === shippingId) ?? SHIPPING_OPTIONS[0];
  const grandTotal = total + selectedShipping.cost;

  function handleSelectPaymentMethod(method: OrderPaymentMethod) {
    setPaymentMethod(method);
    const meta = PAYMENT_METHODS.find((m) => m.value === method);
    if (meta && meta.channels.length > 0) {
      setPaymentChannel(meta.channels[0]);
    }
  }

  async function handleCheckout(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (items.length === 0) return;

    // Validasi alamat pengiriman agar user mendapat pesan jelas bila ada yang kosong
    if (
      !recipientName.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !postalCode.trim()
    ) {
      setError(
        'Mohon lengkapi seluruh kolom Alamat Pengiriman (Nama penerima, Nomor HP, Alamat lengkap, Kota, dan Kode Pos) sebelum melanjutkan pembayaran.',
      );
      return;
    }

    setError(null);
    setLoading(true);

    const shippingInfo = {
      recipient_name: recipientName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postal_code: postalCode.trim(),
    };

    const paymentInfo = buildPaymentAccountInfo(paymentMethod, paymentChannel);
    const fallbackOrderId = `ORD-RM-${Date.now().toString().slice(-6)}`;
    let createdOrderId = fallbackOrderId;
    let externalPaymentUrl: string | undefined;

    try {
      const canCallLiveOrderApi =
        Boolean(session?.access_token) &&
        items.every((i) => UUID_REGEX.test(i.productId));

      if (canCallLiveOrderApi && session) {
        const { data: order } = await apiClient.post<{ id: string; payment_url?: string }>(
          '/orders',
          {
            seller_id: items[0].productId,
            order_type: 'product_retail',
            gross_amount: grandTotal,
            notes: `Kurir: ${selectedShipping.label} | Metode: ${paymentInfo.payment_channel} | Penerima: ${shippingInfo.recipient_name}`,
            items: items.map((i) => ({
              entity_type: 'catalog_item',
              entity_id: i.productId,
              quantity: i.quantity,
              unit_price: i.price,
            })),
          },
          { Authorization: `Bearer ${session.access_token}` },
        );
        if (order?.id) {
          createdOrderId = order.id;
        }
        externalPaymentUrl = order?.payment_url;
      }
    } catch {
      // Tetap lanjutkan dengan penyimpanan pesanan terintegrasi lokal agar proses pembayaran tidak terputus
    }

    const distributorIds = new Set(getManagedDistributorSupplies().map((d) => d.id));
    const detectedPartnerRole: OrderPartnerRole = items.some((i) =>
      distributorIds.has(i.productId),
    )
      ? 'distributor'
      : 'seller';

    const orderRecord: LocalOrderRecord = {
      id: createdOrderId,
      order_type: detectedPartnerRole === 'distributor' ? 'product_wholesale' : 'product_retail',
      target_partner_role: detectedPartnerRole,
      status: 'pending_payment',
      subtotal_amount: total,
      shipping_cost: selectedShipping.cost,
      gross_amount: grandTotal,
      shipping_courier: selectedShipping.label,
      currency: 'IDR',
      payment_method: paymentMethod,
      payment_channel: paymentInfo.payment_channel,
      payment_account_number: paymentInfo.payment_account_number,
      payment_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      shipping_address: shippingInfo,
      notes: `Kurir: ${selectedShipping.label} • Metode: ${paymentInfo.payment_channel}`,
      created_at: new Date().toISOString(),
      order_items: items.map((i, idx) => ({
        id: `${createdOrderId}-item-${idx + 1}`,
        entity_type: 'catalog_item',
        entity_id: i.productId,
        name: i.name,
        vendor_name: i.vendorName,
        image_url: i.imageUrl,
        quantity: i.quantity,
        unit_price: i.price,
        subtotal: i.price * i.quantity,
      })),
      isLocal: true,
    };

    saveLocalOrder(orderRecord);
    clearCart();
    setLoading(false);

    if (externalPaymentUrl) {
      window.location.href = externalPaymentUrl;
      return;
    }

    router.push(`/checkout/payment/${encodeURIComponent(createdOrderId)}`);
  }

  // Redirect / tampilkan empty state jika keranjang kosong
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Keranjang Belanja Kosong</h1>
        <p className="text-sm text-slate-500">
          Tambahkan produk dari Marketplace atau riwayat pesanan Anda terlebih dahulu sebelum melakukan checkout.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/marketplace" className="btn-primary inline-flex items-center gap-1.5 text-xs">
            Belanja di Marketplace
          </Link>
          <Link
            href="/orders"
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition"
          >
            Lihat Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  const activePaymentMeta =
    PAYMENT_METHODS.find((m) => m.value === paymentMethod) ?? PAYMENT_METHODS[1];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Header Checkout & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Keranjang
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Checkout &amp; Pembayaran Aman (Escrow)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi alamat pengiriman, pilih layanan kurir, dan selesaikan pembayaran melalui Rekening Bersama Racik Media.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Dilindungi Rekening Bersama
        </span>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs sm:text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Form Kiri (8 kolom) ──────────────────────────────────── */}
        <form
          id="checkout-form"
          onSubmit={handleCheckout}
          className="lg:col-span-8 space-y-5"
        >
          {/* Alamat Pengiriman */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="h-4 w-4 text-emerald-600" />
              1. Alamat Pengiriman Tujuan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penerima *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Misal: Budi Santoso"
                  className="input-base"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor HP / WhatsApp *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  className="input-base"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Lengkap (Jalan, Nomor Rumah, RT/RW, Patokan) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Jl. Merdeka No. 10, RT 02 / RW 05, Kec. Coblong..."
                className="input-base"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kota / Kabupaten *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Kota Bandung"
                  className="input-base"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Pos *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: 40132"
                  className="input-base"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pilihan Layanan Pengiriman */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <Truck className="h-4 w-4 text-amber-600" />
              2. Pilihan Pengiriman / Kurir
            </h2>
            <div className="space-y-2">
              {SHIPPING_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
                    shippingId === opt.id
                      ? 'border-emerald-500 bg-emerald-50/60'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="shipping_option"
                      value={opt.id}
                      checked={shippingId === opt.id}
                      onChange={() => setShippingId(opt.id)}
                      className="accent-emerald-600"
                    />
                    {opt.label}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                    {opt.cost === 0 ? 'Gratis' : formatRupiah(opt.cost)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Metode Pembayaran & Pilihan Bank / Wallet */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <CreditCard className="h-4 w-4 text-indigo-600" />
              3. Metode Pembayaran
            </h2>

            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
                    paymentMethod === m.value
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={m.value}
                    checked={paymentMethod === m.value}
                    onChange={() => handleSelectPaymentMethod(m.value)}
                    className="accent-emerald-600 mt-1"
                  />
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-slate-900">
                      {m.label}
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Pilih Bank / Saluran Pembayaran:
              </span>
              <div className="flex flex-wrap gap-2">
                {activePaymentMeta.channels.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setPaymentChannel(ch)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition ${
                      paymentChannel === ch
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* ── Ringkasan Kanan (4 kolom) ────────────────────────────── */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base">
              Ringkasan Pesanan
              <span className="ml-1.5 text-xs font-normal text-slate-400">({count} item)</span>
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 max-h-56 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.quantity} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 font-bold text-slate-900">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-slate-200" />

            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal Produk</span>
                <span className="font-semibold text-slate-800">{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ongkos Kirim</span>
                <span className="font-semibold text-slate-800">
                  {selectedShipping.cost === 0 ? 'Gratis' : formatRupiah(selectedShipping.cost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saluran Bayar</span>
                <span className="font-semibold text-indigo-700 text-right max-w-[160px] truncate">
                  {paymentChannel}
                </span>
              </div>
            </div>

            <hr className="border-slate-200" />

            <div className="flex justify-between items-center text-base font-extrabold text-slate-900">
              <span>Total Bayar</span>
              <span className="text-emerald-700 text-lg">{formatRupiah(grandTotal)}</span>
            </div>

            <button
              type="button"
              onClick={() => handleCheckout()}
              disabled={loading}
              className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2 text-sm font-extrabold shadow-md"
            >
              <Lock className="h-4 w-4" />
              {loading ? 'Membuat Invoice Pembayaran…' : 'Bayar Sekarang'}
            </button>

            <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-3 flex items-start gap-2 text-[11px] text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Dana Anda ditahan dengan aman di <strong>Escrow Rekening Bersama</strong> dan baru diteruskan ke Seller/Distributor setelah pesanan diterima dengan baik.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
