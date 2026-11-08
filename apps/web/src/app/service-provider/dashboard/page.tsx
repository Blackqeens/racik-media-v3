import { BriefcaseBusiness, ClipboardCheck, CircleDollarSign, Star } from 'lucide-react';

export default function ServiceProviderDashboardPage() {
  const stats = [
    { label: 'Layanan Aktif', value: 0, icon: BriefcaseBusiness },
    { label: 'Permintaan Masuk', value: 0, icon: ClipboardCheck },
    { label: 'Pekerjaan Berjalan', value: 0, icon: CircleDollarSign },
    { label: 'Rating Layanan', value: 'Belum ada', icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Penyedia Jasa</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola layanan, permintaan, pekerjaan, dan status penyelesaian.</p>
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
              <p className={typeof item.value === 'number' ? 'text-2xl font-bold text-gray-900' : 'text-sm font-bold text-gray-900'}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">Permintaan Terbaru</h2>
          <p className="text-sm text-gray-400">Belum ada permintaan layanan yang masuk.</p>
        </div>
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">Batasan Akses</h2>
          <p className="text-sm text-gray-600">
            Penyedia jasa hanya dapat mengelola layanan, permintaan, dan pekerjaan miliknya sendiri.
          </p>
        </div>
      </div>
    </div>
  );
}
