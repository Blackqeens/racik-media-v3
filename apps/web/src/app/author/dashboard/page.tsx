import Link from 'next/link';
import { FileText, PenLine, Bookmark, Eye } from 'lucide-react';

export default function AuthorDashboardPage() {
  const stats = [
    { label: 'Artikel Diterbitkan', value: 0, icon: FileText },
    { label: 'Draf Artikel', value: 0, icon: PenLine },
    { label: 'Artikel Disimpan', value: 0, icon: Bookmark },
    { label: 'Total Pembaca', value: 0, icon: Eye },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Author</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola draf, artikel, dan performa tulisan.</p>
        </div>
        <Link href="/articles/write" className="btn-primary inline-flex items-center gap-2 text-xs">
          <PenLine className="h-4 w-4" />
          Tulis Artikel
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs">{item.label}</span>
                <Icon className="h-4 w-4 text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">Aktivitas Terbaru</h2>
          <p className="text-sm text-gray-400">Belum ada artikel atau draf yang tersimpan.</p>
        </div>
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">Alur Publikasi</h2>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>1. Buat dan simpan draf.</li>
            <li>2. Kirim artikel untuk review.</li>
            <li>3. Moderator meninjau konten.</li>
            <li>4. Artikel diterbitkan jika disetujui.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
