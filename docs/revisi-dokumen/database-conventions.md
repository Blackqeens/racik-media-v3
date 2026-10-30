# DATABASE CONVENTIONS 
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `database-conventions.md` |
| **Versi** | 1.1 |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |

---

## A. ATURAN PENAMAAN (NAMING CONVENTIONS)

* **Tabel:** Wajib menggunakan format huruf kecil dengan pemisah garis bawah (`snake_case`) dan berbentuk kata benda **jamak**. Contoh benar: `users`, `user_roles`, `escrow_contracts`, `order_items`. Contoh salah: `UserProfiles`, `userProfile`, `user_profile`.
* **Kolom:** Wajib menggunakan `snake_case`. Contoh: `user_id`, `created_at`, `order_type`.
* **Indeks:** Gunakan prefix `idx_` diikuti nama tabel dan kolom. Contoh: `idx_logistics_change_logs_order_id`.

---

## B. ATURAN BLUEPRINT STRUKTUR KOLOM STANDAR

### Primary Key
Wajib menggunakan:
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```
Dilarang menggunakan tipe integer urutan otomatis (`BIGSERIAL`, `SERIAL`).

### Foreign Key
Wajib menggunakan nama entitas tunggal diikuti akhiran `_id`. Contoh: `user_id`, `vendor_id`, `order_id`, `escrow_contract_id`.

### Timestamps
**Tabel mutable** (memiliki lifecycle status, dapat diubah):
```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

**Tabel append-only** (`*_audit_logs`, `*_change_logs`, `*_events`, `reputation_events`, `moderation_panel_votes`, `escrow_events`, dan semua log domain):
```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```
Tidak boleh memiliki `updated_at`. `UPDATE` dan `DELETE` diblokir oleh trigger database.

### Tenant
Wajib pada semua tabel tenant-aware:
```sql
tenant_id UUID NOT NULL REFERENCES tenants(id)
```
Satu nilai aktif selama Phase 1–4 (single-tenant). Akan digunakan penuh saat Phase 5 (multi-tenant). Jangan menggunakan sentinel UUID default atau nilai berbeda antar dokumen.

---

## C. KOLOM STATUS & KEPEMILIKAN (STATUS & AUDIT COLUMNS)

### Status Column
Kolom status utama wajib bernama `status` dengan tipe `VARCHAR` dan nilai `lowercase_snake_case` (ADR-001 D7):
```
active, under_review, suspended, permanently_revoked, pending, approved, rejected, locked, released, refunded
```
Penulisan PascalCase di dokumen lifecycle (`UnderReview`, `Released`) adalah **label tampilan** saja; nilai database tetap `under_review`, `released`.

Kolom status turunan (untuk entitas dengan siklus status independen) menggunakan nama eksplisit dengan suffix:
```
anomaly_status, validation_status, incident_status
```
Nilai tetap `lowercase_snake_case`.

### Audit Columns
* Tabel mutable yang dapat dimutasi oleh pengguna/admin mencatat pelaku melalui `created_by UUID` atau kolom domain setara.
* Tabel append-only menggunakan `actor_id UUID` (nullable untuk aktor sistem) pada setiap rekaman.

---

## D. NAMA TABEL KANONIK (CANONICAL TABLE NAMES)

Nama kanonik yang wajib digunakan secara konsisten di seluruh dokumen:

| Domain | Tabel Kanonik |
| :--- | :--- |
| Identity | `users`, `user_roles`, `individual_profiles`, `organization_profiles`, `organization_representatives`, `verifications`, `verification_documents`, `verification_reviews` |
| Content | `content_items`, `content_citations`, `content_lifecycle_logs` |
| Marketplace | `catalog_items`, `price_anomaly_registry`, `catalog_change_logs` |
| Provenance | `catalog_provenances` |
| Service-Marketplace | `service_listings`, `service_milestones`, `service_presence_tokens`, `service_change_logs` |
| Order | `orders`, `order_items` |
| Escrow | `escrow_contracts`, `escrow_milestone_tranches`, `escrow_settlement_splits`, `escrow_events` |
| Moderation | `moderation_tickets`, `moderation_assignments`, `moderation_panel_reviews`, `moderation_panel_votes`, `appeal_tickets` |
| Security | `security_incidents` |
| Governance | `governance_decisions` |
| Reputation | `core_reputations`, `reputation_events`, `reputation_decay_logs` |
| Logistics | `logistics_change_logs` |
| Audit | `identity_audit_logs`, `security_audit_logs`, `moderation_audit_logs`, `financial_audit_logs` |

---

## E. KETENTUAN REVISI (ADR-001 D7, D9)

* **Tabel append-only/log** dikecualikan dari `updated_at` dan `updated_by`. `UPDATE`/`DELETE` diblokir trigger. Pengecualian purge retensi hanya oleh job retensi sesuai `audit-strategy.md`; job wajib mengaudit setiap penghapusan.
* **Cross-domain FK:** tabel yang merujuk entitas domain lain hanya menyimpan UUID (tidak menggunakan `REFERENCES` lintas domain boundary) kecuali dalam skema yang dikelola domain owner yang sama.
* **Cascade delete:** Dilarang menggunakan `ON DELETE CASCADE` pada tabel transaksi, order, escrow, log, dan audit. Gunakan `ON DELETE RESTRICT` untuk menjaga integritas historis.
* **Boolean flags:** Gunakan `BOOLEAN NOT NULL DEFAULT false` bukan status string untuk flag binary sederhana seperti `aml_hold`, `mfa_enabled`, `is_primary`.
