-- =============================================================================
-- MIGRATION: 010_audit_schema.sql
-- Domain  : Audit
-- Phase   : 1 (Foundation — CRITICAL logs aktif sejak hari pertama)
-- Ref docs: data-models.md §10, audit-strategy.md, ADR-001 D9
-- Depends : 001_identity_schema.sql, 007_security_governance_schema.sql
-- =============================================================================
-- CATATAN PENTING (ADR-001 D9):
--   - SEMUA tabel di sini bersifat APPEND-ONLY
--   - UPDATE dan DELETE DIBLOKIR oleh trigger
--   - Purge HANYA oleh job retensi terjadwal sesuai audit-strategy.md
--   - Retensi: CRITICAL = 7 tahun, IMPORTANT = 2 tahun, INFORMATIONAL = 180 hari
--   - Hapus data PII via ANONYMIZATION (update kolom dengan token anonim),
--     bukan DELETE baris
--   - Domain bisnis MENGIRIM EVENT; Audit domain yang MENULIS tabel ini
--   - Jangan salin NIK, nomor rekening, email, password ke dalam kolom log
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: identity_audit_logs
-- Retensi: CRITICAL — 7 tahun
-- Owner  : Audit domain (ditulis via event dari Identity domain)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS identity_audit_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    correlation_id  UUID        NOT NULL,
    user_id         UUID        NOT NULL,   -- Ref ke users(id); tidak pakai FK CASCADE
    actor_id        UUID,                   -- NULL jika aksi otomatis sistem
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

CREATE INDEX idx_identity_audit_logs_user_id        ON identity_audit_logs(user_id);
CREATE INDEX idx_identity_audit_logs_correlation_id ON identity_audit_logs(correlation_id);
CREATE INDEX idx_identity_audit_logs_action_type    ON identity_audit_logs(action_type);
CREATE INDEX idx_identity_audit_logs_created_at     ON identity_audit_logs(created_at DESC);

CREATE TRIGGER trg_identity_audit_logs_append_only
    BEFORE UPDATE OR DELETE ON identity_audit_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  identity_audit_logs IS 'CRITICAL log (retensi 7 tahun). Mutasi status akun/peran, keputusan KYC/KYB. Append-only. Owner: Audit domain.';
COMMENT ON COLUMN identity_audit_logs.old_value IS 'JSONB snapshot status sebelumnya. JANGAN masukkan email, NIK, atau data PII. Gunakan UUID referensi.';


-- -----------------------------------------------------------------------------
-- SECTION 2: security_audit_logs
-- Retensi: CRITICAL — 7 tahun
-- Owner  : Audit domain (ditulis via event dari Security domain)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS security_audit_logs (
    id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID    NOT NULL,
    correlation_id  UUID    NOT NULL,
    incident_id     UUID,   -- Ref ke security_incidents(id); nullable untuk pre-incident logs
    actor_id        UUID,
    action_type     VARCHAR(100) NOT NULL
                        CHECK (action_type IN (
                            'incident_detected', 'session_invalidated', 'account_locked',
                            'ip_blocked', 'admin_mitigated', 'mfa_breach_attempt',
                            'sybil_quarantined', 'aml_hold_triggered'
                        )),
    metadata        JSONB,
    -- Simpan: geo_hash, user_agent_hash, ip_hash. JANGAN: plaintext IP jika sensitif.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_audit_logs_incident_id   ON security_audit_logs(incident_id);
CREATE INDEX idx_security_audit_logs_action_type   ON security_audit_logs(action_type);
CREATE INDEX idx_security_audit_logs_created_at    ON security_audit_logs(created_at DESC);

CREATE TRIGGER trg_security_audit_logs_append_only
    BEFORE UPDATE OR DELETE ON security_audit_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  security_audit_logs IS 'CRITICAL log (retensi 7 tahun). Insiden keamanan, session invalidation, IP block. Append-only. Owner: Audit domain.';


-- -----------------------------------------------------------------------------
-- SECTION 3: moderation_audit_logs
-- Retensi: IMPORTANT — 2 tahun
-- Owner  : Audit domain (ditulis via event dari Moderation domain)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS moderation_audit_logs (
    id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID    NOT NULL,
    correlation_id          UUID    NOT NULL,
    moderation_ticket_id    UUID    NOT NULL,  -- Ref ke moderation_tickets(id)
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

CREATE INDEX idx_moderation_audit_logs_ticket_id    ON moderation_audit_logs(moderation_ticket_id);
CREATE INDEX idx_moderation_audit_logs_entity_id    ON moderation_audit_logs(entity_id);
CREATE INDEX idx_moderation_audit_logs_action_type  ON moderation_audit_logs(action_type);

CREATE TRIGGER trg_moderation_audit_logs_append_only
    BEFORE UPDATE OR DELETE ON moderation_audit_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  moderation_audit_logs IS 'IMPORTANT log (retensi 2 tahun). Keputusan kurator, panel vote, banding. Append-only. Owner: Audit domain.';


-- -----------------------------------------------------------------------------
-- SECTION 4: financial_audit_logs
-- Retensi: CRITICAL — 7 tahun (kewajiban hukum pelaporan keuangan)
-- Owner  : Audit domain (ditulis via event dari Escrow/Payment domain)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS financial_audit_logs (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID    NOT NULL,
    correlation_id      UUID    NOT NULL,
    escrow_contract_id  UUID    NOT NULL,   -- Ref ke escrow_contracts(id)
    order_id            UUID    NOT NULL,   -- Ref ke orders(id)
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

CREATE INDEX idx_financial_audit_logs_order_id          ON financial_audit_logs(order_id);
CREATE INDEX idx_financial_audit_logs_escrow_contract_id ON financial_audit_logs(escrow_contract_id);
CREATE INDEX idx_financial_audit_logs_correlation_id    ON financial_audit_logs(correlation_id);
CREATE INDEX idx_financial_audit_logs_created_at        ON financial_audit_logs(created_at DESC);

CREATE TRIGGER trg_financial_audit_logs_append_only
    BEFORE UPDATE OR DELETE ON financial_audit_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  financial_audit_logs IS 'CRITICAL log (retensi 7 tahun). Semua mutasi status finansial escrow dan pencairan dana. Append-only. Owner: Audit domain.';
COMMENT ON COLUMN financial_audit_logs.amount_locked IS 'NULL untuk event non-finansial (misal: status_change). Diisi untuk locked, released, refunded.';


-- =============================================================================
-- END OF MIGRATION 010
-- Tabel yang dibuat:
--   identity_audit_logs, security_audit_logs,
--   moderation_audit_logs, financial_audit_logs
-- =============================================================================
