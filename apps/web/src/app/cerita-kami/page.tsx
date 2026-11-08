import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock3, Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = { title: 'Cerita Kami' };

export default function CeritaKamiPage() {
  // EDIT BAGIAN DATA:
  // - Ubah angka pada array `stats`.
  // - Ubah emoji, warna latar, judul, dan deskripsi pada array `pillars`.
  // - Ubah ikon, judul, dan deskripsi pada array `values`.
  const stats = [
    {
      value: '240+',
      label: 'Artikel Mendalam',
      description: 'Liputan jurnalisme warga dari pelosok desa hingga kota',
    },
    {
      value: '1.2K',
      label: 'Ruang Cerita',
      description: 'Ruang Cerita Nusantara, Dari kisah autentik menuju dukungan nyata',
    },
    {
      value: '85+',
      label: 'karya Terkurasi',
      description: 'Dihadirkan langsung dari ruang kreasi produsen, tanpa perantara',
    },
    {
      value: '34+',
      label: 'Wilayah Nusantara',
      description: 'Jaringan produsen dan penulis dari Sabang sampai Papua',
    },
  ];

  const pillars = [
    {
      number: '01',
      icon: '🌾',
      iconClass: 'bg-emerald-100 text-emerald-800',
      title: 'Agrikultur',
      description: '"Wujud nyata kedaulatan pangan melalui inovasi pertanian golongan muda.',
    },
    {
      number: '02',
      icon: '🧺',
      iconClass: 'bg-amber-100 text-amber-800',
      title: 'Kerajinan',
      description: 'Penyelarasan teknologi modern dan ketelitian nilai tradisional ke panggung dunia.',
    },
    {
      number: '03',
      icon: '☕',
      iconClass: 'bg-rose-100 text-rose-800',
      title: 'Kuliner',
      description: 'Menghadirkan resep pusaka dan penjaga identitas Nusantara.',
    },
    {
      number: '04',
      icon: '🤝',
      iconClass: 'bg-blue-100 text-blue-800',
      title: 'Sosial',
      description: 'Menghidupkan nilai budaya dampak ekonomi yang nyata.',
    },
    {
      number: '05',
      icon: '🎭',
      iconClass: 'bg-purple-100 text-purple-800',
      title: 'Budaya',
      description: 'Langkah nyata menjaga keaslian Nusantara.',
    },
  ];

  const values = [
    {
      icon: '✦',
      title: 'Autentisitas & Fakta',
      description: 'Berlandaskan jurnalistik, di setiap cerita.',
    },
    {
      icon: '⚖',
      title: 'Keadilan untuk Produsen',
      description: 'Kami berkomitmen memastikan ekosistem perdagangan yang adil dan setara.',
    },
    {
      icon: '🌱',
      title: 'Keberlanjutan Lingkungan',
      description: 'kami berKomitmen berpihak produsen ramah alam , menjaga alam tetap ada.',
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-900">
      {/* BAGIAN 1: HERO UTAMA
          Edit judul, label, deskripsi, teks tombol, dan tautan di blok ini.
          Animasi hero berasal dari class `cerita-hero-animated`.
          Pengaturan animasi ada di `apps/web/src/app/globals.css`. */}
      <section className="cerita-hero-animated relative isolate overflow-hidden px-4 py-16 text-white sm:py-20">
        <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-700/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Platform Editorial &amp; Commerce Lokal
          </div>
          <h1 className="max-w-4xl font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Racik Media: Menghubungkan Cerita Autentik &amp; Karya Nyata Nusantara
          </h1>
          <p className="mb-4 mt-3 max-w-3xl text-sm font-light leading-relaxed text-emerald-100 sm:text-base">
            &ldquo;Menghubungkan cerita autentik penjuru Nusantara melalui karya lokal yang bermakna.&rdquo;
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#kisah"
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-400"
            >
              Baca Kisah Lengkap ↓
            </a>
            <Link
              href="/#marketplace"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Jelajah Etalase Lokal →
            </Link>
          </div>
        </div>
      </section>

      {/* BAGIAN 2: STATISTIK
          Data angka dan teks dapat diedit melalui array `stats` di bagian atas file. */}
      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl md:grid-cols-4 sm:p-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center p-3 text-center ${
                index === 1 ? 'border-l border-gray-100' : ''
              } ${index === 2 ? 'border-t border-gray-100 md:border-l md:border-t-0' : ''} ${
                index === 3 ? 'border-l border-gray-100 border-t border-gray-100 md:border-t-0' : ''
              }`}
            >
              <span className="font-serif text-3xl font-bold text-emerald-800 sm:text-4xl lg:text-5xl">
                {stat.value}
              </span>
              <span className="mt-1 text-xs font-semibold text-gray-800 sm:text-sm">{stat.label}</span>
              <span className="mt-0.5 max-w-52 text-[11px] leading-tight text-gray-500">{stat.description}</span>
            </div>
          ))}
        </div>
      </section>

      {/* BAGIAN 3: BANNER PENGUMUMAN
          Edit emoji, judul edisi, isi pengumuman, teks tombol, dan href `/articles`. */}
      <section className="mx-auto mt-12 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 p-5 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-lg text-white shadow">
              📢
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                Pengumuman &amp; Edisi Terkini
              </p>
              <p className="mt-0.5 text-sm font-medium leading-relaxed text-gray-800">
                Edisi <span className="font-bold text-emerald-950">Panen Raya 2025</span> kini live — 12 cerita baru dari petani muda inspiratif Indonesia.
              </p>
            </div>
          </div>
          <Link
            href="/articles"
            className="whitespace-nowrap rounded-full bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow transition-colors hover:bg-emerald-900"
          >
            Baca Edisi Panen Raya →
          </Link>
        </div>
      </section>

      {/* BAGIAN 4: KISAH DAN KUTIPAN
          Judul, paragraf kiri-kanan, dan kutipan dapat diedit langsung di blok ini.
          Kutipan memakai animasi `cerita-panel-animated`. */}
      <section id="kisah" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="flex items-center gap-2">
              <span className="w-8 border-t-2 border-emerald-700" />
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
                Filosofi &amp; Asal Mula
              </span>
            </div>
            <h2 className="font-serif text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
              Meracik Cerita, Merawat Martabat Karya Lokal.
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Di Indonesia, setiap jengkal tanah melahirkan kearifan. Namun seringkali cerita indah dari kebun, bengkel karya, dan dapur tradisional hilang di tengah kebisingan informasi modern.
            </p>
            <div className="cerita-panel-animated mt-2 rounded-xl p-4 text-white shadow-lg shadow-emerald-900/10">
              <p className="font-serif text-sm italic leading-relaxed text-emerald-100">
                &ldquo;Kata &lsquo;Racik&rsquo; berarti memadukan bahan-bahan terbaik dengan takaran yang pas, cinta, dan ketelitian. Kami meracik jurnalisme yang menyentuh hati dengan etalase perdagangan yang adil bagi penciptanya.&rdquo;
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 font-sans text-sm leading-relaxed text-gray-700 sm:text-base lg:col-span-7">
            <p>
              <strong>Racik Media</strong> didirikan atas satu keyakinan sederhana:{' '}
              <em>sebuah produk lokal tidak akan pernah bernilai penuh tanpa narasi yang menjelaskannya</em>.
            </p>
            <p>
              Beras organik bukan hanya karbohidrat; ia adalah perjuangan petani di lereng gunung yang menolak pestisida kimia demi tanah air yang lestari. Tas anyaman rotan bukan hanya aksesori; ia adalah keterampilan jari-jemari pengrajin yang diwariskan lintas generasi.
            </p>
            <p>Melalui Racik Media, kami memadukan dua pilar besar:</p>
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              {[
                ['1', 'Editorial yang Autentik', 'Menulis jurnal mendalam dan fotografi jujur dari lapangan tanpa sensasi, mengangkat suara asli komunitas dan pejuang ekonomi mandiri.'],
                ['2', 'Commerce yang Berkeadilan', 'Menyediakan etalase langsung di mana pembeli dapat membeli karya berkualitas langsung dari produsen lokal tanpa rantai tengkulak.'],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-300">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                    {number}
                  </div>
                  <h3 className="mb-1 font-serif text-base font-bold text-gray-900">{title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BAGIAN 5: 5 PILAR
          Data pilar dapat diedit melalui array `pillars`.
          `iconClass` mengatur warna latar dan warna ikon. */}
      <section className="border-y border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-2 inline-flex items-center gap-2">
              <span className="w-6 border-t-2 border-emerald-700" />
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
                Bidang Liputan &amp; Kurasi
              </span>
              <span className="w-6 border-t-2 border-emerald-700" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
              5 Pilar Utama Racik Media
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Fokus tematik yang kami telusuri dalam setiap jurnal, riset lapangan, dan kurasi etalase produk.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {pillars.map((pillar) => (
              <div
                key={pillar.number}
                className="group flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-emerald-500 hover:shadow-lg"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110 ${pillar.iconClass}`}>
                  {pillar.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  Pilar {pillar.number}
                </span>
                <h3 className="mb-2 mt-1 font-serif text-lg font-bold text-gray-900">{pillar.title}</h3>
                <p className="text-xs leading-relaxed text-gray-600">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BAGIAN 6: NILAI UTAMA
          Data nilai dapat diedit melalui array `values` di bagian atas file. */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="w-6 border-t-2 border-emerald-700" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">Pedoman Kami</span>
            <span className="w-6 border-t-2 border-emerald-700" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
            Nilai yang Kami Pegang Teguh
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">
                {value.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">{value.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BAGIAN 7: CALL TO ACTION
          Edit judul, deskripsi, dan tiga tombol di blok ini.
          Panel memakai animasi `cerita-cta-animated`. */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="cerita-cta-animated relative overflow-hidden rounded-3xl p-8 text-center text-white shadow-2xl sm:p-12">
          <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Mari Berkolaborasi</span>
            <h2 className="font-serif text-2xl font-bold leading-snug sm:text-4xl">
              Punya Cerita atau Produk Lokal yang Layak Dikenal Luas?
            </h2>
            <p className="text-sm font-light leading-relaxed text-emerald-100 sm:text-base">
              Bergabunglah bersama ratusan kontributor jurnal dan pelaku UMKM lokal di seluruh Indonesia. Jadilah bagian dari narasi kebanggaan Nusantara.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link href="/dashboard" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-emerald-900 shadow-md transition-colors hover:bg-emerald-50">
              ✍ Tulis Cerita Anda
            </Link>
            <Link href="/seller/register" className="rounded-full border border-emerald-500/50 bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600">
              🏪 Daftarkan Produk / Jasa
            </Link>
            <Link href="/" className="rounded-full border border-emerald-400/30 bg-transparent px-6 py-3 text-sm font-medium text-emerald-200 transition-colors hover:bg-white/10">
              Jelajah Beranda Racik Media
            </Link>
          </div>
        </div>
      </section>

      {/* BAGIAN 8: INFORMASI DAN PETA
          Edit alamat, jam operasional, email, tautan Google Maps, dan embed iframe di sini. */}
      <section className="w-full bg-white px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="w-4 border-t-2 border-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Lokasi Kantor</span>
            <span className="flex-1 border-t border-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Kantor PC GP Ansor Kota Bekasi</h3>
              <p className="leading-relaxed text-slate-600">
                Kunjungi kantor kami untuk konsultasi langsung atau kolaborasi. Kami siap membantu Anda mengembangkan produk lokal dan konten editorial yang berkualitas.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <span>Kota Bekasi, Jawa Barat, Indonesia</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <span>Senin - Jumat: 09:00 - 17:00 WIB</span>
                </div>
                <div className="flex items-start gap-3 text-slate-700">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <a href="mailto:info@racikmedia.id" className="text-emerald-700 hover:underline">info@racikmedia.com</a>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Kantor+PC+GP+Ansor+Kota+Bekasi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-800"
              >
                <MapPin className="h-4 w-4" />
                Buka di Google Maps
              </a>
            </div>
            <div className="h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126962.09479824287!2d107.0895426!3d-6.2365245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698ef1b3d2a7d7%3A0x4027837c99539895!2sKantor%20PC%20GP%20Ansor%20Kota%20Bekasi!5e0!3m2!1sid!2sid!4v1718000000000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Kantor — PC GP Ansor Kota Bekasi"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
