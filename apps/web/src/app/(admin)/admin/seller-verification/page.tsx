import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Verifikasi Seller' };

/**
 * Seller verification (KYB) panel — admin approves/rejects vendor verifications.
 * Ref: moderation-lifecycle.md §identity_queue, permission-matrix.md (ADMIN)
 */
export default function SellerVerificationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Verifikasi Seller</h1>
      <p className="text-sm text-gray-600">Tinjau pengajuan KYB dan berikan keputusan approve / reject.</p>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Pengajuan Pending</h2>
        <p className="text-sm text-gray-400">Tidak ada pengajuan pending.</p>
      </div>
    </div>
  );
}
