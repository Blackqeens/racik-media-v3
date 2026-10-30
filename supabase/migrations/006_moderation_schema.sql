-- =============================================================================
-- MIGRATION: 006_moderation_schema.sql
-- Domain  : Moderation
-- Phase   : 1 (Foundation — 4 antrean kurasi dasar)
-- Ref docs: data-models.md §7, moderation-lifecycle.md, ADR-001 D6
-- Depends : 001_identity_schema.sql (users, tenants)
-- =============================================================================
-- CATATAN PENTING:
--   - Moderation HANYA menerbitkan event moderation.decision_made
--   - Domain pemilik entitas yang menerapkan keputusan dan menerbitkan event bisnis
--   - Moderator merekomendasikan; Admin mengesahkan final (KYC/KYB/Level 3/Pemulihan)
--   - KnowledgeQueue, CatalogQueue, ServiceQueue, IdentityQueue adalah nilai queue_type
--     pada moderation_tickets, BUKAN domain atau tabel terpisah
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: moderation_tickets
-- Status: pending | assigned | revision_requested | under_panel_review | approved | rejected
-- Owner : Moderation domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS moderation_tickets (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    entity_type     VARCHAR(50) NOT NULL
                        CHECK (entity_type IN (
                            'content_item', 'catalog_item', 'service_listing',
                            'identity_verification', 'report', 'dispute'
                        )),
    entity_id       UUID        NOT NULL,   -- Ref cross-domain ke entitas terkait
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
    -- standard (Article/Event/Product/Service): now() + 48 jam
    -- complex (Paper/Journal/Distributor): now() + 7 hari
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moderation_tickets_entity_id   ON moderation_tickets(entity_id);
CREATE INDEX idx_moderation_tickets_queue_type  ON moderation_tickets(queue_type);
CREATE INDEX idx_moderation_tickets_status      ON moderation_tickets(status);
CREATE INDEX idx_moderation_tickets_severity    ON moderation_tickets(severity);
CREATE INDEX idx_moderation_tickets_tenant_id   ON moderation_tickets(tenant_id);

CREATE TRIGGER trg_moderation_tickets_updated_at
    BEFORE UPDATE ON moderation_tickets
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  moderation_tickets IS 'Antrean kurasi terpusat semua entitas. Owner: Moderation domain.';
COMMENT ON COLUMN moderation_tickets.queue_type IS 'knowledge_queue=artikel/paper, catalog_queue=produk, service_queue=jasa, identity_queue=KYC/KYB, fraud_queue=fraud, report_queue=laporan, dispute_queue=sengketa';
COMMENT ON COLUMN moderation_tickets.sla_deadline IS 'Standard: +48jam. Complex (Paper/Journal/Distributor): +7hari. Jika breach → auto-eskalasi ke Admin.';


-- -----------------------------------------------------------------------------
-- SECTION 2: moderation_assignments
-- Owner: Moderation domain
-- -----------------------------------------------------------------------------

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

CREATE INDEX idx_moderation_assignments_ticket_id    ON moderation_assignments(ticket_id);
CREATE INDEX idx_moderation_assignments_moderator_id ON moderation_assignments(moderator_id);

CREATE TRIGGER trg_moderation_assignments_updated_at
    BEFORE UPDATE ON moderation_assignments
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE moderation_assignments IS 'Alokasi tiket ke moderator dengan SLA. Owner: Moderation domain.';


-- -----------------------------------------------------------------------------
-- SECTION 3: moderation_panel_reviews
-- Untuk tiket severity major/critical — butuh konsensus min. 3 moderator
-- Owner: Moderation domain
-- -----------------------------------------------------------------------------

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

CREATE INDEX idx_moderation_panel_reviews_ticket_id ON moderation_panel_reviews(ticket_id);

CREATE TRIGGER trg_moderation_panel_reviews_updated_at
    BEFORE UPDATE ON moderation_panel_reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE moderation_panel_reviews IS 'Panel konsensus untuk kasus major/critical. Min. 3 suara independen. Owner: Moderation domain.';


-- -----------------------------------------------------------------------------
-- SECTION 4: moderation_panel_votes
-- Append-only — suara individual tidak dapat diubah
-- Owner: Moderation domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS moderation_panel_votes (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID    NOT NULL,
    panel_review_id UUID    NOT NULL REFERENCES moderation_panel_reviews(id) ON DELETE RESTRICT,
    moderator_id    UUID    NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vote            VARCHAR(20) NOT NULL CHECK (vote IN ('approve', 'reject')),
    rationale_notes TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(panel_review_id, moderator_id)   -- Satu moderator satu suara per panel
);

CREATE INDEX idx_moderation_panel_votes_panel_id     ON moderation_panel_votes(panel_review_id);
CREATE INDEX idx_moderation_panel_votes_moderator_id ON moderation_panel_votes(moderator_id);

-- Suara panel bersifat append-only — tidak dapat diubah setelah diberikan
CREATE TRIGGER trg_moderation_panel_votes_append_only
    BEFORE UPDATE OR DELETE ON moderation_panel_votes
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  moderation_panel_votes IS 'Log suara individual panel moderator. Append-only. UNIQUE per moderator per panel. Owner: Moderation domain.';


-- -----------------------------------------------------------------------------
-- SECTION 5: appeal_tickets
-- Status: pending | under_admin_arbitration | overturned | upheld
-- Owner : Moderation domain
-- -----------------------------------------------------------------------------

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
    governance_notes    TEXT,       -- Diisi Admin saat memutuskan
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appeal_tickets_original_ticket_id ON appeal_tickets(original_ticket_id);
CREATE INDEX idx_appeal_tickets_appellant_id       ON appeal_tickets(appellant_id);
CREATE INDEX idx_appeal_tickets_status             ON appeal_tickets(status);

CREATE TRIGGER trg_appeal_tickets_updated_at
    BEFORE UPDATE ON appeal_tickets
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  appeal_tickets IS 'Jalur banding konstitusional. Wajib diajukan dalam 7 hari. Admin putuskan maks 14 hari kerja. Owner: Moderation domain.';
COMMENT ON COLUMN appeal_tickets.governance_notes IS 'Pernyataan putusan resmi Admin. Wajib diisi sebelum status = overturned atau upheld.';


-- =============================================================================
-- END OF MIGRATION 006
-- Tabel yang dibuat:
--   moderation_tickets, moderation_assignments, moderation_panel_reviews,
--   moderation_panel_votes, appeal_tickets
-- =============================================================================
