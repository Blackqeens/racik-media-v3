import { Sidebar } from '@/components/layout/Sidebar';

/**
 * Admin group layout — ADMIN / MODERATOR role required.
 * Ref: permission-matrix.md, moderation-lifecycle.md
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 flex gap-3">
      <Sidebar role="admin" />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
