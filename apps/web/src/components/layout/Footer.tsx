import Link from 'next/link';

/**
 * Footer — global site footer.
 */
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600">
        <div className="col-span-2 md:col-span-1">
          <p className="font-bold text-primary-600 text-base mb-2">Racik Media</p>
          <p className="text-gray-400 text-xs">Platform media & marketplace kreatif nusantara.</p>
        </div>
        <div>
          <p className="font-medium text-gray-900 mb-2">Jelajahi</p>
          <ul className="space-y-1">
            <li><Link href="/marketplace" className="hover:text-primary-600">Marketplace</Link></li>
            <li><Link href="/services" className="hover:text-primary-600">Layanan</Link></li>
            <li><Link href="/articles" className="hover:text-primary-600">Artikel</Link></li>
            <li><Link href="/events" className="hover:text-primary-600">Event</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-gray-900 mb-2">Akun</p>
          <ul className="space-y-1">
            <li><Link href="/login" className="hover:text-primary-600">Masuk</Link></li>
            <li><Link href="/register" className="hover:text-primary-600">Daftar</Link></li>
            <li><Link href="/seller/register" className="hover:text-primary-600">Jadi Seller</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-gray-900 mb-2">Perusahaan</p>
          <ul className="space-y-1">
            <li><Link href="/cerita-kami" className="hover:text-primary-600">Cerita Kami</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 text-center py-3 text-xs text-gray-400">
        © {new Date().getFullYear()} Racik Media. Hak cipta dilindungi.
      </div>
    </footer>
  );
}
