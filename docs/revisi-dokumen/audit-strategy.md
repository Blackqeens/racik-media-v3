# AUDIT STRATEGY

| Metadata        | Value                                                        |
| :-------------- | :----------------------------------------------------------- |
| **Dokumen**     | `audit-strategy.md`                                          |
| **Versi**       | 1.0                                                          |
| **Status**      | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Tujuan Inti** | **Backbone Evidentiary Layer & Forensik Ekosistem**          |

---

## A. KLASIFIKASI TINGKAT AUDIT (AUDIT LEVELS)

Setiap rekaman log peristiwa audit dikelompokkan ke dalam tiga kategori urgensi untuk menentukan masa penyimpanan dan kapasitas infrastruktur penyimpanan log:

| Tingkat Urgensi   | Contoh Peristiwa Utama                                                                                                                                                                                                                                                       | Masa Retensi | Target Media Penyimpanan           |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------- | :--------------------------------- |
| **CRITICAL**      | `identity.login_succeeded`, `identity.password_changed`, `identity.kyc_decision_recorded`, `identity.kyb_decision_recorded`, `payment.succeeded`, `escrow.refund_executed`, `order.escrow_locked`, `escrow.milestone_released`, `escrow.disputed`, keputusan Admin/security. | **7 Tahun**  | Cold Storage Imutabel & SIEM Vault |
| **IMPORTANT**     | `catalog.updated`, `content.updated`, `vendor.profile_updated`, `vendor.team_member_changed`, `order.cancelled`, `order.completed`, `moderation.content_removed`.                                                                                                            | **2 Tahun**  | Warm Storage Database / Log Engine |
| **INFORMATIONAL** | `analytics.page_view`, `search.query_recorded`, `content.viewed`.                                                                                                                                                                                                            | **180 Hari** | Hot Storage Analitik               |

Nama `action_type` yang disimpan mengikuti nama kanonik `domain.action` dari `event-map.md`; nama wire uppercase hanya transport broker. Retensi dan level berlaku per rekaman audit, bukan masa hidup event broker.

---

## B. SPESIFIKASI AUDIT LINTAS DOMAIN (AUDIT DOMAINS MAP)

### 1. Domain: Identity & Security

- `identity.login_succeeded` / `identity.logout`: metadata autentikasi minimum di `security_audit_logs` (CRITICAL).
- `identity.password_changed` / `identity.mfa_changed`: metadata perubahan kredensial di `security_audit_logs` (CRITICAL); jangan log secret.
- `identity.kyc_decision_recorded` / `identity.kyb_decision_recorded`: referensi keputusan di `identity_audit_logs` (CRITICAL); dokumen pribadi tidak disalin.

### 2. Domain: Membership & Vendor

- `membership.plan_changed`: transisi tier di `identity_audit_logs` (IMPORTANT).
- `vendor.team_member_changed`: perubahan tim di log Vendor (IMPORTANT).

### 3. Domain: Marketplace & Transaksi

- `catalog.archived` / `catalog.delisted`: log Marketplace (IMPORTANT).
- `order.cancelled` / `order.completed`: order lifecycle log milik Order (IMPORTANT).
- `payment.succeeded` / `escrow.refund_executed`: `financial_audit_logs` (CRITICAL), referensi transaksi tanpa data rekening.
- `order.escrow_locked` / `escrow.milestone_released` / `escrow.disputed`: `financial_audit_logs` (CRITICAL).

### 4. Domain: Admin & Governance

- `identity.status_restricted`: keputusan status pada `identity_audit_logs` (CRITICAL bila tindakan Admin; aturan otomatis dicatat dengan reason/TTL).
- `moderation.content_removed`: keputusan takedown di `moderation_audit_logs` (IMPORTANT; CRITICAL jika ada perintah hukum).

---

## C. KEBIJAKAN INTEGRITAS DATA LOG

Semua log wajib append-only, memiliki `correlation_id`, event reference, actor (nullable untuk sistem), `created_at`, dan metadata minimum. PII disimpan terpisah dan dapat dianonimkan; secret tidak pernah masuk log.

## D. RETENSI DAN PURGE

CRITICAL disimpan minimum 7 tahun; IMPORTANT 2 tahun; INFORMATIONAL 180 hari; pesan/lampiran chat mengikuti retensi jenis ruang pada `chat-architecture.md`. Purge terjadwal oleh job retensi adalah satu-satunya pengecualian DELETE, bukan operasi aplikasi. Setiap purge dicatat terpisah; anonimisasi PII tidak menghapus bukti log. Object Lock harus dikonfigurasi agar mendukung kewajiban retensi dan purge legal.
