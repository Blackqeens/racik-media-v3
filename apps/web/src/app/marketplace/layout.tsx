import { Sidebar } from '@/components/layout/Sidebar';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full gap-3">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
