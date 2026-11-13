import type { Metadata } from 'next';
import { AdminAdministrationCenter } from '@/components/admin/AdminAdministrationCenter';

export const metadata: Metadata = {
  title: 'Pengajuan Member → Seller/Distributor & Legalitas (Role Admin)',
};

export default function SellerVerificationPage() {
  return <AdminAdministrationCenter initialTab="upgrades" />;
}
