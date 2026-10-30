# CHAT ARCHITECTURE 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `chat-architecture.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |
| **Teknologi Inti** | **Persistent WebSocket Duplex Connection** |

---

## A. KATEGORI RUANG OBROLAN (CHAT TYPES)
1. **Private Chat:** Komunikasi antarpengguna umum di luar jalur komersial (koneksi basic).
2. **Order Chat:** Ruang obrolan terisolasi yang menempel ketat pada entitas `order_id`. Obrolan di area ini mengikat secara hukum ekosistem dan menjadi dokumen bukti primer jika terjadi sengketa kerja di domain Escrow.
3. **Vendor Chat:** Jalur interaksi sebelum transaksi antara calon pembeli dengan tim representasi vendor.
4. **Support Chat:** Saluran pengaduan langsung anggota ke tim moderator platform.

---

## B. KEBIJAKAN MANAJEMEN MATERI PENDUKUNG (ATTACHMENT POLICY)
* **Batasan Ukuran File:** Gambar maksimal 5MB, dokumen lampiran teknis (PDF/ZIP) maksimal 20MB.
* **Keamanan Unggahan:** Seluruh file kiriman wajib melewati modul pemindaian malware otomatis sebelum disimpan ke dalam direktori `storage/chat/` dan dialirkan ke pengguna tujuan.

---

## C. ATURAN RETENSI DAN TATA TERTIB CHAT (RETENTION & MODERATION)
* **Penyaringan Konten Otomatis:** Sistem mendeteksi secara *real-time* penggunaan kata-kata terlarang (*blacklisted words*) seperti indikasi penipuan transaksi di luar platform, pelecehan verbal, dan spamming iklan ilegal.
* **Masa Retensi Pesan dan Lampiran:**

```text
[ Ruang Obrolan Order ] --------------------> Pesan/lampiran 5 tahun
[ Ruang Obrolan Support ] ------------------> Pesan/lampiran 3 tahun
[ Ruang Obrolan Privat/Vendor ] ------------> Pesan/lampiran 1 tahun
```



## D. RILIS DAN RETENSI
Order Chat dan Support Chat dirilis bersama Commerce (V3.0/Phase 2). Private Chat dan Vendor Chat dirilis bersama Community (V3.1/Phase 3). Retensi attachment mengikuti retensi pesan: Order 5 tahun, Support 3 tahun, Private/Vendor 1 tahun; purge hanya oleh job retensi terjadwal sesuai `audit-strategy.md`.
