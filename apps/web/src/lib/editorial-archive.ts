'use client';

import { useEffect, useState } from 'react';

export type EditorialEntityType = 'article' | 'event' | 'product_description';

export type EditorialStatus =
  | 'published_homepage'
  | 'approved'
  | 'pending_review'
  | 'revision_needed';

export interface EditorialArchiveItem {
  id: string;
  slug: string;
  entityType: EditorialEntityType;
  sourceRole: 'author' | 'member' | 'seller' | 'distributor' | 'service_provider';
  submitterName: string;
  submitterOrigin?: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  categoryLabel: string;
  contentType?: 'article' | 'journal' | 'paper' | 'story';
  image: string;
  /** Galeri hingga 4 gambar (atau lebih) yang diunggah pengaju dan dipilih Moderator untuk publikasi */
  images?: string[];
  /** Preferensi tipografi hasil suntingan Moderator */
  editorFontFamily?: 'sans' | 'serif' | 'mono' | 'georgia';
  editorFontSize?: number;
  editorTextAlign?: 'left' | 'center' | 'right' | 'justify';
  publishedAt: string;
  readTimeMinutes?: number;
  isFeatured?: boolean;
  // Khusus Event
  eventType?: 'online' | 'offline';
  location?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  maxAttendees?: number;
  registeredAttendeesCount?: number;
  speakerRole?: string;
  // Khusus Produk Seller / Distributor
  productPrice?: number;
  stock?: number;
  soldCount?: number;
  rating?: number;
  badge?: string;
  // Status Kurasi & Analisis Moderator
  status: EditorialStatus;
  publishedToHomepage: boolean;
  writingVerified: boolean;
  imageThemeVerified: boolean;
  moderatorNotes?: string;
}

export interface WritingAnalysisResult {
  score: number;
  titleValid: boolean;
  excerptValid: boolean;
  bodyValid: boolean;
  imageValid: boolean;
  warnings: string[];
}

const STORAGE_KEY = 'racik-editorial-archive-v1';
const UPDATE_EVENT = 'racik-editorial-archive-updated';

export const INITIAL_EDITORIAL_ARCHIVE: EditorialArchiveItem[] = [
  // ── 1. ARTIKEL & JURNAL ──
  {
    id: 'art-01',
    slug: 'anyaman-rotan-cirebon-warisan-global',
    entityType: 'article',
    sourceRole: 'author',
    submitterName: 'Hendra Gunawan',
    title: 'Anyaman Rotan Cirebon: Warisan Tradisi yang Menembus Pasar Desain Global',
    excerpt:
      'Para pengrajin rotan di Tegalwangi kini memasok butik interior di Paris dan Tokyo, tanpa meninggalkan teknik anyam turun-temurun yang menjadi ruh keotentikan karya.',
    body: 'Sentra kerajinan rotan di Desa Tegalwangi, Kabupaten Cirebon, telah lama menjadi tulang punggung industri kriya Nusantara. Melalui kurasi desain yang memadukan estetika minimalis modern dan ikatan rotan tradisional, karya tangan pengrajin lokal mampu menembus pasar ekspor Eropa dan Jepang dengan nilai tambah tinggi.',
    contentType: 'journal',
    category: 'Kerajinan',
    categoryLabel: 'Kerajinan & Seni',
    publishedAt: '2026-06-10T08:00:00Z',
    readTimeMinutes: 5,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
    isFeatured: true,
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
    moderatorNotes: 'Struktur jurnal sangat rapi, foto sesuai tema kriya rotan.',
  },
  {
    id: 'art-02',
    slug: 'kopi-gayo-toraja-flores-tiga-karakter',
    entityType: 'article',
    sourceRole: 'author',
    submitterName: 'Siti Rahmawati',
    title: 'Kopi Gayo, Toraja, dan Flores: Satu Cangkir Tiga Karakter Nusantara',
    excerpt:
      'Panduan lengkap menemukan single origin terbaik dari tiga penjuru nusantara, membedah karakteristik tanah vulkanik dan proses pascapanen langsung dari tangan petani.',
    body: 'Keberagaman geografis Indonesia melahirkan profil rasa kopi yang khas di setiap ketinggian. Kopi Gayo menghadirkan body tebal dan rempah hangat, Toraja menonjolkan keasaman buah bersih, sedangkan Flores Bajawa menawarkan aroma cokelat dan kacang panggang yang memikat.',
    contentType: 'article',
    category: 'Pertanian',
    categoryLabel: 'Pertanian & Pangan',
    publishedAt: '2026-06-07T10:30:00Z',
    readTimeMinutes: 7,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'art-03',
    slug: 'petani-muda-teknologi-presisi-lahan-tradisional',
    entityType: 'article',
    sourceRole: 'author',
    submitterName: 'Budi Santoso',
    title: 'Petani Muda Nusantara: Memadukan Sensor IoT di Lahan Tradisional',
    excerpt:
      'Eksplorasi mendalam bagaimana generasi baru pemuda desa memadukan pemupukan presisi, sensor kelembapan tanah, dan kearifan pranata mangsa untuk meningkatkan panen.',
    body: 'Transformasi pertanian desa kini digerakkan oleh generasi muda yang kembali ke sawah membawa teknologi tepat guna. Penggunaan sensor kelembapan tanah berbasis mikrokontroler terbukti menghemat air irigasi hingga 35% sekaligus menjaga kesuburan mikroba lokal.',
    contentType: 'paper',
    category: 'Inovasi',
    categoryLabel: 'Inovasi & Teknologi',
    publishedAt: '2026-06-01T14:15:00Z',
    readTimeMinutes: 8,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'art-04',
    slug: 'gotong-royong-digital-komunitas-desa',
    entityType: 'article',
    sourceRole: 'member',
    submitterName: 'Dewi Lestari',
    title: 'Gotong Royong Digital: Komunitas Desa yang Mengubah Pola Distribusi Pangan',
    excerpt:
      'Di Kabupaten Blitar, sebuah paguyuban petani sederhana berevolusi menjadi ekosistem distribusi kolektif yang memotong rantai tengkulak dan menyejahterakan warga.',
    body: 'Melalui pencatatan panen bersama dan sistem pengiriman kolektif antar-kelompok tani, warga desa berhasil menyalurkan sayur segar langsung ke dapur konsumen perkotaan dalam waktu kurang dari 12 jam sejak dipetik.',
    contentType: 'story',
    category: 'Sosial',
    categoryLabel: 'Sosial & Komunitas',
    publishedAt: '2026-06-03T09:00:00Z',
    readTimeMinutes: 6,
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'art-05',
    slug: 'tenun-ikat-ntt-motif-leluhur-panggung-dunia',
    entityType: 'article',
    sourceRole: 'author',
    submitterName: 'Maria Yohana',
    title: 'Tenun Ikat NTT: Menjaga Benang Leluhur Tetap Relevan di Era Modern',
    excerpt:
      'Desainer muda lokal berkolaborasi dengan mama-mama penenun di Flores untuk merawat pewarna alam dan simbolisme adat agar terus hidup di kancah busana kontemporer.',
    body: 'Akar mengkudu, daun tarum, dan kulit kayu mahoni diracik dengan sabar untuk menghasilkan warna tenun ikat yang tahan puluhan tahun. Kolaborasi ini memastikan para penenun memperoleh harga adil atas setiap helai kain yang ditenun.',
    contentType: 'article',
    category: 'Kerajinan',
    categoryLabel: 'Kerajinan & Seni',
    publishedAt: '2026-05-28T11:20:00Z',
    readTimeMinutes: 6,
    image: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=800&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'art-06',
    slug: 'ekowisata-mangrove-penghasilan-nelayan-pesisir',
    entityType: 'article',
    sourceRole: 'author',
    submitterName: 'Arif Prasetyo',
    title: 'Hutan Mangrove Berdaya: Ekosistem Penjaga Pesisir Sekaligus Sumber Ekonomi',
    excerpt:
      'Transformasi kawasan rawa payau menjadi sentra kepiting bakau dan wisata konservasi yang mengamankan penghasilan nelayan saat musim ombak besar tiba.',
    body: 'Rehabilitasi mangrove secara partisipatif tidak hanya menahan abrasi pantai, tetapi juga mengembalikan habitat kepiting bakau bernilai ekonomi tinggi serta membuka peluang pengolahan sirup dan kopi buah mangrove.',
    contentType: 'journal',
    category: 'Inovasi',
    categoryLabel: 'Inovasi & Teknologi',
    publishedAt: '2026-05-25T13:45:00Z',
    readTimeMinutes: 5,
    image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'art-07-draft',
    slug: 'fermentasi-kakao-lokal-sulawesi',
    entityType: 'article',
    sourceRole: 'author',
    submitterName: 'Rizal Mahendra',
    title: 'Teknik Fermentasi Biji Kakao Sulawesi untuk Cokelat Artisan Kelas Dunia',
    excerpt:
      'Tahapan fermentasi kotak kayu selama 5 hari yang mengubah biji kakao mentah menjadi bahan baku cokelat bernilai tinggi dengan aroma buah tropis.',
    body: 'Banyak petani kakao menjual biji kering tanpa fermentasi sehingga harga jualnya rendah. Dengan menerapkan SOP fermentasi terkontrol dan pengeringan rumah surya, kualitas biji kakao meningkat drastis dan diminati pembuat cokelat bean-to-bar.',
    contentType: 'article',
    category: 'Pertanian',
    categoryLabel: 'Pertanian & Pangan',
    publishedAt: '2026-06-11T07:00:00Z',
    readTimeMinutes: 6,
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80',
    status: 'pending_review',
    publishedToHomepage: false,
    writingVerified: false,
    imageThemeVerified: false,
    moderatorNotes: 'Menunggu pemeriksaan kesesuaian skema penulisan & gambar oleh Moderator.',
  },

  // ── 2. KOLEKSI EVENT & PELATIHAN ──
  {
    id: 'evt-01-pupuk-organik',
    slug: 'webinar-formulasi-pupuk-organik-cair',
    entityType: 'event',
    sourceRole: 'service_provider',
    submitterName: 'Dr. Sarah Amalia',
    speakerRole: 'Pakar Mikrobiologi & Formulator Tanah',
    title: 'Webinar Nasional: Formulasi Pupuk Organik Cair & Mikroba Pembenah Tanah',
    excerpt:
      'Panduan teknis meracik POC dari limbah dapur dan kotoran ternak dengan isolasi bakteri indigenous untuk menyuburkan lahan kritis.',
    body: 'Pelatihan komprehensif membahas takaran molase, sumber C-organik, waktu aerasi fermentasi, serta cara menguji kematangan Pupuk Organik Cair (POC) agar aman dan efektif diaplikasikan pada tanaman pangan maupun hortikultura.',
    category: 'webinar',
    categoryLabel: 'Webinar Online',
    eventType: 'online',
    location: 'Zoom Meeting / YouTube Live',
    eventDate: '2026-06-20T09:00:00Z',
    startTime: '09:00 WIB',
    endTime: '11:30 WIB',
    price: 0,
    maxAttendees: 500,
    registeredAttendeesCount: 420,
    publishedAt: '2026-06-10T09:00:00Z',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'evt-02-workshop-rotan',
    slug: 'workshop-teknik-anyam-rotan-kontemporer',
    entityType: 'event',
    sourceRole: 'seller',
    submitterName: 'Ki Anom Tegalwangi',
    speakerRole: 'Master Craftsman Rotan Cirebon',
    title: 'Workshop Lapangan: Teknik Anyam Rotan Kontemporer untuk Pasar Global',
    excerpt:
      'Praktik langsung menganyam furnitur dan aksesoris rumah tangga dari bahan rotan alami grade ekspor bersama maestro pengrajin Tegalwangi.',
    body: 'Peserta akan mempelajari pemilihan batang rotan, teknik pelengkungan uap, pola anyaman terbuka, hingga penyelesaian akhir menggunakan pelapis ramah lingkungan berstandar ekspor.',
    category: 'workshop',
    categoryLabel: 'Workshop Lapangan',
    eventType: 'offline',
    location: 'Sentra Rotan Tegalwangi, Cirebon',
    eventDate: '2026-06-27T08:30:00Z',
    startTime: '08:30 WIB',
    endTime: '16:00 WIB',
    price: 250000,
    maxAttendees: 25,
    registeredAttendeesCount: 19,
    publishedAt: '2026-06-09T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'evt-03-sensory-kopi',
    slug: 'kelas-sensori-rasa-cupping-kopi',
    entityType: 'event',
    sourceRole: 'service_provider',
    submitterName: 'Ir. Bayu Wicaksono',
    speakerRole: 'Q Grader & Konsultan Rasa Kopi',
    title: 'Kelas Intensif: Sensori Rasa & Uji Cupping Kopi Single Origin Nusantara',
    excerpt:
      'Pelajari standar SCA cupping protocol untuk mengidentifikasi catatan rasa, keasaman buah, dan kemanisan karamel biji kopi Indonesia.',
    body: 'Sesi kalibrasi indra penciuman dan pengecapan menggunakan 8 sampel kopi Nusantara dari Aceh, Jawa Barat, Bali, Toraja, hingga Flores.',
    category: 'workshop',
    categoryLabel: 'Workshop Lapangan',
    eventType: 'offline',
    location: 'Lab Sensori Racik Media, Bandung',
    eventDate: '2026-07-04T10:00:00Z',
    startTime: '10:00 WIB',
    endTime: '15:00 WIB',
    price: 350000,
    maxAttendees: 20,
    registeredAttendeesCount: 18,
    publishedAt: '2026-06-08T11:00:00Z',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'evt-04-smart-farming',
    slug: 'bedah-teknologi-instalasi-sensor-iot',
    entityType: 'event',
    sourceRole: 'author',
    submitterName: 'Budi Santoso, M.Kom',
    speakerRole: 'Inovator Smart Agriculture',
    title: 'Bedah Teknologi: Instalasi Sensor IoT Murah untuk Kebun Sayur & Greenhouse',
    excerpt:
      'Workshop daring merakit sensor kelembapan tanah dan penyiraman otomatis berbasis microcontroller yang terhubung ke ponsel pintar.',
    body: 'Panduan langkah demi langkah merakit perangkat pemantau kebun mandiri menggunakan komponen terjangkau yang mudah didapat di pasar lokal.',
    category: 'webinar',
    categoryLabel: 'Webinar Online',
    eventType: 'online',
    location: 'Google Meet Interaktif',
    eventDate: '2026-07-11T13:30:00Z',
    startTime: '13:30 WIB',
    endTime: '16:00 WIB',
    price: 0,
    maxAttendees: 300,
    registeredAttendeesCount: 260,
    publishedAt: '2026-06-08T15:00:00Z',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },

  // ── 3. DESKRIPSI PRODUK SELLER & DISTRIBUTOR ──
  {
    id: 'prd-kopi-gayo',
    slug: 'prd-kopi-gayo',
    entityType: 'product_description',
    sourceRole: 'seller',
    submitterName: 'Koperasi Tani Takengon',
    submitterOrigin: 'Aceh Tengah',
    title: 'Kopi Arabika Gayo Single Origin 100g',
    excerpt:
      'Biji kopi arabika dipetik merah dari dataran tinggi Gayo dengan cita rasa asam lembut dan aroma karamel pekat.',
    body: 'Kopi Arabika Gayo asli dari ketinggian 1.400 mdpl di Aceh Tengah. Diproses secara semi-washed oleh petani anggota koperasi, menghasilkan seduhan bersih dengan aroma rempah manis dan cokelat hitam.',
    category: 'hasil_tani',
    categoryLabel: 'Kopi & Rempah',
    productPrice: 22000,
    stock: 120,
    soldCount: 520,
    rating: 4.9,
    badge: 'Produk Unggulan',
    publishedAt: '2026-06-09T08:00:00Z',
    image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'prd-madu-hutan',
    slug: 'prd-madu-hutan',
    entityType: 'product_description',
    sourceRole: 'seller',
    submitterName: 'Rumah Madu Kapuas',
    submitterOrigin: 'Kalimantan Barat',
    title: 'Madu Hutan Liar Murni Kalimantan 250ml',
    excerpt:
      'Madu murni hasil panen lebah liar Apis dorsata pada pohon sialang hutan tropis tanpa pemanasan buatan.',
    body: 'Dipanen secara lestari oleh kelompok masyarakat adat hutan Kapuas Hulu. Mengandung enzim diastase aktif, polen bunga hutan multiflora, dan dikemas higienis tanpa campuran gula.',
    category: 'hasil_tani',
    categoryLabel: 'Herbal Alami',
    productPrice: 65000,
    stock: 45,
    soldCount: 310,
    rating: 4.9,
    badge: 'Organik Alami',
    publishedAt: '2026-06-08T09:30:00Z',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'prd-benih-cabai',
    slug: 'prd-benih-cabai',
    entityType: 'product_description',
    sourceRole: 'seller',
    submitterName: 'Racik Seed Lab',
    submitterOrigin: 'Jawa Timur',
    title: 'Benih Cabai Rawit Merah Unggul (Kemasan 10g)',
    excerpt:
      'Benih cabai produktif untuk kebun rumah dan budidaya presisi. Daya tumbuh di atas 85%.',
    body: 'Benih cabai rawit merah varietas lokal tahan layu bakteri dan adaptif di dataran rendah maupun menengah. Telah melewati uji kecambah laboratorium dan dikemas kedap udara.',
    category: 'bibit',
    categoryLabel: 'Bibit & Benih',
    productPrice: 25000,
    stock: 80,
    soldCount: 240,
    rating: 5.0,
    badge: 'Benih Terpilih',
    publishedAt: '2026-06-07T14:00:00Z',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'prd-kompos-organik',
    slug: 'prd-kompos-organik',
    entityType: 'product_description',
    sourceRole: 'distributor',
    submitterName: 'Tani Lestari Nusantara (Distributor Jawa Barat)',
    submitterOrigin: 'Bandung Barat',
    title: 'Kompos Organik Matang Kaya Mikroba (5 Kg)',
    excerpt:
      'Kompos fermentasi matang tanpa bau menyengat, memperbaiki struktur tanah dan kesuburan tanaman.',
    body: 'Didistribusikan langsung dari instalasi pengomposan terpadu Bandung Barat. Memiliki rasio C/N ideal, remah, bebas biji gulma, serta diperkaya Trichoderma alami.',
    category: 'pupuk',
    categoryLabel: 'Pupuk & Nutrisi',
    productPrice: 45000,
    stock: 60,
    soldCount: 185,
    rating: 4.8,
    badge: 'Kaya Hara',
    publishedAt: '2026-06-06T12:00:00Z',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'prd-tas-rotan',
    slug: 'prd-tas-rotan',
    entityType: 'product_description',
    sourceRole: 'seller',
    submitterName: 'Galeri Rotan Tegalwangi',
    submitterOrigin: 'Cirebon',
    title: 'Tas Anyam Rotan Natural Artisan Cirebon',
    excerpt:
      'Anyaman rotan alami dengan lapisan ramah lingkungan dan furing kain blacu buatan pengrajin lokal.',
    body: 'Tas selempang rotan buatan tangan pengrajin Cirebon dengan struktur kokoh, ringan, dan dilengkapi kancing kulit sintetis premium.',
    category: 'alat',
    categoryLabel: 'Peralatan & Seni',
    productPrice: 135000,
    stock: 25,
    soldCount: 190,
    rating: 4.8,
    badge: 'Handcrafted',
    publishedAt: '2026-06-05T10:00:00Z',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'prd-beras-merah',
    slug: 'prd-beras-merah',
    entityType: 'product_description',
    sourceRole: 'distributor',
    submitterName: 'Sawah Berkah Agro (Distributor Pangan)',
    submitterOrigin: 'Cianjur',
    title: 'Beras Merah Organik Cianjur 1 Kg',
    excerpt:
      'Beras merah kaya serat alami yang ditanam tanpa pestisida kimia sintetis, aman untuk pola makan sehat.',
    body: 'Beras merah pecah kulit dari lereng Gunung Gede Cianjur. Memiliki indeks glikemik rendah, pulen saat ditanak, dan dikemas vakum untuk menjaga kesegaran.',
    category: 'hasil_tani',
    categoryLabel: 'Pangan Organik',
    productPrice: 32000,
    stock: 90,
    soldCount: 530,
    rating: 4.9,
    badge: 'Bebas Pestisida',
    publishedAt: '2026-06-04T09:00:00Z',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'prd-sprayer-tangan',
    slug: 'prd-sprayer-tangan',
    entityType: 'product_description',
    sourceRole: 'distributor',
    submitterName: 'Racik Official Store (Distributor Alat)',
    submitterOrigin: 'Jakarta',
    title: 'Sprayer Tekanan Manual Praktis 2 Liter',
    excerpt:
      'Penyemprot manual dengan nozzle kuningan yang dapat diatur untuk penyiraman lembut atau semprotan hama.',
    body: 'Tabung HDPE tebal tahan tekanan dengan pompa ergonomis dan ujung nozzle kuningan anti-karat untuk aplikasi pupuk daun maupun pestisida nabati.',
    category: 'alat',
    categoryLabel: 'Peralatan Berkebun',
    productPrice: 68000,
    stock: 30,
    soldCount: 145,
    rating: 4.7,
    badge: 'Tahan Karat',
    publishedAt: '2026-06-03T11:00:00Z',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
  {
    id: 'prd-vco-kelapa',
    slug: 'prd-vco-kelapa',
    entityType: 'product_description',
    sourceRole: 'seller',
    submitterName: 'Sentra VCO Kulon Progo',
    submitterOrigin: 'Yogyakarta',
    title: 'Minyak Kelapa Murni (VCO) Cold Pressed 500ml',
    excerpt:
      'Diekstrak tanpa pemanasan tinggi untuk menjaga nutrisi asam laurat alami dan kemurnian minyak kelapa.',
    body: 'Virgin Coconut Oil hasil ekstraksi dingin dari kelapa tua pilihan di Kulon Progo. Jernih, beraroma segar kelapa alami, tidak tengik, dan kaya asam laurat.',
    category: 'hasil_tani',
    categoryLabel: 'Herbal & Pangan',
    productPrice: 45000,
    stock: 50,
    soldCount: 270,
    rating: 4.8,
    badge: 'Cold Pressed',
    publishedAt: '2026-06-02T16:00:00Z',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80',
    status: 'published_homepage',
    publishedToHomepage: true,
    writingVerified: true,
    imageThemeVerified: true,
  },
];

/**
 * Fungsi analisis otomatis tata penulisan & kesesuaian gambar
 * untuk membantu Moderator memverifikasi kepatuhan skema publikasi.
 */
export function analyzeWritingAndImage(item: EditorialArchiveItem): WritingAnalysisResult {
  const warnings: string[] = [];
  const titleLen = item.title.trim().length;
  const excerptLen = item.excerpt.trim().length;
  const bodyLen = item.body.trim().length;
  const hasValidImage =
    item.image.trim().startsWith('http://') ||
    item.image.trim().startsWith('https://') ||
    item.image.trim().startsWith('/');

  const titleValid = titleLen >= 15 && titleLen <= 140;
  if (!titleValid) {
    warnings.push('Judul harus antara 15–140 karakter agar informatif dan sesuai standar tajuk.');
  }

  const excerptValid = excerptLen >= 40;
  if (!excerptValid) {
    warnings.push('Ringkasan/deskripsi singkat minimal 40 karakter agar jelas saat tampil di Homepage.');
  }

  const bodyValid = bodyLen >= 60;
  if (!bodyValid) {
    warnings.push('Isi naskah/uraian lengkap minimal 60 karakter dan harus menggunakan kalimat yang jelas.');
  }

  if (!hasValidImage) {
    warnings.push('Tautan gambar sampul tidak valid atau kosong.');
  }

  let score = 0;
  if (titleValid) score += 25;
  if (excerptValid) score += 25;
  if (bodyValid) score += 25;
  if (hasValidImage) score += 25;

  return {
    score,
    titleValid,
    excerptValid,
    bodyValid,
    imageValid: hasValidImage,
    warnings,
  };
}

export function getEditorialArchive(): EditorialArchiveItem[] {
  if (typeof window === 'undefined') return INITIAL_EDITORIAL_ARCHIVE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_EDITORIAL_ARCHIVE;
    const parsed = JSON.parse(raw) as EditorialArchiveItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_EDITORIAL_ARCHIVE;
    return parsed;
  } catch {
    return INITIAL_EDITORIAL_ARCHIVE;
  }
}

export function saveEditorialArchive(items: EditorialArchiveItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function updateEditorialArchiveItem(
  updated: EditorialArchiveItem,
): EditorialArchiveItem[] {
  const current = getEditorialArchive();
  const exists = current.some((i) => i.id === updated.id);
  const next = exists
    ? current.map((item) => (item.id === updated.id ? updated : item))
    : [updated, ...current];
  saveEditorialArchive(next);
  return next;
}

export function resetEditorialArchive(): EditorialArchiveItem[] {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }
  return INITIAL_EDITORIAL_ARCHIVE;
}

export function useEditorialArchive() {
  const [items, setItems] = useState<EditorialArchiveItem[]>(INITIAL_EDITORIAL_ARCHIVE);
  const [activeEditorRole, setActiveEditorRole] = useState<string>('member');

  useEffect(() => {
    const sync = () => {
      setItems(getEditorialArchive());
    };
    const syncRole = () => {
      const saved = window.localStorage.getItem('racik-dev-role') || 'member';
      setActiveEditorRole(saved);
    };
    sync();
    syncRole();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    window.addEventListener('racik-dev-role-change', syncRole);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('racik-dev-role-change', syncRole);
    };
  }, []);

  const canPublishToHomepage =
    activeEditorRole === 'moderator' || activeEditorRole === 'master_admin';

  return {
    items,
    activeEditorRole,
    canPublishToHomepage,
    updateItem: (item: EditorialArchiveItem) => {
      const next = updateEditorialArchiveItem(item);
      setItems(next);
    },
    resetAll: () => {
      const next = resetEditorialArchive();
      setItems(next);
    },
  };
}

