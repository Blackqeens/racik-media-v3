'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  PenLine,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  User,
  SlidersHorizontal,
  FileQuestion,
  Sparkles,
} from 'lucide-react';
import { useEditorialArchive } from '@/lib/editorial-archive';

export interface HomepageArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentType: 'article' | 'journal' | 'paper' | 'story';
  category: string;
  authorName: string;
  publishedAt: string;
  readTimeMinutes: number;
  image: string;
  isFeatured?: boolean;
}

const ARTICLES_DATA: HomepageArticleItem[] = [
  {
    id: 'art-01',
    slug: 'anyaman-rotan-cirebon-warisan-global',
    title: 'Anyaman Rotan Cirebon: Warisan Tradisi yang Menembus Pasar Desain Global',
    excerpt: 'Para pengrajin rotan di Tegalwangi kini memasok butik interior di Paris dan Tokyo, tanpa meninggalkan teknik anyam turun-temurun yang menjadi ruh keotentikan karya.',
    contentType: 'journal',
    category: 'Kerajinan',
    authorName: 'Hendra Gunawan',
    publishedAt: '2026-06-10T08:00:00Z',
    readTimeMinutes: 5,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
    isFeatured: true,
  },
  {
    id: 'art-02',
    slug: 'kopi-gayo-toraja-flores-tiga-karakter',
    title: 'Kopi Gayo, Toraja, dan Flores: Satu Cangkir Tiga Karakter Nusantara',
    excerpt: 'Panduan lengkap menemukan single origin terbaik dari tiga penjuru nusantara, membedah karakteristik tanah vulkanik dan proses pascapanen langsung dari tangan petani.',
    contentType: 'article',
    category: 'Pertanian',
    authorName: 'Siti Rahmawati',
    publishedAt: '2026-06-07T10:30:00Z',
    readTimeMinutes: 7,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
  },
  {
    id: 'art-03',
    slug: 'petani-muda-teknologi-presisi-lahan-tradisional',
    title: 'Petani Muda Nusantara: Memadukan Sensor IoT di Lahan Tradisional',
    excerpt: 'Eksplorasi mendalam bagaimana generasi baru pemuda desa memadukan pemupukan presisi, sensor kelembapan tanah, dan kearifan pranata mangsa untuk meningkatkan panen.',
    contentType: 'paper',
    category: 'Inovasi',
    authorName: 'Budi Santoso',
    publishedAt: '2026-06-01T14:15:00Z',
    readTimeMinutes: 8,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
  },
  {
    id: 'art-04',
    slug: 'gotong-royong-digital-komunitas-desa',
    title: 'Gotong Royong Digital: Komunitas Desa yang Mengubah Pola Distribusi Pangan',
    excerpt: 'Di Kabupaten Blitar, sebuah paguyuban petani sederhana berevolusi menjadi ekosistem distribusi kolektif yang memotong rantai tengkulak dan menyejahterakan warga.',
    contentType: 'story',
    category: 'Sosial',
    authorName: 'Dewi Lestari',
    publishedAt: '2026-06-03T09:00:00Z',
    readTimeMinutes: 6,
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80',
  },
  {
    id: 'art-05',
    slug: 'tenun-ikat-ntt-motif-leluhur-panggung-dunia',
    title: 'Tenun Ikat NTT: Menjaga Benang Leluhur Tetap Relevan di Era Modern',
    excerpt: 'Desainer muda lokal berkolaborasi dengan mama-mama penenun di Flores untuk merawat pewarna alam dan simbolisme adat agar terus hidup di kancah busana kontemporer.',
    contentType: 'article',
    category: 'Kerajinan',
    authorName: 'Maria Yohana',
    publishedAt: '2026-05-28T11:20:00Z',
    readTimeMinutes: 6,
    image: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=800&q=80',
  },
  {
    id: 'art-06',
    slug: 'ekowisata-mangrove-penghasilan-nelayan-pesisir',
    title: 'Hutan Mangrove Berdaya: Ekosistem Penjaga Pesisir Sekaligus Sumber Ekonomi',
    excerpt: 'Transformasi kawasan rawa payau menjadi sentra kepiting bakau dan wisata konservasi yang mengamankan penghasilan nelayan saat musim ombak besar tiba.',
    contentType: 'journal',
    category: 'Inovasi',
    authorName: 'Arif Prasetyo',
    publishedAt: '2026-05-25T13:45:00Z',
    readTimeMinutes: 5,
    image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'Semua Bacaan' },
  { id: 'Kerajinan', label: 'Kerajinan & Seni' },
  { id: 'Pertanian', label: 'Pertanian & Pangan' },
  { id: 'Inovasi', label: 'Inovasi & Teknologi' },
  { id: 'Sosial', label: 'Sosial & Komunitas' },
];

const TYPE_FILTER = [
  { value: 'all', label: 'Semua Tipe' },
  { value: 'article', label: 'Artikel' },
  { value: 'journal', label: 'Jurnal' },
  { value: 'paper', label: 'Karya Tulis / Paper' },
  { value: 'story', label: 'Kisah Komunitas' },
];

/**
 * HomepageArticles — Page section artikel khusus beranda.
 * Mengadopsi arsitektur, filter, dan estetika dari `apps/web/src/app/articles/page.tsx`
 * dengan tampilan visual jurnalisme berkelas dan ramah pembaca.
 */
export function HomepageArticles() {
  const { items: archiveItems } = useEditorialArchive();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const curatedArticles: HomepageArticleItem[] = useMemo(() => {
    const fromArchive = archiveItems
      .filter((i) => i.entityType === 'article' && i.publishedToHomepage)
      .map((i) => ({
        id: i.id,
        slug: i.slug,
        title: i.title,
        excerpt: i.excerpt,
        contentType: i.contentType ?? 'article',
        category: i.category,
        authorName: i.submitterName,
        publishedAt: i.publishedAt,
        readTimeMinutes: i.readTimeMinutes ?? 5,
        image: i.image,
        isFeatured: i.isFeatured,
      }));
    return fromArchive.length > 0 ? fromArchive : ARTICLES_DATA;
  }, [archiveItems]);

  const filteredArticles = useMemo(() => {
    return curatedArticles.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchType = selectedType === 'all' || item.contentType === selectedType;
      const matchSearch =
        !search ||
        `${item.title} ${item.excerpt} ${item.authorName} ${item.category}`
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchCat && matchType && matchSearch;
    });
  }, [curatedArticles, search, selectedCategory, selectedType]);

  const featuredArticle = filteredArticles.find((a) => a.isFeatured) || filteredArticles[0];
  const listArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <section id="articles" className="w-full px-4 sm:px-6 lg:px-10 py-12 bg-white">
      {/* Header & Section Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-sans font-semibold tracking-widest uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Kilas Wawasan & Tabayyun
            </span>
            <span className="text-xs text-gray-400">Verifikasi Terkurasi</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            Jurnal & Artikel Terkini Nusantara
          </h2>
          <p className="font-sans text-sm text-gray-500 mt-1 max-w-2xl">
            Liputan mendalam, riset aplikatif, dan catatan lapangan dari para pengrajin, petani,
            dan inovator lokal di berbagai penjuru nusantara.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/articles/write"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition"
          >
            <PenLine className="h-3.5 w-3.5" />
            Tulis Ide & Cerita
          </Link>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <span>Semua Jurnal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar (Sesuai Articles Page) */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Kolom Pencarian */}
          <div className="md:col-span-8 relative">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Cari judul artikel, topik kopi, rotan, petani muda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* Filter Tipe Konten */}
          <div className="md:col-span-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              {TYPE_FILTER.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kategori Tabs Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Konten Artikel */}
      {filteredArticles.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center space-y-3">
          <FileQuestion className="h-10 w-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-semibold text-gray-800">Artikel Tidak Ditemukan</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tidak ada artikel yang cocok dengan kata kunci &quot;{search}&quot; pada kategori yang
            dipilih.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedType('all');
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Reset Filter Pencarian
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Artikel Utama (Featured Story Banner) */}
          {featuredArticle && (
            <div className="group rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-6 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="lg:col-span-7 block aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 relative"
                >
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-800 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
                    Sorotan Utama
                  </span>
                </Link>

                <div className="lg:col-span-5 flex flex-col justify-center space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      {featuredArticle.category}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {featuredArticle.contentType}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-emerald-800 transition-colors leading-snug">
                    <Link href={`/articles/${featuredArticle.slug}`}>
                      {featuredArticle.title}
                    </Link>
                  </h3>

                  <p className="font-sans text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 border-t border-gray-200">
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {featuredArticle.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {formatDate(featuredArticle.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {featuredArticle.readTimeMinutes} menit baca
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Artikel Tambahan */}
          {listArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listArticles.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 hover:border-emerald-300 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <Link
                      href={`/articles/${item.slug}`}
                      className="block aspect-[16/10] rounded-xl overflow-hidden bg-gray-100"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </Link>

                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-semibold uppercase tracking-wider text-emerald-700">
                        {item.category}
                      </span>
                      <span className="capitalize">{item.contentType}</span>
                    </div>

                    <h4 className="font-serif text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/articles/${item.slug}`}>{item.title}</Link>
                    </h4>

                    <p className="font-sans text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="truncate max-w-[130px] text-gray-600 font-medium">
                      {item.authorName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{formatDate(item.publishedAt)}</span>
                      <span>·</span>
                      <span>{item.readTimeMinutes} mnt</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
