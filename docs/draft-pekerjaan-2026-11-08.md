# Draft Pekerjaan - 8 November 2026

Dokumen ini menjadi catatan lanjutan untuk sesi berikutnya.

## Ringkasan Hari Ini

### Sidebar role-aware

- Sidebar dibentuk ulang menjadi navigasi vertikal yang lebih rapat.
- Ukuran sidebar terbuka adalah `208px`.
- Mode ikon saja adalah `64px`.
- Menu mengikuti role:
  - member
  - author
  - seller
  - distributor
  - service_provider
  - moderator
  - admin
- Sidebar menyimpan keadaan terbuka atau tertutup pada `localStorage`.
- Pada layar mobile, sidebar awalnya tertutup.
- Menu logout ditempatkan di bagian bawah sidebar.
- Implementasi utama berada pada `apps/web/src/components/layout/Sidebar.tsx`.

### Posisi tombol sidebar

- Tombol tiga garis dipindahkan ke navbar.
- Tombol berada sebelum logo Racik Media.
- Tombol hanya menampilkan ikon tiga garis, tanpa teks tambahan.
- Tombol mengirim event `racik-sidebar-toggle` kepada Sidebar.
- Lebar rail sidebar mode ikon diselaraskan menjadi `64px`.
- Implementasi tombol berada pada `apps/web/src/components/layout/Navbar.tsx`.

### Catatan edit manual

Catatan manual sudah ditambahkan langsung ke kode:

- Daftar menu dan role terdapat pada `navByRole` di Sidebar.
- Lebar, tinggi menu, padding, icon, dan jarak terdapat pada kelas Tailwind Sidebar.
- Logo, dropdown Artikel, pencarian, tema, keranjang, notifikasi, serta portal pengguna terdapat pada Navbar.
- Warna tema dan warna komponen global terdapat pada `apps/web/src/app/globals.css`.

### Tema tampil

Pilihan tema saat ini:

- Terang
- Gelap
- Samudra
- Senja
- Lavender

Preview warna, nama tema, dan daftar pilihan dapat diedit pada array `themes`.
CSS warna halaman dapat ditambah melalui selector:

```css
html[data-theme="nama-tema"] body
html[data-theme="nama-tema"] header
html[data-theme="nama-tema"] .card
```

Tema dipilih pengguna disimpan pada:

```text
localStorage.racik-theme
```

### Alur artikel

Pekerjaan sebelumnya sudah menyambungkan bagian utama alur:

- Member membuat dan menyimpan artikel.
- Artikel dapat diajukan ke antrean moderator.
- Dashboard member menampilkan status artikel.
- Moderator dapat menyetujui, meminta revisi, atau menolak.

Status artikel:

- `draft`
- `under_review`
- `revision_requested`
- `approved`
- `rejected`
- `published`

## Verifikasi Hari Ini

- `npm run typecheck` berhasil untuk frontend dan backend.
- Tidak ditemukan error TypeScript pada perubahan sidebar dan tema.
- Browser sempat menampilkan dashboard admin dengan sidebar role-aware.

## Sisa Masalah yang Perlu Dilanjutkan

### 1. Penyelarasan visual sidebar

- Periksa posisi tombol garis tiga dan logo pada navbar dengan sidebar.
- Pastikan pusat tombol navbar sejajar dengan pusat ikon Dashboard pada sidebar.
- Tes mode sidebar terbuka dan mode ikon saja pada layar desktop.
- Tes sidebar pada layar tablet dan mobile.
- Bersihkan semua jarak yang masih terlalu besar pada dashboard.

### 2. Sinkronisasi role aktif

- Pastikan Sidebar membaca role Supabase untuk seluruh role.
- Moderator tidak boleh tampil sebagai Admin karena urutan role harus sesuai desain.
- Jika satu pengguna memiliki beberapa role, tentukan dashboard role aktif yang diprioritaskan.
- Periksa route layout agar role `admin` tidak dipakai untuk moderator tanpa sengaja.

### 3. API dan autentikasi

- Periksa error HTTP 401 pada endpoint dashboard pesanan, reputasi, dan konten.
- Pastikan header Bearer token dikirim menggunakan Access Token Supabase.
- Pastikan JWT strategy dan tenant/user ID pada backend konsisten.
- Pastikan endpoint `users/me/content` valid untuk semua sesi login.

### 4. Alur artikel

- Uji Member membuat artikel dari `/articles/write`.
- Simpan draft ke Supabase melalui API.
- Ajukan artikel menggunakan `POST /content/:id/submit`.
- Pastikan tiket `knowledge_queue` muncul pada moderator.
- Uji keputusan moderator:
  - approve
  - revision_requested
  - rejected
- Pastikan dashboard member menerima pembaruan status.
- Tambahkan tindakan publikasi terpisah setelah status `approved`.

### 5. Custom tema

- Selesaikan warna tiap tema untuk navbar, sidebar, body, card, dan tombol.
- Perbaiki kontras teks pada tema Gelap.
- Tambahkan jika perlu tema baru:
  - forest
  - rose
  - custom warna perusahaan
- Pastikan pilihan tema masih aktif setelah halaman dimuat ulang.
- Hindari menyimpan tema custom berupa warna dinamis tanpa aturan CSS yang lengkap.

## Prioritas Besok

1. Perbaiki penyelarasan visual final sidebar dan navbar.
2. Verifikasi masing-masing role login menggunakan akun uji.
3. Perbaiki API dashboard yang masih menerima HTTP 401.
4. Lakukan uji lengkap alur artikel Member ke Moderator.
5. Tes seluruh tema pada dashboard, sidebar, navbar, card, dan form.
6. Jalankan kembali:

```powershell
cd "F:\revisi RM\Racik meida nusantasa"
npm run typecheck
```

## File Utama untuk Dilanjutkan

- `apps/web/src/components/layout/Navbar.tsx`
- `apps/web/src/components/layout/Sidebar.tsx`
- `apps/web/src/app/globals.css`
- `apps/web/src/app/articles/write/page.tsx`
- `apps/web/src/app/(dashboard)/dashboard/page.tsx`
- `apps/web/src/app/(admin)/admin/moderation/page.tsx`
- `apps/api/src/features/content/services/content.service.ts`
- `apps/api/src/features/moderation/services/ticket.service.ts`
- `apps/api/src/features/identity/controllers/user.controller.ts`
