-- =============================================================================
-- MIGRATION: 012_partner_escrow_payout_bridge.sql
-- Domain  : Partner Escrow Orders & Finance Bridge (Seller, Distributor, Jasa)
-- Purpose : Menambahkan kolom status_pembayaran dan detail logistik pengiriman
--           pada tabel orders serta catatan permintaan pencairan rekening bank
--           agar terintegrasi mulus dengan UI "Pesanan Toko" & "Keuangan / Saldo".
-- =============================================================================

-- 1. Tambah kolom jembatan status_pembayaran & pelacakan pada orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS target_partner_role VARCHAR(30) DEFAULT 'seller'
    CHECK (target_partner_role IN ('seller', 'distributor', 'service_provider')),
  ADD COLUMN IF NOT EXISTS status_pembayaran VARCHAR(30) NOT NULL DEFAULT 'pending_escrow'
    CHECK (status_pembayaran IN ('unpaid', 'pending_escrow', 'released_to_seller', 'withdrawn')),
  ADD COLUMN IF NOT EXISTS courier_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(120),
  ADD COLUMN IF NOT EXISTS pickup_contact VARCHAR(60),
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS auto_release_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_status_pembayaran ON orders(status_pembayaran);
CREATE INDEX IF NOT EXISTS idx_orders_partner_role ON orders(target_partner_role);

-- 2. Tabel pencairan dana mitra ke rekening bank (withdrawn ledger)
CREATE TABLE IF NOT EXISTS partner_payout_requests (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES tenants(id),
  partner_id      UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  partner_role    VARCHAR(30)   NOT NULL CHECK (partner_role IN ('seller', 'distributor', 'service_provider')),
  gross_amount    NUMERIC(15,2) NOT NULL CHECK (gross_amount > 0),
  platform_fee    NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
  net_amount      NUMERIC(15,2) NOT NULL CHECK (net_amount > 0),
  bank_name       VARCHAR(100)  NOT NULL,
  account_number  VARCHAR(60)   NOT NULL,
  account_holder  VARCHAR(150)  NOT NULL,
  status          VARCHAR(30)   NOT NULL DEFAULT 'processing'
                    CHECK (status IN ('processing', 'completed', 'failed')),
  notes           TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner ON partner_payout_requests(partner_id, partner_role);

DROP TRIGGER IF EXISTS trg_partner_payout_requests_updated_at ON partner_payout_requests;
CREATE TRIGGER trg_partner_payout_requests_updated_at
  BEFORE UPDATE ON partner_payout_requests
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- 3. Trigger otomatis: sinkronkan status_pembayaran & timer H+2 saat kurir delivered / pembeli konfirmasi
CREATE OR REPLACE FUNCTION trigger_sync_order_escrow_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    IF NEW.status_pembayaran <> 'withdrawn' THEN
      NEW.status_pembayaran := 'released_to_seller';
    END IF;
    IF NEW.delivered_at IS NULL THEN
      NEW.delivered_at := now();
    END IF;
  ELSIF NEW.status IN ('paid', 'in_fulfillment') AND NEW.status_pembayaran = 'unpaid' THEN
    NEW.status_pembayaran := 'pending_escrow';
  END IF;

  -- Timer auto-release H+2 (48 jam) setelah delivered_at diisi
  IF NEW.delivered_at IS NOT NULL AND NEW.auto_release_at IS NULL THEN
    NEW.auto_release_at := NEW.delivered_at + interval '2 days';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_sync_escrow_status ON orders;
CREATE TRIGGER trg_orders_sync_escrow_status
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_sync_order_escrow_status();

-- 4. View ringkasan saldo tertahan & saldo siap dicairkan (potongan platform 5%) per mitra
CREATE OR REPLACE VIEW v_partner_escrow_summary AS
SELECT
  o.seller_id AS partner_id,
  o.target_partner_role AS partner_role,
  COALESCE(SUM(CASE WHEN o.status IN ('paid', 'in_fulfillment') AND o.status_pembayaran = 'pending_escrow' THEN o.gross_amount ELSE 0 END), 0) AS saldo_tertahan,
  COALESCE(SUM(CASE WHEN o.status = 'completed' THEN ROUND(o.gross_amount * 0.95, 2) ELSE 0 END), 0) AS total_bersih_selesai,
  COALESCE((
    SELECT SUM(p.net_amount)
    FROM partner_payout_requests p
    WHERE p.partner_id = o.seller_id
      AND p.partner_role = o.target_partner_role
      AND p.status IN ('processing', 'completed')
  ), 0) AS total_ditarik,
  GREATEST(
    0,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN ROUND(o.gross_amount * 0.95, 2) ELSE 0 END), 0)
    - COALESCE((
      SELECT SUM(p.net_amount)
      FROM partner_payout_requests p
      WHERE p.partner_id = o.seller_id
        AND p.partner_role = o.target_partner_role
        AND p.status IN ('processing', 'completed')
    ), 0)
  ) AS saldo_siap_dicairkan
FROM orders o
GROUP BY o.seller_id, o.target_partner_role;

