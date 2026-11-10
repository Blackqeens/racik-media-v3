import { Sidebar } from '@/components/layout/Sidebar';

/**
 * Dashboard group layout — requires auth, shows sidebar navigation.
 * Ref: permission-matrix.md (MEMBER role required)
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full gap-3">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
