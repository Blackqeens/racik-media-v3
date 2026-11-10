-- =============================================================================
-- MIGRATION: 002_content_schema.sql
-- Domain  : Content
-- Phase   : 1 (Foundation)
-- Ref docs: data-models.md §2, content-lifecycle.md, event-map.md
-- Depends : 001_identity_schema.sql (users, tenants, trigger functions)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: content_items
-- Status: draft | under_review | revision_requested | approved | published | archived | rejected
-- Owner : Content domain
-- -----------------------------------------------------------------------------

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
    geolocation_meta POINT,  -- WAJIB diisi jika content_type = 'event'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_items_author_id    ON content_items(author_id);
CREATE INDEX idx_content_items_status       ON content_items(status);
CREATE INDEX idx_content_items_content_type ON content_items(content_type);
CREATE INDEX idx_content_items_tenant_id    ON content_items(tenant_id);

CREATE TRIGGER trg_content_items_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  content_items IS 'Unit pengetahuan platform (Article/Paper/Journal/Event). Wajib kurasi sebelum Published. Owner: Content domain.';
COMMENT ON COLUMN content_items.geolocation_meta IS 'Wajib untuk type=event. Contoh: ST_MakePoint(106.8456, -6.2088)::POINT';
COMMENT ON COLUMN content_items.status IS 'draft → under_review → published; Moderator may instead request revision or reject. See content-lifecycle.md for the full state machine.';


-- -----------------------------------------------------------------------------
-- SECTION 2: content_citations
-- Append-only — sitasi tidak dapat diubah setelah dikunci
-- Owner: Content domain
-- Catatan: WAJIB ada min. 1 untuk paper dan journal (divalidasi di application layer)
-- -----------------------------------------------------------------------------

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

CREATE INDEX idx_content_citations_content_id ON content_citations(content_id);

-- Sitasi akademik bersifat append-only
CREATE TRIGGER trg_content_citations_append_only
    BEFORE UPDATE OR DELETE ON content_citations
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  content_citations IS 'Validasi sitasi akademik (APA/MLA). WAJIB min. 1 untuk Paper dan Journal. Append-only. Owner: Content domain.';
COMMENT ON COLUMN content_citations.citation_format IS 'apa | mla | platform_standard. Gunakan platform_standard jika tidak sesuai format baku.';


-- -----------------------------------------------------------------------------
-- SECTION 3: content_lifecycle_logs
-- Append-only — jejak mutasi status konten
-- Owner: Content domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS content_lifecycle_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    content_id      UUID        NOT NULL,   -- Referensi ke content_items; tidak pakai FK CASCADE
    actor_id        UUID,                   -- NULL jika aksi dilakukan sistem otomatis
    old_state       VARCHAR(50),            -- NULL untuk state awal (draft)
    new_state       VARCHAR(50) NOT NULL,
    rationale_notes TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_lifecycle_logs_content_id ON content_lifecycle_logs(content_id);
CREATE INDEX idx_content_lifecycle_logs_actor_id   ON content_lifecycle_logs(actor_id);

-- Log lifecycle bersifat append-only
CREATE TRIGGER trg_content_lifecycle_logs_append_only
    BEFORE UPDATE OR DELETE ON content_lifecycle_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  content_lifecycle_logs IS 'Jejak mutasi status konten dari draft sampai archived/published. Append-only. Owner: Content domain.';
COMMENT ON COLUMN content_lifecycle_logs.actor_id IS 'UUID user/moderator/sistem. NULL jika aksi otomatis (misal: auto-archive setelah timeout).';
COMMENT ON COLUMN content_lifecycle_logs.old_state IS 'NULL untuk transisi pertama (baru dibuat sebagai draft).';


-- =============================================================================
-- END OF MIGRATION 002
-- Tabel yang dibuat:
--   content_items, content_citations, content_lifecycle_logs
-- =============================================================================
