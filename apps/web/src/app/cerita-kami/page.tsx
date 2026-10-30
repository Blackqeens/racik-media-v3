import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cerita Kami' };

/**
 * About page — company story & mission.
 * Ref: system-overview.md
 */
export default function CeritaKamiPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Cerita Kami</h1>
        <p className="text-gray-600 leading-relaxed">
          Racik Media lahir dari semangat untuk membangun ekosistem media, produk, dan layanan kreatif yang transparan,
          adil, dan berdaya bagi seluruh pelaku industri nusantara.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Misi Kami</h2>
        <p className="text-gray-600 leading-relaxed">
          Menyediakan platform terpercaya di mana pembuat konten, penjual produk, dan penyedia jasa kreatif dapat
          terhubung langsung dengan audiens yang tepat, didukung sistem escrow, moderasi, dan reputasi yang kuat.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Nilai-Nilai</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Transparansi', desc: 'Setiap transaksi dan keputusan dapat dilacak dan diaudit.' },
            { title: 'Keadilan', desc: 'Sistem escrow memastikan pembayaran hanya lepas saat pekerjaan selesai.' },
            { title: 'Komunitas', desc: 'Platform dibangun bersama dan untuk komunitas kreatif Indonesia.' },
          ].map((v) => (
            <div key={v.title} className="card">
              <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
              <p className="text-sm text-gray-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
