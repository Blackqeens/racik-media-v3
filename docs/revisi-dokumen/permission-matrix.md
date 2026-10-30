# PERMISSION MATRIX 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `permission-matrix.md` |
| **Versi** | 2.1 (Role & ABAC Aligned with No-Wallet & Enterprise Specs) |
| **Status** | **In review; senior architect approval pending** |
| **Model Keamanan** | **Role-Based Access Control (RBAC) & Attribute-Based (ABAC)** |

---

## A. DEFINISI PERAN PENGGUNA (*ROLE DEFINITION ARCHITECTURE*)

Platform mengadopsi prinsip **Additive Role Expansion** (Satu Akun Master dapat memiliki kombinasi peran tanpa membuat akun terpisah):

1. **Free Member:** Anggota terdaftar dasar. Berhak membaca konten publik, berkomentar, berinteraksi di forum, dan membeli produk/jasa (*Buyer*).
2. **Pro Member:** Anggota berlangganan berbayar dengan benefit badge Pro, kuota simpanan lebih besar, analisis personal, materi eksklusif, dan prioritas pencarian.
3. **Author:** Anggota yang terverifikasi untuk menulis dan mempublikasikan karya literatur ilmiah, artikel opini, atau jurnal kurasi.
4. **Seller (Individu):** Pengguna yang telah lulus verifikasi **KYC** individu. Berhak menjual produk retail dan menawarkan jasa standar.
5. **Verified Vendor (Bisnis/KYB):** Entitas usaha yang telah divalidasi **KYB** (NIB, SIUP, legalitas). Memiliki badge resmi, kuota katalog tak terbatas, fitur multi-user tim, dan integrasi B2B RFQ.
6. **Enterprise / Agency:** Korporasi skala besar dengan akses multi-tenant, kuota tanpa batas, analitik BI tingkat lanjut, dan API developer resmi.
7. **Moderator:** Tim pengawas ekosistem internal untuk kurasi konten, verifikasi etalase, respon laporan pelanggaran komunitas, dan mediasi sengketa awal.
8. **Admin / Super Admin:** Pengendali tata kelola, pengesahan final KYC/KYB, audit AML, keputusan Level 3/pemulihan, arbitrase final, dan konfigurasi sistem. Tidak memegang role komersial.

`Distributor` adalah role aditif ber-KYB setara Verified Vendor untuk B2B/RFQ; `ServiceProvider` adalah role ber-KYC untuk penawaran jasa. `Author` adalah role terpisah. `Enterprise` adalah membership/tier korporasi, bukan role Identity dan tidak menggantikan verifikasi KYB.

---

## B. MATRIKS OTORISASI AKSES FITUR (*PERMISSION MATRIX*)

| Nama Fitur / Kemampuan Sistem | Free Member | Pro Member | Author | Seller (KYC) | Verified Vendor (KYB) | Enterprise | Moderator | Admin / Super |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baca Artikel & Ikut Forum Komunitas** | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| **Tulis Artikel & Jurnal Ilmiah (Knowledge CMS)** | ✖ | ✖ | ✔ | ✔* | ✔* | ✔ | ✔ | ✔ |
| **Akses Materi Premium & Edukasi Pro** | ✖ | ✔ | ✖ | ✖ | ✔ | ✔ | ✔ | ✔ |
| **Jual Produk Fisik / Digital (Retail)** | ✖ | ✖ | ✖ | ✔ | ✔ | ✔* | ✖ | ✖ |
| **Tawarkan Jasa & Termin Milestones** | ✖ | ✖ | ✖ | ✔** | ✔** | ✔* | ✖ | ✖ |
| **Ikuti Tender Pengadaan B2B / RFQ** | ✖ | ✖ | ✖ | ✖ | ✔*** | ✔* | ✖ | ✖ |
| **Buka Negosiasi & Order Chat Klien** | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| **Kelola Sub-Akun Tim & Staf Operasional**| ✖ | ✖ | ✖ | ✖ | ✔ | ✔ | ✖ | ✔ |
| **Penerimaan Pencairan Dana (Bank Settlement)**| ✖ | ✖ | ✖ | ✔ | ✔ | ✔* | ✖ | ✖ |
| **Pengajuan Sengketa Transaksi (Dispute)**| ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ | ✔ |
| **Moderasi Konten & Take Down Pelanggaran**| ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✔ |
| **Review bukti sengketa (rekomendasi panel)**| ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✔ |
| **Keputusan final arbitrase sengketa**| ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |
| **Verifikasi dokumen KYC & KYB (rekomendasi)** | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✔ |
| **Pengesahan Final KYC & KYB** | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |
| **Audit Kepatuhan AML (> Rp 100 Juta)** | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |
| **Pembekuan Akun Global & Konfigurasi Sistem**| ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |

*Catatan (✔*): Enterprise hanya dapat bertransaksi melalui vendor yang memiliki role/tenant berizin; membership Enterprise saja tidak memberi hak jual. (✔**): Memerlukan role `ServiceProvider` aktif. (✔***): Memerlukan role `Distributor` atau vendor KYB yang diizinkan.
*Catatan: Seller/Verified Vendor menulis artikel hanya bila juga memegang peran Author aktif (additive role).

*Catatan: Seluruh pencairan dana vendor dieksekusi secara otomatis ke rekening bank terdaftar via Payment Gateway Disbursement saat Escrow dirilis (No internal wallet balance).*

---

## C. IMPLEMENTASI KENDALI BERBASIS ATRIBUT (ABAC CONSTRAINTS)

* **Aturan Kuota Katalog Berdasarkan Status:**
  * Peran `Seller` (KYC Individu) dibatasi maksimal **10 produk/jasa aktif** secara bersamaan.
  * Peran `Verified Vendor` (KYB Bisnis) dan `Enterprise` memiliki kuota katalog **tanpa batas (*unlimited*)**.
* **Aturan Kepatuhan Transaksi Finansial (AML Policy):**
  * Transaksi tunggal atau akumulatif dengan nilai **$\ge$ Rp100.000.000** secara otomatis memicu aturan ABAC: dana escrow dikunci sementara dan mewajibkan review manual dari tim `Security / Admin` sebelum dicairkan (*Anti-Money Laundering Compliance Check*).
* **Proteksi Mutasi Rekening Bank (2FA Constraint):**
  * Penambahan atau perubahan nomor rekening bank tujuan pencairan vendor wajib lulus verifikasi dua faktor instan (`two_factor_verified = true`) via WhatsApp OTP / Authenticator App.


## D. KETENTUAN KEPUTUSAN
Admin dan Moderator tidak boleh memegang peran komersial. Moderator memeriksa/merekomendasikan KYC/KYB, sedangkan Admin mengesahkan final. Freeze sementara boleh dilakukan mesin aturan dengan scope dan TTL; sanksi Level 3, banding, dan pemulihan akun hanya oleh Admin pada `governance_decisions`.
