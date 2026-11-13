-- =============================================================================
-- MIGRATION: 013_partner_member_mode_and_registration_gate.sql
-- Domain  : Identity & Partner Role Switching Gate
-- Purpose :
--   1. Menambahkan kolom user_role, is_admin, dan preferred_active_mode pada
--      individual_profiles agar selaras dengan middleware.ts, Sidebar.tsx, dan Navbar.tsx.
--   2. Mengaktifkan RLS + proteksi eskalasi privilege pada individual_profiles
--      dan partner_payout_requests.
--   3. Menjamin akun mitra (seller, distributor, service_provider) selalu tetap
--      memiliki role aktif 'member' untuk berbelanja dari mitra lain.
--   4. Menambahkan tabel partner_applications dan RPC verifikasi role mitra
--      sehingga member murni tidak bisa membuka dashboard mitra sebelum daftar.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Selaraskan kolom individual_profiles dengan query middleware / Navbar / Sidebar
-- -----------------------------------------------------------------------------
ALTER TABLE public.individual_profiles
  ADD COLUMN IF NOT EXISTS user_role VARCHAR(30) NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_active_mode VARCHAR(30) NOT NULL DEFAULT 'member';

ALTER TABLE public.individual_profiles
  DROP CONSTRAINT IF EXISTS individual_profiles_user_role_check;
ALTER TABLE public.individual_profiles
  ADD CONSTRAINT individual_profiles_user_role_check
  CHECK (user_role IN (
    'member', 'seller', 'distributor', 'service_provider',
    'moderator', 'admin', 'master_admin'
  ));

ALTER TABLE public.individual_profiles
  DROP CONSTRAINT IF EXISTS individual_profiles_preferred_active_mode_check;
ALTER TABLE public.individual_profiles
  ADD CONSTRAINT individual_profiles_preferred_active_mode_check
  CHECK (preferred_active_mode IN (
    'member', 'seller', 'distributor', 'service_provider',
    'moderator', 'admin', 'master_admin'
  ));

-- Backfill profil individual untuk user yang sudah terdaftar agar query profil tidak kosong
INSERT INTO public.individual_profiles (tenant_id, user_id, full_name, display_name, user_role, is_admin)
SELECT
  u.tenant_id,
  u.id,
  COALESCE(NULLIF(split_part(u.email, '@', 1), ''), 'Member Racik'),
  COALESCE(NULLIF(split_part(u.email, '@', 1), ''), 'Member Racik'),
  'member',
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role_type = 'master_admin'
      AND ur.status = 'active'
  )
FROM public.users u
ON CONFLICT (user_id) DO NOTHING;

-- RLS policies pada individual_profiles
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own individual profile" ON public.individual_profiles;
CREATE POLICY "Users can read their own individual profile"
  ON public.individual_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own individual profile" ON public.individual_profiles;
CREATE POLICY "Users can insert their own individual profile"
  ON public.individual_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND user_role = 'member' AND is_admin = false AND preferred_active_mode = 'member');

DROP POLICY IF EXISTS "Users can update their own individual profile" ON public.individual_profiles;
CREATE POLICY "Users can update their own individual profile"
  ON public.individual_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cegah eskalasi privilege user_role / is_admin & batasi preferred_active_mode hanya ke role yang dimiliki
CREATE OR REPLACE FUNCTION public.trigger_protect_individual_profile_privilege()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role TEXT := COALESCE(current_setting('request.jwt.claim.role', true), '');
  owns_target_mode BOOLEAN := false;
BEGIN
  IF jwt_role = 'authenticated' THEN
    NEW.user_role := COALESCE(OLD.user_role, 'member');
    NEW.is_admin := COALESCE(OLD.is_admin, false);

    IF NEW.preferred_active_mode IS DISTINCT FROM OLD.preferred_active_mode THEN
      IF NEW.preferred_active_mode = 'member' THEN
        owns_target_mode := true;
      ELSE
        SELECT EXISTS (
          SELECT 1
          FROM public.user_roles ur
          WHERE ur.user_id = NEW.user_id
            AND ur.status = 'active'
            AND (
              ur.role_type = NEW.preferred_active_mode
              OR ur.role_type = 'master_admin'
            )
        ) INTO owns_target_mode;
      END IF;

      IF NOT owns_target_mode THEN
        RAISE EXCEPTION 'Mode dashboard % ditolak: akun belum terdaftar dan aktif sebagai role tersebut.', NEW.preferred_active_mode;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_individual_profile_privilege ON public.individual_profiles;
CREATE TRIGGER trg_protect_individual_profile_privilege
  BEFORE UPDATE ON public.individual_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_protect_individual_profile_privilege();

-- -----------------------------------------------------------------------------
-- 2. Jaminan mitra (seller/distributor/service_provider) selalu punya role 'member'
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.trigger_ensure_partner_keeps_member_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role_type IN ('seller', 'distributor', 'service_provider') AND NEW.status = 'active' THEN
    INSERT INTO public.user_roles (tenant_id, user_id, role_type, status)
    VALUES (NEW.tenant_id, NEW.user_id, 'member', 'active')
    ON CONFLICT (user_id, role_type)
    DO UPDATE SET status = 'active', updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_roles_partner_keeps_member ON public.user_roles;
CREATE TRIGGER trg_user_roles_partner_keeps_member
  AFTER INSERT OR UPDATE OF role_type, status ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_ensure_partner_keeps_member_role();

-- Backfill role 'member' aktif untuk seluruh mitra yang sudah aktif
INSERT INTO public.user_roles (tenant_id, user_id, role_type, status)
SELECT ur.tenant_id, ur.user_id, 'member', 'active'
FROM public.user_roles ur
WHERE ur.role_type IN ('seller', 'distributor', 'service_provider')
  AND ur.status = 'active'
ON CONFLICT (user_id, role_type)
DO UPDATE SET status = 'active', updated_at = now();

-- -----------------------------------------------------------------------------
-- 3. Tabel pengajuan registrasi mitra (gerbang sebelum member masuk dashboard mitra)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partner_applications (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES public.tenants(id),
  user_id         UUID          NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  target_role     VARCHAR(30)   NOT NULL CHECK (target_role IN ('seller', 'distributor', 'service_provider')),
  applicant_name  VARCHAR(255)  NOT NULL,
  business_name   VARCHAR(255)  NOT NULL,
  business_type   VARCHAR(50)   NOT NULL DEFAULT 'perorangan',
  commodity_focus VARCHAR(255),
  phone           VARCHAR(40),
  address         TEXT,
  city            VARCHAR(120),
  province        VARCHAR(120),
  notes           TEXT,
  status          VARCHAR(30)   NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by     UUID          REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_applications_user_role
  ON public.partner_applications(user_id, target_role, status);

DROP TRIGGER IF EXISTS trg_partner_applications_updated_at ON public.partner_applications;
CREATE TRIGGER trg_partner_applications_updated_at
  BEFORE UPDATE ON public.partner_applications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own partner applications" ON public.partner_applications;
CREATE POLICY "Members can view own partner applications"
  ON public.partner_applications
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_type IN ('admin', 'master_admin')
        AND ur.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Members can submit own partner applications" ON public.partner_applications;
CREATE POLICY "Members can submit own partner applications"
  ON public.partner_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Admins can review partner applications" ON public.partner_applications;
CREATE POLICY "Admins can review partner applications"
  ON public.partner_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_type IN ('admin', 'master_admin')
        AND ur.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_type IN ('admin', 'master_admin')
        AND ur.status = 'active'
    )
  );

-- -----------------------------------------------------------------------------
-- 4. RLS pada partner_payout_requests (dari migrasi 012)
-- -----------------------------------------------------------------------------
ALTER TABLE public.partner_payout_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners can view own payout requests" ON public.partner_payout_requests;
CREATE POLICY "Partners can view own payout requests"
  ON public.partner_payout_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = partner_id);

DROP POLICY IF EXISTS "Partners can create own payout requests" ON public.partner_payout_requests;
CREATE POLICY "Partners can create own payout requests"
  ON public.partner_payout_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = partner_id
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role_type = partner_role
        AND ur.status = 'active'
    )
  );

-- -----------------------------------------------------------------------------
-- 5. RPC Helper untuk verifikasi role aktif & gerbang dashboard mitra
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_verified_roles()
RETURNS TABLE(role_type VARCHAR, status VARCHAR)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role_type, ur.status
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.can_access_partner_dashboard(p_role VARCHAR)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.status = 'active'
      AND (
        ur.role_type = p_role
        OR ur.role_type = 'master_admin'
      )
  );
$$;

REVOKE ALL ON FUNCTION public.get_my_verified_roles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_verified_roles() TO authenticated;

REVOKE ALL ON FUNCTION public.can_access_partner_dashboard(VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_partner_dashboard(VARCHAR) TO authenticated;

-- -----------------------------------------------------------------------------
-- 6. Pastikan handle_new_auth_user juga menyiapkan profil individual default
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.users (id, tenant_id, email, password_hash, status, kyc_tier, mfa_enabled)
    VALUES (
        NEW.id,
        '00000000-0000-0000-0000-000000000001',
        NEW.email,
        '',
        'active',
        'tier_1',
        false
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (tenant_id, user_id, role_type, status)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        NEW.id,
        'member',
        'active'
    )
    ON CONFLICT (user_id, role_type) DO NOTHING;

    INSERT INTO public.individual_profiles (tenant_id, user_id, full_name, display_name, user_role, is_admin, preferred_active_mode)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1), 'Member Racik'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1), 'Member Racik'),
        'member',
        false,
        'member'
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.core_reputations (tenant_id, user_id, master_score)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        NEW.id,
        100.00
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$function$;

