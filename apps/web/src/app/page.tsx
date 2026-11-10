import { HomePageView } from '@/components/home/HomePageView';

/**
 * Root Page ('/') — Halaman Utama Racik Media.
 *
 * Seluruh tampilan, state, dan komponen beranda dikelola di file:
 * -> @/components/home/HomePageView.tsx
 *
 * File ini berfungsi sebagai entry-point resmi Next.js App Router agar
 * route URL tetap 'http://localhost:3000/' tanpa mengubah struktur routing.
 */
export default function Page() {
  return <HomePageView />;
}
