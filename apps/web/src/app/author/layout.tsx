import { Sidebar } from '@/components/layout/Sidebar';

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-3 px-4 py-4">
      <Sidebar role="author" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
