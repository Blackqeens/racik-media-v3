import type { Metadata } from 'next';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Kebijakan & Ketentuan Layanan',
  description: 'Kebijakan Privasi, Syarat & Ketentuan Layanan Escrow Rekening Bersama Racik Media',
};

export default function KebijakanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full gap-3">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

