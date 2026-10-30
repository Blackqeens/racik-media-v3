'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

/**
 * Cart page — review items before checkout.
 * Ref: marketplace-lifecycle.md §checkout_flow
 */
export default function CartPage() {
  const { items, total, count, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
        <div className="card text-center py-12 space-y-3">
          <p className="text-4xl">🛒</p>
          <p className="text-gray-500 text-sm">Keranjang Anda kosong.</p>
          <Link href="/marketplace" className="btn-primary inline-block text-sm">
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Keranjang Belanja
        <span className="ml-2 text-sm font-normal text-gray-400">
          ({count} item)
        </span>
      </h1>

      {/* Daftar item */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.productId} className="card flex items-center gap-4">
            {/* Thumbnail */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No img
                </div>
              )}
            </div>

            {/* Info produk */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              {item.vendorName && (
                <p className="text-xs text-gray-400">{item.vendorName}</p>
              )}
              <p className="text-sm font-semibold text-primary-600 mt-0.5">
                Rp {item.price.toLocaleString('id-ID')}
              </p>
            </div>

            {/* Quantity control */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-bold flex items-center justify-center"
                aria-label="Kurangi"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-bold flex items-center justify-center"
                aria-label="Tambah"
              >
                +
              </button>
            </div>

            {/* Subtotal */}
            <p className="text-sm font-semibold text-gray-700 w-28 text-right shrink-0">
              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
            </p>

            {/* Hapus */}
            <button
              onClick={() => removeItem(item.productId)}
              className="text-gray-300 hover:text-red-500 transition shrink-0 text-lg leading-none"
              aria-label="Hapus item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Ringkasan total */}
      <div className="card space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({count} item)</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Ongkos kirim</span>
          <span>Dihitung saat checkout</span>
        </div>
        <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Link href="/marketplace" className="btn-secondary text-sm">
          ← Lanjutkan Belanja
        </Link>
        <Link href="/checkout" className="btn-primary text-sm">
          Checkout →
        </Link>
      </div>
    </div>
  );
}
