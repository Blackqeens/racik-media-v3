# MASTER ERD

| Metadata | Value |
| :--- | :--- |
| **Dokumen** | `master-erd.md` |
| **Versi** | 2.1 |
| **Status** | **Selaras untuk review; pengesahan arsitek senior menunggu** |
| **Prinsip Relasi** | UUID primary keys; writes hanya oleh domain owner; referensi lintas-domain melalui ID dan kontrak |

## A. RELASI INTI (SELURUH DOMAIN)

```text
── IDENTITY DOMAIN ──────────────────────────────────────────────────────
users 1 ── N user_roles
users 1 ── 0..1 individual_profiles
users 1 ── 0..1 organization_profiles
organization_profiles 1 ── N organization_representatives
users 1 ── N verifications
verifications 1 ── N verification_documents
verifications 1 ── N verification_reviews

── CONTENT DOMAIN ───────────────────────────────────────────────────────
users 1 ── N content_items
content_items 1 ── N content_citations       [required for paper/journal]
content_items 1 ── N content_lifecycle_logs  [append-only]

── MARKETPLACE DOMAIN ───────────────────────────────────────────────────
vendors 1 ── N catalog_items
catalog_items 1 ── 0..1 catalog_provenances  [owned by Provenance domain]
catalog_items 1 ── N price_anomaly_registry  [append-only]
catalog_items 1 ── N catalog_change_logs     [append-only]

── SERVICE-MARKETPLACE DOMAIN ───────────────────────────────────────────
users 1 ── N service_listings
service_listings 1 ── N service_milestones
service_milestones 1 ── N service_presence_tokens  [geolocated only]
service_listings 1 ── N service_change_logs  [append-only]

── ORDER / ESCROW DOMAIN ────────────────────────────────────────────────
orders 1 ── N order_items
orders 1 ── 1 escrow_contracts               [UNIQUE order_id]
escrow_contracts 1 ── N escrow_milestone_tranches  [service orders only]
escrow_contracts 1 ── N escrow_settlement_splits   [append-only]
escrow_contracts 1 ── N escrow_events              [append-only]

── LOGISTICS DOMAIN ─────────────────────────────────────────────────────
orders 1 ── N logistics_change_logs  [append-only]

── MODERATION DOMAIN ────────────────────────────────────────────────────
moderation_tickets 1 ── N moderation_assignments
moderation_tickets 1 ── 0..1 moderation_panel_reviews
moderation_panel_reviews 1 ── N moderation_panel_votes  [append-only, UNIQUE per moderator]
moderation_tickets 1 ── 0..1 appeal_tickets

── SECURITY DOMAIN ──────────────────────────────────────────────────────
users 0..1 ── N security_incidents

── GOVERNANCE DOMAIN ────────────────────────────────────────────────────
users (admin) 1 ── N governance_decisions

── REPUTATION DOMAIN ────────────────────────────────────────────────────
users 1 ── 1 core_reputations
core_reputations 1 ── N reputation_events  [append-only]
users 1 ── N reputation_decay_logs        [append-only]

── AUDIT DOMAIN (append-only, ditulis lewat event) ──────────────────────
identity_audit_logs    → references: users, actor
security_audit_logs    → references: security_incidents, actor
moderation_audit_logs  → references: moderation_tickets, entity, actor
financial_audit_logs   → references: escrow_contracts, orders, actor
```

## B. KONVENSI SKEMA BERSAMA

- **PK:** `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` pada semua tabel.
- **Tenant:** `tenant_id UUID NOT NULL REFERENCES tenants(id)` wajib pada semua tabel tenant-aware.
- **Tabel mutable:** wajib memiliki `created_at TIMESTAMPTZ NOT NULL DEFAULT now()` dan `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`.
- **Tabel append-only** (`*_audit_logs`, `*_change_logs`, `*_events`, `*_logs`, `reputation_events`, `moderation_panel_votes`): hanya `created_at`; tidak ada `updated_at`. `UPDATE`/`DELETE` diblokir trigger database.
- **Status:** semua nilai status menggunakan `lowercase_snake_case` (ADR-001 D7). PascalCase hanya label presentasi dokumen.
- **FK historis:** tidak menggunakan `ON DELETE CASCADE` pada tabel transaksi dan log agar jejak historis tidak terhapus ikut.
- **Cross-domain FK:** tabel yang merujuk entitas domain lain menyimpan UUID sebagai referensi saja (contoh: `service_milestones.order_id` bukan FK dengan CASCADE; `catalog_items.vendor_id` tanpa `REFERENCES` ke tabel Vendor karena lintas domain boundary).

## C. SKEMA TRANSAKSI DAN KATALOG (DDL KANONIK)

```sql
CREATE TABLE catalog_provenances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    catalog_item_id UUID NOT NULL UNIQUE REFERENCES catalog_items(id),
    producer_origin TEXT NOT NULL,
    production_method TEXT NOT NULL,
    regional_heritage_story TEXT NOT NULL,
    cultural_attribution_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    certificate_hash TEXT,
    validation_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, verified, rejected
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE escrow_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
    channel_type VARCHAR(20) NOT NULL DEFAULT 'retail',
    status VARCHAR(50) NOT NULL DEFAULT 'payment_detected',
    -- payment_detected, locked, in_transit, delivered, disputed, released, refunded, cancelled
    currency CHAR(3) NOT NULL DEFAULT 'IDR',
    amount_total NUMERIC(14,2) NOT NULL CHECK (amount_total >= 0),
    platform_fee_deducted NUMERIC(14,2) NOT NULL DEFAULT 0,
    aml_hold BOOLEAN NOT NULL DEFAULT false,
    auto_release_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE escrow_milestone_tranches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    escrow_contract_id UUID NOT NULL REFERENCES escrow_contracts(id),
    milestone_id UUID NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'locked',
    -- locked, released, refunded, disputed
    submitted_at TIMESTAMPTZ,
    auto_release_at TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (escrow_contract_id, milestone_id)
);

CREATE TABLE logistics_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    correlation_id UUID NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    tracking_record_id UUID NOT NULL,
    current_status VARCHAR(30) NOT NULL,
    -- manifested, in_transit, delivered, carrier_exception, tracking_invalid
    event_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_logistics_change_logs_order_id ON logistics_change_logs(order_id);
CREATE INDEX idx_logistics_change_logs_correlation_id ON logistics_change_logs(correlation_id);
```

Logistik tidak menyimpan nomor rekening, email, nama penerima, alamat, foto, atau raw payload provider dalam event atau log generik; data operasional yang diperlukan disimpan terenkripsi di domain owner dengan kontrol akses terpisah.

## D. AUDIT DAN RETENSI

Audit domain memiliki empat tabel wajib:

| Tabel | Konten | Retensi |
| :--- | :--- | :--- |
| `identity_audit_logs` | Mutasi status akun dan peran, keputusan KYC/KYB | CRITICAL — 7 tahun |
| `security_audit_logs` | Gagal autentikasi, insiden keamanan, session invalidation | CRITICAL — 7 tahun |
| `moderation_audit_logs` | Keputusan kurator, panel vote, banding | IMPORTANT — 2 tahun |
| `financial_audit_logs` | Penguncian, pencairan, refund, split settlement escrow | CRITICAL — 7 tahun |

Setiap baris mencakup `id`, `correlation_id`, `actor_id` (nullable untuk aktor sistem), `action_type`, referensi entitas, metadata minimum, dan `created_at`. Tabel bersifat append-only; pengecualian purge oleh job retensi dan anonimisasi mengikuti `audit-strategy.md`. Foreign key historis tidak menggunakan `ON DELETE CASCADE`.

## E. KEPEMILIKAN DATA

DDL di dokumen ini menjelaskan bentuk relasi, bukan memberi izin lintas domain untuk menulis tabel. Pemilik setiap tabel mengikuti `data-ownership.md`; status antar-domain disinkronkan melalui katalog pada `event-map.md`. Schema final dan migrasi wajib mencakup tabel lain yang terdaftar pada dokumen domain owner sebelum implementasi produksi. DDL lengkap per domain ada di `data-models.md`.
