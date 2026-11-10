import { Sidebar } from '@/components/layout/Sidebar';

export default function ServiceProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full gap-3">
      <Sidebar role="service-provider" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
