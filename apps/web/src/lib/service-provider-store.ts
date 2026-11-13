'use client';

import { useEffect, useState } from 'react';

export interface ManagedServiceItem {
  id: string;
  title: string;
  shortSummary: string;
  description: string;
  category: string;
  categoryLabel: string;
  priceStartingFrom: number;
  priceUnit: string;
  coverImage: string;
  locationArea: string;
  fullAddress: string;
  serviceMode: 'onsite' | 'online' | 'hybrid';
  operatingHours: string;
  contactPhone: string;
  durationEstimate: string;
  maxRevisions: number;
  hasMilestones: boolean;
  milestonesSummary: string;
  status: 'active' | 'draft';
  totalCompletedJobs: number;
  provider: {
    id: string;
    name: string;
    titleExpertise: string;
    bio: string;
    rating: number;
    isVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'racik-services-catalog-v1';
const UPDATE_EVENT = 'racik-services-catalog-updated';

export const SERVICE_CATEGORY_OPTIONS = [
  { id: 'konsultasi', label: 'Konsultasi & Formulasi' },
  { id: 'uji_lab', label: 'Uji Lab & Kesuburan Tanah' },
  { id: 'pelatihan', label: 'Pelatihan & Pendampingan Lahan' },
  { id: 'mekanisasi', label: 'Drone & Mekanisasi Pertanian' },
  { id: 'greenhouse', label: 'Instalasi Greenhouse & Irigasi IoT' },
  { id: 'dokumentasi', label: 'Dokumentasi & Branding UMKM' },
];

// 6 Layanan Master Utama Terkurasi
const CORE_MANAGED_SERVICES: ManagedServiceItem[] = [
  {
    id: 'srv-01-pelatihan-rotan',
    title: 'Pelatihan & Workshop Kriya Anyaman Rotan Tradisi',
    shortSummary:
      'Bimbingan intensif teknik anyam kriya rotan warisan Cirebon untuk perajin pemula hingga butik desain interior.',
    description:
      'Program pelatihan langsung bersama maestro rotan Tegalwangi meliputi pemilihan bahan baku rotan grade A, teknik pemanasan dan pelengkungan rangka, pola anyaman kontemporer, hingga finishing ramah lingkungan berstandar ekspor.',
    category: 'pelatihan',
    categoryLabel: 'Pelatihan & Pendampingan Lahan',
    priceStartingFrom: 1500000,
    priceUnit: 'batch / grup',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    locationArea: 'Cirebon & Kunjungan On-Site',
    fullAddress: 'Jl. Ki Ageng Tapa No. 42, Sentra Rotan Tegalwangi, Kab. Cirebon, Jawa Barat 45154',
    serviceMode: 'onsite',
    operatingHours: 'Senin - Sabtu (08:00 - 16:30 WIB)',
    contactPhone: '0812-2345-6789',
    durationEstimate: '2 Hari Intensif (14 Jam Praktik)',
    maxRevisions: 2,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Persiapan Bahan (30%) • Tahap 2: Praktik Anyam (40%) • Tahap 3: Evaluasi Karya (30%)',
    status: 'active',
    totalCompletedJobs: 32,
    provider: {
      id: 'pro-cirebon',
      name: 'Ki Anom Tegalwangi',
      titleExpertise: 'Master Craftsman Rotan & Kriya',
      bio: 'Pengrajin dan instruktur kriya rotan berpengalaman 25 tahun untuk pasar ekspor Eropa & Jepang.',
      rating: 5.0,
      isVerified: true,
    },
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'srv-02-uji-kopi',
    title: 'Kurasi Cita Rasa & Uji Organoleptik Kopi Nusantara',
    shortSummary:
      'Sesi cupping profesional untuk menganalisis skor rasa, cacat biji (defect), dan profil sangrai single origin nusantara.',
    description:
      'Layanan pengujian sampel biji kopi hijau (green bean) dan sangrai (roasted bean) menggunakan standar SCA Cupping Protocol. Termasuk pengukuran kadar air, densitas biji, identifikasi defect fisik, serta rekomendasi profil roasting untuk meningkatkan harga jual petani dan roastery.',
    category: 'konsultasi',
    categoryLabel: 'Konsultasi & Formulasi',
    priceStartingFrom: 750000,
    priceUnit: 'sesi cupping',
    coverImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    locationArea: 'Bandung & Kirim Sampel Seluruh Indonesia',
    fullAddress: 'Lab Sensori Racik Nusantara, Jl. Dago Asri No. 18, Coblong, Kota Bandung, Jawa Barat 40135',
    serviceMode: 'hybrid',
    operatingHours: 'Senin - Jumat (09:00 - 17:00 WIB)',
    contactPhone: '0813-8899-1122',
    durationEstimate: '3 - 4 Hari Kerja per Sampel',
    maxRevisions: 2,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Uji Fisik Green Bean (40%) • Tahap 2: Sample Roasting & Cupping Sheet Resmi (60%)',
    status: 'active',
    totalCompletedJobs: 85,
    provider: {
      id: 'pro-kopi',
      name: 'Ir. Bayu Wicaksono',
      titleExpertise: 'Licensed Q Arabica Grader & Sensory Specialist',
      bio: 'Konsultan mutu pascapanen kopi spesialti untuk koperasi petani di Aceh, Toraja, Flores, dan Jawa Barat.',
      rating: 4.9,
      isVerified: true,
    },
    createdAt: '2026-06-02T10:00:00Z',
    updatedAt: '2026-06-09T11:30:00Z',
  },
  {
    id: 'srv-03-uji-tanah',
    title: 'Pemeriksaan Kesuburan Tanah & Formulasi Pemupukan Presisi',
    shortSummary:
      'Analisis pH, kandungan NPK, C-Organik, dan mikrobioma tanah dengan rekomendasi racikan pupuk organik sesuai komoditas.',
    description:
      'Pemeriksaan laboratorium dan observasi lahan untuk mengetahui status keasaman tanah (pH), Kapasitas Tukar Kation (KTK), ketersediaan unsur hara makro-mikro, serta penyusunan jadwal dan dosis pemupukan berimbang agar hemat biaya pupuk hingga 40%.',
    category: 'uji_lab',
    categoryLabel: 'Uji Lab & Kesuburan Tanah',
    priceStartingFrom: 180000,
    priceUnit: 'sampel lahan',
    coverImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    locationArea: 'Jawa Barat, Jawa Tengah & Konsultasi Online',
    fullAddress: 'Klinik Tanah Agro Lestari, Jl. Raya Dramaga Km 7, Kabupaten Bogor, Jawa Barat 16680',
    serviceMode: 'hybrid',
    operatingHours: 'Senin - Sabtu (08:00 - 16:00 WIB)',
    contactPhone: '0811-9000-4455',
    durationEstimate: '3 - 5 Hari Kerja',
    maxRevisions: 3,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Uji Sampel Tanah (50%) • Tahap 2: Rekomendasi Dosis & Jadwal Pemupukan (50%)',
    status: 'active',
    totalCompletedJobs: 64,
    provider: {
      id: 'pro-agronomi',
      name: 'Dr. Sarah Amalia',
      titleExpertise: 'Pakar Ilmu Tanah & Mikrobiologi Pertanian',
      bio: 'Peneliti dan praktisi pemulihan lahan kritis dengan pendekatan pupuk hayati dan organik cair.',
      rating: 4.9,
      isVerified: true,
    },
    createdAt: '2026-06-03T09:00:00Z',
    updatedAt: '2026-06-10T14:00:00Z',
  },
  {
    id: 'srv-04-dokumentasi-umkm',
    title: 'Dokumentasi Visual & Penulisan Narasi Jenama UMKM Daerah',
    shortSummary:
      'Paket fotografi produk autentik dan penyusunan narasi storytelling agar karya lokal memiliki daya pikat pasar nasional & ekspor.',
    description:
      'Layanan pemotretan katalog produk kriya/pangan lokal di lokasi pengrajin, pembuatan video profil singkat proses produksi, serta penulisan deskripsi cerita produk (brand storytelling) berbahasa Indonesia dan Inggris.',
    category: 'dokumentasi',
    categoryLabel: 'Dokumentasi & Branding UMKM',
    priceStartingFrom: 1200000,
    priceUnit: 'paket produk',
    coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
    locationArea: 'Seluruh Nusantara (Kunjungan & Studio)',
    fullAddress: 'Studio Kreatif Nusantara, Jl. Prawirotaman II No. 24, Mergangsan, Kota Yogyakarta 55153',
    serviceMode: 'hybrid',
    operatingHours: 'Senin - Sabtu (09:00 - 18:00 WIB)',
    contactPhone: '0812-7788-9900',
    durationEstimate: '5 - 7 Hari Kerja',
    maxRevisions: 3,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Konsep & Pemotretan (40%) • Tahap 2: Editing Visual & Naskah Cerita (60%)',
    status: 'active',
    totalCompletedJobs: 54,
    provider: {
      id: 'pro-media',
      name: 'Kolektif Media Nusantara',
      titleExpertise: 'Dokumentator Budaya & Branding Komoditas',
      bio: 'Tim fotografer dan penulis narasi yang fokus mengangkat nilai produk desa dan UMKM Nusantara.',
      rating: 4.8,
      isVerified: true,
    },
    createdAt: '2026-06-04T11:00:00Z',
    updatedAt: '2026-06-08T16:00:00Z',
  },
  {
    id: 'srv-05-hama-terpadu',
    title: 'Pendampingan Kebun & Pengendalian Hama Terpadu Ramah Hayati',
    shortSummary:
      'Kunjungan observasi lapangan langsung untuk mendeteksi hama dan menyusun strategi penanganan tanpa pestisida kimia berbahaya.',
    description:
      'Inspeksi langsung ke kebun hortikultura atau perkebunan rakyat untuk mengidentifikasi serangan jamur, bakteri, atau serangga hama. Menyediakan resep biopestisida nabati, pemasangan perangkap feromon, dan agen hayati Trichoderma/Beauveria.',
    category: 'pelatihan',
    categoryLabel: 'Pelatihan & Pendampingan Lahan',
    priceStartingFrom: 350000,
    priceUnit: 'kunjungan lahan',
    coverImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80',
    locationArea: 'Jabodetabek, Priangan Timur & Jawa Barat',
    fullAddress: 'Posko Penyuluhan Tani Mandiri, Jl. Raya Lembang No. 112, Bandung Barat, Jawa Barat 40391',
    serviceMode: 'onsite',
    operatingHours: 'Senin - Sabtu (07:30 - 16:00 WIB)',
    contactPhone: '0815-6677-8899',
    durationEstimate: '1 Hari Kunjungan + 7 Hari Pemantauan',
    maxRevisions: 2,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Diagnosa Lahan (50%) • Tahap 2: Aplikasi & Evaluasi Mingguan (50%)',
    status: 'active',
    totalCompletedJobs: 42,
    provider: {
      id: 'pro-kebun',
      name: 'Tim Racik Agro Edukasi',
      titleExpertise: 'Praktisi Pengendalian Hama Terpadu (PHT)',
      bio: 'Pendamping kelompok tani hortikultura bebas residu pestisida sintetis.',
      rating: 5.0,
      isVerified: true,
    },
    createdAt: '2026-06-05T08:30:00Z',
    updatedAt: '2026-06-09T10:00:00Z',
  },
  {
    id: 'srv-06-instalasi-greenhouse',
    title: 'Desain & Instalasi Greenhouse Bambu/Baja Ringan + Irigasi Tetes IoT',
    shortSummary:
      'Pembangunan greenhouse hemat biaya lengkap dengan sistem fertigasi tetes otomatis untuk melon, cabai, dan sayuran hidroponik.',
    description:
      'Jasa rancang bangun greenhouse skala rumahan hingga komersial dengan sirkulasi udara tropis optimal, pemasangan plastik UV 14%, insect net rapat, serta instalasi pipa irigasi tetes otomatis berbasis timer/sensor kelembapan.',
    category: 'greenhouse',
    categoryLabel: 'Instalasi Greenhouse & Irigasi IoT',
    priceStartingFrom: 2500000,
    priceUnit: 'paket instalasi',
    coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    locationArea: 'Jawa, Bali & Sumatera Selatan',
    fullAddress: 'Workshop Agro Tekno, Jl. Soekarno Hatta No. 88, Kec. Lowokwaru, Kota Malang, Jawa Timur 65141',
    serviceMode: 'onsite',
    operatingHours: 'Senin - Sabtu (08:00 - 17:00 WIB)',
    contactPhone: '0819-3344-5566',
    durationEstimate: '7 - 14 Hari Pengerjaan',
    maxRevisions: 3,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Desain & Rangka (40%) • Tahap 2: Atap UV & Irigasi (40%) • Tahap 3: Uji Coba (20%)',
    status: 'active',
    totalCompletedJobs: 29,
    provider: {
      id: 'pro-iot',
      name: 'Budi Santoso, M.Kom',
      titleExpertise: 'Inovator Smart Agriculture & Greenhouse',
      bio: 'Spesialis otomasi irigasi tetes dan konstruksi greenhouse adaptif iklim tropis.',
      rating: 4.9,
      isVerified: true,
    },
    createdAt: '2026-06-06T09:00:00Z',
    updatedAt: '2026-06-10T15:00:00Z',
  },
];

// Koleksi Data Lengkap 55+ Layanan Nusantara untuk Mendukung Navigasi Halaman (50 item per etalase tanpa duplikasi)
const REGIONAL_SERVICES_CATALOG: ManagedServiceItem[] = [
  ...CORE_MANAGED_SERVICES,
  {
    id: 'srv-07-drone-pemupukan',
    title: 'Penyemprotan Pupuk Hayati & Biopestisida Lahan Menggunakan Drone Agras',
    shortSummary: 'Penyemprotan presisi tinggi 10 hektar per hari menghemat tenaga kerja dan air hingga 85%.',
    description: 'Layanan mekanisasi udara menggunakan drone DJI Agras berkapasitas 20-30 liter, dilengkapi pemetaan multispektral NDVI untuk menargetkan tanaman yang membutuhkan nutrisi tambahan.',
    category: 'mekanisasi',
    categoryLabel: 'Drone & Mekanisasi Pertanian',
    priceStartingFrom: 175000,
    priceUnit: 'hektar',
    coverImage: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80',
    locationArea: 'Subang, Karawang, Indramayu & Lampung',
    fullAddress: 'Hub Aero Agri Nusantara, Jl. Otto Iskandardinata No. 50, Pasirkareumbi, Kab. Subang, Jawa Barat 41211',
    serviceMode: 'onsite',
    operatingHours: 'Setiap Hari (06:00 - 17:00 WIB)',
    contactPhone: '0812-4455-6677',
    durationEstimate: '1 - 2 Hari per Hamparan',
    maxRevisions: 1,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Pemetaan Area (30%) • Tahap 2: Eksekusi Spraying (70%)',
    status: 'active',
    totalCompletedJobs: 92,
    provider: {
      id: 'pro-drone',
      name: 'AgriDrone Solusi Nusantara',
      titleExpertise: 'Pilot Drone Berlisensi FASI & Agronomis Presisi',
      bio: 'Operator drone pertanian bersertifikasi dengan armada spray modern untuk tanaman pangan dan perkebunan.',
      rating: 4.9,
      isVerified: true,
    },
    createdAt: '2026-06-07T08:00:00Z',
    updatedAt: '2026-06-11T09:00:00Z',
  },
  {
    id: 'srv-08-sertifikasi-organik',
    title: 'Pendampingan Audit & Sertifikasi Lahan Pertanian Organik (SNI Organik)',
    shortSummary: 'Bimbingan konversi lahan kimia ke organik, penyusunan ICS (Internal Control System) dan sertifikasi resmi.',
    description: 'Pendampingan komprehensif bagi kelompok tani atau produsen rempah/sayur agar lolos audit lembaga sertifikasi organik terakreditasi KAN, termasuk pengujian residu logam berat dan audit rantai pasok.',
    category: 'konsultasi',
    categoryLabel: 'Konsultasi & Formulasi',
    priceStartingFrom: 3500000,
    priceUnit: 'kelompok tani',
    coverImage: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&q=80',
    locationArea: 'Jawa Timur, Bali & Sulawesi Selatan',
    fullAddress: 'Pusat Konsultasi Mutu Pertanian, Jl. Veteran No. 12, Klojen, Kota Malang, Jawa Timur 65111',
    serviceMode: 'hybrid',
    operatingHours: 'Senin - Jumat (08:30 - 17:00 WIB)',
    contactPhone: '0813-9090-8877',
    durationEstimate: '30 - 60 Hari Pendampingan',
    maxRevisions: 4,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Gap Analysis (30%) • Tahap 2: Dokumen ICS (40%) • Tahap 3: Pra-Audit (30%)',
    status: 'active',
    totalCompletedJobs: 18,
    provider: {
      id: 'pro-sertifikasi',
      name: 'Lembaga Mitra Organik Indonesia',
      titleExpertise: 'Auditor Utama Pertanian Organik SNI & EU Standard',
      bio: 'Konsultan sertifikasi organik terakreditasi dengan pengalaman mengantar 40+ kelompok tani menembus pasar ekspor.',
      rating: 5.0,
      isVerified: true,
    },
    createdAt: '2026-06-08T10:00:00Z',
    updatedAt: '2026-06-11T11:00:00Z',
  },
  {
    id: 'srv-09-pembuatan-silase',
    title: 'Pelatihan Formulasi Pakan Fermentasi Silase & Bio-Urin Ternak Ruminansia',
    shortSummary: 'Teknik pembuatan pakan awetan hijauan kaya protein untuk peternak kambing, domba, dan sapi perah.',
    description: 'Pelatihan mandiri pemanfaatan limbah jerami jagung dan rumput gajah menggunakan inokulan probiotik lokal, ditambah instalasi pengolahan urin ternak menjadi pupuk cair organik bermutu tinggi.',
    category: 'pelatihan',
    categoryLabel: 'Pelatihan & Pendampingan Lahan',
    priceStartingFrom: 850000,
    priceUnit: 'workshop / kandang',
    coverImage: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80',
    locationArea: 'Boyolali, Salatiga, Magelang & Sleman',
    fullAddress: 'Sentra Peternakan Rakyat, Jl. Pandanaran No. 77, Boyolali, Jawa Tengah 57311',
    serviceMode: 'onsite',
    operatingHours: 'Senin - Sabtu (08:00 - 16:00 WIB)',
    contactPhone: '0817-2233-4455',
    durationEstimate: '1 Hari Praktik Lapangan',
    maxRevisions: 2,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Racikan Starter (40%) • Tahap 2: Pembuatan Silase 500kg (60%)',
    status: 'active',
    totalCompletedJobs: 47,
    provider: {
      id: 'pro-pakan',
      name: 'drh. Hendro Pranoto',
      titleExpertise: 'Praktisi Nutrisi Ternak & Biokonversi Limbah',
      bio: 'Dokter hewan dan formulator pakan fermentasi yang membina 500+ peternak rakyat di Jawa Tengah.',
      rating: 4.9,
      isVerified: true,
    },
    createdAt: '2026-06-09T08:00:00Z',
    updatedAt: '2026-06-12T10:00:00Z',
  },
  {
    id: 'srv-10-uji-mikrobiologi',
    title: 'Uji Laboratorium Keamanan Pangan & Uji Cemaran Mikroba Produk Herbal/Madu',
    shortSummary: 'Pemeriksaan ALT, angka kapang/khamir, Salmonella, dan E.coli untuk syarat izin edar BPOM dan PIRT.',
    description: 'Pengujian resmi sampel produk pangan olahan, madu hutan, jamu, dan minyak atsiri menggunakan metode ISO 17025. Hasil pengujian dilengkapi sertifikat Certificate of Analysis (CoA) untuk kelayakan edar pasar ritel.',
    category: 'uji_lab',
    categoryLabel: 'Uji Lab & Kesuburan Tanah',
    priceStartingFrom: 450000,
    priceUnit: 'parameter uji',
    coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    locationArea: 'Surabaya & Kirim Sampel Seluruh Indonesia',
    fullAddress: 'Lab Biosains Terpadu, Jl. Mulyorejo No. 45, Rungkut, Kota Surabaya, Jawa Timur 60115',
    serviceMode: 'hybrid',
    operatingHours: 'Senin - Jumat (08:00 - 16:30 WIB)',
    contactPhone: '0812-3344-5566',
    durationEstimate: '5 - 7 Hari Kerja',
    maxRevisions: 2,
    hasMilestones: true,
    milestonesSummary: 'Tahap 1: Preparasi Sampel (40%) • Tahap 2: Inkubasi & Penerbitan CoA (60%)',
    status: 'active',
    totalCompletedJobs: 110,
    provider: {
      id: 'pro-lab-pangan',
      name: 'Lab Bio Pangan Mandiri',
      titleExpertise: 'Analis Mikrobiologi Pangan & Sertifikasi Mutu',
      bio: 'Laboratorium riset independen dengan akreditasi pengujian keamanan produk pangan dan ekstrak herbal.',
      rating: 5.0,
      isVerified: true,
    },
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-06-12T14:00:00Z',
  },
  // Tambahan 45 varian layanan unik nusantara untuk memastikan total etalase mencapai 55+ item
  ...Array.from({ length: 45 }).map((_, i) => {
    const index = i + 11;
    const catKeys = ['konsultasi', 'uji_lab', 'pelatihan', 'mekanisasi', 'greenhouse', 'dokumentasi'] as const;
    const cat = catKeys[i % catKeys.length];
    const catLabels: Record<string, string> = {
      konsultasi: 'Konsultasi & Formulasi',
      uji_lab: 'Uji Lab & Kesuburan Tanah',
      pelatihan: 'Pelatihan & Pendampingan Lahan',
      mekanisasi: 'Drone & Mekanisasi Pertanian',
      greenhouse: 'Instalasi Greenhouse & Irigasi IoT',
      dokumentasi: 'Dokumentasi & Branding UMKM',
    };

    const regionalThemes = [
      { city: 'Banda Aceh', prov: 'Aceh', item: 'Kopi Arabika Gayo & Minyak Nilam', expert: 'Teuku Faisal, S.P.' },
      { city: 'Medan', prov: 'Sumatera Utara', item: 'Perkebunan Kelapa Sawit Berkelanjutan', expert: 'Ir. Zulkifli Lubis' },
      { city: 'Padang', prov: 'Sumatera Barat', item: 'Kayu Manis Kerinci & Gambir', expert: 'Siti Rahmawati, M.Si.' },
      { city: 'Palembang', prov: 'Sumatera Selatan', item: 'Karet Alam & Lahan Gambut Terkendali', expert: 'Dedi Kurniawan' },
      { city: 'Bandar Lampung', prov: 'Lampung', item: 'Lada Hitam & Kakao Fermentasi', expert: 'Agus Setiawan, S.P.' },
      { city: 'Bogor', prov: 'Jawa Barat', item: 'Bioteknologi Pupuk Hayati Mikoriza', expert: 'Dr. Retno Wulandari' },
      { city: 'Sukabumi', prov: 'Jawa Barat', item: 'Budidaya Vanili Organik Berstandar Ekspor', expert: 'Kang Asep Sukabumi' },
      { city: 'Semarang', prov: 'Jawa Tengah', item: 'Irigasi Bawah Permukaan Hortikultura', expert: 'Hartono, S.T.' },
      { city: 'Solo', prov: 'Jawa Tengah', item: 'Batik Tulis Alami Warna Indigo & Kulit Kayu', expert: 'Nyai Sekar Wangi' },
      { city: 'Yogyakarta', prov: 'D.I. Yogyakarta', item: 'Kemasan Ramah Lingkungan Serat Pelepah Pisang', expert: 'Raden Mas Danang' },
      { city: 'Malang', prov: 'Jawa Timur', item: 'Pemetikan & Pascapanen Apel Organik', expert: 'Suryo Handoko, M.P.' },
      { city: 'Banyuwangi', prov: 'Jawa Timur', item: 'Formulasi Pupuk Organik Buah Naga Merah', expert: 'Hj. Dewi Lestari' },
      { city: 'Denpasar', prov: 'Bali', item: 'Sistem Pertanian Subak Berbasis Kearifan Lokal', expert: 'I Wayan Sudarma' },
      { city: 'Mataram', prov: 'Nusa Tenggara Barat', item: 'Madu Trigona & Silvopastura Terpadu', expert: 'Lalu M. Zaini' },
      { city: 'Kupang', prov: 'Nusa Tenggara Timur', item: 'Gula Lontar Organik & Pakan Sapi Sabana', expert: 'Yohanes Bria' },
      { city: 'Pontianak', prov: 'Kalimantan Barat', item: 'Pengolahan Lidah Buaya & Lahan Pasang Surut', expert: 'Lim Seng Guan' },
      { city: 'Banjarmasin', prov: 'Kalimantan Selatan', item: 'Budidaya Ikan Baung & Lahan Rawa Lebak', expert: 'Akhmad Baihaki' },
      { city: 'Samarinda', prov: 'Kalimantan Timur', item: 'Rehabilitasi Lahan Pascatambang dengan Sengon', expert: 'Wahyu Nugroho, S.Hut.' },
      { city: 'Makassar', prov: 'Sulawesi Selatan', item: 'Sutra Alam Wajo & Kakao Fermentasi Kolaka', expert: 'Andi Mallarangeng' },
      { city: 'Toraja', prov: 'Sulawesi Selatan', item: 'Konservasi Kopi Arabika Toraja Sapan', expert: 'Papa Ne Rombe' },
      { city: 'Palu', prov: 'Sulawesi Tengah', item: 'Bawang Merah Goreng Palu & Ekstraksi Atsiri', expert: 'Fadly Arifin' },
      { city: 'Manado', prov: 'Sulawesi Utara', item: 'Pala Siau & Olahan Kelapa Terpadu (VCO)', expert: 'Franky Mongisidi' },
      { city: 'Ambon', prov: 'Maluku', item: 'Pemurnian Minyak Cengkeh Tradisional', expert: 'Piter Pattinama' },
      { city: 'Jayapura', prov: 'Papua', item: 'Ekstraksi Minyak Buah Merah & Kopi Wamena', expert: 'Karel Tabuni' },
    ];

    const reg = regionalThemes[i % regionalThemes.length];
    const imageList = [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
      'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&q=80',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80',
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    ];

    const itemResult: ManagedServiceItem = {
      id: `srv-${index.toString().padStart(2, '0')}-${cat}-${reg.prov.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: `${catLabels[cat]}: ${reg.item} Wilayah ${reg.city}`,
      shortSummary: `Layanan pendampingan profesional dan solusi teknis ${reg.item.toLowerCase()} bergaransi rekber resmi di ${reg.city}, ${reg.prov}.`,
      description: `Penyediaan jasa berstandar profesional di bidang ${catLabels[cat]} untuk mendukung produktivitas petani, UMKM, dan koperasi lokal di wilayah ${reg.city}. Pekerjaan mencakup studi pendahuluan, penerapan di lapangan, serta evaluasi akhir dengan perlindungan Rekening Bersama (Escrow) Racik Media.`,
      category: cat,
      categoryLabel: catLabels[cat],
      priceStartingFrom: 250000 + (i * 75000),
      priceUnit: i % 2 === 0 ? 'paket layanan' : 'sesi pendampingan',
      coverImage: imageList[i % imageList.length],
      locationArea: `${reg.city}, ${reg.prov}`,
      fullAddress: `Jl. Raya Sentra Komoditas No. ${index * 3}, ${reg.city}, ${reg.prov}`,
      serviceMode: (i % 3 === 0 ? 'onsite' : i % 3 === 1 ? 'hybrid' : 'online') as 'onsite' | 'hybrid' | 'online',
      operatingHours: 'Senin - Sabtu (08:00 - 17:00 WIB)',
      contactPhone: `0812-${(1000 + index * 17).toString()}-${(2000 + index * 23).toString()}`,
      durationEstimate: `${2 + (i % 5)} - ${5 + (i % 7)} Hari Kerja`,
      maxRevisions: 2 + (i % 2),
      hasMilestones: true,
      milestonesSummary: 'Tahap 1: Analisis Kebutuhan (35%) • Tahap 2: Eksekusi Lapangan (40%) • Tahap 3: Pelaporan & Evaluasi (25%)',
      status: 'active',
      totalCompletedJobs: 15 + (i * 3),
      provider: {
        id: `pro-${reg.city.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
        name: reg.expert,
        titleExpertise: `Spesialis ${catLabels[cat]} & Komoditas ${reg.prov}`,
        bio: `Praktisi terverifikasi dengan pengalaman lebih dari 8 tahun mendampingi komoditas ${reg.item} di ${reg.prov}.`,
        rating: Number((4.7 + (i % 4) * 0.1).toFixed(1)),
        isVerified: true,
      },
      createdAt: `2026-06-${(index % 25 + 1).toString().padStart(2, '0')}T08:00:00Z`,
      updatedAt: `2026-06-${(index % 25 + 5).toString().padStart(2, '0')}T10:00:00Z`,
    };
    return itemResult;
  }),
];

export const INITIAL_MANAGED_SERVICES: ManagedServiceItem[] = REGIONAL_SERVICES_CATALOG;

export function getManagedServices(): ManagedServiceItem[] {
  if (typeof window === 'undefined') return INITIAL_MANAGED_SERVICES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_MANAGED_SERVICES;
    const parsed = JSON.parse(raw) as ManagedServiceItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_MANAGED_SERVICES;
    // Jika data lama hanya berisi 6 item, otomatis gabungkan dengan katalog nusantara baru agar navigasi 50 item bekerja
    if (parsed.length < 50) {
      const existingIds = new Set(parsed.map((p) => p.id));
      const merged = [...parsed, ...INITIAL_MANAGED_SERVICES.filter((m) => !existingIds.has(m.id))];
      saveManagedServices(merged);
      return merged;
    }
    return parsed;
  } catch {
    return INITIAL_MANAGED_SERVICES;
  }
}

export function saveManagedServices(items: ManagedServiceItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function upsertManagedService(item: ManagedServiceItem): ManagedServiceItem[] {
  const current = getManagedServices();
  const exists = current.some((s) => s.id === item.id);
  const next = exists
    ? current.map((s) => (s.id === item.id ? item : s))
    : [item, ...current];
  saveManagedServices(next);
  return next;
}

export function deleteManagedService(id: string): ManagedServiceItem[] {
  const current = getManagedServices();
  const next = current.filter((s) => s.id !== id);
  saveManagedServices(next);
  return next;
}

export function resetManagedServices(): ManagedServiceItem[] {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }
  return INITIAL_MANAGED_SERVICES;
}

export function useManagedServices() {
  const [services, setServices] = useState<ManagedServiceItem[]>(INITIAL_MANAGED_SERVICES);

  useEffect(() => {
    const sync = () => {
      setServices(getManagedServices());
    };
    sync();
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    services,
    upsertService: (item: ManagedServiceItem) => {
      const next = upsertManagedService(item);
      setServices(next);
    },
    removeService: (id: string) => {
      const next = deleteManagedService(id);
      setServices(next);
    },
    resetServices: () => {
      const next = resetManagedServices();
      setServices(next);
    },
  };
}
