| Dokumen | `decision-record-architecture.md` |

| :--- | :--- |
| **Versi** | `1.0` |
| **Status** | **APPROVED / FROZEN** |
| **Teknologi Inti** | `System Architecture Blueprint` |

---

# Architecture Decision Record

| Path                 | File                              |
| :------------------- | :-------------------------------- |
| `docs/architecture/` | `architecture-decision-record.md` |

**STATUS DOKUMEN:** ``**VERSION:**`1.0.0`**LAST UPDATED:**`2026-10-24`**ARCHITECTURE BASELINE:**`V1`

---

# ADR-001: Domain Authority & Data Ownership Reference

### Status

Approved

### Decision

Menetapkan dokumen `data-ownership.md` (23 domain granular) sebagai sumber kebenaran utama (_Single Source of Truth_) dan acuan mutlak untuk seluruh rancangan arsitektur. Dokumen `domain-map.md` dan skema database wajib tunduk pada pemetaan batasan yang diatur di dalam `data-ownership.md`.

### Reason

Peta domain grafis sering kali hanya menjadi diagram visual abstrak. Sistem memerlukan definisi tertulis yang tegas mengenai batas-batas kepemilikan data nyata agar tidak terjadi tumpang tindih fungsi antarmodul.

### Impact

Seluruh pemetaan _database schema_, struktur repositori kode, dan hak akses data harus merujuk langsung pada domain yang terdaftar di `data-ownership.md`.

---

# ADR-002: Chat & Community Feature Prioritization

### Status

Approved

### Decision

Membagi pengiriman fitur komunikasi menjadi dua fase penahapan:

1. **V3.0 (Core Release):** Hanya mengimplementasikan _Order Chat_ dan _Support Chat_.
2. **V3.1 (Extension Release):** Mengimplementasikan fitur sosial seperti _Forum_, _Group_, dan _Feed_.

Seluruh transkrip _Order/Support Chat_ pada V3.0 wajib disimpan di **Supabase PostgreSQL** sebagai log _append-only_ (tanpa fitur edit/hapus), dengan pesan yang dialirkan melalui RabbitMQ event-bus.

### Reason

Fitur _Order Chat_ dan _Support Chat_ bersifat kritikal sejak hari pertama karena berfungsi sebagai instrumen penyedia barang bukti legal untuk mitigasi sengketa transaksi finansial pada _DisputeQueue_ di domain escrow. Fitur komunitas tidak berdampak langsung pada validitas alur transaksi ekonomi.

### Impact

Tim pengembang fokus 100% menyelesaikan mesin chat transaksi pada rilis utama V3.0 dan menunda seluruh pustaka kode atau dependensi sosial ke rilis V3.1.

---

# ADR-003: Database Status String Convention

### Status

Approved

### Decision

Mewajibkan standarisasi format penulisan nilai status di tingkat database. Seluruh kolom yang menyimpan status di database wajib menggunakan format **`lowercase snake_case`**. Penggunaan format **`PascalCase`** atau **`camelCase`** dilarang keras di layer persistensi data.

Format konversi visual:

- **Database (PostgreSQL/NoSQL):** `pending_payment`, `in_progress`, `completed`, `under_review`, `funds_deposited`.
- **User Interface (UI):** `Pending Payment`, `In Progress`, `Completed`.

### Reason

Mencegah inkonsistensi penulisan data status oleh tim pengembang yang berbeda, mempermudah proses indexing, serta menghindari kendala pencarian data sensitif (_case-sensitivity_) pada PostgreSQL.

### Impact

Seluruh script DDL SQL, mutasi status _backend_, dan skema pengecekan (_CHECK constraints_) wajib dideklarasikan dalam format _lowercase snake_case_.

---

# ADR-004: Write Ownership Enforcement

### Status

Approved

### Decision

Menegakkan aturan kedaulatan data secara mutlak: **Hanya domain owner yang memiliki hak akses menulis (_Write Access / INSERT, UPDATE, DELETE_) ke tabel miliknya sendiri**. Domain lain dilarang keras mengubah data domain asing secara langsung.

_Contoh:_ Domain Identity adalah pemilik tabel `users`, `individual_profiles`, dan `verifications`. Domain Marketplace dilarang melakukan operasi `UPDATE users`. Jika diperlukan perubahan, domain asing wajib melalui intervensi **Public API Barrel Export** atau menembakkan **Async Event-Bus**.

### Reason

Mencegah terjadinya keterikatan kode tingkat tinggi (_high coupling_), duplikasi data ilegal, serta menghindari kerusakan integritas data akibat mutasi dari pihak luar yang tidak memahami aturan bisnis domain tersebut.

### Impact

Implementasi keamanan database pada Supabase wajib mengunci kedaulatan ini menggunakan kebijakan **Row Level Security (RLS)** yang ketat dan isolasi _Database User Roles_.

---

# ADR-005: Event Naming Standard

### Status

Approved

### Decision

Standardisasi format penamaan event asinkronus menggunakan format nama kanonik **`domain.action`** (menggunakan huruf kecil). Untuk format pengiriman data (_wire format/message broker payload_), tanda titik ditransformasikan menjadi huruf besar dan dihubungkan dengan _underscore_ (**`DOMAIN_ACTION`**).

_Contoh Penamaan (mengikuti katalog resmi `event-map.md`):_

- Kanonik: `identity.role_activated` $\rightarrow$ Wire Format: `IDENTITY_ROLE_ACTIVATED`
- Kanonik: `order.created` $\rightarrow$ Wire Format: `ORDER_CREATED`
- Kanonik: `payment.succeeded` $\rightarrow$ Wire Format: `PAYMENT_SUCCEEDED`
- Kanonik: `escrow.milestone_released` $\rightarrow$ Wire Format: `ESCROW_MILESTONE_RELEASED`

Setiap event hanya boleh diterbitkan oleh satu entitas tunggal (_Single Publisher/Aggregate Root Owner_).

### Reason

Menjamin standarisasi jalur komunikasi berbasis peristiwa (_Event-Driven Architecture_), menyederhanakan pelacakan log (_debugging_), dan mempermudah proses _routing_ pesan pada _Event-Bus_.

### Impact

Seluruh definisi _Event Publisher_ dan _Event Consumer_ di dalam folder `src/core/events/` wajib mendaftarkan skema payload-nya ke dalam _Schema Registry_ terpusat mengikuti aturan penamaan ini.

---

# ADR-006: Escrow Contract Multi-Tranche Model

### Status

Approved

### Decision

Menetapkan model relasi finansial terisolasi: **1 Kontrak Komersial (`orders`) mengikat tepat 1 Kontrak Penampungan Dana (`escrow_contracts`), dan jasa bermilestone dapat dipecah menjadi beberapa tranche (`escrow_milestone_tranches`)** berbasis target kerja (_milestone_).

Aturan penguncian waktu otomatis (_Timer Automation Rule_):

- **Logistik Fisik:** Dana otomatis dicairkan tepat **7 hari (168 jam)** setelah status kurir pihak ketiga dinyatakan _Delivered_, jika tidak ada komplain.
- **Produk Jasa/Digital:** Dana otomatis dicairkan tepat **72 jam** setelah milestone diserahkan (_Submitted_), jika tidak ada komplain.

### Reason

Mendukung transaksi proyek kompleks berskala besar yang membutuhkan pembayaran bertahap (_Project Milestone_) tanpa perlu melakukan perombakan atau _redesign_ struktur tabel database di masa mendatang.

### Impact

Tabel `escrow_contracts` wajib mengunci _CHECK constraint_ status finansial dengan nilai `lowercase_snake_case`: `payment_detected`, `locked`, `in_transit`, `delivered`, `disputed`, `released`, `refunded`, dan `cancelled`. Tranche jasa menggunakan nilai: `locked`, `released`, `refunded`, `disputed`. (Sesuai `escrow-lifecycle.md` dan ADR-001 D7.)

---

# ADR-007: KYC & KYB Dual-Gate Governance

### Status

Approved

### Decision

Menetapkan tata kelola verifikasi identitas legal secara berlapis:

1. **Artificial Intelligence (AI):** Bertindak murni sebagai **Penasihat / Advisor** (melakukan analisis kecocokan citra, ekstraksi teks dokumen via OCR, dan memberikan rekomendasi skor validitas). AI dilarang mengambil keputusan akhir secara sepihak.
2. **Moderator:** Melakukan verifikasi manual dan pemeriksaan keabsahan fisik berkas via `IdentityQueue`. Berhak melakukan penolakan tiket.
3. **Admin:** Bertindak sebagai **Pemutus Akhir / Decision Maker** tertinggi yang memvalidasi hasil kerja Moderator untuk secara resmi mengesahkan peningkatan peran akun pengguna menjadi mitra legal platform.

### Reason

Menjaga kepatuhan hukum (_legal compliance_) yang sehat dan memastikan adanya akuntabilitas manusia nyata atas setiap keputusan hukum yang berdampak pada pembukaan akses finansial berisiko tinggi di platform.

### Impact

Logika bisnis pada kode aplikasi wajib menyediakan alur persetujuan bertingkat (_multi-step approval workflow_) sebelum status baris data pada tabel `verifications` berubah menjadi `approved`.

---

# ADR-008: Automated Sanctions Framework

### Status

Approved

### Decision

Mesin aturan berbasis kode terprogram (**Rule Engine**) berhak melakukan pembekuan sementara (_temporary freeze_) terhadap akun atau konten publik secara otomatis jika terpicu oleh sistem perimeter keamanan (seperti deteksi serangan massal _Sybil Attack_ atau anomali indikasi perang harga ekstrem).

Namun, hak eksekusi untuk menjatuhkan sanksi permanen (Sanksi Tingkat 3 / Blokir Permanen) serta otorisasi pemulihan status akun (_Unfreeze/Account Restoration_) **mutlak hanya bisa dilakukan secara manual atas persetujuan Admin** melalui _Governance Domain_. Sistem beralgoritma Kecerdasan Buatan (AI) dilarang keras melakukan pemblokiran akun otomatis secara sepihak.

### Reason

Melindungi ekosistem platform dari anomali siber secara cepat (_real-time response_) tanpa mengorbankan hak-hak keadilan pengguna akibat potensi kesalahan deteksi (_false positive_) oleh sistem otomatis atau kecerdasan buatan.

### Impact

Modul keamanan wajib membedakan status akun: pembekuan sementara otomatis oleh mesin aturan menggunakan `users.status = 'suspended'` dengan TTL dan alasan tercatat; pembekuan permanen hanya oleh Admin Governance menggunakan `users.status = 'permanently_revoked'` melalui `governance_decisions`. Nilai status menggunakan `lowercase_snake_case` (ADR-001 D7, D8).

---

# ADR-009: Log Immutability & Personal Data Retention Policy

### Status

Approved

### Decision

Menyeimbangkan regulasi transparansi forensik siber dengan undang-undang perlindungan data pribadi pengguna (GDPR / UU PDP):

1. **Audit Critical Logs:** Seluruh rekaman log transaksi finansial, log keamanan perimeter, dan log aktivitas utama pada **Supabase PostgreSQL (tabel `identity_audit_logs`, `security_audit_logs`, `moderation_audit_logs`, `financial_audit_logs`)** bersifat **mutlak abadi (_Immutable_)**. Tabel append-only dilindungi trigger blocker yang menolak `UPDATE` dan `DELETE`. Purge terjadwal oleh job retensi adalah satu-satunya pengecualian sesuai `audit-strategy.md`.
2. **Personally Identifiable Information (PII):** Jika pengguna meminta penghapusan akun secara resmi, data pribadi sensitif mereka (seperti nama, email, nomor telepon) di dalam log audit **wajib dianonimkan secara permanen** (menggunakan teknik enkripsi searah/hashing atau penggantian string identitas). Identitas akan digantikan oleh token UUID anonim, namun nominal angka transaksi dan kronologi log tetap dipertahankan utuh untuk validitas pembukuan keuangan.

### Reason

Menghindari benturan hukum antara hak penghapusan data pribadi pengguna (_The right to be forgotten_) dengan kewajiban platform untuk menyediakan rekam jejak forensik keuangan yang utuh di mata hukum jika terjadi audit pidana di kemudian hari.

### Impact

Seluruh service yang berinteraksi dengan tabel audit (`*_audit_logs`) dilarang mengekspos endpoint DELETE untuk log tersebut. Fungsi penghapusan akun wajib menggunakan modul Anonymizer Worker untuk mengganti kolom PII dengan string acak terenkripsi, bukan menghapus baris log. Purge retensi hanya oleh job terjadwal yang mengaudit setiap penghapusan.
