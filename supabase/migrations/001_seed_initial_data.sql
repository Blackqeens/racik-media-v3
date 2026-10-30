-- =============================================================================
-- SEED DATA AWAL - RACIK MEDIA V3 (PRESISI DENGAN SCHEMA 000)
-- =============================================================================
-- Cara Pakai:
-- 1. Buka Supabase Dashboard -> SQL Editor
-- 2. Paste seluruh script ini -> Klik Run
-- =============================================================================

DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_user_id   UUID;
BEGIN
    -- 1. Tenant Utama (kolom: id, name, slug, is_active)
    INSERT INTO tenants (id, name, slug, is_active, created_at, updated_at)
    VALUES (
        v_tenant_id,
        'Racik Media',
        'racik-media',
        true,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        is_active = true;

    -- 2. Ambil user yang ada, atau buat user seed default
    SELECT id INTO v_user_id FROM users LIMIT 1;

    IF v_user_id IS NULL THEN
        v_user_id := '11111111-1111-1111-1111-111111111111';
        INSERT INTO users (id, tenant_id, email, password_hash, status, kyc_tier, mfa_enabled, created_at, updated_at)
        VALUES (
            v_user_id,
            v_tenant_id,
            'admin@racikmedia.com',
            '',
            'active',
            'tier_1',
            false,
            now(),
            now()
        )
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO individual_profiles (id, tenant_id, user_id, full_name, display_name, bio, city, province, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            v_user_id,
            'Admin Racik Media',
            'Racik Official',
            'Tim Kurator & Agronomis Racik Media',
            'Bandung',
            'Jawa Barat',
            now(),
            now()
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- 3. Seed Produk Katalog (catalog_items)
    -- kolom: id, tenant_id, vendor_id, item_type, title, description, price_fixed, stock_quantity, status
    INSERT INTO catalog_items (
        id, tenant_id, vendor_id, item_type, title, description, price_fixed, stock_quantity, status, created_at, updated_at
    )
    VALUES 
    (
        'a0000001-0000-0000-0000-000000000001',
        v_tenant_id,
        v_user_id,
        'retail',
        'Bibit Cabai Rawit Unggul Varietas Bhaskara (10 Gram)',
        'Benih cabai rawit hibrida tahan layu bakteri dan virus antraknosa. Produktivitas tinggi cocok untuk dataran rendah hingga tinggi.',
        45000,
        150,
        'active',
        now(),
        now()
    ),
    (
        'a0000001-0000-0000-0000-000000000002',
        v_tenant_id,
        v_user_id,
        'retail',
        'Pupuk Organik Cair (POC) Hayati Multisimbion 1 Liter',
        'Konsorsium mikroba pengurai Trichoderma, Pseudomonas, dan Bacillus. Mempercepat serapan nutrisi tanaman dan memperkuat akar.',
        85000,
        75,
        'active',
        now(),
        now()
    ),
    (
        'a0000001-0000-0000-0000-000000000003',
        v_tenant_id,
        v_user_id,
        'retail',
        'Kalsium Boron Super Soluble 1 Kg (Anti Rontok Bunga & Buah)',
        'Pupuk mikro kalsium 100% larut air plus Boron untuk mencegah busuk ujung buah (blossom end rot) dan kerontokan bunga pada masa generatif.',
        38000,
        200,
        'active',
        now(),
        now()
    ),
    (
        'a0000001-0000-0000-0000-000000000004',
        v_tenant_id,
        v_user_id,
        'retail',
        'Soil pH & Moisture Meter 3-in-1 (Alat Uji Tanah Digital)',
        'Alat pengukur derajat keasaman tanah (pH 3.5 - 8.0), kelembaban, dan intensitas cahaya matahari tanpa baterai.',
        125000,
        40,
        'active',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        price_fixed = EXCLUDED.price_fixed,
        status = 'active';

    -- 4. Seed Konten & Edukasi (content_items)
    -- kolom: id, tenant_id, author_id, content_type, title, body, status
    INSERT INTO content_items (
        id, tenant_id, author_id, content_type, title, body, status, created_at, updated_at
    )
    VALUES 
    (
        'b0000001-0000-0000-0000-000000000001',
        v_tenant_id,
        v_user_id,
        'article',
        'Panduan Lengkap Manajemen Unsur Hara NPK Pada Fase Vegetatif Cabai',
        'Fase vegetatif membutuhkan rasio N yang cukup namun harus diimbangi dengan Fosfat untuk perkembangan perakaran awal. Ketidakseimbangan pemupukan seringkali menjadi penyebab utama tanaman cabai mudah terserang busuk batang dan layu bakteri saat curah hujan tinggi.',
        'published',
        now() - interval '2 days',
        now()
    ),
    (
        'b0000001-0000-0000-0000-000000000002',
        v_tenant_id,
        v_user_id,
        'article',
        'Mengatasi Masalah Asam-Asaman Tanah Sawah dengan Aplikasi Dolomit dan Humat',
        'Kondisi tanah yang masam menyebabkan unsur Fosfat terikat oleh Aluminium dan Besi sehingga tidak dapat diserap oleh tanaman. Langkah pertama adalah netralisasi menggunakan kalsit/dolomit bersama asam humat murni.',
        'published',
        now() - interval '5 days',
        now()
    ),
    (
        'b0000001-0000-0000-0000-000000000003',
        v_tenant_id,
        v_user_id,
        'event',
        'Webinar Nasional: Teknologi Drone & Smart Farming untuk Agribisnis 2026',
        'Agenda webinar daring interaktif membahas implementasi drone spray dan pemetaan hara tanah secara real-time bersama pakar presisi agrikultur Racik Media.',
        'published',
        now() - interval '1 day',
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        status = 'published';

    -- 5. Seed Layanan Keahlian & Jasa (service_listings)
    -- kolom: id, tenant_id, provider_id, title, description, delivery_method, base_price, status
    -- delivery_method CHECK ('remote', 'geolocated')
    INSERT INTO service_listings (
        id, tenant_id, provider_id, title, description, delivery_method, base_price, status, created_at, updated_at
    )
    VALUES 
    (
        'c0000001-0000-0000-0000-000000000001',
        v_tenant_id,
        v_user_id,
        'Konsultasi Formulasi Pupuk Custom Berdasarkan Uji Tanah',
        'Pendampingan penyusunan racikan hara makro & mikro spesifik per hektar lahan untuk efisiensi biaya saprotan.',
        'remote',
        350000,
        'active',
        now(),
        now()
    ),
    (
        'c0000001-0000-0000-0000-000000000002',
        v_tenant_id,
        v_user_id,
        'Jasa Pemetaan Lahan & Spraying Drone Pertanian (Per Hektar)',
        'Penyemprotan pestisida/nutrisi daun menggunakan drone kapasitas 20 liter dengan akurasi semprot tinggi.',
        'geolocated',
        180000,
        'active',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        status = 'active';

END $$;
