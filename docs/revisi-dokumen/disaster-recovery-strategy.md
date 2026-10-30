# DISASTER RECOVERY STRATEGY 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `disaster-recovery-strategy.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |
| **Fokus** | **Kontinuitas Bisnis & Rekonsiliasi Status Transaksi** |

---

## A. METRIK PEMULIHAN SISTEM (RPO & RTO STANDARDS)
* **Recovery Point Objective (RPO):** Maksimal data hilang adalah **5 menit**. Kehilangan data akibat bencana di atas batasan ini dianggap sebagai kegagalan sistem fatal.
* **Recovery Time Objective (RTO):** Identity, Order, Payment, Escrow, dan event processing dipulihkan maksimal **2 jam**; layanan non-kritis maksimal **8 jam**.

---

## B. STRATEGI CADANGAN DATA (BACKUP STRATEGY)
* **PostgreSQL (Supabase):** Continuous WAL archiving dan snapshot penuh tiap 6 jam; backup 30 hari. Audit logs direplikasi ke storage terpisah/append-only agar PITR database operasional tidak menghapus atau me-rollback bukti audit.
* **Object Storage:** Cross-region replication; retention/object lock wajib mengikuti legal purge policy.
* **Redis:** Cache dibangun ulang; tidak perlu restore sebagai master state.
* **Meilisearch:** Indeks dibangun ulang dari event/outbox dan PostgreSQL.
* **RabbitMQ:** Durable queues, publisher confirms, dead-letter queue, dan pemulihan/replay idempoten dari outbox.
* **Chat:** Pesan persistent dan attachment dipulihkan sesuai RPO/RTO domain kritis.

---

## C. PROSEDUR REKONSILIASI KRONOLOGIS (*STATE RECONCILIATION*)
Jika terjadi pemulihan database dari titik cadangan (*Point-in-Time Recovery*):
1. **Pemeriksaan File Hantu:** Sistem melakukan pemindaian otomatis membandingkan metadata di database dengan berkas fisik asli di Object Storage untuk mencegah adanya file tanpa data (*orphan files*).
2. **Rekonsiliasi Escrow/Payment:** `financial_audit_logs` adalah ledger immutable, bukan queue. Replay dilakukan dari outbox/RabbitMQ secara idempoten, kemudian dicocokkan dengan webhook dan laporan settlement payment gateway menggunakan `correlation_id`; jangan mengulang payout sebelum status eksternal terverifikasi.


---
