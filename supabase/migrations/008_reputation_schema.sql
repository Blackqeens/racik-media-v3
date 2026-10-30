-- =============================================================================
-- MIGRATION: 008_reputation_schema.sql
-- Domain  : Reputation
-- Phase   : 1 (Foundation — skor dasar + event +2 untuk content.published)
-- Ref docs: data-models.md §11, reputation-engine.md
-- Depends : 001_identity_schema.sql (users, tenants)
-- =============================================================================
-- CATATAN:
--   - Skor awal = 100, rentang 0–1000
--   - reputation_events adalah sumber kebenaran; core_reputations adalah read model
--   - TIDAK ADA domain lain yang boleh menulis langsung ke tabel ini
--   - Pembalikan penalti pakai event baru (reason_code=penalty_reversed), bukan DELETE
--   - Inactivity decay: -5/bulan setelah 6 bulan tidak aktif (job terjadwal)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: core_reputations
-- Read model — skor master per pengguna
-- Owner: Reputation domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS core_reputations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    master_score    NUMERIC(6,2) NOT NULL DEFAULT 100.00
                        CHECK (master_score >= 0 AND master_score <= 1000),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_core_reputations_user_id     ON core_reputations(user_id);
CREATE INDEX idx_core_reputations_master_score ON core_reputations(master_score DESC);

CREATE TRIGGER trg_core_reputations_updated_at
    BEFORE UPDATE ON core_reputations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  core_reputations IS 'Read model skor reputasi master per pengguna (0–1000). Hanya Reputation domain yang menulis. Owner: Reputation domain.';
COMMENT ON COLUMN core_reputations.master_score IS 'Skor awal = 100. Min = 0, Max = 1000. Dihitung dari reputation_events. Mempengaruhi ranking pencarian.';


-- -----------------------------------------------------------------------------
-- SECTION 2: reputation_events
-- Append-only — ledger sumber kebenaran semua mutasi skor
-- Owner: Reputation domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reputation_events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason_code     VARCHAR(100) NOT NULL
                        CHECK (reason_code IN (
                            'knowledge_approved',   -- +2  (content.published)
                            'order_fulfilled',      -- +1  (escrow.milestone_released)
                            'provenance_verified',  -- +15 (provenance.verified)
                            'tracking_number_invalid', -- -250 (logistics.tracking_invalid)
                            'provenance_violation', -- -250 (provenance.rejected terbukti)
                            'penalty_reversed',     -- +250 atau nilai tercatat (banding berhasil)
                            'inactivity_decay'      -- -5 per bulan (job terjadwal)
                        )),
    score_delta     NUMERIC(7,2) NOT NULL,
    -- Positif = tambah skor, Negatif = kurangi. Skor akhir = max(0, min(1000, current+delta))
    source_event_id UUID        UNIQUE NOT NULL,
    -- Idempotency key: eventId dari event-map.md. UNIQUE mencegah double-processing.
    source_domain   VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reputation_events_user_id         ON reputation_events(user_id);
CREATE INDEX idx_reputation_events_reason_code     ON reputation_events(reason_code);
CREATE INDEX idx_reputation_events_source_event_id ON reputation_events(source_event_id);

-- Ledger reputasi bersifat append-only
CREATE TRIGGER trg_reputation_events_append_only
    BEFORE UPDATE OR DELETE ON reputation_events
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  reputation_events IS 'Ledger sumber kebenaran skor reputasi. Append-only. Idempoten via source_event_id. Owner: Reputation domain.';
COMMENT ON COLUMN reputation_events.source_event_id IS 'eventId dari event-map.md. UNIQUE constraint mencegah consumer memproses event yang sama dua kali.';
COMMENT ON COLUMN reputation_events.score_delta IS 'Delta skor. Skor final = CLAMP(current_score + delta, 0, 1000). Pembalikan pakai event baru dengan delta positif.';


-- -----------------------------------------------------------------------------
-- SECTION 3: reputation_decay_logs
-- Append-only — rekaman penalti inactivity decay bulanan
-- Owner: Reputation domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reputation_decay_logs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    score_delta NUMERIC(7,2) NOT NULL CHECK (score_delta < 0),
    -- Selalu negatif: -5 per bulan memenuhi syarat
    reason_code VARCHAR(50) NOT NULL DEFAULT 'inactivity_decay',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reputation_decay_logs_user_id ON reputation_decay_logs(user_id);

CREATE TRIGGER trg_reputation_decay_logs_append_only
    BEFORE UPDATE OR DELETE ON reputation_decay_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  reputation_decay_logs IS 'Log penalti inactivity decay (-5/bulan setelah 6 bulan tidak aktif). Append-only. Owner: Reputation domain.';
COMMENT ON COLUMN reputation_decay_logs.score_delta IS 'Selalu negatif. Dijalankan max 1x per bulan per user oleh scheduled job Reputation.';


-- =============================================================================
-- END OF MIGRATION 008
-- Tabel yang dibuat:
--   core_reputations, reputation_events, reputation_decay_logs
-- =============================================================================
