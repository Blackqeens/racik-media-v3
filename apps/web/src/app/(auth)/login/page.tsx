import { Suspense } from 'react';
import { AuthUnifiedView } from '@/components/auth/AuthUnifiedView';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[550px] w-full animate-pulse rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm" />
      }
    >
      <AuthUnifiedView initialMode="login" />
    </Suspense>
  );
}
