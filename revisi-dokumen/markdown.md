markdown
# DATABASE CONVENTIONS

| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `database-conventions.md` |
| **Versi** | 1.1 |
| **Status** | **In review** |

---

## A. ATURAN PENAMAAN (NAMING CONVENTIONS)

* **Tabel & Kolom:** Wajib menggunakan format huruf kecil dengan pemisah garis bawah (`snake_case`). Nama tabel harus berbentuk kata benda jamak (*plural*).
* **Contoh Benar:** `users`, `user_profiles`, `escrow_contracts`, `order_items`.
* **Contoh Salah:** `UserProfiles`, `userProfile`, `user_profile`.

---

## B. ATURAN BLUEPRINT STRUKTUR KOLOM STANDAR

### 1. Primary Key
* **Format & Tipe Data:** Wajib menggunakan format `id UUID PRIMARY KEY`.
* **Nilai Default:** Ditentukan menggunakan UUIDv7 (atau menggunakan `gen_random_uuid()` untuk kompatibilitas UUIDv4 jika UUIDv7 belum didukung penuh oleh *database engine*).
* **Larangan:** Dilarang menggunakan tipe integer urutan otomatis (*auto-increment integer*).
* **Tabel Relasi (Many-to-Many):** Hubungan penghubung murni menggunakan komposit PK (`PRIMARY KEY (left_id, right_id)`).

### 2. Foreign Key
* **Format Naming:** Wajib menggunakan nama entitas tunggal diikuti akhiran `_id`. Contoh: `user_id`, `vendor_id`, `order_id`.
* **Ketentuan Kontrak Referensial (ON DELETE):** Wajib mendefinisikan aksi referensial secara eksplisit (misalnya `ON DELETE RESTRICT` atau `ON DELETE CASCADE` sesuai kebutuhan integritas data).
* **Kepemilikan Ambigu & Polimorfik:** Untuk entitas seperti `catalog_items` yang kepemilikannya bisa bersifat alternatif antara vendor atau distributor, wajib menerapkan salah satu pendekatan berikut:
  * Menggunakan kolom penanda tipe dan ID objek (`owner_type` + `owner_id`).
  * Menyediakan kolom relasi terpisah (misalnya `vendor_id` dan `distributor_id`) yang divalidasi dengan constraint `CHECK` agar salah satu kolom wajib terisi secara eksklusif.

### 3. Jejak Waktu (Timestamps) & Soft Deletion
* **Tabel Mutable:** Wajib memiliki kolom `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` dan `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`. Perubahan nilai `updated_at` wajib diotomatisasi menggunakan mekanisme database *trigger* pada setiap aksi *UPDATE*.
* **Soft Deletion (`deleted_at`):** Entitas yang membutuhkan fitur penghapusan logis wajib menyertakan kolom `deleted_at TIMESTAMPTZ NULL`. Untuk menjaga integritas keunikan data saat menggunakan soft delete, indeks unik wajib menggunakan *partial unique index* dengan kondisi `WHERE deleted_at IS NULL`.
* **Tabel Append-Only / Log:** Hanya menyertakan kolom `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`. Penggunaan kolom `updated_at` dan `deleted_at` tidak diperbolehkan pada jenis tabel ini.

### 4. Multi-Tenancy (Tenant)
* **Aturan Kolom:** Semua tabel yang bersifat *tenant-aware* wajib menyertakan kolom `tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT`.
* **Sentinel Tenant:** Penggunaan baris *sentinel* (seperti UUID berisi nol penuh `00000000-0000-0000-0000-000000000000`) dilarang digunakan sebagai nilai default implisit karena dapat menyembunyikan kesalahan kode yang lupa mengisi data tenant. Keberadaan baris *sentinel* di dalam database harus dipastikan ada secara eksplisit, dan seluruh ketergantungan ini dijadwalkan untuk dihapus sepenuhnya pada Enterprise Phase 5.

### 5. Aturan Moneter & Penamaan Objek Database
* **Tipe Data Uang:** Seluruh nilai finansial atau mata uang wajib disimpan menggunakan tipe data `NUMERIC(p, s)` dengan presisi yang disesuaikan (contoh: `NUMERIC(15, 4)`). Dilarang keras menggunakan tipe data pecahan tidak pasti seperti `FLOAT` atau `REAL`.
* **Penamaan Constraint & Indeks:** Wajib mengikuti format baku untuk mempermudah pelacakan error:
  * Primary Key: `pk_nama_tabel`
  * Foreign Key: `fk_nama_tabel_nama_kolom`
  * Unique Index: `uq_nama_tabel_nama_kolom`
  * Check Constraint: `chk_nama_tabel_nama_kolom`

---

## C. KOLOM STATUS & KEPEMILIKAN (STATUS & AUDIT COLUMNS)

### 1. Kolom Status
* **Lifecycle Utama:** Kolom status utama wajib diberi nama `status` dengan tipe data string terbatas (`VARCHAR(50)` atau tipe `ENUM` database).
* **Validasi Nilai:** Wajib dilengkapi dengan constraint `CHECK (status IN ('nilai_1', 'nilai_2'))` untuk memastikan integritas data jika menggunakan `VARCHAR`.
* **Format Nilai:** Seluruh nilai status di dalam database wajib ditulis dalam format huruf kecil `snake_case` (sesuai ADR-001 D7). Contoh: `active`, `under_review`, `suspended`. Penulisan format PascalCase (`UnderReview`) hanya digunakan sebagai label tampilan pada layer aplikasi.
* **Kolom Status Turunan:** Untuk entitas yang memiliki siklus status independen di luar siklus utama (seperti status validasi atau anomali), diizinkan menggunakan nama kolom turunan khusus seperti `anomaly_status`, `validation_status`, atau `incident_status`. Seluruh nilai di dalam kolom turunan ini tetap wajib mematuhi aturan format huruf kecil `snake_case`.

### 2. Kolom Audit & Proteksi Append-Only
* **Tabel Mutable:** Setiap perubahan data oleh pengguna atau administrator wajib dicatat melalui kolom `created_by UUID` dan `updated_by UUID` (atau kolom domain identitas yang setara).
* **Tabel Append-Only / Log:** 
  * Setiap rekaman wajib menggunakan kolom `actor_id UUID` untuk mengidentifikasi pelaku aksi.
  * Wajib menyertakan kolom `correlation_id UUID` pada setiap tabel *event* atau *log* untuk kebutuhan pelacakan rantai proses transaksi secara menyeluruh.
  * Keamanan integritas data pada tabel append-only (`*_audit_logs`, `*_change_logs`, `*_events`, `reputation_events`) dilindungi secara ketat. Proses eksekusi perintah `UPDATE` dan `DELETE` wajib diblokir total menggunakan database *trigger*.
  * Sebagai pengamanan tambahan, hak akses instruksi penulisan wajib dibatasi menggunakan perintah `REVOKE UPDATE, DELETE ON nama_tabel FROM nama_role;` serta pemasangan *trigger* tambahan untuk menangani instruksi `TRUNCATE`. Pengecualian pembersihan data (*purge*) hanya boleh dilakukan oleh *job* retensi otomatis yang terdaftar resmi sesuai ketentuan dokumen `audit-strategy.md`, di mana *job* tersebut wajib mencatat log audit pembersihan secara terpisah.

### 3. Daftar Nama Kanonik Tabel (Sebagian)
Nama-nama tabel berikut merupakan standar penamaan baku yang telah disepakati. Daftar ini bersifat parsial dan hanya memuat sebagian contoh utama entitas sistem:
* `users`
* `vendors`
* `content_items`
* `catalog_items`
* `catalog_provenances`
* `service_listings`
* `orders`
* `escrow_contracts`
* `escrow_milestone_tranches`
* `moderation_tickets`
* `disputes`
* `quotations`
* `rfqs`
* `*_audit_logs` (dan tabel log sejenis)
Gunakan kode dengan hati-hati.
Dokumen database-conventions.md telah diperbarui dengan menggabungkan aturan revisi ke dalam blueprint standar untuk menjaga prinsip single source of truth, menyeragamkan bahasa ke Bahasa Indonesia formal, serta melengkapi aturan teknis baru seperti tipe data uang, constraint, dan skema proteksi tabel append-only.
Jika Anda ingin melanjutkan proses perbaikan, mohon informasikan:
• Apakah Anda ingin saya membuat draf perbaikan untuk file glossary.md berdasarkan daftar nomor 11 hingga 15 pada tabel perbaikan Anda?
• Apakah ada batasan panjang karakter tertentu untuk kolom VARCHAR status yang ingin Anda tetapkan sebagai standar baku?
Saya siap menyesuaikan draf dokumen berikutnya agar selaras dengan kebutuhan arsitektur sistem Anda.
