import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Laporan Keuangan' };

/**
 * Financial report page — escrow & payment audit overview.
 * Ref: audit-strategy.md §financial_audit, permission-matrix.md (ADMIN)
 */
export default function FinancialReportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Escrow Aktif (Rp)', value: '—' },
          { label: 'Total Dilepas Bulan Ini (Rp)', value: '—' },
          { label: 'Fee Platform (Rp)', value: '—' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-xl font-bold text-primary-600">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Log Audit Keuangan</h2>
        <p className="text-sm text-gray-400">Belum ada log.</p>
      </div>
    </div>
  );
}
