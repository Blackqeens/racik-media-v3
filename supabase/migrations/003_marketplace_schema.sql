-- =============================================================================
-- MIGRATION: 003_marketplace_schema.sql
-- Domain  : Marketplace + Provenance
-- Phase   : 1 (Foundation — catalog listing dasar)
-- Ref docs: data-models.md §3-4, marketplace-lifecycle.md, pricing-sustainability.md
-- Depends : 001_identity_schema.sql (users, tenants)
-- =============================================================================
-- CATATAN:
--   vendors (domain Vendor) belum dibuat di migrasi ini karena domain Vendor
--   memiliki skema tersendiri. catalog_items.vendor_id adalah referensi UUID
--   cross-domain — tidak pakai FOREIGN KEY ke tabel vendor (beda domain boundary).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: catalog_items
-- Status: under_review | active | suspended | rejected | archived
-- Owner : Marketplace domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS catalog_items (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID        NOT NULL REFERENCES tenants(id),
    vendor_id                   UUID        NOT NULL,  -- Ref ke vendors(id); cross-domain, tanpa FK
    item_type                   VARCHAR(50) NOT NULL
                                    CHECK (item_type IN (
                                        'retail', 'wholesale', 'online_service', 'local_service'
                                    )),
    title                       VARCHAR(255) NOT NULL,
    description                 TEXT,
    price_fixed                 NUMERIC(15,2),  -- NULL untuk wholesale/RFQ
    stock_quantity              INT,
    knowledge_backed_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00
                                    CHECK (knowledge_backed_multiplier >= 1.00
                                       AND knowledge_backed_multiplier <= 2.00),
    status                      VARCHAR(50) NOT NULL DEFAULT 'under_review'
                                    CHECK (status IN (
                                        'under_review', 'active', 'suspended',
                                        'rejected', 'archived'
                                    )),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_items_vendor_id  ON catalog_items(vendor_id);
CREATE INDEX idx_catalog_items_status     ON catalog_items(status);
CREATE INDEX idx_catalog_items_item_type  ON catalog_items(item_type);
CREATE INDEX idx_catalog_items_tenant_id  ON catalog_items(tenant_id);

CREATE TRIGGER trg_catalog_items_updated_at
    BEFORE UPDATE ON catalog_items
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  catalog_items IS 'Katalog produk terpadu retail dan grosir. Wajib kurasi sebelum active. Owner: Marketplace domain.';
COMMENT ON COLUMN catalog_items.vendor_id IS 'Referensi cross-domain ke vendors(id). Tidak pakai FK karena beda domain boundary.';
COMMENT ON COLUMN catalog_items.price_fixed IS 'NULL untuk item wholesale/RFQ — harga dinegosiasikan via Quotation.';
COMMENT ON COLUMN catalog_items.knowledge_backed_multiplier IS 'Bobot ranking pencarian 1.00–2.00. Meningkat bila ada konten terkait di Content domain.';


-- -----------------------------------------------------------------------------
-- SECTION 2: price_anomaly_registry
-- Append-only — rekaman deteksi Anti-Price-War
-- Owner: Marketplace domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS price_anomaly_registry (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    catalog_item_id         UUID        NOT NULL REFERENCES catalog_items(id) ON DELETE RESTRICT,
    detected_price          NUMERIC(15,2) NOT NULL,
    category_floor_price    NUMERIC(15,2) NOT NULL,
    deviation_percentage    NUMERIC(5,2) NOT NULL,
    anomaly_status          VARCHAR(30) NOT NULL DEFAULT 'flagged'
                                CHECK (anomaly_status IN ('flagged', 'cleared', 'suppressed')),
    flagged_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_anomaly_catalog_item_id ON price_anomaly_registry(catalog_item_id);
CREATE INDEX idx_price_anomaly_status          ON price_anomaly_registry(anomaly_status);

-- Registry anomali bersifat append-only — jangan edit, buat baris baru untuk status update
CREATE TRIGGER trg_price_anomaly_registry_append_only
    BEFORE UPDATE OR DELETE ON price_anomaly_registry
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  price_anomaly_registry IS 'Rekaman deteksi harga predator (Anti-Price-War). Append-only. Owner: Marketplace domain.';
COMMENT ON COLUMN price_anomaly_registry.anomaly_status IS 'flagged=terdeteksi, cleared=dibersihkan kurator, suppressed=dikonfirmasi pelanggaran.';


-- -----------------------------------------------------------------------------
-- SECTION 3: catalog_change_logs
-- Append-only — jejak mutasi harga/stok/metadata
-- Owner: Marketplace domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS catalog_change_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    catalog_item_id UUID        NOT NULL,  -- Ref ke catalog_items; tidak cascade
    actor_id        UUID        NOT NULL,  -- UUID user/moderator/sistem
    change_type     VARCHAR(50) NOT NULL
                        CHECK (change_type IN (
                            'create', 'price_update', 'stock_depletion',
                            'metadata_amendment', 'suspension', 'status_change'
                        )),
    old_value       JSONB,
    new_value       JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_change_logs_catalog_item_id ON catalog_change_logs(catalog_item_id);
CREATE INDEX idx_catalog_change_logs_actor_id        ON catalog_change_logs(actor_id);

CREATE TRIGGER trg_catalog_change_logs_append_only
    BEFORE UPDATE OR DELETE ON catalog_change_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  catalog_change_logs IS 'Jejak mutasi harga/stok/metadata katalog. Append-only. Owner: Marketplace domain.';
COMMENT ON COLUMN catalog_change_logs.old_value IS 'Snapshot nilai sebelum perubahan dalam JSONB. NULL untuk event create.';


-- -----------------------------------------------------------------------------
-- SECTION 4: catalog_provenances
-- Status (validation_status): pending | verified | rejected
-- Owner : Provenance domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS catalog_provenances (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID        NOT NULL REFERENCES tenants(id),
    catalog_item_id             UUID        NOT NULL UNIQUE REFERENCES catalog_items(id) ON DELETE RESTRICT,
    producer_origin             TEXT        NOT NULL,  -- Asal geografis produsen/perajin
    production_method           TEXT        NOT NULL,  -- Metode produksi tradisional/manufaktur
    regional_heritage_story     TEXT        NOT NULL,  -- Narasi sejarah budaya produk
    cultural_attribution_meta   JSONB       NOT NULL DEFAULT '{}'::jsonb,
    -- Format: {"content_ids": ["uuid1", "uuid2"]} — ID artikel terkait di Content domain
    certificate_hash            TEXT,       -- Hash sertifikat keaslian (opsional)
    validation_status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                                    CHECK (validation_status IN ('pending', 'verified', 'rejected')),
    verified_at                 TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_catalog_provenances_catalog_item_id    ON catalog_provenances(catalog_item_id);
CREATE INDEX idx_catalog_provenances_validation_status  ON catalog_provenances(validation_status);

CREATE TRIGGER trg_catalog_provenances_updated_at
    BEFORE UPDATE ON catalog_provenances
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  catalog_provenances IS 'Cerita asal-usul produk (Item Story Rule). Dimiliki Provenance domain. Dikurasi sebelum katalog aktif.';
COMMENT ON COLUMN catalog_provenances.cultural_attribution_meta IS 'JSONB. Contoh: {"content_ids": ["uuid-artikel-batik"]}. Hanya ID referensi, bukan duplikasi konten.';
COMMENT ON COLUMN catalog_provenances.certificate_hash IS 'Hash SHA-256 dari dokumen sertifikat keaslian (misalnya sertifikat SNI, BPOM, GI).';


-- =============================================================================
-- END OF MIGRATION 003
-- Tabel yang dibuat:
--   catalog_items, price_anomaly_registry, catalog_change_logs,
--   catalog_provenances
-- =============================================================================
