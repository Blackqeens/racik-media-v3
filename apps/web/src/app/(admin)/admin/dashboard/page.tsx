import Link from 'next/link';
import { ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';

const adminTasks = [
  {
    title: 'Verifikasi seller',
    description: 'Tinjau dokumen dan status pendaftaran penjual.',
    href: '/admin/seller-verification',
    icon: ShieldCheck,
  },
  {
    title: 'Pemantauan keuangan',
    description: 'Pantau transaksi, escrow, dan catatan keuangan.',
    href: '/admin/financial-report',
    icon: CreditCard,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrasi Platform</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fokus Admin adalah administrasi operasional seperti verifikasi seller dan pemantauan
          keuangan. Keputusan moderasi konten ditangani Moderator.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {adminTasks.map((task) => {
          const Icon = task.icon;
          return (
            <Link
              key={task.href}
              href={task.href}
              className="card flex items-start gap-4 transition hover:border-primary-300 hover:shadow-md"
            >
              <span className="rounded-lg bg-primary-50 p-2 text-primary-700">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 font-semibold text-gray-900">
                  {task.title}
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                </span>
                <span className="mt-1 block text-sm text-gray-500">{task.description}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Perhitungan atau analisis keuangan mendalam menjadi tanggung jawab Master Admin, bukan
        bagian dari tugas rutin Admin.
      </p>
    </div>
  );
}
