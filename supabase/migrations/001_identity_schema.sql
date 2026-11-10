-- =============================================================================
-- MIGRATION: 001_identity_schema.sql
-- Domain  : Identity
-- Phase   : 1 (Foundation)
-- Ref docs: data-models.md §1, user-lifecycle.md, permission-matrix.md
-- Depends : (none — first migration)
-- =============================================================================
-- CATATAN UNTUK DEV:
--   1. Jalankan di Supabase SQL Editor atau via CLI: supabase db push
--   2. Selama Phase 1-4, sistem single-tenant. Buat SATU baris di tabel tenants
--      lalu gunakan UUID-nya sebagai DEFAULT di aplikasi.
--   3. Trigger append_only_block mencegah UPDATE/DELETE pada tabel log.
--   4. Trigger set_updated_at mengisi updated_at otomatis tanpa perlu diset manual.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 0: TENANT TABLE (Fondasi multi-tenancy Phase 5)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'racik-media'
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE tenants IS
    'Single-tenant selama Phase 1-4. Kolom tenant_id sudah dipasang di semua '
    'tabel agar siap migrasi ke multi-tenant pada Phase 5.';

-- Seed: satu tenant aktif untuk Phase 1-4
INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Racik Media', 'racik-media')
ON CONFLICT DO NOTHING;


-- -----------------------------------------------------------------------------
-- SECTION 1: HELPER — trigger fungsi updated_at otomatis
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_set_updated_at IS
    'Digunakan oleh semua tabel mutable agar kolom updated_at selalu akurat.';


-- -----------------------------------------------------------------------------
-- SECTION 2: HELPER — trigger blokir UPDATE/DELETE pada tabel append-only
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION trigger_append_only_block()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION
        'Tabel % bersifat append-only. UPDATE dan DELETE dilarang. '
        'Gunakan event kompensasi baru untuk pembetulan. (ADR-001 D9)',
        TG_TABLE_NAME;
    RETURN NULL;
END;
$$;

COMMENT ON FUNCTION trigger_append_only_block IS
    'Digunakan oleh semua tabel audit log dan change log agar baris tidak '
    'bisa diubah atau dihapus (ADR-001 D9, audit-strategy.md).';


-- -----------------------------------------------------------------------------
-- SECTION 3: users
-- Status: active | under_review | restricted | suspended | permanently_revoked
-- Owner : Identity domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'active'
                        CHECK (status IN (
                            'active', 'under_review', 'restricted',
                            'suspended', 'permanently_revoked'
                        )),
    kyc_tier        VARCHAR(20) NOT NULL DEFAULT 'tier_1'
                        CHECK (kyc_tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4')),
    mfa_enabled     BOOLEAN     NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email     ON users(email);
CREATE INDEX idx_users_status    ON users(status);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  users IS 'Master identity anchor. Single Account Policy enforced via UNIQUE(email). Owner: Identity domain.';
COMMENT ON COLUMN users.status    IS 'Lifecycle status: active | under_review | restricted | suspended | permanently_revoked';
COMMENT ON COLUMN users.kyc_tier  IS 'tier_1=member, tier_2=seller/provider, tier_3=distributor, tier_4=enterprise';
COMMENT ON COLUMN users.mfa_enabled IS 'Wajib true untuk role: seller, distributor, service_provider, moderator, admin, master_admin';


-- -----------------------------------------------------------------------------
-- SECTION 4: user_roles
-- Status: active | under_review | suspended
-- Owner : Identity domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    role_type   VARCHAR(50) NOT NULL
                    CHECK (role_type IN (
                        'member', 'seller', 'distributor', 'service_provider',
                        'moderator', 'admin', 'master_admin'
                    )),
    status      VARCHAR(50) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'under_review', 'suspended')),
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role_type)   -- Satu akun hanya boleh punya satu role_type
);

CREATE INDEX idx_user_roles_user_id    ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_type  ON user_roles(role_type);
CREATE INDEX idx_user_roles_status     ON user_roles(status);

CREATE TRIGGER trg_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  user_roles IS 'Additive role expansion per identity. Admin/Moderator dilarang memegang role komersial. Owner: Identity domain.';
COMMENT ON COLUMN user_roles.role_type IS 'member | seller | distributor | service_provider | moderator | admin | master_admin';


-- -----------------------------------------------------------------------------
-- SECTION 5: individual_profiles
-- Owner: Identity domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS individual_profiles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    full_name       VARCHAR(255) NOT NULL,
    display_name    VARCHAR(100),
    bio             TEXT,
    avatar_url      TEXT,
    phone_number    VARCHAR(20),
    province        VARCHAR(100),
    city            VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_individual_profiles_user_id ON individual_profiles(user_id);

CREATE TRIGGER trg_individual_profiles_updated_at
    BEFORE UPDATE ON individual_profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE individual_profiles IS 'Profil personal akun perorangan. Owner: Identity domain.';


-- -----------------------------------------------------------------------------
-- SECTION 6: organization_profiles
-- Owner: Identity domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organization_profiles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES tenants(id),
    user_id         UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    legal_name      VARCHAR(255) NOT NULL,
    brand_name      VARCHAR(255),
    entity_type     VARCHAR(50) NOT NULL
                        CHECK (entity_type IN ('pt', 'cv', 'koperasi', 'yayasan', 'other')),
    nib             VARCHAR(50),
    npwp            VARCHAR(30),
    legal_address   TEXT,
    logo_url        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organization_profiles_user_id ON organization_profiles(user_id);

CREATE TRIGGER trg_organization_profiles_updated_at
    BEFORE UPDATE ON organization_profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE organization_profiles IS 'Profil entitas badan hukum (PT/CV/Koperasi/Yayasan). Owner: Identity domain.';


-- -----------------------------------------------------------------------------
-- SECTION 7: organization_representatives
-- Owner: Identity domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organization_representatives (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID        NOT NULL REFERENCES tenants(id),
    organization_profile_id UUID        NOT NULL REFERENCES organization_profiles(id) ON DELETE RESTRICT,
    user_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    role_in_org             VARCHAR(100) NOT NULL
                                CHECK (role_in_org IN ('director', 'commissioner', 'authorized_agent')),
    is_primary              BOOLEAN     NOT NULL DEFAULT false,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_org_representatives_org_id  ON organization_representatives(organization_profile_id);
CREATE INDEX idx_org_representatives_user_id ON organization_representatives(user_id);

CREATE TRIGGER trg_org_representatives_updated_at
    BEFORE UPDATE ON organization_representatives
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE organization_representatives IS 'Penanggung jawab manusia akuntabel untuk badan hukum. Wajib ada min. 1 untuk KYB. Owner: Identity domain.';


-- -----------------------------------------------------------------------------
-- SECTION 8: verifications
-- Status: pending | under_review | approved | rejected | expired
-- Owner : Identity domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS verifications (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    verification_type   VARCHAR(30) NOT NULL
                            CHECK (verification_type IN ('kyc', 'kyb')),
    status              VARCHAR(30) NOT NULL DEFAULT 'pending'
                            CHECK (status IN (
                                'pending', 'under_review', 'approved', 'rejected', 'expired'
                            )),
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at         TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_status  ON verifications(status);
CREATE INDEX idx_verifications_type    ON verifications(verification_type);

CREATE TRIGGER trg_verifications_updated_at
    BEFORE UPDATE ON verifications
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

COMMENT ON TABLE  verifications IS 'Gerbang validasi KYC (personal) dan KYB (badan usaha). Moderator merekomendasikan, Admin mengesahkan. Owner: Identity domain.';
COMMENT ON COLUMN verifications.verification_type IS 'kyc = individu (Seller/Author/ServiceProvider), kyb = badan usaha (Distributor/Vendor)';


-- -----------------------------------------------------------------------------
-- SECTION 9: verification_documents
-- Append-only — UPDATE/DELETE diblokir
-- Owner: Identity domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS verification_documents (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    verification_id     UUID        NOT NULL REFERENCES verifications(id) ON DELETE RESTRICT,
    document_type       VARCHAR(50) NOT NULL
                            CHECK (document_type IN (
                                'ktp', 'selfie_with_ktp', 'npwp', 'nib',
                                'siup', 'deed_of_establishment', 'other'
                            )),
    storage_path        TEXT        NOT NULL,  -- Encrypted path: storage/kyc/ atau storage/kyb/
    file_hash           TEXT        NOT NULL,  -- SHA-256 hash untuk deteksi tampering
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_docs_verification_id ON verification_documents(verification_id);

-- Blokir UPDATE/DELETE — dokumen KYC/KYB tidak boleh diubah setelah diunggah
CREATE TRIGGER trg_verification_documents_append_only
    BEFORE UPDATE OR DELETE ON verification_documents
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  verification_documents IS 'Dokumen legal KYC/KYB. Append-only setelah upload. Path terenkripsi di storage private. Owner: Identity domain.';
COMMENT ON COLUMN verification_documents.storage_path IS 'Path di Supabase Storage bucket kyc/ atau kyb/. JANGAN simpan plaintext NIK/data sensitif di sini.';
COMMENT ON COLUMN verification_documents.file_hash    IS 'SHA-256 dari file original untuk validasi integritas dokumen.';


-- -----------------------------------------------------------------------------
-- SECTION 10: verification_reviews
-- Append-only — catatan review moderator tidak dapat diubah
-- Owner: Identity domain
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS verification_reviews (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL REFERENCES tenants(id),
    verification_id     UUID        NOT NULL REFERENCES verifications(id) ON DELETE RESTRICT,
    reviewer_id         UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    recommendation      VARCHAR(30) NOT NULL
                            CHECK (recommendation IN ('approve', 'reject', 'request_revision')),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_reviews_verification_id ON verification_reviews(verification_id);
CREATE INDEX idx_verification_reviews_reviewer_id     ON verification_reviews(reviewer_id);

-- Review moderator bersifat append-only — tidak bisa diedit setelah diserahkan
CREATE TRIGGER trg_verification_reviews_append_only
    BEFORE UPDATE OR DELETE ON verification_reviews
    FOR EACH ROW EXECUTE FUNCTION trigger_append_only_block();

COMMENT ON TABLE  verification_reviews IS 'Catatan review KYC/KYB oleh Moderator. Append-only. Admin membuat keputusan final. Owner: Identity domain.';
COMMENT ON COLUMN verification_reviews.recommendation IS 'approve = rekomendasi ke Admin, reject = tolak, request_revision = minta perbaikan dokumen';


-- =============================================================================
-- END OF MIGRATION 001
-- Tabel yang dibuat:
--   tenants, users, user_roles, individual_profiles,
--   organization_profiles, organization_representatives,
--   verifications, verification_documents, verification_reviews
-- Helper functions:
--   trigger_set_updated_at(), trigger_append_only_block()
-- =============================================================================
