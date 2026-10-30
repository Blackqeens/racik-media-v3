import Link from 'next/link';

/**
 * Homepage — landing page Racik Media V3
 */
export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Selamat Datang di <span className="text-primary-500">Racik Media</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Platform media produk & layanan kreatif nusantara — temukan artikel, produk, dan jasa terbaik.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/marketplace" className="btn-primary">Jelajahi Marketplace</Link>
          <Link href="/articles" className="btn-secondary">Baca Artikel</Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Marketplace', desc: 'Temukan produk-produk unggulan dari vendor terverifikasi.', href: '/marketplace' },
          { title: 'Layanan', desc: 'Jasa kreatif dari para profesional berpengalaman.', href: '/services' },
          { title: 'Artikel', desc: 'Konten berkualitas seputar industri media & kreatif.', href: '/articles' },
        ].map((f) => (
          <Link key={f.title} href={f.href} className="card hover:border-primary-300 transition-colors group">
            <h2 className="font-semibold text-gray-900 group-hover:text-primary-600 mb-1">{f.title}</h2>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
