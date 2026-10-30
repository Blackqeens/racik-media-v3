# WORKFLOW DIAGRAMS 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `workflow-diagrams.md` |
| **Versi** | 2.1 (Lifecycle & State Machine Aligned) |
| **Status** | **In review; senior architect approval pending** |
| **Fokus Utama** | **State Machine & Siklus Hidup Entitas Utama Platform** |

---

## A. ALUR SIKLUS HIDUP ARTIKEL (*CONTENT LIFECYCLE*)

Setiap pembuatan konten publik wajib melalui alur kurasi kualitas dan kepatuhan norma komunitas (`content-lifecycle.md`).

```text
┌─────────────┐
│    MULAI    │
└──────┬──────┘
       │ Simpan Draft
       ▼
┌─────────────┐       Ajukan Review        ┌──────────────┐
│    DRAFT    ├───────────────────────────►│ UNDER REVIEW │◄────────────────────────┐
└─────────────┘                            └──────┬───────┘                         │
                                                  │                                 │
                   ┌──────────────────────────────┼───────────────────────────┐     │ Perbaikan
                   │ Lolos Kurasi                 │ Format/Sitasi Kurang      │     │ (Maks 14 Hari)
                   ▼                              ▼                           │     │
            ┌──────────────┐               ┌──────────────────────┐           │     │
            │   APPROVED   │               │  REVISION REQUESTED  ├───────────┴─────┘
            └──────┬───────┘               └──────────┬───────────┘
                   │ Auto Distribution Feed           │ Batas Waktu Habis
                   ▼                                  ▼
            ┌──────────────┐                   ┌──────────────┐
            │  PUBLISHED   │                   │   REJECTED   │ (Pelanggaran Berat)
            └──────┬───────┘                   └──────┬───────┘
                   │ Tarik / Kadaluarsa               │ Arsip Permanen
                   └──────────────────┬───────────────┘
                                      ▼
                               ┌──────────────┐
                               │   ARCHIVED   │
                               └──────────────┘
```

---

## B. ALUR SIKLUS HIDUP KATALOG PRODUK (*MARKETPLACE PRODUCT LIFECYCLE*)

Menjaga martabat pasar, keaslian asal-usul barang, dan mencegah perang harga destruktif (`marketplace-lifecycle.md`).

```text
┌─────────────┐
│    MULAI    │
└──────┬──────┘
       │ Pendaftaran / Update Harga
       ▼
┌──────────────┐
│ UNDER REVIEW │◄────────────────── Perbaikan Anomali / Verifikasi Ulang ──────────────────┐
└──────┬───────┘                                                                            │
       │                                                                                    │
       ├───────────────────────────────┬────────────────────────────────┐                   │
       │ Lolos Kurasi                  │ Anomali Harga / Dumping        │ Pelanggaran Berat │
       ▼ (Floor Price Valid)           ▼                                ▼ (Kategori Ilegal) │
┌──────────────┐               ┌───────────────┐                 ┌──────────────┐           │
│    ACTIVE    ├──────────────►│   SUSPENDED   ├─────────────────┴──────────────┘           │
└──────┬───────┘ Modifikasi /  └───────┬───────┘                                            │
       │         Predatory Dumping     │ Audit Kurator Selesai (Cleared)                    │
       │         Terdeteksi            └────────────────────────────────────────────────────┘
       │
       │ Penonaktifan Sukarela / Delisting
       ▼
┌──────────────┐
│   ARCHIVED   │
└──────────────┘
```

---

## C. ALUR TRANSAKSI PESANAN & BRANKAS ESCROW (*ORDER & ESCROW TRANSACTION FLOW*)

Arsitektur transaksi inti tanpa dompet (*No-Wallet Financial Model*) untuk menjamin keamanan dana pembeli dan kepastian pembayaran penjual langsung ke rekening bank.

```text
   [ CHECKOUT ]             Pembeli menekan tombol bayar pada keranjang/penawaran.
        │
        ▼
   [ MENUNGGU BAYAR ]       Domain Payment menerbitkan Invoice & Payment Link Midtrans/Xendit.
        │
        ▼
   [ PEMBAYARAN DITERIMA ]  Webhook Payment Gateway mengonfirmasi dana berhasil masuk.
        │
        ▼
   [ ESCROW LOCKED ]        Dana dikunci pada kontrak escrow per order (tanpa pooling/saldo platform).
        │                   Timer auto-release dimulai saat Delivered (fisik, 7 hari) / Submitted (jasa, 72 jam).
        ▼
   [ DALAM PROSES ]         Vendor mengirimkan barang fisik atau memulai pengerjaan jasa.
        │
        ├────────────────────────────────────────────────┐
        │ Pembeli konfirmasi pesanan selesai /           │ Pembeli mengajukan komplain
        │ Timer auto-release berakhir tanpa komplain     │ (DisputeTriggerButton ditekan)
        ▼                                                ▼
   [ PESANAN SELESAI ]                              [ DISPUTE HOLD ]
        │                                                │ Dana dibekukan sementara.
        ▼                                                ▼
   [ DIRECT BANK SETTLEMENT ]                       [ MEDIASI & ARBITRASE ]
   Dana ditransfer langsung oleh Payment Gateway    Panel mediasi chat dibuka. Tim Admin
   ke rekening bank resmi vendor yang terdaftar.    mengevaluasi bukti dan dokumen.
   (No Internal Platform Wallet Balance).                │
        │                                                ├──────────────────────┐
        ▼                                                ▼                      ▼
   [ TRANSAKSI DITUTUP ]                            [ REFUND PEMBELI ]    [ SETTLEMENT VENDOR ]
```

---

## D. ALUR JASA DENGAN TERMIN KERJA (*SERVICE MILESTONES LIFECYCLE*)

Mengatur transaksi jasa profesional berbasis pencapaian target kerja bertahap (*milestones*).

```text
   [ KONTRAK DISEPAKATI ]   Klien & Vendor menyepakati Ruang Lingkup, Deadline, & N-Milestones.
        │
        ▼
   [ DEPOSIT MILESTONE ]    Klien membayar nominal Milestone ke-N ke Brankas Escrow.
        │
        ▼
   [ PENGERJAAN JASA ]      Vendor mengunggah berkas/deliverable hasil kerja di Digital Deliverable Vault (hash berkas dicatat).
        │
        ▼
   [ REVIEW & REVISI ]      Klien memeriksa hasil. Jika belum sesuai, meminta revisi (sesuai kuota).
        │
        ▼
   [ APPROVAL MILESTONE ]   Klien menyetujui hasil pengerjaan.
        │
        ▼
   [ DISBURSEMENT PARSIAL ] Dana termin ke-N langsung ditransfer ke rekening bank vendor.
        │
        ├─► Masih ada Milestone berikutnya? ───► Ulangi ke [ DEPOSIT MILESTONE ]
        │
        ▼
   [ KONTRAK SELESAI ]      Semua tahapan tuntas. Klien & Vendor bertukar ulasan/reputasi.
```

---

## E. ALUR VERIFIKASI IDENTITAS KYC & KYB (*VERIFICATION LIFECYCLE*)

Pemisahan jalur validasi identitas individu (Seller) dan legalitas korporasi (Official Vendor).

```text
   [ SUBMIT BERKAS ]
        │
        ├──► Jalur KYC (Individu) ──► Upload Foto KTP & Selfie ──► Pra-validasi otomatis (saran saja) -> review manusia (IdentityQueue)
        │                                                              │
        │                                                              ▼
        │                                                    [ ROLE: SELLER AKTIF ]
        │
        └──► Jalur KYB (Bisnis)   ──► Upload NIB, NPWP, SIUP   ──► Validasi Legal Admin
                                                                       │
                                                                       ▼
                                                             [ ROLE: VERIFIED VENDOR ]
```


---
