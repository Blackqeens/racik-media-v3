# OBSERVABILITY ARCHITECTURE
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `observability-architecture.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |

---

## A. TIGA PILAR OBSERVABILITAS (THREE PILLARS)
1. **Logs:** Pencatatan jejak teks aplikasi terbagi atas: Log Aplikasi Internal, Log Transaksi Audit imutabel (`correlation_id` aktif), dan Log Anomali Keamanan.
2. **Metrics:** Pemantauan indikator vital server: Penggunaan CPU, konsumsi memori RAM, jumlah request masuk per detik (RPS), tingkat latensi API (ms), dan persentase tingkat kegagalan respons sistem.
3. **Tracing:** Pelacakan perjalanan request pengguna yang menembus batas antar-modul internal untuk mendeteksi simpul kemacetan performa (*bottleneck detection*).

---

## B. ATURAN PEMICU PERINGATAN BAHAYA (CRITICAL ALERTS SYSTEM)
Sistem peringatan otomatis wajib terhubung langsung ke kanal komunikasi darurat tim DevOps (seperti Slack Alert atau WhatsApp Admin) jika mendeteksi kondisi kritis berikut:
* `DATABASE_DOWN`: Koneksi backend menuju database utama PostgreSQL terputus.
* `ESCROW_FAILURE` / `ESCROW_TAMPERED`: Terdeteksi upaya manipulasi data log ledger escrow atau kegagalan pelepasan dana otomatis.
* `HIGH_ERROR_RATE`: Persentase respons kode HTTP 500 melonjak di atas 5% dalam kurun waktu 1 menit berkelanjutan.
* `QUEUE_FAILURE`: Antrean pesan kritis pada RabbitMQ mengalami penumpukan (*backlog*) tanpa ada proses hantaran sukses.

---

## C. PEMISAHAN DASBOR VISUALISASI (MONITORING DASHBOARDS)
* **Technical Dashboard:** Dasbor visual performa server, runtime memori, IOPS database, dan metrik jaringan untuk tim Tech.
* **Business Dashboard:** Metrik volume transaksi sukses, jumlah register harian, rute jalur escrow aktif untuk tim Finansial.
* **Security Dashboard:** Visualisasi pelacakan aktivitas login abnormal, deteksi serangan brute force, dan log aksi pemblokiran akun admin.


---
