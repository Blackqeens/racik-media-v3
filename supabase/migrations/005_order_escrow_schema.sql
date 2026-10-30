-- =============================================================================
-- MIGRATION: 005_order_escrow_schema.sql
-- Domain  : Order + Escrow
-- Phase   : 2 (Commerce & Financial Escrow)
-- Ref docs: data-models.md §6, escrow-lifecycle.md, pricing-sustainability.md
-- Depends : 001_identity_schema.sql (users, tenants)
-- =============================================================================
-- CATATAN PENTING (No-Wallet Architecture):
--   - Platform TIDAK boleh memiliki tabel saldo/wallet pengguna
--   - Setiap escrow_contracts terikat 1:1 dengan orders (UNIQUE order_id)
--   - Jasa bermilestone menggunakan escrow_milestone_tranches di dalam kontrak yang sama
--   - Dana dicairkan langsung ke rekening bank via Payment Gateway (bukan saldo internal)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: orders
-- Status: pending_payment | paid | in_fulfillment | completed | cancelled | disputed
-- Owner : Order domain
-- -----------------------------------------------------------------------------

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

CREATE INDEX idx_orders_buyer_id    ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id   ON orders(seller_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_order_type  ON orders(order_type);
CREATE INDEX idx_orders_tenant_id   ON orders(tenant_id);

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  orders IS 'Komitmen komersial bilateral pembeli-penjual. 1 order = 1 escrow_contract. Owner: Order domain.';
COMMENT ON COLUMN orders.order_type IS 'product_retail|product_wholesale|service_remote|service_geolocated';
COMMENT ON COLUMN orders.gross_amount IS 'Nilai bruto sebelum fee. Platform fee dihitung di escrow_settlement_splits.';


-- -----------------------------------------------------------------------------
-- SECTION 2: order_items
-- Append-only — line items tidak dapat diubah setelah order dibuat
-- Owner: Order domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_items (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id),
    order_id    UUID        NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('catalog_item', 'service_listing')),
    entity_id   UUID        NOT NULL,   -- Ref cross-domain ke catalog_items atau service_listings
    quantity    INT         NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price  NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0),
    subtotal    NUMERIC(15,2) NOT NULL CHECK (subtotal >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE TRIGGER trg_order_items_append_only
    BEFORE UPDATE OR DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  order_items IS 'Line items per order. Append-only setelah order dibuat. Owner: Order domain.';


-- -----------------------------------------------------------------------------
-- SECTION 3: escrow_contracts
-- Status: payment_detected | locked | in_transit | delivered | disputed | released | refunded | cancelled
-- Owner : Escrow domain
-- AML   : aml_hold = true jika transaksi >= Rp 100.000.000
-- -----------------------------------------------------------------------------

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
    -- true jika transaksi >= Rp 100.000.000; menunggu review Security/Admin
    status                  VARCHAR(50) NOT NULL DEFAULT 'payment_detected'
                                CHECK (status IN (
                                    'payment_detected', 'locked', 'in_transit', 'delivered',
                                    'disputed', 'released', 'refunded', 'cancelled'
                                )),
    auto_release_at         TIMESTAMPTZ,
    -- Fisik: diset 7 hari setelah Delivered. Jasa: diset 72 jam setelah tranche Submitted.
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_escrow_contracts_order_id    ON escrow_contracts(order_id);
CREATE INDEX idx_escrow_contracts_buyer_id    ON escrow_contracts(buyer_id);
CREATE INDEX idx_escrow_contracts_seller_id   ON escrow_contracts(seller_id);
CREATE INDEX idx_escrow_contracts_status      ON escrow_contracts(status);
CREATE INDEX idx_escrow_contracts_aml_hold    ON escrow_contracts(aml_hold) WHERE aml_hold = true;

CREATE TRIGGER trg_escrow_contracts_updated_at
    BEFORE UPDATE ON escrow_contracts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  escrow_contracts IS 'Kontrak pengamanan dana per order. 1:1 dengan orders. No-Wallet Architecture. Owner: Escrow domain.';
COMMENT ON COLUMN escrow_contracts.aml_hold IS 'true jika gross_amount >= Rp 100.000.000. Dana dibekukan sampai Security/Admin selesai review AML.';
COMMENT ON COLUMN escrow_contracts.auto_release_at IS 'Timer otomatis: fisik = Delivered + 7 hari; jasa = per tranche Submitted + 72 jam.';
COMMENT ON COLUMN escrow_contracts.status IS 'State machine: payment_detected→locked→in_transit→delivered→released/refunded. Lihat escrow-lifecycle.md.';


-- -----------------------------------------------------------------------------
-- SECTION 4: escrow_milestone_tranches
-- Status: locked | released | refunded | disputed
-- Owner : Escrow domain (hanya Escrow Service yang boleh menulis)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS escrow_milestone_tranches (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    escrow_contract_id  UUID        NOT NULL REFERENCES escrow_contracts(id) ON DELETE RESTRICT,
    milestone_id        UUID        NOT NULL,   -- Ref cross-domain ke service_milestones(id)
    amount              NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    status              VARCHAR(30) NOT NULL DEFAULT 'locked'
                            CHECK (status IN ('locked', 'released', 'refunded', 'disputed')),
    submitted_at        TIMESTAMPTZ,    -- Waktu provider submit deliverable
    auto_release_at     TIMESTAMPTZ,   -- submitted_at + 72 jam (diset saat submitted)
    released_at         TIMESTAMPTZ,   -- Waktu aktual dana dicairkan
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (escrow_contract_id, milestone_id)
);

CREATE INDEX idx_escrow_tranches_contract_id  ON escrow_milestone_tranches(escrow_contract_id);
CREATE INDEX idx_escrow_tranches_status       ON escrow_milestone_tranches(status);

CREATE TRIGGER trg_escrow_milestone_tranches_updated_at
    BEFORE UPDATE ON escrow_milestone_tranches
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  escrow_milestone_tranches IS 'Dana per milestone jasa. Dikunci dan dicairkan oleh Escrow domain. Owner: Escrow domain.';
COMMENT ON COLUMN escrow_milestone_tranches.auto_release_at IS 'Diset = submitted_at + 72 jam. Jika klien tidak respons, dana auto-released.';


-- -----------------------------------------------------------------------------
-- SECTION 5: escrow_settlement_splits
-- Append-only — perhitungan split fee platform
-- Owner: Escrow domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS escrow_settlement_splits (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL,
    escrow_contract_id      UUID        NOT NULL REFERENCES escrow_contracts(id),
    tranche_id              UUID,       -- NULL untuk retail/wholesale; diisi untuk service
    gross_amount            NUMERIC(14,2) NOT NULL CHECK (gross_amount >= 0),
    platform_fee_percentage NUMERIC(5,4) NOT NULL CHECK (platform_fee_percentage >= 0),
    platform_fee_amount     NUMERIC(14,2) NOT NULL CHECK (platform_fee_amount >= 0),
    gateway_fee_amount      NUMERIC(14,2) NOT NULL DEFAULT 0,
    vendor_final_payout     NUMERIC(14,2) NOT NULL CHECK (vendor_final_payout >= 0),
    disbursement_reference  TEXT,       -- Referensi dari Payment Gateway
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_escrow_settlement_splits_contract_id ON escrow_settlement_splits(escrow_contract_id);

CREATE TRIGGER trg_escrow_settlement_splits_append_only
    BEFORE UPDATE OR DELETE ON escrow_settlement_splits
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  escrow_settlement_splits IS 'Rekaman perhitungan pembagian dana. Append-only. Formula: vendor_payout = gross - (gross×fee%) - gateway_fee. Owner: Escrow domain.';
COMMENT ON COLUMN escrow_settlement_splits.platform_fee_percentage IS 'Nilai dari governance_decisions. Default: retail=0.05 (5%), wholesale=0.035–0.015, service=0.05.';


-- -----------------------------------------------------------------------------
-- SECTION 6: escrow_events
-- Append-only — log kronologis perubahan status finansial
-- Owner: Escrow domain
-- -----------------------------------------------------------------------------

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
    actor_id            UUID,   -- NULL jika aksi otomatis sistem
    metadata            JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_escrow_events_contract_id ON escrow_events(escrow_contract_id);
CREATE INDEX idx_escrow_events_event_type  ON escrow_events(event_type);

CREATE TRIGGER trg_escrow_events_append_only
    BEFORE UPDATE OR DELETE ON escrow_events
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  escrow_events IS 'Log kronologis status finansial escrow. Append-only. Sumber bukti forensik finansial. Owner: Escrow domain.';
COMMENT ON COLUMN escrow_events.actor_id IS 'NULL untuk aksi otomatis (timer auto-release, AML engine). Diisi UUID user/admin untuk aksi manual.';


-- =============================================================================
-- END OF MIGRATION 005
-- Tabel yang dibuat:
--   orders, order_items, escrow_contracts, escrow_milestone_tranches,
--   escrow_settlement_splits, escrow_events
-- =============================================================================
