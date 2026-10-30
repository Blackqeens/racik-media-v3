# STORAGE ARCHITECTURE
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `storage-architecture.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |
| **Prinsip Utama** | **Database = Metadata Only, Storage = Object Store Blob** |

---

## A. PRINSIP STRUKTUR DIREKTORI (STORAGE HOUSING)
Seluruh aset digital ekosistem diisolasi ke dalam bucket Object Storage dengan struktur direktori terpusat sebagai berikut:

```text
storage/
├── avatars/                # Foto profil publik pengguna dan admin
├── kyc/                    # Dokumen sensitif KTP dan Selfie (Private encrypted)
├── kyb/                    # Dokumen legalitas korporasi, NPWP, NIB (Private encrypted)
├── vendors/                # Aset portofolio, sertifikasi keahlian vendor
├── products/               # Foto produk fisik, thumbnail visual marketplace
├── services/               # Dokumen brief, lampiran teknis penawaran jasa
├── deliverables/           # Hasil kerja jasa (private, terikat order/milestone)
├── provenance/             # Sertifikat/bukti asal-usul (private)
├── shipping-manifests/     # Bukti manifest dan serah terima (private)
├── disputes/               # Bukti sengketa (private)
├── articles/               # Gambar utama artikel dan aset media markdown
├── community/              # Gambar ilustrasi forum dan grup diskusi
├── contracts/              # File PDF Surat Perjanjian Kerja / SPK digital (Secured)
├── invoices/               # Dokumen PDF bukti bayar resmi dan resi transaksi
└── chat/                   # File lampiran multimedia hasil obrolan pengguna
```

---

## B. KONVENSI PENAMAAN FILE (NAMING CONVENTION)
Setiap file yang diunggah wajib diubah namanya secara otomatis oleh sistem (*sanitized randomized*) untuk mencegah peretasan berbasis manipulasi nama file dan konflik duplikasi:
* **Format:** `{domain_prefix}_{correlation_id}_{timestamp_epoch}_{random_suffix}.{extension}` dengan suffix acak minimal 128-bit.
* **Contoh:** `kyc_c89b21f9-4d6f-4740_1792823600_a81f03c2.jpg`

---

## C. KEBIJAKAN AKSES & STRATEGI CDN (ACCESS POLICY & CDN STRATEGY)

### 1. Kategori Publik (Public CDN Bucket)
* **Direktori:** `avatars/`, `products/`, `articles/`, `community/`, `vendors/` (portofolio umum).
* **Strategi:** Didistribusikan melalui simpul tepi CDN (*Edge Nodes*) dengan masa kedaluwarsa tembolok (*cache lifetime*) yang panjang untuk efisiensi latensi.

### 2. Kategori Privat & Sensitif (Private Signed URL Bucket)
* **Direktori:** `kyc/`, `kyb/`, `contracts/`, `invoices/`, `chat/`.
* **Direktori privat tambahan:** `deliverables/`, `provenance/`, `shipping-manifests/`, `disputes/`, dan `services/` (brief/lampiran privat kecuali dipublikasikan eksplisit).
* **Strategi:** CDN publik tidak digunakan. File dienkripsi saat transit dan saat tersimpan. Akses hanya melalui signed URL backend maksimal 15 menit setelah pengecekan role/tenant/order.
* **Unggahan universal:** allowlist tipe/ukuran, nama file sanitasi, malware scan sebelum file tersedia, karantina hasil tidak aman, dan audit akses/hasil scan.

---

## D. KEBIJAKAN RETENSI & STRATEGI CADANGAN (FILE RETENTION & BACKUP)
* **Retensi Dokumen Keuangan/Hukum (`invoices/`, `contracts/`):** Minimum 7 tahun, sesuai kewajiban hukum.
* **Retensi KYC/KYB:** Simpan selama verifikasi aktif dan masa kewajiban hukum; hapus atau anonimisasi setelah tujuan/retensi berakhir melalui job terotorisasi.
* **Retensi Lampiran Obrolan:** Order 5 tahun; Support 3 tahun; private/vendor 1 tahun, mengikuti retensi pesan.
* **Backup:** Cross-region replication dan object lock mendukung recovery; lifecycle purge terjadwal adalah pengecualian kebijakan yang tercatat. Object Lock tidak boleh membuat data melewati retensi hukum/privasi; konfigurasi lock harus dapat memenuhi purge yang diwajibkan.
