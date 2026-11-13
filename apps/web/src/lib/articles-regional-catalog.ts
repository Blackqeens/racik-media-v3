'use client';

import type { EditorialArchiveItem } from '@/lib/editorial-archive';

const ARTICLE_SEEDS = [
  {
    city: 'Takengon',
    prov: 'Aceh',
    author: 'Teuku Ridwan, S.P.',
    type: 'journal' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Fermentasi Anaerob Kopi Arabika Gayo: Peningkatan Mutu Cita Rasa Dataran Tinggi',
    excerpt:
      'Kajian lapangan kelompok tani dataran tinggi Gayo dalam mengendalikan suhu tangki fermentasi guna menjaga konsistensi skor cupping di atas 85 poin.',
  },
  {
    city: 'Medan',
    prov: 'Sumatera Utara',
    author: 'Dr. Maruli Sitompul',
    type: 'paper' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Pemanfaatan Mikoriza Endofit pada Pembibitan Kelapa Sawit Rakyat Berkelanjutan',
    excerpt:
      'Riset kolaboratif yang menunjukkan bagaimana inokulasi jamur mikoriza menurunkan ketergantungan pupuk kimia sintetis hingga 30 persen.',
  },
  {
    city: 'Bukittinggi',
    prov: 'Sumatera Barat',
    author: 'Nadia Fitriani, M.Si.',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Menjaga Kemurnian Kayu Manis Kerinci dari Lereng Bukit Barisan Menuju Pasar Eropa',
    excerpt:
      'Bagaimana standar pengeringan higienis di rumah kaca surya mengangkat nilai jual kulit manis petani di pasar rempah internasional.',
  },
  {
    city: 'Kampar',
    prov: 'Riau',
    author: 'Hendra Syahputra',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Kisah Petani Muda Kampar Mengubah Lahan Gambut Bekas Bakar Jadi Kebun Nanas Produktif',
    excerpt:
      'Pendekatan tata kelola air parit bersekat menjaga kelembapan gambut tetap aman dari kebakaran sekaligus memberi panen rutin mingguan.',
  },
  {
    city: 'Jambi',
    prov: 'Jambi',
    author: 'Fajar Nugroho, S.Hut.',
    type: 'journal' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Agroforestri Karet dan Kopi Liberika di Lahan Pasang Surut Pesisir Timur Jambi',
    excerpt:
      'Diversifikasi tajuk tanaman membantu petani bertahan saat fluktuasi harga getah karet global terjadi sepanjang tahun.',
  },
  {
    city: 'Pagar Alam',
    prov: 'Sumatera Selatan',
    author: 'Rani Kusumawardani',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Teknik Pangkas Produksi Kopi Robusta Lereng Gunung Dempo yang Ramah Ekosistem',
    excerpt:
      'Penerapan pemangkasan bertahap dan penanaman pohon pelindung lamtoro meningkatkan ketahanan cabang produktif di musim kemarau panjang.',
  },
  {
    city: 'Kepahiang',
    prov: 'Bengkulu',
    author: 'Bambang Hermanto',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Rumah Sangrai Bersama: Koperasi Pemuda Desa yang Mengolah Kopi Petik Merah',
    excerpt:
      'Dengan memusatkan alat pengupas dan meja jemur dome, petani tidak lagi menjual biji asalan ke tengkulak luar kota.',
  },
  {
    city: 'Lampung Barat',
    prov: 'Lampung',
    author: 'Dian Puspitasari, M.P.',
    type: 'paper' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Pengendalian Penyakit Busuk Pangkal Batang Lada Hitam Berbasis Trichoderma Lokal',
    excerpt:
      'Isolat cendawan antagonis dari tanah kebun sehat terbukti melindungi perakaran tanaman lada dari serangan patogen Phytophthora.',
  },
  {
    city: 'Pandeglang',
    prov: 'Banten',
    author: 'Ahmad Fauzi',
    type: 'article' as const,
    cat: 'Kerajinan',
    catLabel: 'Kerajinan & Seni',
    title: 'Mengangkat Anyaman Bambu Baduy dan Pandeglang ke Pasar Fungsional Modern',
    excerpt:
      'Teknik pengawetan bambu alami menggunakan perendaman air mengalir dan pengasapan menjaga ketahanan produk kerajinan hingga bertahun-tahun.',
  },
  {
    city: 'Jakarta Selatan',
    prov: 'DKI Jakarta',
    author: 'Citra Amelia',
    type: 'article' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Urban Farming Atap Gedung: Memasok Sayuran Hidroponik Segar Tanpa Rantai Dingin Panjang',
    excerpt:
      'Pemanfaatan atap bangunan komersial untuk sistem NFT bertingkat menurunkan jejak karbon distribusi pangan di kawasan metropolitan.',
  },
  {
    city: 'Lembang',
    prov: 'Jawa Barat',
    author: 'Ir. Kusnadi Wijaya',
    type: 'journal' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Kalibrasi Irigasi Tetes Otomatis pada Budidaya Paprika di Rumah Kaca Tropis',
    excerpt:
      'Pengaturan EC dan pH larutan nutrisi berbasis timer presisi mengurangi pemborosan air dan pupuk terlarut hingga 40 persen.',
  },
  {
    city: 'Garut',
    prov: 'Jawa Barat',
    author: 'Asep Saepudin',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Akar Wangi Garut dan Konservasi Lereng Curam yang Menggerakkan Ekonomi Kerajinan',
    excerpt:
      'Selain menahan erosi tebing perbukitan, akar wangi diolah warga menjadi minyak atsiri sekaligus bahan baku kriya harum bernilai tinggi.',
  },
  {
    city: 'Indramayu',
    prov: 'Jawa Barat',
    author: 'Kartini Suryaningsih',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Budidaya Mangga Gedong Gincu Organik di Luar Musim dengan Pemangkasan Terjadwal',
    excerpt:
      'Rekayasa pembungaan alami tanpa residu zat pengatur tumbuh berlebihan menghasilkan buah manis beraroma kuat sepanjang tahun.',
  },
  {
    city: 'Brebes',
    prov: 'Jawa Tengah',
    author: 'Slamet Riyadi, S.P.',
    type: 'paper' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Transisi Benih Biji Botani (TSS) Bawang Merah untuk Produktivitas Lahan Pesisir Brebes',
    excerpt:
      'Penggunaan True Shallot Seed memangkas biaya penyimpanan umbi bibit sekaligus memutus siklus penularan virus laten pada generasi tanam baru.',
  },
  {
    city: 'Solo',
    prov: 'Jawa Tengah',
    author: 'Retno Pamungkas',
    type: 'article' as const,
    cat: 'Kerajinan',
    catLabel: 'Kerajinan & Seni',
    title: 'Pewarna Alam Indigofera dan Soga dalam Regenerasi Industri Batik Ramah Sungai',
    excerpt:
      'Kelompok pembatik beralih ke pasta pewarna nabati sehingga limbah cair celupan aman diolah dengan filter bio-remediasi sederhana.',
  },
  {
    city: 'Wonosobo',
    prov: 'Jawa Tengah',
    author: 'Eko Prasetiyo',
    type: 'journal' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Terasering Berbasis Tanaman Semusim dan Pohon Peneduh di Dataran Tinggi Dieng',
    excerpt:
      'Pola tanam sabuk gunung mencegah longsornya tanah vulkanik subur saat intensitas hujan puncak berlangsung.',
  },
  {
    city: 'Kulon Progo',
    prov: 'D.I. Yogyakarta',
    author: 'Wulandari Putri, M.Si.',
    type: 'paper' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Optimalisasi Ekstraksi Cold-Pressed Minyak Kelapa Murni (VCO) Skala Kelompok Tani',
    excerpt:
      'Pengendalian suhu ruang fermentasi di bawah 32 derajat Celcius menjaga kejernihan warna serta kadar asam laurat di atas 48 persen.',
  },
  {
    city: 'Bantul',
    prov: 'D.I. Yogyakarta',
    author: 'Bagus Santosa',
    type: 'article' as const,
    cat: 'Kerajinan',
    catLabel: 'Kerajinan & Seni',
    title: 'Gerabah Kasongan Berglasir Abu Sekam Padi: Inovasi Limbah Tani Menjadi Produk Estetis',
    excerpt:
      'Silika alami dari abu pembakaran sekam menghasilkan efek warna glasir keramik unik yang diminati arsitek hotel butik.',
  },
  {
    city: 'Kota Batu',
    prov: 'Jawa Timur',
    author: 'Dr. Hendro Susilo',
    type: 'journal' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Rehabilitasi Kebun Apel Manalagi Menggunakan Kompos Kotoran Sapi Terfermentasi Penuh',
    excerpt:
      'Pemulihan pH dan kandungan C-organik tanah mengembalikan kerenyahan buah apel dataran tinggi setelah dekade pemakaian pupuk kimia.',
  },
  {
    city: 'Banyuwangi',
    prov: 'Jawa Timur',
    author: 'Luluk Hidayati',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Desa Wisata Kopi Osing Kemiren: Menjual Pengalaman Seduh Tradisional Bersama Hasil Kebun',
    excerpt:
      'Kolaborasi ibu-ibu sangrai kayu bakar dan pemuda pemandu kebun menjadikan kopi rakyat sebagai penggerak ekonomi desa mandiri.',
  },
  {
    city: 'Jember',
    prov: 'Jawa Timur',
    author: 'Agung Pribadi, M.P.',
    type: 'paper' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Seleksi Klon Kakao Mulia Jawa Timur Tahan Penggerek Buah pada Pola Tanam Campuran',
    excerpt:
      'Uji ketahanan lapang selama tiga musim panen mengidentifikasi klon produktif dengan ukuran biji seragam bagi pengrajin cokelat.',
  },
  {
    city: 'Tabanan',
    prov: 'Bali',
    author: 'I Made Suardana',
    type: 'journal' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Sistem Subak Jatiluwih sebagai Model Ketahanan Pangan Berbasis Kearifan Lokal Abad ke-21',
    excerpt:
      'Pengaturan giliran air irigasi tradisional terbukti menekan hama wereng secara alami tanpa ketergantungan insektisida keras.',
  },
  {
    city: 'Kintamani',
    prov: 'Bali',
    author: 'Ni Luh Putu Sari',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Harmoni Kebun Kopi dan Jeruk Keprok Kintamani dalam Sistem Pertanian Tanpa Limbah',
    excerpt:
      'Kulit buah kopi difermentasi menjadi pupuk cascara dan kompos jeruk untuk mengembalikan hara ke tanah vulkanis Gunung Batur.',
  },
  {
    city: 'Lombok Timur',
    prov: 'Nusa Tenggara Barat',
    author: 'Lalu Supriadi',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Lebah Tanpa Sengat Trigona: Sumber Penghasilan Tambahan Penjaga Penyerbukan Hutan NTB',
    excerpt:
      'Budidaya madu kelulut di pekarangan rumah membantu petani menjaga kelestarian pohon bunga sekaligus meraih panen madu kaya propolis.',
  },
  {
    city: 'Kupang',
    prov: 'Nusa Tenggara Timur',
    author: 'Yohanes Kolo, S.P.',
    type: 'paper' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Sorgum Bioguma sebagai Pangan Alternatif Tangguh Kekeringan di Wilayah Sabana Timor',
    excerpt:
      'Kemampuan tumbuh dengan curah hujan minim serta ratun berulang menjadikan sorgum tumpuan gizi dan pakan ternak lahan kering.',
  },
  {
    city: 'Kapuas Hulu',
    prov: 'Kalimantan Barat',
    author: 'Markus Sialang',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Panen Lestari Madu Hutan Danau Sentarum: Menjaga Pohon Sialang Tetap Berdiri Tegak',
    excerpt:
      'Aturan adat hanya memanen sebagian sarang kepala madu memastikan koloni lebah Apis dorsata terus kembali setiap musim berbunga.',
  },
  {
    city: 'Palangka Raya',
    prov: 'Kalimantan Tengah',
    author: 'Rini Hartati, M.Sc.',
    type: 'paper' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Aplikasi Biochar Sekam Padi dan Dolomit untuk Meningkatkan Ketersediaan Fosfor Tanah Gambut',
    excerpt:
      'Pori mikro biochar mengikat unsur hara sehingga tidak mudah tercuci air hujan pada budidaya sayuran daun di Kalimantan Tengah.',
  },
  {
    city: 'Banjarbaru',
    prov: 'Kalimantan Selatan',
    author: 'Akhmad Muzakir',
    type: 'journal' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Sistem Surjan di Lahan Rawa Lebak: Sinergi Budidaya Padi, Ikan Rawa, dan Tanaman Sayur',
    excerpt:
      'Penataan gundukan tanah terangkat dan tabukan berair memaksimalkan produksi dua jenis pangan dalam satu hamparan rawa.',
  },
  {
    city: 'Kutai Kartanegara',
    prov: 'Kalimantan Timur',
    author: 'Wahyu Ramadhan, S.Hut.',
    type: 'journal' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Reklamasi Lahan Pascatambang Menggunakan Tanaman Pionir Lokal dan Kompos Tandan Sawit',
    excerpt:
      'Kombinasi leguminosa penutup tanah dan sengon mempercepat pembentukan serasah organik dalam dua tahun pertama penanaman.',
  },
  {
    city: 'Toraja Utara',
    prov: 'Sulawesi Selatan',
    author: 'Paulus Rante, S.P.',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Pengolahan Semi-Washed Khas Toraja dan Pengaruhnya terhadap Profil Manis Karamel Kopi Sapan',
    excerpt:
      'Proses perendaman selektif menggunakan air pegunungan jernih mempertahankan karakter herbal segar kopi dataran tinggi Sulawesi.',
  },
  {
    city: 'Wajo',
    prov: 'Sulawesi Selatan',
    author: 'Andi Tenri Bau',
    type: 'article' as const,
    cat: 'Kerajinan',
    catLabel: 'Kerajinan & Seni',
    title: 'Menghidupkan Kembali Kebun Murbei dan Pemintalan Sutera Alam Lipa Sabbe di Wajo',
    excerpt:
      'Integrasi hulu-hilir dari pemeliharaan ulat sutera hingga tenun gedogan tradisional menjamin pasokan benang berkualitas bagi penenun.',
  },
  {
    city: 'Palu',
    prov: 'Sulawesi Tengah',
    author: 'Fadly Rahman',
    type: 'journal' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Karakteristrik Tanah Aluvial Lembah Palu yang Melahirkan Bawang Merah Goreng Renyah Alami',
    excerpt:
      'Kandungan air umbi yang rendah pada varietas bawang batu lokal menghasilkan aroma gurih dan tekstur renyah tahan lama tanpa tambahan tepung.',
  },
  {
    city: 'Minahasa',
    prov: 'Sulawesi Utara',
    author: 'Franky Rumokoy',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Pala Siau dan Kelapa Terpadu: Mengubah Limbah Sabut menjadi Cocopeat Ekspor Bernilai Tinggi',
    excerpt:
      'Pengolahan seluruh bagian buah kelapa menciptakan nilai tambah berlapis dari kopra putih, VCO, hingga media tanam hortikultura.',
  },
  {
    city: 'Gorontalo',
    prov: 'Gorontalo',
    author: 'Hasyim Katili, M.P.',
    type: 'paper' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Pengeringan Mekanis Tongkol Jagung Hemat Energi Menggunakan Tungku Sekam dan Tongkol Kering',
    excerpt:
      'Penerapan pengeringan pascapanen cepat menekan kontaminasi aflatoksin di bawah ambang aman pada panen raya musim hujan.',
  },
  {
    city: 'Ambon',
    prov: 'Maluku',
    author: 'Johan Pattiselanno',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Merawat Pohon Cengkeh Tuni Berusia Ratusan Tahun di Kepulauan Lease dengan Pemupukan Organik',
    excerpt:
      'Pengembalian daun gugur ke piringan akar dan penyemprotan nutrisi daun alami membantu menstabilkan siklus panen raya cengkeh Maluku.',
  },
  {
    city: 'Ternate',
    prov: 'Maluku Utara',
    author: 'Suharto Alting',
    type: 'journal' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Distilasi Uap Modern Minyak Atsiri Pala dan Daun Cengkeh untuk Industri Farmasi Alami',
    excerpt:
      'Penggunaan ketel stainless steel menjaga kemurnian kadar eugenol dan miristisin tanpa kontaminasi logam berat.',
  },
  {
    city: 'Wamena',
    prov: 'Papua Pegunungan',
    author: 'Karel Hubi',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Kopi Organik Lembah Baliem: Dari Kebun Tanpa Pupuk Sintetis Menuju Kedai Kopi Nusantara',
    excerpt:
      'Ketinggian 1.600 meter dan kompos alami dedaunan pegunungan melahirkan biji kopi berkarakter bunga liar yang dicari penikmat specialty.',
  },
  {
    city: 'Jayapura',
    prov: 'Papua',
    author: 'Yuliana Suebu, S.T.P.',
    type: 'paper' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Ekstraksi Higienis Minyak Buah Merah Papua untuk Penguatan Produk Pangan Fungsional UMKM',
    excerpt:
      'Pengolahan bertahap pada suhu terkendali mempertahankan kadar tokoferol dan beta-karoten alami buah merah pegunungan tengah.',
  },
  {
    city: 'Subang',
    prov: 'Jawa Barat',
    author: 'Deden Kurnia',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Pengolahan Limbah Kulit Nanas Madu Subang menjadi Enzim Bromelain dan Pakan Fermentasi',
    excerpt:
      'Ekonomi sirkular sentra nanas mengubah sisa pengupasan industri olahan menjadi produk sampingan menguntungkan bagi peternak lokal.',
  },
  {
    city: 'Cirebon',
    prov: 'Jawa Barat',
    author: 'Nana Supriatna',
    type: 'article' as const,
    cat: 'Kerajinan',
    catLabel: 'Kerajinan & Seni',
    title: 'Desain Modular Furnitur Rotan Lipat untuk Apartemen Perkotaan dan Kafe Minimalis',
    excerpt:
      'Pengrajin Cirebon mengombinasikan sambungan knock-down berpresisi agar produk rotan lebih hemat volume kirim antar-pulau.',
  },
  {
    city: 'Magelang',
    prov: 'Jawa Tengah',
    author: 'Budi Utomo',
    type: 'journal' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Vermikompos Cacing Lumbricus rubellus sebagai Media Semai Bebas Jamur Patogen',
    excerpt:
      'Uji pembibitan cabai dan tomat menunjukkan tingkat keberhasilan tumbuh bibit mencapai 94 persen pada campuran media kascing.',
  },
  {
    city: 'Boyolali',
    prov: 'Jawa Tengah',
    author: 'Tri Wahyuni, S.Pt.',
    type: 'paper' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Silase Pakan Hijauan Rumput Pakchong sebagai Penyangga Produksi Susu Sapi Perah Musim Kemarau',
    excerpt:
      'Fermentasi kedap udara selama 21 hari menghasilkan pakan berprotein tinggi yang tetap segar dan disukai ternak hingga enam bulan.',
  },
  {
    city: 'Probolinggo',
    prov: 'Jawa Timur',
    author: 'Haji Misbahuddin',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Rumah Kemas Bersama Petani Mangga Arumanis: Menjaga Kesegaran Buah Selama Pengiriman Darat',
    excerpt:
      'Perlakuan air hangat pascapanen dan kotak karton berventilasi menekan tingkat kerusakan buah selama perjalanan antarprovinsi.',
  },
  {
    city: 'Tuban',
    prov: 'Jawa Timur',
    author: 'Samsul Arifin',
    type: 'article' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Peran Unsur Silika dan Kalsium Alami dalam Memperkuat Batang Padi Terhadap Serangan Angin',
    excerpt:
      'Penguatan dinding sel epidermis daun dan batang padi mencegah kerebahan saat bulir menguning menjelang panen.',
  },
  {
    city: 'Karawang',
    prov: 'Jawa Barat',
    author: 'H. Ujang Suryana',
    type: 'journal' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Efisiensi Tanam Jajar Legowo 2:1 Menggunakan Alat Tanam Dorong Manual di Lahan Sawah Irigasi',
    excerpt:
      'Penataan barisan lega mempermudah penyiangan mekanis, melancarkan sirkulasi udara, dan menekan populasi hama tikus sawah.',
  },
  {
    city: 'Sukabumi',
    prov: 'Jawa Barat',
    author: 'Rismawati Dewi',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Polinasi Manual Bunga Vanili Planifolia: Ketelitian Jam Pagi Penentu Mutu Polong Ekspor',
    excerpt:
      'Penyarian sebelum pukul 10 pagi dan proses curing bertahap menghasilkan kadar vanilin alami di atas dua persen.',
  },
  {
    city: 'Sumedang',
    prov: 'Jawa Barat',
    author: 'Kang Dedi Mulyadi',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Ubi Cilembu: Menjaga Indikasi Geografis Tanah Lembah Tanjungsari agar Cita Rasa Tetap Autentik',
    excerpt:
      'Komunitas petani menyepakati rotasi tanaman kacang-kacangan dan kompos organik agar madu alami umbi Cilembu tetap khas saat dipanggang.',
  },
  {
    city: 'Purbalingga',
    prov: 'Jawa Tengah',
    author: 'Siti Aminah',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Produksi Gula Semut Kelapa Organik Berstandar Keamanan Pangan untuk Pasar Kopi Spesialti',
    excerpt:
      'Pengendalian kadar air di bawah dua persen melalui pengayakan bertingkat menjaga keawetan gula kelapa kristal tanpa pengawet.',
  },
  {
    city: 'Nganjuk',
    prov: 'Jawa Timur',
    author: 'Joko Prasetyo, S.P.',
    type: 'paper' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Pemetaan Kesesuaian Unsur Hara Kalium terhadap Bobot dan Daya Simpan Bawang Merah Tajuk',
    excerpt:
      'Pemberian kalium berimbang pada fase pembentukan umbi menghasilkan bawang lebih padat dengan susut simpan rendah.',
  },
  {
    city: 'Sidoarjo',
    prov: 'Jawa Timur',
    author: 'Indah Permatasari',
    type: 'article' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Standar Pengemasan Vakum dan Katup Satu Arah untuk Memperpanjang Umur Simpan Produk UMKM',
    excerpt:
      'Pemilihan ketebalan kemasan nilon food-grade mencegah oksidasi lemak pada kopi sangrai, bumbu kering, dan pangan lokal.',
  },
  {
    city: 'Singkawang',
    prov: 'Kalimantan Barat',
    author: 'Liem Kiat Seng',
    type: 'journal' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Manajemen Pendinginan Akar Hidroponik di Wilayah Beriklim Panas Dekat Garis Khatulistiwa',
    excerpt:
      'Penanaman tandon nutrisi di bawah permukaan tanah dan isolasi pipa menjaga suhu larutan tetap ideal bagi tanaman selada renyah.',
  },
  {
    city: 'Tanjung Pinang',
    prov: 'Kepulauan Riau',
    author: 'Raja Hafizuddin',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Rumah Pengolahan Hasil Laut & Rumput Laut Pulau Bintan untuk Ketahanan Ekonomi Pesisir',
    excerpt:
      'Pelatihan pengeringan higienis bagi keluarga nelayan melahirkan camilan sehat dan agar-agar rumput laut siap kirim antarkota.',
  },
  {
    city: 'Pangkal Pinang',
    prov: 'Kepulauan Bangka Belitung',
    author: 'Zulkarnaen, S.P.',
    type: 'article' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Merawat Kejayaan Lada Putih Muntok dengan Tiang Panjat Hidup dan Pupuk Kompos Terkendali',
    excerpt:
      'Penggunaan pohon gamal sebagai panjatan hidup memberikan naungan sejuk dan serasah organik alami bagi kebun lada putih Bangka.',
  },
  {
    city: 'Kendari',
    prov: 'Sulawesi Tenggara',
    author: 'La Ode Syahrir',
    type: 'journal' as const,
    cat: 'Pertanian',
    catLabel: 'Pertanian & Pangan',
    title: 'Pengolahan Kacang Mete Tanpa Pecah Menggunakan Pengukusan Tekanan Terkontrol di Muna',
    excerpt:
      'Peralatan pemecah kulit mete ergonomis menjaga keutuhan biji kupas putih utuh di atas 85 persen untuk pasar ekspor.',
  },
  {
    city: 'Mamuju',
    prov: 'Sulawesi Barat',
    author: 'Hasrul Hadi, M.P.',
    type: 'paper' as const,
    cat: 'Inovasi',
    catLabel: 'Inovasi & Teknologi',
    title: 'Integrasi Ternak Kambing dan Perkebunan Kakao sebagai Sumber Pupuk Organik Mandiri Petani',
    excerpt:
      'Kulit buah kakao diolah menjadi pakan fermentasi bernutrisi sementara kotoran kambing dikembalikan ke kebun kakao dalam bentuk kompos.',
  },
  {
    city: 'Sorong',
    prov: 'Papua Barat Daya',
    author: 'Beatrix Kafiar',
    type: 'story' as const,
    cat: 'Sosial',
    catLabel: 'Sosial & Komunitas',
    title: 'Sagu Hutan Alam Sorong: Mengembangkan Tepung Sagu Halus Modern sebagai Pangan Masa Depan',
    excerpt:
      'Penerapan alat parut dan pengendapan bersih menjadikan tepung sagu tradisional siap masuk ke industri roti dan mi bebas gluten.',
  },
];

const ARTICLE_IMAGES: Record<string, string[]> = {
  Pertanian: [
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80',
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
  ],
  Inovasi: [
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80',
    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80',
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&q=80',
  ],
  Kerajinan: [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=800&q=80',
  ],
  Sosial: [
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80',
    'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&q=80',
  ],
};

export const REGIONAL_ARTICLES_CATALOG: EditorialArchiveItem[] = ARTICLE_SEEDS.map(
  (seed, idx) => {
    const num = (idx + 1).toString().padStart(2, '0');
    const slugBase = seed.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    const imgs = ARTICLE_IMAGES[seed.cat] || ARTICLE_IMAGES.Pertanian;

    return {
      id: `art-reg-${num}`,
      slug: `${slugBase}-reg-${num}`,
      entityType: 'article',
      sourceRole: idx % 4 === 3 ? 'member' : 'author',
      submitterName: seed.author,
      submitterOrigin: `${seed.city}, ${seed.prov}`,
      title: seed.title,
      excerpt: seed.excerpt,
      body: `${seed.excerpt}\n\nLaporan mendalam dari ${seed.city}, ${seed.prov} ini disusun oleh ${seed.author} melalui dokumentasi langsung di lapangan bersama pelaku usaha lokal dan pendamping ekosistem Racik Media Nusantara. Melalui pencatatan terstruktur dan adopsi teknologi tepat guna yang selaras dengan kelestarian lingkungan setempat, komunitas lokal terbukti mampu meningkatkan kualitas komoditas sekaligus memperluas jangkauan pemasaran antarpulau.`,
      category: seed.cat,
      categoryLabel: seed.catLabel,
      contentType: seed.type,
      image: imgs[idx % imgs.length],
      publishedAt: new Date(Date.now() - (idx + 2) * 20 * 60 * 60 * 1000).toISOString(),
      readTimeMinutes: 5 + (idx % 5),
      rating: Number((4.7 + (idx % 4) * 0.1).toFixed(1)),
      soldCount: 45 + (idx * 9) % 320,
      status: 'published_homepage',
      publishedToHomepage: true,
      writingVerified: true,
      imageThemeVerified: true,
    };
  },
);

export function findRegionalArticleBySlugOrId(
  slugOrId: string,
): EditorialArchiveItem | undefined {
  return REGIONAL_ARTICLES_CATALOG.find(
    (a) => a.slug === slugOrId || a.id === slugOrId,
  );
}

