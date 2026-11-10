import { Sidebar } from '@/components/layout/Sidebar';

/**
 * Seller group layout — SELLER role required.
 * Ref: permission-matrix.md (SELLER role), vendor-architecture.md
 */
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full gap-3">
      <Sidebar role="seller" />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
