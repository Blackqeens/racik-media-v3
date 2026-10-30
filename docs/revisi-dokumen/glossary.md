# GLOSSARY 

| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `glossary.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |

---

## A. TERMINOLOGI AKTOR & PENGGUNA (ACTORS & ROLES)
* **Member:** Akun Identity dasar; dapat membaca konten publik dan menjadi pembeli.
* **Pro:** Tier langganan Membership yang memberi benefit tertentu; bukan role profesi/komersial.
* **Author:** Role aditif untuk menulis konten setelah verifikasi/kurasi yang berlaku.
* **Seller:** Role dagang perorangan ber-KYC. Data produk komersial yang diunggah oleh Seller/Vendor secara kanonik disimpan dalam tabel `catalog_items`.
* **ServiceProvider:** Role penyedia jasa ber-KYC dan MFA.
* **Distributor:** Role bisnis grosir/B2B ber-KYB dan MFA.
* **Vendor:** Profil organisasi/etalase resmi yang dimiliki domain Vendor; bertindak sebagai entitas pemilik/induk dari `catalog_items`.
* **Verified Vendor:** Label verifikasi badan usaha setelah KYB disahkan Admin.
* **Enterprise:** Tier korporasi/multi-tenant yang tersedia mulai Phase 5.

---

## B. TERMINOLOGI TRANSAKSI & TATA KELOLA (COMMERCIAL & GOVERNANCE)
* **Order:** Kesepakatan transaksi komersial sah yang mengikat antara pihak pembeli dengan pihak penjual.
* **Escrow:** Kontrak pengamanan dana terikat satu order melalui payment/disbursement provider; bukan rekening bersama platform, bukan saldo wallet, dan tidak melakukan pooling.
* **Dispute:** Kondisi perselisihan komersial resmi akibat ketidaksesuaian barang atau jasa hasil kiriman penjual.
* **Quotation:** Penawaran skema harga dan spesifikasi teknis khusus yang diterbitkan penjual untuk merespons permintaan pesanan kustom.
* **RFQ (Request for Quotation):** Formulir permintaan penawaran pengadaan grosir yang diajukan calon pembeli kepada penjual; penjual merespons dengan Quotation.


## C. ISTILAH ARSITEKTUR
* **Moderator:** Reviewer/rekomendator kurasi. Moderator tidak mengesahkan final KYC/KYB, sanksi permanen, atau pemulihan akun.
* **Admin:** Pengesah final KYC/KYB, keputusan Level 3, banding, pemulihan, dan arbitrase final; semua tindakan dicatat Governance.
* **KYC/KYB:** Verifikasi identitas personal/badan usaha; Moderator meninjau dan Admin mengesahkan.
* **Provenance:** Bukti asal-usul produk; data dimiliki domain Provenance.
* **Status database:** lowercase snake_case (`under_review`); PascalCase adalah label presentasi.
* **Event kanonik:** nama wire RabbitMQ uppercase dengan titik menjadi underscore. Setiap event wajib menyertakan atribut `correlation_id` untuk pelacakan forensik lintas domain. Katalog tunggal: `event-map.md`.


---
