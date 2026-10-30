import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * cart.store.ts — Zustand cart store dengan localStorage persistence.
 *
 * State tidak hilang saat user navigasi antar halaman atau refresh.
 * Key localStorage: 'racik-cart' (versi: 1).
 *
 * Ref: marketplace-lifecycle.md §checkout_flow
 */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  vendorName?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];

  /** Tambah item. Jika sudah ada, increment quantity. */
  addItem: (item: Omit<CartItem, 'quantity'>) => void;

  /** Hapus satu item dari cart. */
  removeItem: (productId: string) => void;

  /** Set quantity item secara langsung. Jika <= 0, item dihapus. */
  updateQuantity: (productId: string, quantity: number) => void;

  /** Kosongkan seluruh cart (setelah checkout berhasil). */
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem(item) {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity(productId, quantity) {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== productId),
          }));
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart() {
        set({ items: [] });
      },
    }),
    {
      name: 'racik-cart',   // key di localStorage
      version: 1,
    },
  ),
);

// ─── Computed selectors (pakai di luar hook untuk efisiensi) ──────────────────

/** Total harga semua item di cart (Rupiah). */
export function selectCartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/** Total jumlah item (sum quantity semua baris). */
export function selectCartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}
