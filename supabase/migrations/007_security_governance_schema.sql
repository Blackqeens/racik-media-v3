-- =============================================================================
-- MIGRATION: 007_security_governance_schema.sql
-- Domain  : Security + Governance
-- Phase   : 1 (Foundation)
-- Ref docs: data-models.md §8-9, security-architecture.md, governance-sanction-rules.md
-- Depends : 001_identity_schema.sql (users, tenants)
-- =============================================================================
-- CATATAN:
--   - Security HANYA menerbitkan event security.incident_critical
--   - Identity adalah satu-satunya domain yang menulis users.status / user_roles.status
--   - Governance mencatat keputusan Level 3, pemulihan akun, amend parameter
--   - Mesin aturan deterministik (BUKAN AI) boleh freeze sementara; Level 3 hanya Admin
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: security_incidents
-- Status (incident_status): open | investigating | mitigated | closed
-- Owner : Security domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS security_incidents (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        REFERENCES users(id) ON DELETE RESTRICT,
    -- NULL jika insiden tidak terkait user spesifik (misal: DDoS level infrastruktur)
    incident_type   VARCHAR(50) NOT NULL
                        CHECK (incident_type IN (
                            'mfa_failure', 'credential_stuffing', 'device_mismatch',
                            'geo_anomaly', 'sybil_detection', 'aml_flag', 'rate_limit_breach'
                        )),
    severity_level  VARCHAR(20) NOT NULL
                        CHECK (severity_level IN ('medium', 'high', 'critical')),
    incident_status VARCHAR(30) NOT NULL DEFAULT 'open'
                        CHECK (incident_status IN (
                            'open', 'investigating', 'mitigated', 'closed'
                        )),
    source_ip       INET,
    metadata        JSONB,
    -- Simpan: user_agent, geo_location, device_fingerprint_hash (bukan data sensitif)
    detected_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_incidents_user_id         ON security_incidents(user_id);
CREATE INDEX idx_security_incidents_incident_type   ON security_incidents(incident_type);
CREATE INDEX idx_security_incidents_severity_level  ON security_incidents(severity_level);
CREATE INDEX idx_security_incidents_incident_status ON security_incidents(incident_status);
CREATE INDEX idx_security_incidents_detected_at     ON security_incidents(detected_at DESC);

CREATE TRIGGER trg_security_incidents_updated_at
    BEFORE UPDATE ON security_incidents
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  security_incidents IS 'Rekaman insiden keamanan. Security menerbitkan event; Identity menerapkan perubahan status. Owner: Security domain.';
COMMENT ON COLUMN security_incidents.incident_type IS 'mfa_failure=5x gagal/10mnt, geo_anomaly=impossible travel >500km/<1jam, sybil_detection=multi-akun fingerprint sama.';
COMMENT ON COLUMN security_incidents.metadata IS 'JSONB. Boleh: user_agent, geo_hash, device_hash. JANGAN: email, NIK, password, raw token.';


-- -----------------------------------------------------------------------------
-- SECTION 2: governance_decisions
-- Append-only — keputusan Admin tidak dapat diubah setelah ditetapkan
-- Owner: Governance domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS governance_decisions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    actor_id            UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    -- Harus user dengan role_type = 'admin'
    decision_type       VARCHAR(50) NOT NULL
                            CHECK (decision_type IN (
                                'amend_parameter',      -- Ubah fee platform, floor price, dll
                                'override_dispute',     -- Override keputusan sengketa
                                'trigger_lockdown',     -- Lockdown darurat
                                'account_restoration',  -- Pulihkan akun yang di-suspend
                                'sanction_level_3',     -- permanently_revoked
                                'sanction_reversal',    -- Batalkan sanksi Level 3
                                'governance_review'     -- Review umum / audit
                            )),
    reference_id        UUID,
    -- ticket_id, incident_id, appeal_id, atau entity_id sesuai konteks
    previous_value      JSONB,
    new_value           JSONB,
    rationale_statement TEXT        NOT NULL,
    -- Pernyataan justifikasi wajib; tidak dapat dikosongkan
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_governance_decisions_actor_id      ON governance_decisions(actor_id);
CREATE INDEX idx_governance_decisions_decision_type ON governance_decisions(decision_type);
CREATE INDEX idx_governance_decisions_reference_id  ON governance_decisions(reference_id);

-- Keputusan Governance bersifat append-only — tidak dapat diubah
CREATE TRIGGER trg_governance_decisions_append_only
    BEFORE UPDATE OR DELETE ON governance_decisions
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  governance_decisions IS 'Log keputusan administratif tertinggi. Append-only. Semua tindakan Admin yang berdampak sistemik wajib dicatat di sini. Owner: Governance domain.';
COMMENT ON COLUMN governance_decisions.rationale_statement IS 'Wajib diisi. Justifikasi legal/operasional. Tidak dapat diedit setelah disimpan.';
COMMENT ON COLUMN governance_decisions.reference_id IS 'Isi dengan UUID tiket/insiden/banding/entitas yang relevan. NULL jika amend global parameter.';


-- =============================================================================
-- END OF MIGRATION 007
-- Tabel yang dibuat:
--   security_incidents, governance_decisions
-- =============================================================================
