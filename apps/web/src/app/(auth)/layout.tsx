import type { Metadata } from 'next';

/**
 * Auth group layout — centered card layout for auth pages.
 * Metadata di sini karena page.tsx masing-masing adalah 'use client'.
 * Ref: user-lifecycle.md (auth flow)
 */
export const metadata: Metadata = {
  title: {
    default: 'Autentikasi',
    template: '%s | Racik Media',
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-primary-600">Racik Media</span>
        </div>
        {children}
      </div>
    </div>
  );
}
