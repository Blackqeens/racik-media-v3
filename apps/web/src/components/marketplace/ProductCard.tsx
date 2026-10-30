'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cart.store';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  vendorName?: string;
}

/**
 * ProductCard — marketplace product listing card.
 * Client Component karena butuh tombol "Tambah ke Keranjang".
 * Ref: marketplace-lifecycle.md
 */
export function ProductCard({ id, name, price, imageUrl, vendorName }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();   // jangan ikuti Link ke detail page
    addItem({ productId: id, name, price, imageUrl, vendorName });
  }

  return (
    <Link href={`/marketplace/${id}`} className="card hover:border-primary-300 transition group block">
      {/* Gambar produk */}
      <div className="bg-gray-100 rounded-lg aspect-square mb-3 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700 line-clamp-2">
        {name}
      </p>
      {vendorName && (
        <p className="text-xs text-gray-400 mt-0.5">{vendorName}</p>
      )}
      <p className="text-sm font-semibold text-primary-600 mt-1">
        Rp {price.toLocaleString('id-ID')}
      </p>

      {/* Tombol tambah ke keranjang */}
      <button
        onClick={handleAddToCart}
        className="mt-3 w-full btn-secondary text-xs py-1.5"
      >
        + Keranjang
      </button>
    </Link>
  );
}
