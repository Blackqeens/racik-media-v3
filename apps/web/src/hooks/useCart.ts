'use client';

import {
  useCartStore,
  selectCartTotal,
  selectCartCount,
} from '@/stores/cart.store';

/**
 * useCart — thin wrapper atas cart.store (Zustand + localStorage).
 *
 * API identik dengan versi useState sebelumnya — komponen yang sudah
 * ada tidak perlu diubah. Cart sekarang persisten antar navigasi halaman.
 *
 * Ref: marketplace-lifecycle.md §checkout_flow
 */
export function useCart() {
  const items        = useCartStore((s) => s.items);
  const addItem      = useCartStore((s) => s.addItem);
  const removeItem   = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart    = useCartStore((s) => s.clearCart);

  const total = selectCartTotal(items);
  const count = selectCartCount(items);

  return { items, total, count, addItem, removeItem, updateQuantity, clearCart };
}
