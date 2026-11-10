# Draft Matriks Batasan Dashboard dan Role

Dokumen ini menjadi acuan untuk menentukan fitur yang boleh dilihat dan dijalankan oleh setiap role. Hak akses frontend tidak boleh dianggap pengaman utama. Pengaman tetap harus dilakukan pada middleware, API, dan Row Level Security Supabase.

## 1. Prinsip utama

1. Guest dapat membuka informasi publik.
2. Member aktif adalah role dasar setiap akun.
3. Satu akun dapat memiliki beberapa role aktif.
4. Role menentukan menu dan aksi, bukan identitas akun secara tunggal.
5. Menu yang disembunyikan bukan izin akses. Route, API, dan database tetap harus memvalidasi role.
6. Pemilik data hanya dapat mengubah data miliknya.
7. Admin tidak boleh memperoleh seluruh hak hanya berdasarkan tampilan menu.
8. Moderator berbeda dari admin dan tidak boleh mengubah verifikasi atau laporan keuangan.
9. Master admin bersifat khusus dan sebaiknya hanya diberikan kepada akun yang melakukan pengelolaan sistem.
10. Kontributor adalah kemampuan, bukan role terpisah: semua role pengguna dapat menulis dan mengajukan konten kepada Moderator.
11. Master Admin dapat mengambil alih akses role lain; setiap penggunaan override wajib tercatat di audit log.

## 2. Status akses

| Simbol | Arti |
|---|---|
| D | Bisa melihat dashboard atau halaman |
| U | Bisa membuka dan mengelola |
| B | Bisa membuat atau mengajukan, tetapi belum mempunyai hak final |
| T | Tidak tersedia untuk role tersebut |
| M | Membutuhkan persetujuan, verifikasi, atau status aktif |

## 3. Matriks halaman umum

| Halaman atau fungsi | Guest | Member | Seller | Distributor | Penyedia Jasa | Moderator | Admin | Master Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Beranda dan halaman publik | D | D | D | D | D | D | D | D |
| Artikel yang sudah diterbitkan | D | D | D | D | D | D | D | D |
| Login dan daftar | D | T | T | T | T | T | T | T |
| Keranjang dan checkout | T | U | U | U | U | U | U | U |
| Profil dan dashboard pribadi | T | U | U | U | U | U | U | U |
| Menulis dan mengajukan konten | T | B | B | B | B | B | B | B |
| Menyetujui dan menerbitkan konten | T | T | T | T | T | U | T | U |
| Administrasi dan pemantauan keuangan | T | T | T | T | T | T | U | U |
| Analisis/perhitungan keuangan mendalam | T | T | T | T | T | T | T | U |
| Override akses role | T | T | T | T | T | T | T | U* |

## 4. Matriks dashboard role

### 4.1 Guest atau belum login

Akses:

- Membaca halaman publik.
- Membuka login dan registrasi.
- Mengisi keranjang sesuai kebijakan guest checkout.
- Memilih tema tampilan.

Batasan:

- Tidak dapat membuka dashboard.
- Tidak dapat melihat profil pengguna lain yang bersifat privat.
- Tidak dapat membuat pesanan atau artikel sebagai pengguna terautentikasi.
- Tidak dapat membuka halaman `/checkout`, `/profile`, `/orders`, `/bookmarks`, dan `/dashboard`.
- Tidak dapat membuka dashboard seller, moderator, atau admin.

### 4.2 Member

Akses utama:

- `/dashboard`
- `/profile`
- `/orders`
- `/orders/[id]`
- `/bookmarks`
- `/checkout`
- marketplace, layanan, artikel, dan event publik
- tema, keranjang, dan notifikasi miliknya

Akses:

- Menulis ide, cerita, artikel, atau konten lainnya.
- Mengajukan konten untuk ditinjau Moderator.
- Mengajukan menjadi seller.
- Mengajukan menjadi distributor.
- Mengajukan menjadi penyedia jasa.

Batasan:

- Tidak dapat membuat produk aktif sebagai seller sebelum role `seller` aktif.
- Tidak dapat mengakses pesanan milik pengguna lain.
- Tidak dapat mengakses laporan seller atau laporan keuangan.
- Tidak dapat melihat atau menjalankan halaman moderasi.
- Tidak dapat membuka route `/admin/*`.
- Tidak dapat mengubah role miliknya sendiri.

### 4.3 Kontributor konten (semua role)

Kontributor bukan role tersendiri. Member, seller, distributor, penyedia jasa, moderator, admin, dan Master Admin dapat membuat draf serta mengajukannya untuk moderasi.

Batasan:

- Konten tidak dapat diterbitkan langsung oleh pembuatnya.
- Hanya Moderator atau Master Admin yang dapat menyetujui dan menerbitkan konten.
- Pembuat hanya dapat mengubah draf atau konten miliknya yang dikembalikan untuk revisi.
- Konten yang belum berstatus `published` tidak boleh tampil pada endpoint publik.

### 4.4 Seller

Akses tambahan selain seluruh hak member:

- `/seller/dashboard`
- `/seller/products`
- `/seller/products/new`
- `/seller/orders`
- `/seller/reports`
- mengelola produk miliknya
- melihat pesanan yang masuk pada toko miliknya
- mengubah stok dan status produk miliknya

Batasan:

- Tidak dapat mengakses data seller lain.
- Tidak dapat mengubah atau menghapus produk milik seller lain.
- Tidak dapat mengubah pesanan pengguna lain.
- Tidak dapat mengakses verifikasi seller, moderasi, atau laporan keuangan admin.
- Tidak dapat memberi role pada akun lain.
- Akses produk dan pesanan tetap harus dibatasi memakai `seller_id` atau `owner_id`.
- Verifikasi KYC, status suspended, dan status pending harus menghalangi penjualan aktif.

Untuk seller yang belum aktif, dashboard seller dapat menampilkan status pengajuan dan tautan ke `/seller/register`. Akses tetap tidak boleh diberikan sebelum role aktif atau persetujuan seller selesai.

### 4.5 Distributor

Akses tambahan yang disarankan:

- Dashboard distributor khusus.
- Melihat stok atau pasokan wilayah yang ditugaskan.
- Mengelola hubungan pengiriman.
- Melihat pesanan di area distribusi yang ditugaskan.

Batasan:

- Belum boleh memakai dashboard seller kecuali juga memiliki role seller aktif.
- Tidak dapat mengubah harga produk milik seller.
- Tidak dapat mengakses pembeli di luar pesanan yang masuk ke wilayahnya.
- Tidak dapat mengakses laporan keuangan platform.
- Tidak dapat memverifikasi akun atau seller lain.
- Pencakupan akses perlu dibatasi berdasarkan wilayah, kontrak, dan distributor yang ditugaskan.

Catatan: role ini tersedia dalam model database, tetapi belum mempunyai route dan halaman frontend khusus pada implementasi saat ini.

### 4.6 Penyedia Jasa

Akses tambahan yang disarankan:

- Dashboard penyedia layanan khusus.
- Membuat dan mengubah layanan miliknya.
- Melihat permintaan dan pesanan layanan miliknya.
- Mengubah status pekerjaan yang menjadi tanggung jawabnya.

Batasan:

- Tidak dapat mengubah layanan milik penyedia lain.
- Tidak dapat mengakses pesanan pembeli yang tidak ditujukan kepadanya.
- Tidak dapat menarik dana tanpa proses escrow atau pencairan yang sah.
- Tidak dapat memverifikasi pengguna atau menyelesaikan sengketa atas nama admin.
- Tidak dapat mengakses laporan keuangan platform.

Catatan: detail role database saat ini perlu konsisten dengan label `service_provider`, dan route khusus belum tersedia.

### 4.7 Moderator

Akses tambahan:

- `/admin/moderation`
- melihat antrean konten atau laporan yang perlu ditinjau
- menyetujui, menerbitkan, meminta revisi, atau menolak konten
- menutup pelanggaran ringan sesuai SOP
- melihat alasan pelaporan

Batasan:

- Tidak dapat mengubah role akun.
- Tidak dapat memberi atau mencabut hak admin.
- Tidak dapat memverifikasi seller.
- Tidak dapat mengakses laporan keuangan.
- Tidak dapat mengubah konfigurasi platform.
- Tidak dapat menghapus akun secara permanen.
- Tidak dapat mengubah data transaksi yang telah final.
- Tidak dapat membuka dashboard administrasi, verifikasi seller, atau laporan keuangan.

### 4.8 Admin

Akses tambahan:

- `/admin/dashboard`
- `/admin/seller-verification`
- `/admin/financial-report`
- mengelola kebutuhan administrasi platform dan akun
- memproses verifikasi seller
- memantau transaksi, escrow, dan catatan keuangan

Batasan:

- Tidak dapat melakukan moderasi konten.
- Tidak melakukan analisis atau perhitungan keuangan mendalam; pekerjaan tersebut ditangani Master Admin.
- Tidak dapat mengambil alih akses role.
- Perubahan administratif harus dicatat audit log.
- Tidak dapat memanfaatkan Session Service Role Key atau Secret Key dari browser.

### 4.9 Master Admin

Akses tambahan:

- Seluruh akses Admin dan Moderator.
- Mengelola arah, konfigurasi, dan tanggung jawab platform.
- Mengambil alih akses role lain untuk penanganan khusus; setiap override wajib dicatat dan diaudit.
- Menangani analisis/perhitungan keuangan mendalam atau menugaskannya.

Batasan:

- Jumlah master admin harus dibatasi dan tidak boleh dibuat otomatis.
- Tidak boleh diberikan lewat registrasi normal.
- Setiap pemberian master admin memerlukan persetujuan dua pihak atau audit manual.
- Pelaku dan waktu perubahan harus dapat ditelusuri.
- Secret Key atau Service Role Key tidak boleh berada di frontend.

## 5. Matriks aksi lintas role

| Aksi | Member | Seller | Distributor | Penyedia Jasa | Moderator | Admin | Master Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Membuat dan mengajukan konten | B | B | B | B | B | B | B |
| Menyetujui dan menerbitkan konten | T | T | T | T | U | T | U |
| Mengelola produk milik sendiri | T | T | T | T | T | T | U* |
| Mengelola layanan milik sendiri | T | T | T | T | T | T | U* |
| Memverifikasi seller | T | T | T | T | T | U | U |
| Mengelola administrasi platform | T | T | T | T | T | U | U |
| Memantau keuangan | T | T | T | T | T | U | U |
| Analisis/perhitungan mendalam | T | T | T | T | T | T | U |
| Override role | T | T | T | T | T | T | U* |

`U*` untuk override wajib menghasilkan catatan audit.

## 6. Pembatasan route saat ini

Implementasi middleware saat ini melindungi route berikut:

| Kelompok route | Persyaratan saat ini |
|---|---|
| `/dashboard/*`, `/profile/*`, `/bookmarks/*`, `/orders/*`, `/checkout/*` | Harus login |
| `/articles/write/*` | Harus login |
| `/seller/dashboard/*`, `/seller/products/*`, `/seller/orders/*`, `/seller/reports/*` | Login dan role `seller` atau `vendor` aktif |
| `/admin/dashboard/*`, `/admin/seller-verification/*`, `/admin/financial-report/*` | Login dan role `admin` atau `master_admin` aktif |
| `/admin/moderation/*` | Login dan role `moderator` atau `master_admin` aktif |
| `/login`, `/register`, `/forgot-password` | Guest; pengguna login dialihkan ke dashboard |

### Batasan yang perlu diperbaiki

1. Moderasi hanya boleh dijalankan Moderator atau Master Admin.
2. Admin menangani administrasi dan pemantauan keuangan, bukan moderasi atau analisis keuangan mendalam.
3. Master Admin adalah role terpisah, tidak diberikan melalui registrasi publik, dan override-nya selalu diaudit.
4. Route seller menggunakan role `seller`; nama “agen” tidak mengubah role database `distributor`.
5. Semua role terautentikasi dapat mengajukan konten, tetapi hanya konten yang disetujui Moderator yang dapat dipublikasikan.
6. Navbar hanya menampilkan menu sesuai role aktif.
7. Middleware tidak boleh menjadi satu-satunya pengaman karena route dapat dipanggil API langsung.

## 7. Batasan rute server dan data

Untuk setiap endpoint API disarankan validasi:

1. Sesi login masih valid.
2. Status akun aktif.
3. Role aktif sesuai route.
4. Kepemilikan data.
5. Status objek tidak terminal atau tidak dikunci.
6. KYC, verifikasi, atau persetujuan sudah terpenuhi.
7. Setiap aksi sensitif dicatat dalam audit log.

Contoh pembatasan:

- Seller dapat mengubah produk hanya jika `product.owner_id = user.id`.
- Member dapat melihat pesanan hanya jika `order.buyer_id = user.id`.
- Seller dapat melihat pesanan masuk hanya jika `order.seller_id = user.id`.
- Semua kontributor hanya dapat mengubah konten miliknya (`content.author_id = user.id`).
- Moderator dapat mengubah status konten, tetapi tidak dapat mengubah owner-nya.
- Admin dapat memverifikasi seller, tetapi perubahan role tetap mempunyai audit log.
- Financial report harus dibatasi dengan permission khusus, bukan hanya role `admin`.

## 8. Penggunaan multi-role

Contoh:

- Akun dapat menjadi member dan seller.
- Akun dapat memiliki role member bersama role operasionalnya; kontributor bukan role terpisah.
- Akun dapat menjadi member, seller, dan moderator.
- Akun dapat menjadi admin dan member.

Urutan dashboard yang disarankan:

1. Jika user memilih role aktif, dashboard mengikuti pilihan tersebut.
2. Jika belum memilih, dashboard menentukan role tertinggi yang aman.
3. Urutan tampilan role aktif: master admin, admin, moderator, seller, distributor, penyedia jasa, member.
4. Menu harus mengikuti role aktif, sementara data global tetap memperlihatkan seluruh role milik pengguna.
5. Setelah role ditambahkan atau dicabut, session dan menu perlu disinkronkan ulang.

## 9. Draft navbar berdasarkan akses

### Guest

- Masuk
- Daftar
- Artikel
- Tema
- Keranjang publik

### Member

- Dashboard Member
- Profil
- Pesanan Saya
- Artikel Tersimpan
- Artikel
- Tema
- Logout

### Seller

- Dashboard Seller
- Produk Saya
- Pesanan Masuk
- Laporan Seller
- Dashboard Member
- Logout

### Distributor

- Dashboard Distributor
- Distribusi atau stok
- Pesanan wilayah
- Dashboard Member
- Logout

### Penyedia Jasa

- Dashboard Penyedia Jasa
- Layanan Saya
- Permintaan/Pekerjaan
- Dashboard Member
- Logout

### Moderator

- Dashboard Moderasi
- Antrean Konten
- Laporan Pelanggaran
- Dashboard Member
- Logout

### Admin

- Dashboard Admin
- Verifikasi Seller
- Laporan Keuangan
- Administrasi pengguna
- Dashboard Member
- Logout

### Master Admin

- Semua menu admin
- Semua menu moderator
- Konfigurasi Sistem
- Pengelolaan Master Role
- Log Audit
- Override akses (wajib audit)
- Logout

## 10. Checklist sebelum UAT role

- Pastikan tiga akun UAT mempunyai role sesuai kebutuhan.
- Pastikan satu akun member tanpa role tambahan tidak dapat membuka route seller.
- Pastikan seller dapat membuka dashboard seller, tetapi tidak dapat membuka route admin.
- Pastikan moderator dapat meninjau dan menerbitkan konten, tetapi tidak dapat membuka administrasi atau laporan keuangan.
- Pastikan admin dapat verifikasi seller dan laporan keuangan.
- Pastikan admin tidak dapat membuka antrean moderasi atau melakukan perhitungan keuangan mendalam.
- Pastikan Master Admin dapat mengambil alih role dan setiap override tercatat.
- Pastikan semua role terautentikasi dapat mengajukan tulisan, tetapi tulisan baru menjadi publik setelah disetujui moderator.
- Pastikan akun multi-role dapat membuka semua dashboard yang memang aktif.
- Pastikan menu tersembunyi tidak menjadi satu-satunya pengaman.
- Pastikan API menolak akses tanpa role meski URL diketahui.
- Pastikan logout menghapus portal pengguna dan session.
- Pastikan refresh browser mempertahankan tema dan role aktif.
- Pastikan mobile menampilkan menu berdasarkan status login dan role.
- Pastikan email, password, dan Service Role Key tidak masuk ke log frontend atau browser.
