-- =============================================================================
-- MIGRATION: 009_logistics_schema.sql
-- Domain  : Logistics
-- Phase   : 2 (Commerce — aktif saat Order & Escrow sudah jalan)
-- Ref docs: data-models.md §12, logistics-provenance.md, master-erd.md
-- Depends : 005_order_escrow_schema.sql (orders)
-- =============================================================================
-- CATATAN:
--   - Logistics TIDAK menentukan status kontrak, refund, payout, atau sanksi
--   - Logistics hanya menerbitkan event fulfillment (manifested, in_transit, delivered, dll)
--   - Escrow mengonsumsi event Logistics dan mengelola timer auto-release
--   - Detail sensitif (nomor resi, nama penerima, alamat) disimpan terenkripsi
--     di domain Logistics (bukan di tabel generik ini) dan diacuh via tracking_record_id
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: logistics_change_logs
-- Append-only — chain of custody yang tidak dapat diubah
-- Owner: Logistics domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS logistics_change_logs (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL,
    correlation_id      UUID        NOT NULL,   -- UUID pengikat event lintas domain
    order_id            UUID        NOT NULL REFERENCES orders(id),
    tracking_record_id  UUID        NOT NULL,
    -- Referensi ke rekaman tracking detail yang disimpan terenkripsi
    -- di domain Logistics (tabel internal, bukan schema publik ini)
    current_status      VARCHAR(30) NOT NULL
                            CHECK (current_status IN (
                                'manifested', 'in_transit', 'delivered',
                                'carrier_exception', 'tracking_invalid'
                            )),
    event_reference     TEXT,
    -- Referensi event id dari event-map.md (logistics.manifested, dll) untuk tracing
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_logistics_change_logs_order_id        ON logistics_change_logs(order_id);
CREATE INDEX idx_logistics_change_logs_correlation_id  ON logistics_change_logs(correlation_id);
CREATE INDEX idx_logistics_change_logs_current_status  ON logistics_change_logs(current_status);

-- Chain of custody bersifat append-only
CREATE TRIGGER trg_logistics_change_logs_append_only
    BEFORE UPDATE OR DELETE ON logistics_change_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  logistics_change_logs IS 'Chain-of-custody pengiriman fisik. Append-only. Bukti forensik logistik. Owner: Logistics domain.';
COMMENT ON COLUMN logistics_change_logs.tracking_record_id IS 'UUID referensi ke rekaman tracking detail terenkripsi di storage private Logistics. JANGAN simpan nomor resi, nama, alamat langsung di sini.';
COMMENT ON COLUMN logistics_change_logs.current_status IS 'manifested=resi dibuat, in_transit=diserahkan kurir, delivered=diterima, carrier_exception=masalah kurir, tracking_invalid=resi palsu terverifikasi.';
COMMENT ON COLUMN logistics_change_logs.correlation_id IS 'UUID yang mengikat event Logistics dengan event Order/Escrow untuk forensik lintas domain.';


-- =============================================================================
-- END OF MIGRATION 009
-- Tabel yang dibuat:
--   logistics_change_logs
-- =============================================================================
