'use client';

import Link from 'next/link';
import { useRef, useEffect, useState, useCallback } from 'react';
import { HomepageSidebar } from '@/components/layout/HomepageSidebar';
import { HomepageMarketplace } from '@/components/marketplace/HomepageMarketplace';
import { HomepageArticles } from '@/components/articles/HomepageArticles';
import { HomepageServices } from '@/components/services/HomepageServices';
import { HomepageEvents } from '@/components/events/HomepageEvents';
import { DevBypassPanel } from '@/components/home/DevBypassPanel';

// ─── Hero Carousel ────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80',
    alt: 'Marketplace Racik Media — produk lokal pilihan',
    label: 'Pasar',
    title: 'Pasar Racik Tepat Guna',
    desc: 'Temukan produk lokal terbaik dari seluruh Nusantara — dari kerajinan tangan, rempah pilihan, hingga kebutuhan sehari-hari, langsung dari produsen terpercaya.',
    cta: 'Jelajahi Marketplace',
    href: '/marketplace',
  },
  {
    img: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1600&q=80',
    alt: 'Artikel Racik Media — wawasan dan tabayyun',
    label: 'Jurnal',
    title: 'Kilas Wawasan & Tabayyun',
    desc: 'Bacaan mendalam yang diverifikasi — artikel, opini, dan investigasi untuk membangun perspektif yang jernih dan bijak di era informasi.',
    cta: 'Baca Koleksi Artikel',
    href: '/articles',
  },
  {
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80',
    alt: 'Events Racik Media — agenda komunitas',
    label: 'Agenda',
    title: 'Agenda & Kegiatan Komunitas',
    desc: 'Ikuti workshop, pameran, dan diskusi bersama komunitas kreatif Racik Media. Dari online hingga offline, ada ruang untuk setiap gagasan.',
    cta: 'Lihat Agenda Event',
    href: '/events',
  },
  {
    img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80',
    alt: 'Tentang Racik Media — mengenal kami',
    label: 'Tentang',
    title: 'Mengenal Racik Media',
    desc: 'Platform editorial dan marketplace yang mengangkat produk lokal Indonesia. Kami percaya bahwa setiap daerah memiliki cerita dan karya yang layak dikenal dunia.',
    cta: 'Cerita Kami',
    href: '/cerita-kami',
  },
];

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const TOTAL = HERO_SLIDES.length;
  const DELAY = 5000;

  const resetProgress = useCallback(() => {
    setProgress(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgress(true));
    });
  }, []);

  const goTo = useCallback((index: number) => {
    const next = ((index % TOTAL) + TOTAL) % TOTAL;
    setCurrent(next);
    resetProgress();
  }, [TOTAL, resetProgress]);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    resetProgress();
    timerRef.current = setInterval(() => {
      setIsPaused((p) => {
        if (!p) setCurrent((c) => ((c + 1) % TOTAL));
        return p;
      });
    }, DELAY);
  }, [TOTAL, resetProgress]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startAutoPlay]);

  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      aria-label="Hero Carousel Racik Media"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ isolation: 'isolate' }}
    >
      {/* Track */}
      <div
        className="flex"
        style={{
          width: `${TOTAL * 100}%`,
          transform: `translateX(-${(current * 100) / TOTAL}%)`,
          transition: 'transform 1.2s cubic-bezier(0.65, 0, 0.35, 1)',
          willChange: 'transform',
        }}
      >
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="relative flex-shrink-0"
            style={{
              width: `${100 / TOTAL}%`,
              minHeight: 'clamp(440px, 60vw, 735px)',
            }}
          >
            {/* Background Image */}
            <Link href={slide.href} className="absolute inset-0 block" aria-label={slide.cta} tabIndex={i === current ? 0 : -1}>
              <img
                src={slide.img}
                alt={slide.alt}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{
                  filter: 'brightness(0.72)',
                  transform: i === current ? 'scale(1.06)' : 'scale(1)',
                  transition: 'transform 8s linear',
                }}
              />
            </Link>

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.38) 40%, rgba(0,0,0,0.12) 70%, transparent 100%)',
              }}
            />

            {/* Content Box */}
            <div
              className="absolute inset-0 flex items-start justify-center"
              style={{ padding: '5% 0 32px', zIndex: 2 }}
            >
              <div
                className="text-center rounded-2xl"
                style={{
                  background: 'rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: 'clamp(28px, 4vw, 44px) clamp(32px, 5vw, 56px)',
                  width: 'min(90%, 900px)',
                  opacity: i === current ? 1 : 0,
                  transform: i === current ? 'translateY(0)' : 'translateY(28px)',
                  transition: 'opacity 0.8s ease 0.4s, transform 0.25s ease',
                }}
              >
                <span className="inline-block font-sans text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#6ee7b7', letterSpacing: '0.18em' }}>
                  {slide.label}
                </span>
                <h2 className="font-serif font-bold leading-tight text-white mb-2.5"
                  style={{ fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                  {slide.title}
                </h2>
                <p className="font-sans font-light leading-relaxed mb-5" style={{ fontSize: 18, color: 'rgba(255,255,255,0.82)' }}>
                  {slide.desc}
                </p>
                <Link
                  href={slide.href}
                  tabIndex={i === current ? 0 : -1}
                  className="inline-flex items-center gap-2 font-sans font-semibold text-white rounded-full transition-all"
                  style={{
                    fontSize: 16,
                    letterSpacing: '0.04em',
                    background: '#047857',
                    padding: '11px 28px',
                    boxShadow: '0 4px 16px rgba(4,120,87,0.35)',
                    textDecoration: 'none',
                  }}
                >
                  {slide.cta}
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev Arrow */}
      <button
        onClick={() => { goTo(current - 1); startAutoPlay(); }}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
        style={{ border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)' }}
        aria-label="Slide sebelumnya"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>

      {/* Next Arrow */}
      <button
        onClick={() => { goTo(current + 1); startAutoPlay(); }}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100 focus:opacity-100"
        style={{ border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)' }}
        aria-label="Slide berikutnya"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2.5">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); startAutoPlay(); }}
            aria-label={`Slide ${i + 1}`}
            className="w-2.5 h-2.5 rounded-full transition-all"
            style={{
              border: '2px solid rgba(255,255,255,0.5)',
              background: i === current ? '#fff' : 'transparent',
              transform: i === current ? 'scale(1.2)' : 'scale(1)',
              borderColor: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px] z-10"
        style={{
          background: 'linear-gradient(90deg, #10b981, #047857)',
          width: progress ? '100%' : '0%',
          transition: progress ? `width ${DELAY}ms linear` : 'none',
        }}
      />
    </section>
  );
}

// ─── Section Divider ──────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10">
      <hr className="border-t border-gray-100" />
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label, linkHref, linkText }: { label: string; linkHref?: string; linkText?: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="text-xs font-sans font-semibold tracking-widest uppercase text-gray-500">{label}</span>
      <span className="flex-1 border-t border-gray-100" />
      {linkHref && linkText && (
        <Link href={linkHref} className="text-xs font-sans font-medium text-emerald-700 hover:underline tracking-wide">
          {linkText}
        </Link>
      )}
    </div>
  );
}

// ─── More Stories Section ─────────────────────────────────────────────────────

function MoreStoriesSection() {
  return (
    <section id="more-stories" className="w-full px-4 sm:px-6 lg:px-10 py-12">
      <SectionHeader label="Lebih Banyak Cerita" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured story */}
        <article className="lg:col-span-2 flex flex-col sm:flex-row gap-6 group">
          <div className="rounded-md overflow-hidden bg-gray-100 w-full sm:w-56 flex-shrink-0" style={{ aspectRatio: '4/3' }}>
            <img src="https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=700&q=75" alt="Tenun NTT"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          </div>
          <div className="flex flex-col gap-2 justify-center">
            <span className="text-xs font-sans font-semibold tracking-widest uppercase text-emerald-700">Budaya</span>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold leading-snug text-gray-900 group-hover:text-emerald-800 transition-colors">
              <Link href="/articles">Tenun Ikat NTT: Motif Leluhur yang Kini Dikenakan di Panggung Dunia</Link>
            </h3>
            <p className="font-sans text-sm leading-relaxed text-gray-500 line-clamp-2">
              Desainer muda lokal berkolaborasi dengan penenun lansia di Flores untuk menjaga motif adat tetap hidup dan relevan bagi generasi berikutnya.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-sans text-gray-400">1 Jun 2025</span>
              <span className="text-gray-300">·</span>
              <span className="text-xs font-sans text-gray-400">8 menit baca</span>
            </div>
          </div>
        </article>

        {/* Side stories */}
        <div className="flex flex-col gap-6">
          {[
            {
              img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&q=75',
              alt: 'Sampah Plastik',
              category: 'Lingkungan',
              title: 'Desa Bebas Plastik: Kisah dari Bali yang Menginspirasi Dunia',
              date: '28 Mei 2025',
            },
            {
              img: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=300&q=75',
              alt: 'Ekowisata',
              category: 'Wisata',
              title: 'Ekowisata Hutan Mangrove: Alternatif Penghasilan Nelayan Pesisir',
              date: '25 Mei 2025',
            },
          ].map((s, i) => (
            <div key={i}>
              <article className="flex gap-4 group">
                <div className="rounded-md overflow-hidden bg-gray-100 w-24 h-20 flex-shrink-0">
                  <img src={s.img} alt={s.alt} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <span className="text-xs font-sans font-semibold tracking-widest uppercase text-emerald-700">{s.category}</span>
                  <h4 className="font-serif text-base font-semibold leading-snug text-gray-900 group-hover:text-emerald-800 transition-colors">
                    <Link href="/articles">{s.title}</Link>
                  </h4>
                  <span className="text-xs font-sans text-gray-400">{s.date}</span>
                </div>
              </article>
              {i === 0 && <hr className="border-t border-gray-100 mt-6" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter Section ───────────────────────────────────────────────────────

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !consent) return;
    setStatus('Terima kasih! Anda telah berlangganan newsletter Racik Media.');
    setEmail('');
    setConsent(false);
  }

  return (
    <section className="bg-gray-50 border-t border-b border-gray-100 py-14">
      <div className="max-w-2xl mx-auto px-4 text-center flex flex-col gap-4">
        <span className="text-xs font-sans font-semibold tracking-widest uppercase text-emerald-700">Newsletter</span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
          Cerita terbaik, langsung ke kotak masuk Anda
        </h2>
        <p className="font-sans text-sm text-gray-500 leading-relaxed">
          Bergabunglah dengan ribuan pembaca yang menerima kurasi artikel pilihan dan penawaran produk eksklusif setiap bulan.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 justify-center mt-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="alamat@email.com"
            aria-label="Alamat email"
            className="flex-1 max-w-xs px-4 py-2.5 text-sm font-sans border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
          <label className="flex items-start gap-2 max-w-md text-left text-xs font-sans text-gray-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="mt-0.5 accent-emerald-700"
            />
            <span>Saya bersedia menerima kurasi artikel dan penawaran produk Racik Media melalui email setiap bulan.</span>
          </label>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-sans font-semibold bg-emerald-700 text-white rounded-full hover:bg-emerald-800 transition-colors"
          >
            Langganan Gratis
          </button>
          {status && (
            <p className="text-sm font-sans text-emerald-700" role="status" aria-live="polite">{status}</p>
          )}
        </form>
        <p className="text-xs font-sans text-gray-400">
          Email Anda digunakan untuk menyiapkan dan mengirim informasi tabloid bulanan Racik Media.
        </p>
      </div>
    </section>
  );
}

// ─── HomePageView ─────────────────────────────────────────────────────────────

/**
 * HomePageView — Tampilan utama Beranda Racik Media.
 * Menggabungkan seluruh komponen beranda secara modular dan responsif.
 * Dikelola di file ini sehingga mudah dibedakan dari page.tsx lainnya di editor.
 */
export function HomePageView() {
  return (
    <div className="mx-auto flex w-full">
      {/* Sidebar Khusus Homepage */}
      <HomepageSidebar />

      {/* Konten Utama Beranda */}
      <div className="flex-1 min-w-0">
        {/* 1. Hero Carousel */}
        <HeroCarousel />

        <Divider />

        {/* 2. Artikel & Jurnal Khusus Beranda (Berdasarkan Page Artikel) */}
        <HomepageArticles />

        <Divider />

        {/* 3. Marketplace Khusus Beranda (Berdasarkan Page Marketplace) */}
        <HomepageMarketplace />

        <Divider />

        {/* 4. Layanan Jasa & Service Provider Khusus Beranda (Berdasarkan Page Service-Provider) */}
        <HomepageServices />

        <Divider />

        {/* 5. Agenda & Event Khusus Beranda (Berdasarkan Page Events) */}
        <HomepageEvents />

        <Divider />

        {/* 6. 🔧 Dev Bypass Panel — Akses Semua Dashboard */}
        <DevBypassPanel />

        <Divider />

        {/* 7. More Stories */}
        <MoreStoriesSection />

        <Divider />

        {/* 7. Newsletter */}
        <NewsletterSection />
      </div>
    </div>
  );
}

