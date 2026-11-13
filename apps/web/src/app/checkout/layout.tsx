import { Sidebar } from '@/components/layout/Sidebar';

/**
 * Checkout layout — memasang Sidebar navigasi pada halaman Checkout & Pembayaran
 * agar konsisten dengan Dashboard Member / Mitra.
 */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full gap-3">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

