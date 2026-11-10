-- =============================================================================
-- MASTER MIGRATION SCRIPT — Racik Media V3
-- =============================================================================
-- CARA PAKAI:
--   1. Buka https://supabase.com/dashboard/project/bpppiqblcbhqytppahrq
--   2. Klik menu kiri: "SQL Editor" → "New query"
--   3. Paste seluruh isi file ini → klik "Run"
--   4. Seharusnya tidak ada error jika database masih kosong
--   5. Jalankan SEKALI SAJA — semua CREATE TABLE sudah pakai IF NOT EXISTS
--
-- URUTAN DEPENDENSI:
--   001 (Identity)  ← fondasi, tidak ada dependensi
--   002 (Content)   ← butuh: users, tenants
--   003 (Marketplace+Provenance) ← butuh: users, tenants
--   004 (Service)   ← butuh: users, tenants
--   005 (Order+Escrow) ← butuh: users, tenants
--   006 (Moderation) ← butuh: users, tenants
--   007 (Security+Governance) ← butuh: users, tenants
--   008 (Reputation) ← butuh: users, tenants
--   009 (Logistics) ← butuh: orders
--   010 (Audit)     ← butuh: users, tenants, security_incidents
--   BRIDGE          ← sinkronisasi auth.users → public.users (Supabase-specific)
-- =============================================================================

-- ─── SECTION 0 — SAFETY CHECK ────────────────────────────────────────────────
-- Hentikan eksekusi jika schema sudah ada (idempoten)
-- Semua DDL sudah pakai IF NOT EXISTS sehingga aman di-run ulang
DO $$
BEGIN
  RAISE NOTICE 'Mulai migrasi Racik Media V3 — %', now();
END $$;


-- =============================================================================
-- MIGRATION 001 — IDENTITY
-- Tables: tenants, users, user_roles, individual_profiles,
--         organization_profiles, organization_representatives,
--         verifications, verification_documents, verification_reviews
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Racik Media', 'racik-media')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trigger_append_only_block()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION
        'Tabel % bersifat append-only. UPDATE dan DELETE dilarang. '
        'Gunakan event kompensasi baru untuk pembetulan. (ADR-001 D9)',
        TG_TABLE_NAME;
    RETURN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL DEFAULT '',
    -- DEFAULT '' karena Supabase Auth mengelola password; kolom ini sebagai placeholder
    status          VARCHAR(50) NOT NULL DEFAULT 'active'
                        CHECK (status IN (
                            'active', 'under_review', 'restricted',
                            'suspended', 'permanently_revoked'
                        )),
    kyc_tier        VARCHAR(20) NOT NULL DEFAULT 'tier_1'
                        CHECK (kyc_tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4')),
    mfa_enabled     BOOLEAN     NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status    ON users(status);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS user_roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    role_type   VARCHAR(50) NOT NULL
                    CHECK (role_type IN (
                        'member', 'seller', 'distributor', 'service_provider',
                        'moderator', 'admin', 'master_admin'
                    )),
    status      VARCHAR(50) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'under_review', 'suspended')),
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role_type)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id    ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_type  ON user_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_user_roles_status     ON user_roles(status);

DROP TRIGGER IF EXISTS trg_user_roles_updated_at ON user_roles;
CREATE TRIGGER trg_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS individual_profiles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    full_name       VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100),
    bio             TEXT,
    avatar_url      TEXT,
    phone_number    VARCHAR(20),
    province        VARCHAR(100),
    city            VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_individual_profiles_user_id ON individual_profiles(user_id);

DROP TRIGGER IF EXISTS trg_individual_profiles_updated_at ON individual_profiles;
CREATE TRIGGER trg_individual_profiles_updated_at
    BEFORE UPDATE ON individual_profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS organization_profiles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    legal_name      VARCHAR(255) NOT NULL,
    brand_name      VARCHAR(255),
    entity_type     VARCHAR(50) NOT NULL
                        CHECK (entity_type IN ('pt', 'cv', 'koperasi', 'yayasan', 'other')),
    nib             VARCHAR(50),
    npwp            VARCHAR(30),
    legal_address   TEXT,
    logo_url        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organization_profiles_user_id ON organization_profiles(user_id);

DROP TRIGGER IF EXISTS trg_organization_profiles_updated_at ON organization_profiles;
CREATE TRIGGER trg_organization_profiles_updated_at
    BEFORE UPDATE ON organization_profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS organization_representatives (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    organization_profile_id UUID        NOT NULL REFERENCES organization_profiles(id) ON DELETE RESTRICT,
    user_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    role_in_org             VARCHAR(100) NOT NULL
                                CHECK (role_in_org IN ('director', 'commissioner', 'authorized_agent')),
    is_primary              BOOLEAN     NOT NULL DEFAULT false,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_representatives_org_id  ON organization_representatives(organization_profile_id);
CREATE INDEX IF NOT EXISTS idx_org_representatives_user_id ON organization_representatives(user_id);

DROP TRIGGER IF EXISTS trg_org_representatives_updated_at ON organization_representatives;
CREATE TRIGGER trg_org_representatives_updated_at
    BEFORE UPDATE ON organization_representatives
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS verifications (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verification_type   VARCHAR(30) NOT NULL
                            CHECK (verification_type IN ('kyc', 'kyb')),
    status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'expired')),
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at         TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status  ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_verifications_type    ON verifications(verification_type);

DROP TRIGGER IF EXISTS trg_verifications_updated_at ON verifications;
CREATE TRIGGER trg_verifications_updated_at
    BEFORE UPDATE ON verifications
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS verification_documents (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    verification_id     UUID        NOT NULL REFERENCES verifications(id) ON DELETE RESTRICT,
    document_type       VARCHAR(50) NOT NULL
                            CHECK (document_type IN (
                                'ktp', 'selfie_with_ktp', 'npwp', 'nib',
                                'siup', 'deed_of_establishment', 'other'
                            )),
    storage_path        TEXT        NOT NULL,
    file_hash           TEXT        NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_docs_verification_id ON verification_documents(verification_id);

DROP TRIGGER IF EXISTS trg_verification_documents_append_only ON verification_documents;
CREATE TRIGGER trg_verification_documents_append_only
    BEFORE UPDATE OR DELETE ON verification_documents
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS verification_reviews (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    verification_id     UUID        NOT NULL REFERENCES verifications(id) ON DELETE RESTRICT,
    reviewer_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    recommendation      VARCHAR(30) NOT NULL
                            CHECK (recommendation IN ('approve', 'reject', 'request_revision')),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_reviews_verification_id ON verification_reviews(verification_id);
CREATE INDEX IF NOT EXISTS idx_verification_reviews_reviewer_id     ON verification_reviews(reviewer_id);

DROP TRIGGER IF EXISTS trg_verification_reviews_append_only ON verification_reviews;
CREATE TRIGGER trg_verification_reviews_append_only
    BEFORE UPDATE OR DELETE ON verification_reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();


-- =============================================================================
-- MIGRATION 002 — CONTENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS content_items (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    author_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content_type    VARCHAR(30) NOT NULL
                        CHECK (content_type IN ('article', 'paper', 'journal', 'event')),
    title           VARCHAR(500) NOT NULL,
    body            TEXT        NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft'
                        CHECK (status IN (
                            'draft', 'under_review', 'revision_requested',
                            'approved', 'published', 'archived', 'rejected'
                        )),
    geolocation_meta POINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_items_author_id    ON content_items(author_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status       ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_content_type ON content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_items_tenant_id    ON content_items(tenant_id);

DROP TRIGGER IF EXISTS trg_content_items_updated_at ON content_items;
CREATE TRIGGER trg_content_items_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS content_citations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    content_id      UUID        NOT NULL REFERENCES content_items(id) ON DELETE RESTRICT,
    citation_format VARCHAR(20) NOT NULL
                        CHECK (citation_format IN ('apa', 'mla', 'platform_standard')),
    citation_text   TEXT        NOT NULL,
    source_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_citations_content_id ON content_citations(content_id);

DROP TRIGGER IF EXISTS trg_content_citations_append_only ON content_citations;
CREATE TRIGGER trg_content_citations_append_only
    BEFORE UPDATE OR DELETE ON content_citations
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS content_lifecycle_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    content_id      UUID        NOT NULL,
    actor_id        UUID,
    old_state       VARCHAR(50),
    new_state       VARCHAR(50) NOT NULL,
    rationale_notes TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_lifecycle_logs_content_id ON content_lifecycle_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_content_lifecycle_logs_actor_id   ON content_lifecycle_logs(actor_id);

DROP TRIGGER IF EXISTS trg_content_lifecycle_logs_append_only ON content_lifecycle_logs;
CREATE TRIGGER trg_content_lifecycle_logs_append_only
    BEFORE UPDATE OR DELETE ON content_lifecycle_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();


-- =============================================================================
-- MIGRATION 003 — MARKETPLACE + PROVENANCE
-- =============================================================================

CREATE TABLE IF NOT EXISTS catalog_items (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID        NOT NULL REFERENCES tenants(id),
    vendor_id                   UUID        NOT NULL,
    item_type                   VARCHAR(50) NOT NULL
                                    CHECK (item_type IN ('retail', 'wholesale', 'online_service', 'local_service')),
    title                       VARCHAR(255) NOT NULL,
    description                 TEXT,
    price_fixed                 NUMERIC(15,2),
    stock_quantity              INT,
    knowledge_backed_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00
                                    CHECK (knowledge_backed_multiplier >= 1.00 AND knowledge_backed_multiplier <= 2.00),
    status                      VARCHAR(50) NOT NULL DEFAULT 'under_review'
                                    CHECK (status IN ('under_review', 'active', 'suspended', 'rejected', 'archived')),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_items_vendor_id  ON catalog_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_status     ON catalog_items(status);
CREATE INDEX IF NOT EXISTS idx_catalog_items_item_type  ON catalog_items(item_type);
CREATE INDEX IF NOT EXISTS idx_catalog_items_tenant_id  ON catalog_items(tenant_id);

DROP TRIGGER IF EXISTS trg_catalog_items_updated_at ON catalog_items;
CREATE TRIGGER trg_catalog_items_updated_at
    BEFORE UPDATE ON catalog_items
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

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

CREATE INDEX IF NOT EXISTS idx_price_anomaly_catalog_item_id ON price_anomaly_registry(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_price_anomaly_status          ON price_anomaly_registry(anomaly_status);

DROP TRIGGER IF EXISTS trg_price_anomaly_registry_append_only ON price_anomaly_registry;
CREATE TRIGGER trg_price_anomaly_registry_append_only
    BEFORE UPDATE OR DELETE ON price_anomaly_registry
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS catalog_change_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    catalog_item_id UUID        NOT NULL,
    actor_id        UUID        NOT NULL,
    change_type     VARCHAR(50) NOT NULL
                        CHECK (change_type IN (
                            'create', 'price_update', 'stock_depletion',
                            'metadata_amendment', 'suspension', 'status_change'
                        )),
    old_value       JSONB,
    new_value       JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_change_logs_catalog_item_id ON catalog_change_logs(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_catalog_change_logs_actor_id        ON catalog_change_logs(actor_id);

DROP TRIGGER IF EXISTS trg_catalog_change_logs_append_only ON catalog_change_logs;
CREATE TRIGGER trg_catalog_change_logs_append_only
    BEFORE UPDATE OR DELETE ON catalog_change_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS catalog_provenances (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID        NOT NULL REFERENCES tenants(id),
    catalog_item_id             UUID        NOT NULL UNIQUE REFERENCES catalog_items(id) ON DELETE RESTRICT,
    producer_origin             TEXT        NOT NULL,
    production_method           TEXT        NOT NULL,
    regional_heritage_story     TEXT        NOT NULL,
    cultural_attribution_meta   JSONB       NOT NULL DEFAULT '{}'::jsonb,
    certificate_hash            TEXT,
    validation_status           VARCHAR(30) NOT NULL DEFAULT 'pending'
                                    CHECK (validation_status IN ('pending', 'verified', 'rejected')),
    verified_at                 TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_provenances_catalog_item_id    ON catalog_provenances(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_catalog_provenances_validation_status  ON catalog_provenances(validation_status);

DROP TRIGGER IF EXISTS trg_catalog_provenances_updated_at ON catalog_provenances;
CREATE TRIGGER trg_catalog_provenances_updated_at
    BEFORE UPDATE ON catalog_provenances
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- =============================================================================
-- MIGRATION 004 — SERVICE MARKETPLACE
-- =============================================================================

CREATE TABLE IF NOT EXISTS service_listings (
    id                                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                           UUID        NOT NULL REFERENCES tenants(id),
    provider_id                         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vendor_id                           UUID,
    title                               VARCHAR(255) NOT NULL,
    description                         TEXT        NOT NULL,
    delivery_method                     VARCHAR(20) NOT NULL
                                            CHECK (delivery_method IN ('remote', 'geolocated')),
    base_price                          NUMERIC(15,2) NOT NULL CHECK (base_price >= 0),
    base_location                       POINT,
    service_operational_radius_meters   INT,
    status                              VARCHAR(30) NOT NULL DEFAULT 'under_review'
                                            CHECK (status IN ('under_review', 'active', 'suspended', 'rejected', 'archived')),
    created_at                          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_listings_provider_id     ON service_listings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_listings_status          ON service_listings(status);
CREATE INDEX IF NOT EXISTS idx_service_listings_delivery_method ON service_listings(delivery_method);
CREATE INDEX IF NOT EXISTS idx_service_listings_tenant_id       ON service_listings(tenant_id);

DROP TRIGGER IF EXISTS trg_service_listings_updated_at ON service_listings;
CREATE TRIGGER trg_service_listings_updated_at
    BEFORE UPDATE ON service_listings
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS service_milestones (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    order_id            UUID        NOT NULL,
    service_listing_id  UUID        NOT NULL REFERENCES service_listings(id) ON DELETE RESTRICT,
    milestone_order     INT         NOT NULL CHECK (milestone_order >= 1),
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                            CHECK (status IN (
                                'pending', 'locked', 'in_progress', 'submitted',
                                'amendment_requested', 'completed', 'cancelled'
                            )),
    revision_count      INT         NOT NULL DEFAULT 0
                            CONSTRAINT check_revision_cap CHECK (revision_count <= 3),
    due_at              TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_milestones_order_id           ON service_milestones(order_id);
CREATE INDEX IF NOT EXISTS idx_service_milestones_service_listing_id ON service_milestones(service_listing_id);
CREATE INDEX IF NOT EXISTS idx_service_milestones_status             ON service_milestones(status);

DROP TRIGGER IF EXISTS trg_service_milestones_updated_at ON service_milestones;
CREATE TRIGGER trg_service_milestones_updated_at
    BEFORE UPDATE ON service_milestones
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS service_presence_tokens (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID        NOT NULL REFERENCES tenants(id),
    milestone_id                UUID        NOT NULL REFERENCES service_milestones(id) ON DELETE RESTRICT,
    provider_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verification_method         VARCHAR(30) NOT NULL
                                    CHECK (verification_method IN ('qr_scan', 'geofence_match', 'manual_moderator_override')),
    provider_coordinates        POINT,
    client_coordinates          POINT,
    distance_deviation_meters   NUMERIC(10,2),
    verified_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_presence_tokens_milestone_id ON service_presence_tokens(milestone_id);
CREATE INDEX IF NOT EXISTS idx_service_presence_tokens_provider_id  ON service_presence_tokens(provider_id);

DROP TRIGGER IF EXISTS trg_service_presence_tokens_append_only ON service_presence_tokens;
CREATE TRIGGER trg_service_presence_tokens_append_only
    BEFORE UPDATE OR DELETE ON service_presence_tokens
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS service_change_logs (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID    NOT NULL,
    service_id  UUID    NOT NULL,
    actor_id    UUID    NOT NULL,
    old_scope   JSONB,
    new_scope   JSONB   NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_change_logs_service_id ON service_change_logs(service_id);

DROP TRIGGER IF EXISTS trg_service_change_logs_append_only ON service_change_logs;
CREATE TRIGGER trg_service_change_logs_append_only
    BEFORE UPDATE OR DELETE ON service_change_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();


-- =============================================================================
-- MIGRATION 005 — ORDER + ESCROW
-- =============================================================================

CREATE TABLE IF NOT EXISTS orders (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    buyer_id        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id       UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_type      VARCHAR(30) NOT NULL
                        CHECK (order_type IN (
                            'product_retail', 'product_wholesale',
                            'service_remote', 'service_geolocated'
                        )),
    status          VARCHAR(50) NOT NULL DEFAULT 'pending_payment'
                        CHECK (status IN (
                            'pending_payment', 'paid', 'in_fulfillment',
                            'completed', 'cancelled', 'disputed'
                        )),
    gross_amount    NUMERIC(15,2) NOT NULL CHECK (gross_amount > 0),
    currency        CHAR(3)     NOT NULL DEFAULT 'IDR',
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id    ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id   ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_type  ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id   ON orders(tenant_id);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS order_items (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id),
    order_id    UUID        NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('catalog_item', 'service_listing')),
    entity_id   UUID        NOT NULL,
    quantity    INT         NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price  NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0),
    subtotal    NUMERIC(15,2) NOT NULL CHECK (subtotal >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

DROP TRIGGER IF EXISTS trg_order_items_append_only ON order_items;
CREATE TRIGGER trg_order_items_append_only
    BEFORE UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS escrow_contracts (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    order_id                UUID        UNIQUE NOT NULL REFERENCES orders(id),
    channel_type            VARCHAR(20) NOT NULL DEFAULT 'retail'
                                CHECK (channel_type IN ('retail', 'wholesale', 'service')),
    buyer_id                UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id               UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    currency                CHAR(3)     NOT NULL DEFAULT 'IDR',
    amount_total            NUMERIC(14,2) NOT NULL CHECK (amount_total >= 0),
    platform_fee_deducted   NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (platform_fee_deducted >= 0),
    aml_hold                BOOLEAN     NOT NULL DEFAULT false,
    status                  VARCHAR(50) NOT NULL DEFAULT 'payment_detected'
                                CHECK (status IN (
                                    'payment_detected', 'locked', 'in_transit', 'delivered',
                                    'disputed', 'released', 'refunded', 'cancelled'
                                )),
    auto_release_at         TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_escrow_contracts_order_id    ON escrow_contracts(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_contracts_buyer_id    ON escrow_contracts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_contracts_seller_id   ON escrow_contracts(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_contracts_status      ON escrow_contracts(status);
CREATE INDEX IF NOT EXISTS idx_escrow_contracts_aml_hold    ON escrow_contracts(aml_hold) WHERE aml_hold = true;

DROP TRIGGER IF EXISTS trg_escrow_contracts_updated_at ON escrow_contracts;
CREATE TRIGGER trg_escrow_contracts_updated_at
    BEFORE UPDATE ON escrow_contracts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS escrow_milestone_tranches (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    escrow_contract_id  UUID        NOT NULL REFERENCES escrow_contracts(id) ON DELETE RESTRICT,
    milestone_id        UUID        NOT NULL,
    amount              NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    status              VARCHAR(30) NOT NULL DEFAULT 'locked'
                            CHECK (status IN ('locked', 'released', 'refunded', 'disputed')),
    submitted_at        TIMESTAMPTZ,
    auto_release_at     TIMESTAMPTZ,
    released_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (escrow_contract_id, milestone_id)
);

CREATE INDEX IF NOT EXISTS idx_escrow_tranches_contract_id  ON escrow_milestone_tranches(escrow_contract_id);
CREATE INDEX IF NOT EXISTS idx_escrow_tranches_status       ON escrow_milestone_tranches(status);

DROP TRIGGER IF EXISTS trg_escrow_milestone_tranches_updated_at ON escrow_milestone_tranches;
CREATE TRIGGER trg_escrow_milestone_tranches_updated_at
    BEFORE UPDATE ON escrow_milestone_tranches
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS escrow_settlement_splits (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL,
    escrow_contract_id      UUID        NOT NULL REFERENCES escrow_contracts(id),
    tranche_id              UUID,
    gross_amount            NUMERIC(14,2) NOT NULL CHECK (gross_amount >= 0),
    platform_fee_percentage NUMERIC(5,4) NOT NULL CHECK (platform_fee_percentage >= 0),
    platform_fee_amount     NUMERIC(14,2) NOT NULL CHECK (platform_fee_amount >= 0),
    gateway_fee_amount      NUMERIC(14,2) NOT NULL DEFAULT 0,
    vendor_final_payout     NUMERIC(14,2) NOT NULL CHECK (vendor_final_payout >= 0),
    disbursement_reference  TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_escrow_settlement_splits_contract_id ON escrow_settlement_splits(escrow_contract_id);

DROP TRIGGER IF EXISTS trg_escrow_settlement_splits_append_only ON escrow_settlement_splits;
CREATE TRIGGER trg_escrow_settlement_splits_append_only
    BEFORE UPDATE OR DELETE ON escrow_settlement_splits
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS escrow_events (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID    NOT NULL,
    escrow_contract_id  UUID    NOT NULL REFERENCES escrow_contracts(id),
    event_type          VARCHAR(100) NOT NULL
                            CHECK (event_type IN (
                                'funds_locked', 'tracking_inserted', 'fulfillment_confirmed',
                                'buyer_confirmed', 'auto_release_triggered',
                                'partial_split_approved', 'dispute_frozen',
                                'sla_auto_release', 'refund_executed', 'aml_hold_set',
                                'aml_hold_released'
                            )),
    actor_id            UUID,
    metadata            JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_escrow_events_contract_id ON escrow_events(escrow_contract_id);
CREATE INDEX IF NOT EXISTS idx_escrow_events_event_type  ON escrow_events(event_type);

DROP TRIGGER IF EXISTS trg_escrow_events_append_only ON escrow_events;
CREATE TRIGGER trg_escrow_events_append_only
    BEFORE UPDATE OR DELETE ON escrow_events
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();


-- =============================================================================
-- MIGRATION 006 — MODERATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS moderation_tickets (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    entity_type     VARCHAR(50) NOT NULL
                        CHECK (entity_type IN (
                            'content_item', 'catalog_item', 'service_listing',
                            'identity_verification', 'report', 'dispute'
                        )),
    entity_id       UUID        NOT NULL,
    queue_type      VARCHAR(50) NOT NULL
                        CHECK (queue_type IN (
                            'knowledge_queue', 'catalog_queue', 'service_queue',
                            'identity_queue', 'fraud_queue', 'report_queue', 'dispute_queue'
                        )),
    severity        VARCHAR(20) NOT NULL DEFAULT 'standard'
                        CHECK (severity IN ('standard', 'major', 'critical')),
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                        CHECK (status IN (
                            'pending', 'assigned', 'revision_requested',
                            'under_panel_review', 'approved', 'rejected'
                        )),
    sla_deadline    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_tickets_entity_id   ON moderation_tickets(entity_id);
CREATE INDEX IF NOT EXISTS idx_moderation_tickets_queue_type  ON moderation_tickets(queue_type);
CREATE INDEX IF NOT EXISTS idx_moderation_tickets_status      ON moderation_tickets(status);
CREATE INDEX IF NOT EXISTS idx_moderation_tickets_severity    ON moderation_tickets(severity);
CREATE INDEX IF NOT EXISTS idx_moderation_tickets_tenant_id   ON moderation_tickets(tenant_id);

DROP TRIGGER IF EXISTS trg_moderation_tickets_updated_at ON moderation_tickets;
CREATE TRIGGER trg_moderation_tickets_updated_at
    BEFORE UPDATE ON moderation_tickets
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS moderation_assignments (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    ticket_id       UUID        NOT NULL REFERENCES moderation_tickets(id) ON DELETE RESTRICT,
    moderator_id    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    sla_deadline    TIMESTAMPTZ NOT NULL,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_assignments_ticket_id    ON moderation_assignments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_moderation_assignments_moderator_id ON moderation_assignments(moderator_id);

DROP TRIGGER IF EXISTS trg_moderation_assignments_updated_at ON moderation_assignments;
CREATE TRIGGER trg_moderation_assignments_updated_at
    BEFORE UPDATE ON moderation_assignments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS moderation_panel_reviews (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID    NOT NULL REFERENCES tenants(id),
    ticket_id       UUID    NOT NULL UNIQUE REFERENCES moderation_tickets(id) ON DELETE RESTRICT,
    required_votes  INT     NOT NULL DEFAULT 3,
    votes_approved  INT     NOT NULL DEFAULT 0 CHECK (votes_approved >= 0),
    votes_rejected  INT     NOT NULL DEFAULT 0 CHECK (votes_rejected >= 0),
    final_decision  VARCHAR(20) CHECK (final_decision IN ('approved', 'rejected')),
    decided_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_panel_reviews_ticket_id ON moderation_panel_reviews(ticket_id);

DROP TRIGGER IF EXISTS trg_moderation_panel_reviews_updated_at ON moderation_panel_reviews;
CREATE TRIGGER trg_moderation_panel_reviews_updated_at
    BEFORE UPDATE ON moderation_panel_reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS moderation_panel_votes (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID    NOT NULL,
    panel_review_id UUID    NOT NULL REFERENCES moderation_panel_reviews(id) ON DELETE RESTRICT,
    moderator_id    UUID    NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vote            VARCHAR(20) NOT NULL CHECK (vote IN ('approve', 'reject')),
    rationale_notes TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(panel_review_id, moderator_id)
);

CREATE INDEX IF NOT EXISTS idx_moderation_panel_votes_panel_id     ON moderation_panel_votes(panel_review_id);
CREATE INDEX IF NOT EXISTS idx_moderation_panel_votes_moderator_id ON moderation_panel_votes(moderator_id);

DROP TRIGGER IF EXISTS trg_moderation_panel_votes_append_only ON moderation_panel_votes;
CREATE TRIGGER trg_moderation_panel_votes_append_only
    BEFORE UPDATE OR DELETE ON moderation_panel_votes
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS appeal_tickets (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    original_ticket_id  UUID        NOT NULL REFERENCES moderation_tickets(id) ON DELETE RESTRICT,
    appellant_id        UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                            CHECK (status IN (
                                'pending', 'under_admin_arbitration',
                                'overturned', 'upheld'
                            )),
    evidence_text       TEXT,
    governance_notes    TEXT,
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appeal_tickets_original_ticket_id ON appeal_tickets(original_ticket_id);
CREATE INDEX IF NOT EXISTS idx_appeal_tickets_appellant_id       ON appeal_tickets(appellant_id);
CREATE INDEX IF NOT EXISTS idx_appeal_tickets_status             ON appeal_tickets(status);

DROP TRIGGER IF EXISTS trg_appeal_tickets_updated_at ON appeal_tickets;
CREATE TRIGGER trg_appeal_tickets_updated_at
    BEFORE UPDATE ON appeal_tickets
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- =============================================================================
-- MIGRATION 007 — SECURITY + GOVERNANCE
-- =============================================================================

CREATE TABLE IF NOT EXISTS security_incidents (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        REFERENCES users(id) ON DELETE RESTRICT,
    incident_type   VARCHAR(50) NOT NULL
                        CHECK (incident_type IN (
                            'mfa_failure', 'credential_stuffing', 'device_mismatch',
                            'geo_anomaly', 'sybil_detection', 'aml_flag', 'rate_limit_breach'
                        )),
    severity_level  VARCHAR(20) NOT NULL
                        CHECK (severity_level IN ('medium', 'high', 'critical')),
    incident_status VARCHAR(30) NOT NULL DEFAULT 'open'
                        CHECK (incident_status IN ('open', 'investigating', 'mitigated', 'closed')),
    source_ip       INET,
    metadata        JSONB,
    detected_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_incidents_user_id         ON security_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_security_incidents_incident_type   ON security_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity_level  ON security_incidents(severity_level);
CREATE INDEX IF NOT EXISTS idx_security_incidents_incident_status ON security_incidents(incident_status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_detected_at     ON security_incidents(detected_at DESC);

DROP TRIGGER IF EXISTS trg_security_incidents_updated_at ON security_incidents;
CREATE TRIGGER trg_security_incidents_updated_at
    BEFORE UPDATE ON security_incidents
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS governance_decisions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    actor_id            UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    decision_type       VARCHAR(50) NOT NULL
                            CHECK (decision_type IN (
                                'amend_parameter', 'override_dispute', 'trigger_lockdown',
                                'account_restoration', 'sanction_level_3',
                                'sanction_reversal', 'governance_review'
                            )),
    reference_id        UUID,
    previous_value      JSONB,
    new_value           JSONB,
    rationale_statement TEXT        NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_governance_decisions_actor_id      ON governance_decisions(actor_id);
CREATE INDEX IF NOT EXISTS idx_governance_decisions_decision_type ON governance_decisions(decision_type);
CREATE INDEX IF NOT EXISTS idx_governance_decisions_reference_id  ON governance_decisions(reference_id);

DROP TRIGGER IF EXISTS trg_governance_decisions_append_only ON governance_decisions;
CREATE TRIGGER trg_governance_decisions_append_only
    BEFORE UPDATE OR DELETE ON governance_decisions
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();


-- =============================================================================
-- MIGRATION 008 — REPUTATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS core_reputations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    master_score    NUMERIC(6,2) NOT NULL DEFAULT 100.00
                        CHECK (master_score >= 0 AND master_score <= 1000),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_core_reputations_user_id      ON core_reputations(user_id);
CREATE INDEX IF NOT EXISTS idx_core_reputations_master_score ON core_reputations(master_score DESC);

DROP TRIGGER IF EXISTS trg_core_reputations_updated_at ON core_reputations;
CREATE TRIGGER trg_core_reputations_updated_at
    BEFORE UPDATE ON core_reputations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS reputation_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason_code     VARCHAR(100) NOT NULL
                        CHECK (reason_code IN (
                            'knowledge_approved', 'order_fulfilled', 'provenance_verified',
                            'tracking_number_invalid', 'provenance_violation',
                            'penalty_reversed', 'inactivity_decay'
                        )),
    score_delta     NUMERIC(7,2) NOT NULL,
    source_event_id UUID        UNIQUE NOT NULL,
    source_domain   VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reputation_events_user_id         ON reputation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_events_reason_code     ON reputation_events(reason_code);
CREATE INDEX IF NOT EXISTS idx_reputation_events_source_event_id ON reputation_events(source_event_id);

DROP TRIGGER IF EXISTS trg_reputation_events_append_only ON reputation_events;
CREATE TRIGGER trg_reputation_events_append_only
    BEFORE UPDATE OR DELETE ON reputation_events
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS reputation_decay_logs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    score_delta NUMERIC(7,2) NOT NULL CHECK (score_delta < 0),
    reason_code VARCHAR(50) NOT NULL DEFAULT 'inactivity_decay',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reputation_decay_logs_user_id ON reputation_decay_logs(user_id);

DROP TRIGGER IF EXISTS trg_reputation_decay_logs_append_only ON reputation_decay_logs;
CREATE TRIGGER trg_reputation_decay_logs_append_only
    BEFORE UPDATE OR DELETE ON reputation_decay_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();


-- =============================================================================
-- MIGRATION 009 — LOGISTICS
-- =============================================================================

CREATE TABLE IF NOT EXISTS logistics_change_logs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL,
    correlation_id      UUID        NOT NULL,
    order_id            UUID        NOT NULL REFERENCES orders(id),
    tracking_record_id  UUID        NOT NULL,
    current_status      VARCHAR(30) NOT NULL
                            CHECK (current_status IN (
                                'manifested', 'in_transit', 'delivered',
                                'carrier_exception', 'tracking_invalid'
                            )),
    event_reference     TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_logistics_change_logs_order_id        ON logistics_change_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_logistics_change_logs_correlation_id  ON logistics_change_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_logistics_change_logs_current_status  ON logistics_change_logs(current_status);

DROP TRIGGER IF EXISTS trg_logistics_change_logs_append_only ON logistics_change_logs;
CREATE TRIGGER trg_logistics_change_logs_append_only
    BEFORE UPDATE OR DELETE ON logistics_change_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();


-- =============================================================================
-- MIGRATION 010 — AUDIT LOGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS identity_audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    correlation_id  UUID        NOT NULL,
    user_id         UUID        NOT NULL,
    actor_id        UUID,
    action_type     VARCHAR(100) NOT NULL
                        CHECK (action_type IN (
                            'role_activated', 'role_suspended', 'role_rejected',
                            'status_restricted', 'status_suspended',
                            'status_permanently_revoked', 'status_restored',
                            'revalidation_expired', 'kyc_approved', 'kyc_rejected',
                            'kyb_approved', 'kyb_rejected', 'mfa_enabled', 'mfa_disabled'
                        )),
    old_value       JSONB,
    new_value       JSONB,
    rationale_code  VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_identity_audit_logs_user_id        ON identity_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_audit_logs_correlation_id ON identity_audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_identity_audit_logs_action_type    ON identity_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_identity_audit_logs_created_at     ON identity_audit_logs(created_at DESC);

DROP TRIGGER IF EXISTS trg_identity_audit_logs_append_only ON identity_audit_logs;
CREATE TRIGGER trg_identity_audit_logs_append_only
    BEFORE UPDATE OR DELETE ON identity_audit_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS security_audit_logs (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID    NOT NULL,
    correlation_id  UUID    NOT NULL,
    incident_id     UUID,
    actor_id        UUID,
    action_type     VARCHAR(100) NOT NULL
                        CHECK (action_type IN (
                            'incident_detected', 'session_invalidated', 'account_locked',
                            'ip_blocked', 'admin_mitigated', 'mfa_breach_attempt',
                            'sybil_quarantined', 'aml_hold_triggered', 'role_override_used'
                        )),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_incident_id   ON security_audit_logs(incident_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_action_type   ON security_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at    ON security_audit_logs(created_at DESC);

DROP TRIGGER IF EXISTS trg_security_audit_logs_append_only ON security_audit_logs;
CREATE TRIGGER trg_security_audit_logs_append_only
    BEFORE UPDATE OR DELETE ON security_audit_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS moderation_audit_logs (
    id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID    NOT NULL,
    correlation_id          UUID    NOT NULL,
    moderation_ticket_id    UUID    NOT NULL,
    entity_type             VARCHAR(50) NOT NULL,
    entity_id               UUID    NOT NULL,
    actor_id                UUID,
    action_type             VARCHAR(50) NOT NULL
                                CHECK (action_type IN (
                                    'ticket_assigned', 'revision_requested',
                                    'approved', 'rejected', 'panel_vote_cast',
                                    'appeal_submitted', 'appeal_resolved',
                                    'sla_breached', 'escalated_to_admin'
                                )),
    rationale_notes         TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_moderation_audit_logs_ticket_id   ON moderation_audit_logs(moderation_ticket_id);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_logs_entity_id   ON moderation_audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_logs_action_type ON moderation_audit_logs(action_type);

DROP TRIGGER IF EXISTS trg_moderation_audit_logs_append_only ON moderation_audit_logs;
CREATE TRIGGER trg_moderation_audit_logs_append_only
    BEFORE UPDATE OR DELETE ON moderation_audit_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

CREATE TABLE IF NOT EXISTS financial_audit_logs (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID    NOT NULL,
    correlation_id      UUID    NOT NULL,
    escrow_contract_id  UUID    NOT NULL,
    order_id            UUID    NOT NULL,
    amount_locked       NUMERIC(14,2),
    fee_deducted        NUMERIC(14,2),
    release_state       VARCHAR(50)
                            CHECK (release_state IN ('released', 'refunded', NULL)),
    actor_id            UUID,
    action_type         VARCHAR(100) NOT NULL
                            CHECK (action_type IN (
                                'payment_detected', 'locked', 'in_transit', 'delivered',
                                'buyer_confirmed', 'auto_released', 'released',
                                'refunded', 'disputed', 'aml_hold_set', 'aml_hold_released',
                                'split_calculated', 'disbursement_initiated'
                            )),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_order_id           ON financial_audit_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_escrow_contract_id ON financial_audit_logs(escrow_contract_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_correlation_id     ON financial_audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_logs_created_at         ON financial_audit_logs(created_at DESC);

DROP TRIGGER IF EXISTS trg_financial_audit_logs_append_only ON financial_audit_logs;
CREATE TRIGGER trg_financial_audit_logs_append_only
    BEFORE UPDATE OR DELETE ON financial_audit_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();


-- =============================================================================
-- BRIDGE — Sinkronisasi auth.users → public.users (Supabase-specific)
-- =============================================================================
-- Supabase Auth mengelola auth.users. Kita perlu menyinkronkan ke public.users
-- agar semua domain bisa melakukan JOIN tanpa harus melintasi schema auth.
-- Trigger ini berjalan setiap kali user mendaftar via Supabase Auth.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, tenant_id, email, password_hash, status, kyc_tier, mfa_enabled)
    VALUES (
        NEW.id,
        '00000000-0000-0000-0000-000000000001',  -- tenant Racik Media (single-tenant Phase 1-4)
        NEW.email,
        '',                                       -- password dikelola auth.users, bukan kolom ini
        'active',
        'tier_1',
        false
    )
    ON CONFLICT (id) DO NOTHING;   -- idempoten: jika sudah ada, skip

    -- Beri role 'member' secara otomatis untuk semua user baru
    INSERT INTO public.user_roles (tenant_id, user_id, role_type, status)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        NEW.id,
        'member',
        'active'
    )
    ON CONFLICT (user_id, role_type) DO NOTHING;

    -- Inisialisasi skor reputasi awal = 100
    INSERT INTO public.core_reputations (tenant_id, user_id, master_score)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        NEW.id,
        100.00
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Pasang trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- =============================================================================
-- SELESAI — Konfirmasi
-- =============================================================================
DO $$
DECLARE
    tbl_count INT;
BEGIN
    SELECT COUNT(*) INTO tbl_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';

    RAISE NOTICE '✅ Migrasi selesai. Total tabel di schema public: %', tbl_count;
    RAISE NOTICE '   Semua trigger bridge auth.users → public.users sudah terpasang.';
    RAISE NOTICE '   Tenant ID: 00000000-0000-0000-0000-000000000001';
END $$;
