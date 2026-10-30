# TENANCY MODEL
| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `tenancy-model.md` |
| **Versi** | 1.0 |
| **Status** | **In review; senior architect approval pending** |
| **Model Aktif** | **Single Tenant (Shared Database, Shared Schema)** |

---

## A. FILOSOFI MODEL SAAT INI
Racik Media V3 beroperasi sebagai satu kesatuan ekosistem terpadu di mana seluruh tipe entitas peran (`Member`, `Seller`, `Vendor`, `Enterprise`) saling berinteraksi secara terbuka di dalam basis data publik dan skema data relasional yang sama (*Shared Schema*).

---

## B. KESIAPAN MASA DEPAN (PHASE 5)
Selama Phase 1–4, platform menjalankan single-tenant. `tenant_id` dipasang pada tabel tenant-aware sejak migrasi awal, mengacu ke satu baris `tenants` aktif; jangan menambah tenant melalui aplikasi sebelum Phase 5.

```sql
ALTER TABLE users ADD COLUMN tenant_id UUID NOT NULL REFERENCES tenants(id);
```

### Tabel Wajib Penanda Penyewa (*Tenant Aware Tables*):
* Identity/roles/verifications; membership/subscriptions; vendors/team; content/citations; catalog/provenance/inventory; service listings/milestones; orders/order items/RFQ; payment records; escrow contracts/tranches/disputes; logistics records; moderation tickets/appeals/sanctions; chat rooms/messages/attachments; review/reputation; notification; analytics read models.
* `security_incidents`, `governance_decisions`, dan audit logs juga membawa tenant scope bila data terkait tenant. Infrastruktur/global configuration dapat tetap global dan harus didokumentasikan sebagai pengecualian.

Tenant key yang digunakan adalah `tenant_id UUID NOT NULL REFERENCES tenants(id)`. Hindari UUID default sentinel atau nilai berbeda antar dokumen. Entity lintas tenant tidak boleh dihubungkan oleh foreign key tanpa validasi tenant yang sama.

---

## C. ATURAN HAK ISOLASI DATA (ACCESS ISOLATION RULES)
* **Anggota Dasar (Member):** Hanya mengakses data pribadi miliknya dan data publik sesuai policy RLS; tenant bukan pengganti `user_id` authorization.
* **Perusahaan/Agensi (Vendor):** Isolasi data kelompok. Hanya diizinkan mengakses aset data organisasi internal milik vendornya serta data manajemen staf operasional timnya (`vendor_teams`).
* **Pengendali Sistem (Admin):** Admin tenant terbatas pada tenant yang ditugaskan; akses lintas-tenant memerlukan role super-admin terpisah, justifikasi, step-up MFA, dan audit.

---

## D. STRATEGI MIGRASI KE MULTI-TENANT
Pada Phase 5, multi-tenancy ditegakkan oleh PostgreSQL RLS sebagai batas wajib dan backend sebagai defense-in-depth (`tenant_id = :tenantId`). Jangan mengandalkan filtrasi aplikasi saja. Migrasi tenant memerlukan ADR, uji isolasi negatif, serta validasi foreign key lintas tenant.


---
