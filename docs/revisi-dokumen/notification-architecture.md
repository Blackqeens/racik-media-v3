# NOTIFICATION ARCHITECTURE
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `notification-architecture.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |
| **Pola Pengiriman** | **Non-Blocking Broker Messaging Queue** |

---

## A. ALUR HANTARAN NOTIFIKASI (DELIVERY FLOW)

```text
[ Sistem Peristiwa (Event) ] -> Pemicu aksi, e.g., ORDER_CREATED
             │
             ▼
[ Notification Service ] -> Mengidentifikasi preferensi rute penerima & load template
             │
             ▼
[ Message Queue (Broker) ] -> Isolasi antrean pesan agar proses utama tidak terhambat
             │
             ▼
[ Channel Delivery Providers ] -> Eksekusi pengiriman ke gerbang eksternal (WA / Email / Push)
             │
             ▼
[ Penerima Akhir ] -> Pengguna menerima pesan pemberitahuan resmi
```

---

## B. SALURAN PENGIRIMAN & PRIORITAS (CHANNELS CONFIGURATION)
1. **WhatsApp Gateway:** Jalur utama untuk notifikasi transaksional kritis (OTP, Tagihan Pembayaran, Pesanan Masuk Vendor).
2. **Email Service:** Digunakan untuk pengiriman dokumen berukuran besar (Lampiran Invoice PDF, berkas Kontrak Kerja Bersama, Berita Acara Penyelesaian Sengketa).
3. **In-App & Push Notification:** Notifikasi real-time di dalam aplikasi untuk aktivitas interaksi sosial (Komentar artikel baru, balasan forum komunitas, indikator ketikan chat baru).

---

## C. MANAJEMEN ANTREAN & KEBIJAKAN GAGAL HANTAR (QUEUE & RETRY POLICY)
* **Isolasi Antrean:** Antrean dipisah menjadi dua jalur: `high-priority-queue` (untuk OTP dan keamanan akun) dan `low-priority-queue` (untuk promosi pemasaran).
* **Kebijakan Percobaan Ulang (Retry Policy):** Jika provider mengalami gangguan, sistem menerapkan exponential backoff maksimal 3 kali lalu menandai `delivery_failed` pada `notification_delivery_logs` milik Notification dan menerbitkan `notification.delivery_failed`. Log audit global ditulis oleh Audit melalui event.
