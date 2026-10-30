-- =============================================================================
-- MIGRATION: 004_service_schema.sql
-- Domain  : Service-Marketplace
-- Phase   : 1 (Foundation — listing dasar) + Phase 2 (milestones + presence)
-- Ref docs: data-models.md §5, service-lifecycle.md
-- Depends : 001_identity_schema.sql (users, tenants)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: service_listings
-- Status: under_review | active | suspended | rejected | archived
-- Owner : Service-Marketplace domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS service_listings (
    id                                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                           UUID        NOT NULL REFERENCES tenants(id),
    provider_id                         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vendor_id                           UUID,       -- Opsional; ref cross-domain ke vendors(id)
    title                               VARCHAR(255) NOT NULL,
    description                         TEXT        NOT NULL,
    delivery_method                     VARCHAR(20) NOT NULL
                                            CHECK (delivery_method IN ('remote', 'geolocated')),
    base_price                          NUMERIC(15,2) NOT NULL CHECK (base_price >= 0),
    base_location                       POINT,      -- WAJIB jika delivery_method = 'geolocated'
    service_operational_radius_meters   INT,        -- WAJIB jika delivery_method = 'geolocated'
    status                              VARCHAR(30) NOT NULL DEFAULT 'under_review'
                                            CHECK (status IN (
                                                'under_review', 'active', 'suspended',
                                                'rejected', 'archived'
                                            )),
    created_at                          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_listings_provider_id       ON service_listings(provider_id);
CREATE INDEX idx_service_listings_status            ON service_listings(status);
CREATE INDEX idx_service_listings_delivery_method   ON service_listings(delivery_method);
CREATE INDEX idx_service_listings_tenant_id         ON service_listings(tenant_id);

CREATE TRIGGER trg_service_listings_updated_at
    BEFORE UPDATE ON service_listings
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  service_listings IS 'Katalog jasa profesional. Remote (digital) atau Geolocated (fisik lapangan). Owner: Service-Marketplace domain.';
COMMENT ON COLUMN service_listings.base_location IS 'Koordinat pusat operasi. Wajib untuk geolocated. Contoh: ST_MakePoint(106.8456, -6.2088)::POINT';
COMMENT ON COLUMN service_listings.service_operational_radius_meters IS 'Radius jangkauan dalam meter. Wajib untuk geolocated. Contoh: 10000 = 10 km.';


-- -----------------------------------------------------------------------------
-- SECTION 2: service_milestones
-- Status: pending | locked | in_progress | submitted | amendment_requested | completed | cancelled
-- Owner : Service-Marketplace domain
-- Catatan: Dana (locked/released/refunded) dimiliki escrow_milestone_tranches
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS service_milestones (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    order_id            UUID        NOT NULL,   -- Ref cross-domain ke orders(id)
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

CREATE INDEX idx_service_milestones_order_id           ON service_milestones(order_id);
CREATE INDEX idx_service_milestones_service_listing_id ON service_milestones(service_listing_id);
CREATE INDEX idx_service_milestones_status             ON service_milestones(status);

CREATE TRIGGER trg_service_milestones_updated_at
    BEFORE UPDATE ON service_milestones
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  service_milestones IS 'Target kerja per milestone. Status progres pekerjaan (bukan dana). Dana dikelola escrow_milestone_tranches. Owner: Service-Marketplace domain.';
COMMENT ON COLUMN service_milestones.revision_count IS 'Maks 3 revisi. Jika sudah 3 dan klien menolak lagi → wajib buka dispute ke Escrow.';
COMMENT ON COLUMN service_milestones.order_id IS 'Ref cross-domain ke orders(id). Tidak pakai FK CASCADE karena beda domain boundary.';


-- -----------------------------------------------------------------------------
-- SECTION 3: service_presence_tokens
-- Append-only — bukti kehadiran fisik lapangan
-- Owner: Service-Marketplace domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS service_presence_tokens (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID        NOT NULL REFERENCES tenants(id),
    milestone_id                UUID        NOT NULL REFERENCES service_milestones(id) ON DELETE RESTRICT,
    provider_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verification_method         VARCHAR(30) NOT NULL
                                    CHECK (verification_method IN (
                                        'qr_scan', 'geofence_match', 'manual_moderator_override'
                                    )),
    provider_coordinates        POINT,
    client_coordinates          POINT,
    distance_deviation_meters   NUMERIC(10,2),
    verified_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_presence_tokens_milestone_id ON service_presence_tokens(milestone_id);
CREATE INDEX idx_service_presence_tokens_provider_id  ON service_presence_tokens(provider_id);

-- Bukti kehadiran bersifat append-only
CREATE TRIGGER trg_service_presence_tokens_append_only
    BEFORE UPDATE OR DELETE ON service_presence_tokens
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  service_presence_tokens IS 'Bukti kehadiran fisik lapangan untuk milestone geolocated. Append-only. Owner: Service-Marketplace domain.';
COMMENT ON COLUMN service_presence_tokens.verification_method IS 'qr_scan=scan QR OTP, geofence_match=koordinat dalam radius 50m, manual_moderator_override=override kurator dengan bukti foto.';
COMMENT ON COLUMN service_presence_tokens.distance_deviation_meters IS 'Selisih jarak provider vs client dalam meter. Disetujui otomatis jika <= 50m.';


-- -----------------------------------------------------------------------------
-- SECTION 4: service_change_logs
-- Append-only — jejak modifikasi lingkup/harga/geofence
-- Owner: Service-Marketplace domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS service_change_logs (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID    NOT NULL,
    service_id  UUID    NOT NULL,   -- Ref ke service_listings(id)
    actor_id    UUID    NOT NULL,
    old_scope   JSONB,
    new_scope   JSONB   NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_change_logs_service_id ON service_change_logs(service_id);

CREATE TRIGGER trg_service_change_logs_append_only
    BEFORE UPDATE OR DELETE ON service_change_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  service_change_logs IS 'Audit trail modifikasi lingkup kerja, harga, radius geofence. Append-only. Owner: Service-Marketplace domain.';
COMMENT ON COLUMN service_change_logs.old_scope IS 'Snapshot JSONB kondisi sebelum perubahan. NULL untuk create pertama.';


-- =============================================================================
-- END OF MIGRATION 004
-- Tabel yang dibuat:
--   service_listings, service_milestones, service_presence_tokens,
--   service_change_logs
-- =============================================================================
