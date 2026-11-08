# Draft Arsitektur Pintasan Dashboard dan Fungsi

## 1. Tujuan

Dokumen ini menjelaskan cara menambahkan ikon atau tombol fungsi baru pada dashboard tanpa menggabungkan seluruh proses ke dalam satu halaman dashboard.

Contoh fungsi yang dimaksud:

- **Buat Artikel**
- **Tambah Produk**
- **Kelola Pesanan**
- **Moderasi Konten**
- **Verifikasi Seller**
- **Buka Laporan**
- **Pindah ke Dashboard Role Lain**

Dashboard berfungsi sebagai:

- Ringkasan status dan data terbaru.
- Titik masuk menuju proses yang lebih lengkap.
- Titik navigasi lintas-halaman dalam satu akun dan role.
- Penghubung antar fitur, role, dan proses bisnis.

Dashboard **bukan tempat untuk memindahkan seluruh form, proses, mutasi data, atau validasi bisnis** dari halaman fungsinya.

---

## 2. Prinsip Dasar

### Dashboard tetap terpisah dari fungsi

Dashboard menampilkan pintasan, sedangkan proses dilakukan pada route khusus.

```text
Dashboard
  -> Artikel:  /articles/new
  -> Produk:   /seller/products/new
  -> Pesanan:  /orders atau /seller/orders
  -> Moderasi: /admin/moderation
```

Pemisahan ini mencegah dashboard menjadi file yang terlalu besar dan mempermudah:

- Pengembangan form.
- Pengujian proses.
- Pengubahan hak akses.
- Perbaikan fitur tanpa memengaruhi halaman dashboard lain.
- Penggunaan ulang form atau komponen.
- Pemisahan tampilan berdasarkan role.

### Dashboard tidak menggantikan halaman detail

Contoh, kartu artikel bukan editor artikel lengkap. Kartu hanya menampilkan ringkasan jumlah artikel atau status terbaru.

Form dan proses pembuatan artikel tetap berada pada halaman khusus, misalnya:

```text
/articles/new
```

Route ini masih harus dibuat bila belum tersedia. Saat ini halaman daftar artikel sudah ada di `apps/web/src/app/articles/page.tsx`, tetapi route pembuatan artikel belum ditemukan dalam struktur aplikasi.

### Interaksi lintas role adalah navigasi yang dibatasi

Satu akun dapat memiliki beberapa role. Dashboard harus menampilkan fungsi yang sesuai, tetapi tidak boleh menampilkan seluruh halaman sebagai satu dashboard.

Contohnya:

```text
Member
  -> Dashboard Member
  -> Pesanan Saya
  -> Artikel Saya

Seller
  -> Dashboard Seller
  -> Produk Seller
  -> Pesanan Masuk

Admin
  -> Dashboard Admin
  -> Moderasi
  -> Verifikasi Seller
```

Navigasi antar-role dapat berupa menu, ikon menu, atau popup switch role.

---

## 3. Kondisi yang Sudah Ada di Proyek

Struktur berikut sudah tersedia dan sebaiknya dipertahankan:

### Dashboard User

```text
app/(dashboard)/dashboard/page.tsx
```

Dashboard ini menampilkan statistik pesanan aktif, jumlah konten, reputasi, dan pesanan terbaru.

### Dashboard Seller

```text
app/(seller)/seller/dashboard/page.tsx
```

Dashboard ini menampilkan total produk, pesanan masuk, pesanan tertunda, dan estimasi pendapatan.

### Dashboard Admin

```text
app/(admin)/admin/dashboard/page.tsx
```

Dashboard ini menampilkan pengguna, tiket moderasi, produk pending, dan verifikasi seller.

### Layout

```text
app/(dashboard)/layout.tsx
app/(seller)/layout.tsx
app/(admin)/layout.tsx
```

Masing-masing layout menyediakan sidebar yang sesuai role.

### Sidebar

```text
components/layout/Sidebar.tsx
```

Sidebar sudah membaca role sebagai:

- `user`
- `seller`
- `admin`

### Middleware

```text
src/middleware.ts
```

Middleware sudah memisahkan:

- Route yang memerlukan login.
- Route seller/vendor.
- Route admin/moderator.
- Guest-only route.

### Fungsi yang Sudah Memiliki Route

| Fungsi | Route | Status |
|---|---|---|
| Kelola pesanan user | `/orders` | Sudah ada |
| Detail pesanan user | `/orders/[id]` | Sudah ada |
| Daftar artikel | `/articles` | Sudah ada |
| Tambah produk | `/seller/products/new` | Sudah ada |
| Produk seller | `/seller/products` | Sudah ada |
| Dashboard seller | `/seller/dashboard` | Sudah ada |
| Moderasi | `/admin/moderation` | Sudah ada |
| Verifikasi seller | `/admin/seller-verification` | Sudah ada |
| Laporan keuangan | `/admin/financial-report` | Sudah ada |
| Buat artikel | `/articles/new` | Belum ada pada struktur saat ini |

---

## 4. Pembagian Tanggung Jawab

### Dashboard

Dashboard bertanggung jawab untuk:

- Mengambil ringkasan melalui React Query.
- Menampilkan status loading dan status error.
- Menampilkan jumlah atau daftar ringkas.
- Menautkan ke halaman proses lengkap.
- Menyembunyikan tombol yang tidak boleh diakses role pengguna.
- Tidak melakukan mutation utama atau validasi bisnis kompleks.

### Sidebar

Sidebar bertanggung jawab untuk:

- Menampilkan menu utama.
- Menampilkan menu berbeda berdasarkan role.
- Menampilkan logout.
- Memindahkan pengguna antarhalaman utama.

### Halaman Fungsi

Halaman fungsi bertanggung jawab untuk:

- Menampilkan form atau detail lengkap.
- Memvalidasi input yang dibuat pengguna.
- Memanggil API untuk menyimpan atau mengubah data.
- Menampilkan success, error, dan empty state.
- Melakukan redirect setelah proses berhasil.

Contoh proses Tambah Produk:

```text
Dashboard Seller
  -> klik "Tambah Produk"
  -> buka /seller/products/new
  -> isi form
  -> POST /catalog
  -> tampilkan pesan berhasil
  -> redirect ke /seller/products
```

Halaman Tambah Produk sudah tersedia dan alur dasarnya sudah berjalan.

---

## 5. Bentuk Pintasan Dashboard

Pintasan sebaiknya dibuat sebagai komponen reusable, bukan ditulis berulang sebagai JSX liar.

Contoh data konfigurasi:

```tsx
const userShortcuts = [
  {
    label: 'Buat Artikel',
    description: 'Tulis artikel pertanian atau edukasi.',
    href: '/articles/new',
    icon: Pencil,
  },
  {
    label: 'Pesanan Saya',
    description: 'Pantau pesanan dan status pembayaran.',
    href: '/orders',
    icon: ShoppingBag,
  },
];
```

Contoh elemen UI:

```tsx
<Link
  href="/articles/new"
  className="card p-4 hover:border-primary-300 transition"
>
  <Pencil className="w-5 h-5 text-primary-600" />
  <div>
    <p className="font-semibold">Buat Artikel</p>
    <p className="text-xs text-gray-400">
      Tulis artikel pertanian atau edukasi.
    </p>
  </div>
</Link>
```

Komponen reusable dapat seperti:

```text
components/dashboard/ShortcutCard.tsx
components/dashboard/StatCard.tsx
components/dashboard/RecentActivity.tsx
components/dashboard/RoleSwitcher.tsx
```

---

## 6. Kebutuhan yang Dibutuhkan

### Untuk setiap dashboard fungsi

Pembuatan fungsi baru memerlukan:

1. Icon atau label yang jelas.
2. Route tujuan.
3. Role yang diperbolehkan.
4. API atau layanan backend.
5. Data yang ditampilkan sebelum dan sesudah proses.
6. Loading state.
7. Empty state.
8. Error state.
9. Success state.
10. Redirect atau kembali ke dashboard.
11. Pengujian navigasi dan hak akses.

### Untuk dashboard secara umum

Pintasan dashboard memerlukan:

- Struktur role dari tabel atau hook autentikasi.
- Daftar route per role.
- Komponen statistik ringkas.
- Komponen kartu pintasan.
- Komponen menu role switcher bila dibutuhkan.
- React Query untuk data ringkas.
- API response yang stabil.

### Untuk fungsi lintas-role

Pastikan data backend juga menyimpan pemilik atau actor:

```text
created_by = user.id
vendor_id = user.vendor.id
moderator_id = user.id
```

Frontend tidak boleh membangun hak akses hanya dari nama route. Keputusan yang sebenarnya tetap harus dilakukan oleh middleware dan API backend.

---

## 7. Matrik Role dan Fungsi

| Fungsi | User | Seller | Admin/Moderator |
|---|---:|---:|---:|
| Melihat dashboard sendiri | Ya | Ya | Ya |
| Membuat artikel | Sesuai aturan konten | Sesuai aturan konten | Ya, bila perlu |
| Membeli produk | Ya | Ya | Dapat dibatasi |
| Menambah produk | Tidak | Ya | Tidak, kecuali role khusus |
| Mengelola produk milik sendiri | Tidak | Ya | Tidak |
| Melihat pesanan sendiri | Ya | Ya | Tidak, kecuali ditinjau |
| Melihat pesanan masuk toko | Tidak | Ya | Tidak |
| Memoderasi konten | Tidak | Tidak | Ya |
| Memverifikasi seller | Tidak | Tidak | Ya |
| Melihat laporan keuangan | Tidak | Hanya laporan toko | Ya |

Matrix ini perlu disesuaikan dengan aturan bisnis atau permission matrix resmi aplikasi.

---

## 8. Alur Keamanan

Setiap navigasi harus melewati dua lapis pengecekan.

```text
UI Sidebar / Dashboard
  -> menyembunyikan atau menampilkan pintasan

Middleware
  -> memeriksa login
  -> memeriksa role
  -> mengizinkan atau redirect

API Backend
  -> memvalidasi session
  -> memvalidasi role
  -> memvalidasi kepemilikan data
  -> menjawab berhasil atau ditolak
```

Lapisan UI tidak boleh menjadi satu-satunya keamanan.

### Contoh

Seorang user biasa dapat mengetahui URL:

```text
/seller/products/new
```

Namun middleware harus:

- Menolak jika user belum login.
- Menolak atau mengarahkan ke register bila user belum memiliki role seller aktif.

API membuat produk juga harus memeriksa:

- Seller sedang aktif.
- Seller memiliki vendor toko.
- Data yang dibuat dikaitkan dengan toko yang benar.
- User bukan seller lain yang mencoba mengubah produk milik orang lain.

---

## 9. Batasan Implementasi

### Tidak boleh dilakukan

- Menggabungkan form tambah artikel, produk, dan moderasi ke dalam satu dashboard.
- Menyimpan logika pemrosesan bisnis langsung di dashboard.
- Mengakses tabel database langsung dari halaman Next.js tanpa API yang ditetapkan.
- Menampilkan fitur berdasar URL semata.
- Memperbolehkan pengujian role hanya dari frontend.
- Mengubah route lama yang sudah dipakai sebagai bagian navigasi utama tanpa redirect.
- Menghapus layout atau middleware role yang sudah ada.
- Membuat semua dashboard memiliki logika role sendiri tanpa konfigurasi bersama.

### Boleh dilakukan

- Menambah kartu pintasan pada dashboard.
- Menambah route baru yang berhubungan dengan fungsi.
- Menambah API baru.
- Memakai komponen dashboard bersama.
- Menambahkan role switcher.
- Menampilkan badge, jumlah pending, status, dan ringkasan data.
- Memindahkan pengguna ke halaman yang sudah tersedia.
- Menyesuaikan link berdasarkan role aktif.

---

## 10. Contoh Penambahan Fungsi Buat Artikel

### Route yang dibutuhkan

Tambahkan:

```text
app/articles/new/page.tsx
```

### API yang dibutuhkan

Contoh:

```text
POST /articles
GET  /users/me/articles?limit=5
GET  /articles/[slug]
PUT  /articles/[slug]
```

Nama endpoint final harus mengikuti konvensi API proyek.

### Halaman proses

Halaman `/articles/new` bertanggung jawab atas:

- Judul artikel.
- Slug atau artikel yang dihasilkan sistem.
- Ringkasan.
- Isi artikel.
- Kategori.
- Thumbnail.
- Status draft atau pending review.
- Tanggal publikasi bila tersedia.

### Tombol pada dashboard

```tsx
<ShortcutCard
  label="Buat Artikel"
  description="Mulai menulis artikel baru"
  href="/articles/new"
  icon={Pencil}
/>
```

### Data ringkas pada dashboard

Dashboard dapat menampilkan:

- Jumlah artikel draft.
- Artikel menunggu review.
- Artikel terbaru.
- Artikel paling banyak dibaca bila tersedia.

Dashboard tidak boleh menampilkan editor lengkap.

### Pengamanan route

Tambahkan `/articles/new` ke daftar route yang memerlukan login:

```ts
const AUTH_REQUIRED = [
  '/dashboard',
  '/profile',
  '/articles/new',
];
```

Penambahan fungsi harus tetap memakai validasi role dari API sesuai ketentuan konten.

---

## 11. Contoh Interaksi Antar-Role

### Member menemukan artikel seller

```text
Member membuka artikel
  -> melihat produk yang direkomendasikan
  -> klik produk
  -> pindah ke marketplace atau detail produk
  -> membuat pesanan
```

### Seller menghasilkan pesanan

```text
User membeli produk
  -> pesanan dibuat
  -> seller melihat pesanan masuk
  -> seller memperbarui status
  -> user melihat status pesanan terbaru
```

### Admin memoderasi konten seller atau member

```text
Konten dibuat
  -> status awal pending review
  -> admin membuka /admin/moderation
  -> admin menyetujui atau menolak
  -> status konten berubah
  -> pemilik konten melihat hasil melalui dashboard
```

Hubungan antar-role harus memiliki status dan event yang jelas.

---

## 12. Status yang Perlu Didefinisikan

Untuk proses fungsi yang baru, setiap objek perlu memiliki status yang mudah dipahami.

Contoh artikel:

```text
draft -> pending_review -> published
draft -> pending_review -> rejected
```

Contoh produk:

```text
draft -> pending_review -> active
draft -> pending_review -> rejected
```

Contoh pesanan:

```text
created -> paid -> in_fulfillment -> completed
created -> paid -> disputed
```

Dashboard dapat menampilkan status tersebut tetapi tidak boleh mengubah status lewat tombol tanpa proses API dan log audit.

---

## 13. State yang Wajib Ditangani

Setiap kartu atau halaman fungsi harus menangani:

### Loading

Contoh:

```text
Memuat dashboard...
...
Skeleton
```

### Empty

Contoh:

```text
Belum ada pesanan.
Belum ada artikel.
Belum ada produk tertunda.
```

### Success

Contoh:

```text
Produk berhasil ditambahkan.
Artikel berhasil disimpan sebagai draft.
Pesanan berhasil dikonfirmasi.
```

### Error

Contoh:

```text
Gagal memuat data dashboard.
Data tidak dapat disimpan.
Anda tidak memiliki izin untuk melakukan tindakan ini.
```

### Unauthorized

Contoh:

```text
Tidak login -> ke /login
Tidak memiliki role -> ke /seller/register atau /dashboard
Role tidak sesuai -> ke /dashboard
```

---

## 14. Urutan Pembuatan Fitur

Urutan yang direkomendasikan:

1. Tentukan nama fungsi dan tujuan pengguna.
2. Tentukan role yang boleh mengakses fungsi.
3. Tentukan route halaman proses.
4. Tentukan API yang dibutuhkan.
5. Tentukan status, validasi, dan error.
6. Buat halaman proses dulu.
7. Tambahkan API dan validasi backend.
8. Tambahkan middleware route protection.
9. Tambahkan kartu atau icon pada dashboard.
10. Tambahkan sidebar atau role switcher bila diperlukan.
11. Tambahkan loading, empty, error, dan success state.
12. Uji sebagai user, seller, dan admin.
13. Update dokumentasi dan permission matrix.

Urutan ini memastikan dashboard dibuat setelah proses utama jelas, bukan sebaliknya.

---

## 15. Checklist Sebelum Fitur Dinilai Selesai

### Frontend

- [ ] Route fungsi sudah tersedia.
- [ ] Route sudah terhubung dari dashboard atau sidebar.
- [ ] Link berfungsi tanpa membuat halaman dashboard terlalu berat.
- [ ] Loading, empty, success, dan error state sudah ada.
- [ ] Responsif untuk desktop dan mobile.
- [ ] Tombol yang tidak berhak tidak ditampilkan.
- [ ] Navigasi kembali ke halaman asal tersedia.

### Keamanan

- [ ] Middleware memeriksa login.
- [ ] Middleware memeriksa role.
- [ ] API memeriksa session.
- [ ] API memeriksa role.
- [ ] API memeriksa kepemilikan data.
- [ ] Frontend bukan satu-satunya pengaman.

### Backend

- [ ] Validasi input tersedia.
- [ ] Status objek tersedia.
- [ ] Ownership atau vendor ditetapkan.
- [ ] Error response konsisten.
- [ ] Query tidak membocorkan data lintas-user.

### Pengujian

- [ ] User biasa dapat mengakses fitur yang diperbolehkan.
- [ ] User biasa tidak dapat mengakses route seller/admin.
- [ ] Seller tidak dapat mengubah data seller lain.
- [ ] Admin hanya dapat menjalankan fungsi admin yang dibolehkan.
- [ ] User yang belum login dialihkan ke login dengan parameter `next`.
- [ ] Seller belum terdaftar dialihkan ke register seller.

---

## 16. Keputusan Rekomendasi

Rekomendasi implementasi untuk Racik Media:

1. Pertahankan dashboard terpisah untuk User, Seller, dan Admin.
2. Gunakan sidebar role-aware yang sudah ada.
3. Tambahkan Role Switcher hanya bila satu akun benar-benar memiliki beberapa role aktif.
4. Gunakan kartu pintasan reusable.
5. Jangan memasukkan seluruh proses membuat artikel atau tambah produk ke dalam dashboard.
6. Buat `/articles/new` sebelum menampilkan pintasan Buat Artikel secara aktif.
7. Tambahkan middleware protection untuk route baru.
8. Validasi kepemilikan dan role juga pada API.
9. Gunakan status workflow yang sama antara dashboard, halaman detail, dan backend.

Dengan cara ini, penambahan fungsi baru tidak merusak aturan role lama. Dashboard justru menjadi penghubung yang jelas antara ringkasan, proses, dan interaksi antar-role.

---

# Lampiran: Proses Memasukkan Email dan Akun Role Uji Coba

## 1. Jangan Langsung Menguji pada Production

Untuk uji coba dashboard, buat project atau environment terpisah:

```text
Development
  - Akun dan data uji
  - Email bebas untuk pengujian
  - Produk dummy
  - Pesanan dummy

Staging/UAT
  - Mirip production
  - Email peserta UAT nyata atau domain khusus uji
  - Role Member, Seller, Moderator, dan Admin

Production
  - Tidak boleh dipakai untuk seed akun otomatis
  - Password test tidak boleh digunakan
  - Tidak boleh terdapat produk atau pesanan uji
```

Gunakan Supabase project terpisah untuk development/staging. Variabel `.env.local` frontend dan environment API juga harus menunjuk ke Supabase serta database yang berbeda dari production.

Contoh pembagian domain test:

```text
member-uat@racikmedia.test
seller-uat@racikmedia.test
moderator-uat@racikmedia.test
admin-uat@racikmedia.test
```

`.test` bukan domain publik, tetapi Supabase lokal atau provider email test tetap perlu dikonfigurasi agar verifikasi email dapat menerima atau melewati proses dengan benar.

---

## 2. Jenis Akun yang Dibutuhkan

Minimal siapkan 4 akun:

| Akun | Role Database | Tujuan Pengujian |
|---|---|---|
| Member | `member` | Dashboard user, pesanan, bookmark, artikel user |
| Seller | `member` + `seller` | Dashboard seller, tambah produk, pesanan masuk |
| Moderator | `member` + `moderator` | Moderasi konten dan produk |
| Admin | `member` + `admin` | Verifikasi seller, laporan, dashboard admin |

Tambahan akun untuk edge case:

| Akun | Kondisi | Tujuan |
|---|---|---|
| Seller Suspended | Role seller dengan status `suspended` | Route harus ditolak atau dibatasi |
| Seller Pending | Role seller dengan status `under_review` | Tidak boleh mengakses fitur aktif |
| User Tanpa Role Seller | Hanya `member` | Mencegah masuk route seller |
| Akun Belum Login | Tidak ada session | Redirect ke login |
| Multi-role | `member` + `seller` + `author` | Menguji role switcher dan permission gabungan |

Database saat ini menerima role:

```text
member
author
seller
distributor
service_provider
moderator
admin
```

Karena `user_roles.role_type` bersifat additive, satu akun dapat mempunyai beberapa baris role. Namun middleware saat ini menggunakan nama route dan daftar role tertentu. Role switcher hanya boleh ditambahkan bila frontend dan backend sudah membaca daftar role secara konsisten.

---

## 3. Cara Membuat Akun Uji Coba

### A. Daftarkan akun melalui aplikasi

Buka halaman register dan buat akun baru:

```text
/register
```

Gunakan password yang sama hanya untuk file rahasia testing lokal, jangan menggunakan password production atau email pribadi.

Setiap pendaftaran normal:

1. Membuat akun pada Supabase Auth.
2. Trigger database membuat row pada `public.users`.
3. Trigger memberi role `member` secara aktif.
4. Aplikasi mengarahkan pengguna ke `/dashboard`.

Pembuatan akun ini dapat menjadi dasar untuk role tambahan.

### B. Tambahkan role seller/moderator/admin

Role tambahan tidak boleh diberikan secara acak oleh halaman register. Penambahan role dilakukan oleh administrator atau SQL terkontrol pada database.

Setelah akun Supabase dan user aplikasi dibuat, tambahkan role menggunakan Supabase SQL Editor:

```sql
INSERT INTO public.user_roles (
  tenant_id,
  user_id,
  role_type,
  status
)
SELECT
  '00000000-0000-0000-0000-000000000001',
  u.id,
  'seller',
  'active'
FROM auth.users u
WHERE u.email = 'seller-uat@example.com'
ON CONFLICT (user_id, role_type) DO UPDATE SET
  status = EXCLUDED.status;
```

Contoh untuk moderator:

```sql
INSERT INTO public.user_roles (
  tenant_id,
  user_id,
  role_type,
  status
)
SELECT
  '00000000-0000-0000-0000-000000000001',
  u.id,
  'moderator',
  'active'
FROM auth.users u
WHERE u.email = 'moderator-uat@example.com'
ON CONFLICT (user_id, role_type) DO UPDATE SET
  status = EXCLUDED.status;
```

Contoh untuk admin:

```sql
INSERT INTO public.user_roles (
  tenant_id,
  user_id,
  role_type,
  status
)
SELECT
  '00000000-0000-0000-0000-000000000001',
  u.id,
  'admin',
  'active'
FROM auth.users u
WHERE u.email = 'admin-uat@example.com'
ON CONFLICT (user_id, role_type) DO UPDATE SET
  status = EXCLUDED.status;
```

Catatan:

- Jangan memberi role admin atau moderator melalui query yang dapat dijalankan pengguna biasa.
- Jangan hard-code email admin sebagai satu-satunya proteksi.
- Gunakan SQL manual, migration, atau admin workflow dengan audit log yang terbatas pada admin berwenang.
- Setelah memberi role, logout dan login kembali agar seluruh session dibangun ulang.

---

## 4. Konfirmasi Data Akun

Data role dapat diperiksa dari Supabase SQL Editor:

```sql
SELECT
  au.email,
  ur.role_type,
  ur.status,
  ur.granted_at
FROM auth.users au
JOIN public.user_roles ur ON ur.user_id = au.id
WHERE au.email IN (
  'member-uat@example.com',
  'seller-uat@example.com',
  'moderator-uat@example.com',
  'admin-uat@example.com'
)
ORDER BY au.email, ur.role_type;
```

Semua akun yang baru didaftarkan juga harus mempunyai role `member` dengan status `active`.

---

## 5. Proses Uji Login

Untuk setiap akun:

1. Buka `/login`.
2. Login memakai email dan password akun test.
3. Buka dashboard sesuai role yang dibawa akun.
4. Pastikan menu yang tidak berhak tidak ditampilkan.
5. Buka route terlarang secara langsung.
6. Pastikan redirect atau `403` terjadi sesuai middleware/backend.
7. Logout.
8. Ulangi pengujian menggunakan browser/incognito atau browser yang berbeda.

Contoh:

```text
Member -> /dashboard       berhasil
Member -> /seller/dashboard ditolak atau dialihkan
Member -> /admin/dashboard ditolak atau dialihkan
Seller -> /seller/dashboard berhasil
Seller -> /admin/dashboard  ditolak
Admin  -> /admin/dashboard  berhasil
Admin  -> /seller/dashboard hanya bila role seller juga aktif
```

Dashboard tidak boleh menentukan izin sendiri. Middleware dan API tetap menjadi pengaman utama.

---

## 6. Temuan yang Perlu Diperiksa Saat Ini

Ada perbedaan nama role yang perlu diselaraskan sebelum testing:

- Schema database menerima `seller`, bukan `vendor`.
- Schema database menerima `admin` dan `moderator`.
- Middleware saat ini memeriksa `seller` atau `vendor` untuk route seller, serta `admin`, `master_admin`, atau `moderator` untuk route admin.
- Middleware tidak memeriksa nilai `author` meskipun role tersebut ada pada database.
- Sidebar menggunakan role string sederhana `user`, `seller`, dan `admin`.

Sebelum diuji lintas-role:

1. Tetapkan apakah role member akan selalu menggunakan nama `member`.
2. Jangan gunakan `user`, `vendor`, atau `master_admin` tanpa menambahkan value tersebut pada schema dan API secara konsisten.
3. Untuk akun seller gunakan `member` + `seller`.
4. Untuk akun moderator gunakan `member` + `moderator`.
5. Untuk akun admin gunakan `member` + `admin`.
6. Tambahkan role switcher hanya setelah source daftar role dari API benar-benar tersedia.

Tanpa penyelarasan ini, akun dapat terlihat berhasil login tetapi diarahkan ke dashboard yang salah atau ditolak karena middleware mencari role yang tidak ada pada database.

---

## 7. Skenario Pengujian Dashboard

### Uji Member

- [ ] Member dapat membuka `/dashboard`.
- [ ] Statistik pesanan dapat dimuat.
- [ ] Pesanan kosong ditangani.
- [ ] Link pesanan menuju `/orders`.
- [ ] Link artikel menuju halaman artikel yang tersedia.
- [ ] Member tidak dapat membuka `/seller/dashboard`.
- [ ] Member tidak dapat membuka `/admin/dashboard`.
- [ ] Membuat artikel hanya tersedia jika fitur dan permission sudah disetujui.

### Uji Seller

- [ ] Seller dapat membuka `/seller/dashboard`.
- [ ] Seller dapat membuka `/seller/products`.
- [ ] Seller dapat membuka `/seller/products/new`.
- [ ] Form produk menolak data kosong atau harga di bawah minimum.
- [ ] Produk baru mengikuti status pending review.
- [ ] Seller tidak dapat melihat atau mengubah produk milik seller lain.
- [ ] Seller tanpa vendor/toko dialihkan atau diminta daftar menjadi seller.
- [ ] Seller dengan status suspended tidak dapat membuat produk aktif.

### Uji Admin

- [ ] Admin dapat membuka `/admin/dashboard`.
- [ ] Admin dapat membuka `/admin/moderation`.
- [ ] Admin dapat membuka `/admin/seller-verification`.
- [ ] Admin dapat membuka `/admin/financial-report`.
- [ ] Admin dapat menyetujui atau menolak dengan status yang tepat.
- [ ] Semua action admin tercatat atau dapat diaudit.
- [ ] Admin tidak boleh mengambil hak seller tanpa role seller.

### Uji Moderator

- [ ] Moderator dapat membuka route moderasi.
- [ ] Moderator tidak dapat membuka route dashboard keuangan admin bila tidak mempunyai admin.
- [ ] Moderator tidak dapat mengubah role user.
- [ ] Moderator dapat menyelesaikan tindakan moderasi yang sesuai haknya.

### Uji Multi-role

- [ ] Role member tetap dapat melihat dashboard member.
- [ ] Seller dapat berpindah ke dashboard seller.
- [ ] Admin dapat berpindah ke dashboard admin bila role admin aktif.
- [ ] Account dengan role sesuai dapat berpindah tanpa login ulang.
- [ ] Role tidak aktif tidak muncul pada menu.

---

## 8. Uji Crash dan Error

Sebelum menganggap fitur berhasil, lakukan pengujian crash dengan:

- Disconnect jaringan saat query dashboard.
- API memberikan HTTP 500.
- API memberikan HTTP 401 atau 403.
- Response data berbentuk kosong atau tidak lengkap.
- Salah satu React Query gagal tetapi dashboard lain tetap dapat dimuat.
- User membuka dua dashboard berurutan dalam satu browser.
- Session expired saat mengisi form.
- User menekan submit dua kali.
- Browser mobile dan desktop.
- Refresh langsung pada route protected.
- Login ulang setelah logout.

Halaman harus menampilkan:

```text
Loading -> data muncul
Loading -> empty state
Loading -> error state
Loading -> redirect unauthorized
```

Halaman tidak boleh mengalami:

- Blank screen tanpa pesan.
- Redirect loop.
- Error `Cannot read properties of undefined`.
- Akses data antar-user.
- Mutation sukses di frontend tetapi gagal di API.
- Tombol melakukan mutasi dua kali.

---

## 9. Tools Pemeriksaan Crash

Gunakan pemeriksaan berikut selama UAT:

### Frontend

```bash
pnpm --filter @racik-media/web typecheck
pnpm --filter @racik-media/web lint
pnpm --filter @racik-media/web build
```

### Backend API

```bash
pnpm --filter @racik-media/api build
pnpm --filter @racik-media/api test
```

### Pengujian Browser

- DevTools -> Console: tidak ada error React atau JavaScript.
- DevTools -> Network: response tidak boleh 401/403 yang tidak ditangani.
- DevTools -> Application: session dan cookie tidak bocor antar-akun.
- Inspect Redux/Zustand bila dipakai untuk cart atau state lain.
- Logout pada satu tab lalu refresh tab lain.

---

## 10. Alur Pelaksanaan UAT

Urutan yang direkomendasikan:

1. Siapkan project Supabase staging terpisah.
2. Jalankan migration dan seed data staging.
3. Konfigurasi email verification atau provider test.
4. Buat akun Member, Seller, Moderator, dan Admin.
5. Berikan role dengan proses administrasi yang diaudit.
6. Siapkan data dummy dan status proses lengkap.
7. Jalankan test login dan redirect.
8. Jalankan test transaksi Member -> Seller.
9. Jalankan moderation Member/Seller -> Admin/Moderator.
10. Catat crash pada spreadsheet atau issue tracker.
11. Perbaiki bug lalu jalankan ulang dari skenario yang gagal.
12. Baru pertimbangkan pengujian production terbatas.

UAT sebaiknya mencatat minimal:

```text
Tanggal
Akuntest
Role
Browser
Route yang diuji
Data input
Hasil yang diharapkan
Hasil aktual
Screenshot
Console error
Status issue
```

---

# Lampiran: Migrasi Bertahap ke Supabase Auth Google

## 1. Apakah Bisa Dashboard Didesain Terlebih Dahulu?

Bisa. Perubahan tampilan dapat dilakukan sebelum autentikasi Google diaktifkan.

Urutan yang aman adalah:

```text
Fase 1
  - Rapikan layout dashboard.
  - Tambah sidebar dan role switcher.
  - Tambah kartu shortcut.
  - Gunakan akun atau session dummy.

Fase 2
  - Aktifkan Google provider pada Supabase.
  - Tambahkan tombol Login dengan Google.
  - Tambahkan callback dan redirect URL.

Fase 3
  - Sinkronkan akun Google ke public.users.
  - Sinkronkan role dan permission.
  - Uji email/password, Google, dan multi-role.

Fase 4
  - Aktifkan Google sebagai metode login utama atau tambahkan sebagai metode alternatif.
```

Perubahan tampilan tidak memerlukan perubahan Supabase atau Google OAuth saat UI masih dibuat.

Jangan menggunakan akun Google di proyek lain sebagai data autentikasi aktif sebelum callback, environment, dan database tujuan sudah dikonfigurasi.

## 2. Konsep yang Tepat

Google tidak menggantikan Supabase.

Konfigurasi yang tepat adalah:

```text
UI Next.js
  -> Supabase Auth
  -> Google OAuth Provider
  -> Supabase session
  -> AuthContext
  -> Middleware
  -> API/backend
```

Artinya:

- Google mengidentifikasi pengguna melalui provider OAuth.
- Supabase mengelola session, token, callback, dan refresh.
- Aplikasi tetap membaca session dari Supabase seperti saat ini.
- Dashboard dan middleware tidak perlu diganti ketika provider Google ditambahkan.

Proyek saat ini sudah memakai Supabase Auth dari:

```text
src/lib/supabase.ts
src/app/providers.tsx
src/middleware.ts
```

Kode dashboard dapat tetap memakai `session` dan `useAuth()` setelah login Google.

## 3. Email Password dan Google Dapat Bersama

Supabase dapat mendukung beberapa metode dalam satu fase:

```text
Login Email/Password  -> aktif
Login Google          -> ditambahkan
Login Setelah Migrasi -> email/password tetap tersedia atau dinonaktifkan sesuai keputusan
```

Sebaiknya, pada fase awal, metode lama tidak langsung dimatikan.

Matriknya:

| Fase | Email/Password | Google |
|---|---:|---:|
| Desain UI | Aktif | Belum aktif |
| Staging OAuth | Aktif sebagai fallback | Aktif untuk UAT |
| Migrasi bertahap | Aktif sementara | Aktif sebagai login utama |
| Setelah stabil | Opsional | Aktif |

Keputusan mengenai metode login lama harus dipisahkan dari keputusan tampilan dashboard.

## 4. Yang Harus Ditambahkan Setelah Desain Selesai

### Konfigurasi Google Cloud

Siapkan OAuth Client:

- OAuth client type: Web application.
- Authorized JavaScript origins: domain aplikasi frontend.
- Authorized redirect URI: Supabase callback URL.
- Client ID dan Client Secret disimpan pada Supabase dashboard.

Supabase callback biasanya berada pada project Supabase, bukan langsung pada route Next.js. Redirect UI setelah callback tetap dapat diarahkan ke `/dashboard`, `/seller/dashboard`, atau `/admin/dashboard`.

### Konfigurasi Supabase

Aktifkan Google provider pada:

```text
Supabase Dashboard
  -> Authentication
  -> Providers
  -> Google
  -> Masukkan Client ID
  -> Masukkan Client Secret
```

Konfigurasi URL:

```text
Site URL
  -> origin utama aplikasi

Redirect URLs
  -> http://localhost:3000/**
  -> https://staging-domain/**
  -> https://production-domain/**
```

URL callback harus menggunakan environment yang benar. Jangan memakai origin project demo atau production pada project staging.

### Tombol Login

Tambahkan tombol Google pada halaman login:

```tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
  },
});
```

Tambahkan error UI bila Google gagal:

- Provider belum aktif.
- Client ID atau Secret salah.
- Callback URL tidak tercantum.
- Akun dibatalkan.
- Session tidak terbentuk.

## 5. Sinkronisasi Akun Google ke Database

Trigger database sudah menangani akun baru:

```text
auth.users
  -> handle_new_auth_user()
  -> public.users
  -> user_roles(member, active)
  -> core_reputations(master_score=100)
```

Dengan trigger yang sudah ada, pengguna yang login melalui Google akan:

1. Membuat row `auth.users`.
2. Membuat row `public.users`.
3. Mendapat role `member` secara aktif.
4. Mendapat reputasi awal.

Trigger tidak boleh menambahkan role seller, moderator, atau admin secara otomatis berdasarkan email. Role tersebut harus diberikan melalui proses admin atau identity approval.

## 6. Akun Email Lama dan Akun Google Baru

Kemungkinan terjadi dua identity untuk satu orang.

Contoh:

```text
Email lama: user@domain.com, metode password
Email Google: user@domain.com, metode Google
```

Supabase dapat mengidentifikasi keduanya sebagai user berbeda tergantung konfigurasi identity linking dan manual linking.

Jangan membuat user baru dari Google secara diam-diam jika email lama sudah mempunyai:

- Pesanan.
- Produk seller.
- Konten.
- Reputasi.
- Transaksi escrow.
- Role aktif.

Proses yang direkomendasikan:

1. Temukan user lama berdasarkan email yang terverifikasi.
2. Tampilkan opsi penghubungan akun.
3. Verifikasi kepemilikan identitas.
4. Gunakan identity linking pada Supabase apabila didukung konfigurasi project.
5. Simpan audit log penggabungan.
6. Jangan menggabungkan akun hanya berdasarkan kesamaan string email tanpa verifikasi.

Untuk data yang sudah ada pada project 1 atau project 2, pemindahan database dan akun harus diperlakukan sebagai migration data terpisah, bukan sekadar menukar UI atau environment variable.

## 7. Tidak Boleh Disamakan dengan Pemindahan Database

Ada dua hal terpisah:

### Menambahkan Google Login

```text
Google OAuth
  -> Supabase Auth
  -> session pengguna
```

### Menghubungkan Project 1 dan Project 2

```text
Database Project 1
Database Project 2
UI Project 1
UI Project 2
```

Supaya project 2 memakai dashboard project 1, aplikasi project 2 dapat memakai:

- Komponen visual dan layout dashboard yang sama.
- Design system yang sama.
- Route dan pola navigasi yang sama.
- Supabase Auth pada project 2 secara terpisah.
- Database yang diselaraskan melalui migration atau API.

UI dan database tidak perlu dibawa sebagai satu paket.

Jika project 1 dan project 2 memakai Supabase yang berbeda, login project 1 tidak otomatis login project 2.

Project 2 memerlukan:

```text
NEXT_PUBLIC_SUPABASE_URL project-2
NEXT_PUBLIC_SUPABASE_ANON_KEY project-2
```

Setiap project juga memerlukan Google redirect URL yang khusus atau sesuai domainnya.

## 8. Urutan Implementasi Aman

1. Buat dashboard dan shortcut pada staging.
2. Pastikan session dummy atau akun member tersedia.
3. Aktifkan Google hanya pada Supabase staging.
4. Tambahkan tombol Google dan callback redirect.
5. Uji login Google menghasilkan `public.users`.
6. Uji role member otomatis dibuat.
7. Berikan role seller/admin/moderator secara terkontrol untuk akun UAT.
8. Uji route protected dan API.
9. Uji logout dan refresh session.
10. Uji logout satu akun dan login akun lain pada tab berbeda.
11. Uji akun email lama dan akun Google lama.
12. Baru aktifkan pada production.

## 9. Fitur yang Tidak Perlu Diubah

Migrasi Google tidak memerlukan perubahan:

- Struktur role `user_roles`.
- Layout dashboard Member, Seller, dan Admin.
- Komponen statistik.
- Sidebar.
- Middleware route seller/admin.
- API endpoint setelah session token sudah valid.
- Database transaksi yang sudah ada.

Yang berubah biasanya hanya:

- Provider login pada halaman auth.
- Konfigurasi Supabase provider.
- Redirect URL dan callback.
- Proses sinkronisasi identity pada signup.
- Penanganan user Google baru.

## 10. Penyimpanan Secret

Jangan menyimpan Client Secret pada:

- Source code frontend.
- `NEXT_PUBLIC_*`.
- Repository Git.
- Dokumentasi.
- Browser.

Client Secret Google disimpan pada:

```text
Supabase Dashboard Provider Settings
```

Supabase Anon Key memang boleh dipakai oleh browser, tetapi Service Role Key tidak boleh ditaruh pada frontend atau repository.

## 11. Risiko yang Harus Dicegah

| Risiko | Pencegahan |
|---|---|
| Dashboard rusak saat login Google | Jangan mengganti AuthContext; tambahkan provider sebagai method baru |
| Login loop | Periksa callback URL, session, dan redirect middleware |
| Akun ganda | Implementasi identity linking atau migration identitas |
| Google login bypass role | Middleware dan API tetap memvalidasi role |
| Akun random mendapat admin | Jangan memberi role admin berdasarkan email domain tanpa verifikasi admin |
| Data tertukar antar Supabase project | Pastikan URL dan key hanya berasal dari project/staging yang benar |
| Secret Google bocor | Simpan Client Secret hanya pada Supabase dashboard |
| Session production tercampur | Gunakan browser/profile berbeda untuk staging dan production |

## 12. Checklist Sebelum Google Diaktifkan

- [ ] UI dashboard selesai dan bukan hotfix login Google.
- [ ] Supabase staging tersedia.
- [ ] Google OAuth client staging tersedia.
- [ ] Callback URL sudah terdaftar.
- [ ] Environment variable sudah diarahkan ke project staging.
- [ ] Trigger `handle_new_auth_user()` aktif.
- [ ] Role default member otomatis terbentuk.
- [ ] Login Google membuat session Supabase.
- [ ] Login Google mengarahkan ke dashboard yang benar.
- [ ] Login email/password lama tetap berfungsi bila dipertahankan.
- [ ] Logout menghapus session.
- [ ] Middleware memeriksa role tetap.
- [ ] API memeriksa session tetap.
- [ ] Akun multi-role diuji.
- [ ] Akun ganda sudah punya aturan penggabungan.
