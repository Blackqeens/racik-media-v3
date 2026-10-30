# INTEGRATION MAP

| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `integration-map.md` |
| **Versi** | 1.2 |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Prinsip** | Integrasi eksternal lewat adapter milik domain owner |

## A. IDENTITY DAN NOTIFIKASI

| Kapabilitas | Integrasi | Owner dan batasan |
| :--- | :--- | :--- |
| OAuth | Google OAuth, Microsoft Entra ID | Identity; OAuth hanya untuk autentikasi, MFA tetap diwajibkan untuk role privileged |
| WhatsApp OTP | Provider WhatsApp Business API melalui adapter | Notification mengirim; Identity mengelola verifikasi dan tidak menyimpan OTP plaintext |
| Email | SMTP/API email provider melalui adapter | Notification; template dan delivery status dimiliki Notification |
| Push / in-app | Web Push dan in-app queue | Notification; event sumber mengikuti `event-map.md` |

Pemilihan vendor SMS/WhatsApp/email final dilakukan saat procurement. Kontrak internal, callback verification, retries, rate limits, dan secret management tetap vendor-neutral.

## B. LOGISTICS

* Outbound REST dan inbound webhook signature-verified melalui adapter Logistics.
* Biteship sebagai agregator kandidat utama; RajaOngkir untuk tarif dan Shipper sebagai opsi cadangan. Provider produksi harus dipilih/dikonfirmasi sebelum implementasi, bukan diasumsikan aktif sekaligus.
* Kurir domestik yang dapat diintegrasikan: JNE, J&T, SiCepat, Pos Indonesia; daftar aktif bergantung coverage kontrak provider.
* Webhook hanya diterima setelah verifikasi signature, timestamp/replay protection, dan idempotency check. Provider outage mengalihkan validasi ke review manual; tidak men-trigger sanksi otomatis.
* Detail nomor resi, penerima, alamat, foto, dan response provider disimpan terbatas/terenkripsi pada domain Logistics; event umum hanya mengirim `trackingRecordId`.

## C. PEMBAYARAN, STORAGE, AI, SEARCH, DAN MONITORING

| Kapabilitas | Integrasi | Owner dan batasan |
| :--- | :--- | :--- |
| Payment/disbursement | Adapter payment gateway; Midtrans dan Xendit kandidat yang masih perlu seleksi | Payment/Escrow; tidak membuat saldo wallet, webhook terverifikasi dan idempoten |
| Object storage | Supabase Storage sebagai baseline; S3-compatible adapter untuk backup/migrasi | Storage; signed URL, encryption, malware scan, lifecycle policy |
| AI | Langflow orchestration + Google Cloud Vertex AI | AI adapter; no direct DB access, rekomendasi saja, lihat `ai-integration-contracts.md` |
| Search | Meilisearch | Search read model melalui event; PostgreSQL tetap sumber kebenaran |
| Cache | Redis | Cache/session/rate limit; data dapat dibangun ulang, bukan master data |
| Monitoring | Prometheus + Grafana; tracing OpenTelemetry | Observability; log audit disimpan oleh domain Audit, bukan dashboard |

Dukcapil tidak diasumsikan sebagai integrasi. Jika kelak digunakan, harus melalui persetujuan legal, kontrak keamanan, tujuan pemrosesan yang sah, dan catatan ADR tersendiri.
