'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { formatRupiah } from '@/lib/utils';

/**
 * Checkout page — alamat pengiriman, metode pembayaran, ringkasan order.
 * POST ke /orders untuk buat order, lalu redirect ke payment gateway.
 * Ref: marketplace-lifecycle.md §checkout_flow, escrow-lifecycle.md
 */

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Transfer Bank' },
  { value: 'virtual_account', label: 'Virtual Account' },
  { value: 'ewallet', label: 'E-Wallet' },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]['value'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, count, clearCart } = useCart();
  const { session } = useAuth();

  const [recipientName, setRecipientName]   = useState('');
  const [phone, setPhone]                   = useState('');
  const [address, setAddress]               = useState('');
  const [city, setCity]                     = useState('');
  const [postalCode, setPostalCode]         = useState('');
  const [paymentMethod, setPaymentMethod]   = useState<PaymentMethod>('virtual_account');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { router.push('/login?next=/checkout'); return; }
    if (items.length === 0) return;

    setError(null);
    setLoading(true);

    try {
      // Ambil seller_id dari item pertama (single-seller checkout)
      const firstItem = items[0];

      const { data: order } = await apiClient.post<{ id: string; payment_url?: string }>(
        '/orders',
        {
          order_type:     'product_retail',
          gross_amount:   total,
          payment_method: paymentMethod,
          shipping_address: { recipient_name: recipientName, phone, address, city, postal_code: postalCode },
          items: items.map((i) => ({
            entity_type: 'catalog_item',
            entity_id:   i.productId,
            quantity:    i.quantity,
            unit_price:  i.price,
            subtotal:    i.price * i.quantity,
          })),
        },
        { Authorization: `Bearer ${session.access_token}` },
      );

      clearCart();

      // Redirect ke payment gateway jika ada URL, atau ke halaman konfirmasi
      if (order?.payment_url) {
        window.location.href = order.payment_url;
      } else {
        router.push(`/orders/${order?.id ?? ''}`);
      }
    } catch {
      setError('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  // Redirect ke marketplace jika cart kosong
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-4xl">🛒</p>
        <h1 className="text-xl font-bold text-gray-900">Keranjang Kosong</h1>
        <p className="text-sm text-gray-500">Tambahkan produk terlebih dahulu sebelum checkout.</p>
        <Link href="/marketplace" className="btn-primary inline-block">
          Belanja Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* ── Form kiri ──────────────────────────────────────────────── */}
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
          {/* Alamat */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Alamat Pengiriman</h2>
            <input
              required
              type="text"
              placeholder="Nama penerima"
              className="input-base"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
            <input
              required
              type="tel"
              placeholder="Nomor HP (contoh: 08123456789)"
              className="input-base"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <textarea
              required
              rows={3}
              placeholder="Alamat lengkap (nama jalan, nomor, RT/RW)"
              className="input-base"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                type="text"
                placeholder="Kota"
                className="input-base"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <input
                required
                type="text"
                placeholder="Kode Pos"
                className="input-base"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>

          {/* Metode pembayaran */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-gray-900">Metode Pembayaran</h2>
            {PAYMENT_METHODS.map((m) => (
              <label key={m.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment_method"
                  value={m.value}
                  checked={paymentMethod === m.value}
                  onChange={() => setPaymentMethod(m.value)}
                  className="accent-primary-600"
                />
                <span className="text-sm text-gray-700">{m.label}</span>
              </label>
            ))}
          </div>
        </form>
      </div>

      {/* ── Ringkasan kanan ────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">
            Ringkasan Pesanan
            <span className="ml-1 text-xs font-normal text-gray-400">({count} item)</span>
          </h2>

          <div className="space-y-2 text-sm text-gray-600 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span className="truncate pr-2">
                  {item.name} ×{item.quantity}
                </span>
                <span className="shrink-0 font-medium text-gray-800">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-gray-200" />

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Ongkos kirim</span>
            <span className="text-gray-400">Dihitung saat konfirmasi</span>
          </div>

          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>

          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Memproses…' : 'Bayar Sekarang'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Dana masuk ke escrow dan dilepaskan setelah pesanan selesai.
        </p>
      </div>
    </div>
  );
}
