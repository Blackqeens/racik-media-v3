import { Boxes, MapPin, ShoppingBag, Truck } from 'lucide-react';

export default function DistributorDashboardPage() {
  const stats = [
    { label: 'Wilayah Aktif', value: 0, icon: MapPin },
    { label: 'Pasokan Terkelola', value: 0, icon: Boxes },
    { label: 'Pesanan Distribusi', value: 0, icon: ShoppingBag },
    { label: 'Pengiriman Berjalan', value: 0, icon: Truck },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Distributor</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola pasokan, cakupan wilayah, dan distribusi pesanan.</p>
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
          <h2 className="font-semibold text-gray-900">Wilayah Distribusi</h2>
          <p className="text-sm text-gray-400">Belum ada wilayah atau kontrak distribusi yang ditetapkan.</p>
        </div>
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900">Batasan Akses</h2>
          <p className="text-sm text-gray-600">
            Distributor hanya dapat mengelola data di wilayah dan pesanan yang ditugaskan kepadanya.
          </p>
        </div>
      </div>
    </div>
  );
}
