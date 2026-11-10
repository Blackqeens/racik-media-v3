-- Sample catalog content for local web testing.
-- Run after the Supabase schema migrations. Safe to run repeatedly.

ALTER TABLE catalog_items
    ADD COLUMN IF NOT EXISTS category VARCHAR(80) NOT NULL DEFAULT 'bibit',
    ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE service_listings
    ADD COLUMN IF NOT EXISTS category VARCHAR(80) NOT NULL DEFAULT 'konsultasi',
    ADD COLUMN IF NOT EXISTS location_area VARCHAR(255) NOT NULL DEFAULT 'Online',
    ADD COLUMN IF NOT EXISTS price_unit VARCHAR(80) NOT NULL DEFAULT 'proyek',
    ADD COLUMN IF NOT EXISTS cover_image TEXT,
    ADD COLUMN IF NOT EXISTS has_milestones BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS duration_estimate VARCHAR(120);

DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
    v_user_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    INSERT INTO tenants (id, name, slug, is_active)
    VALUES (v_tenant_id, 'Racik Media', 'racik-media', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO users (id, tenant_id, email, password_hash, status, kyc_tier)
    VALUES (
        v_user_id,
        v_tenant_id,
        'sample-data@racikmedia.invalid',
        '',
        'active',
        'tier_2'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO individual_profiles (
        id, tenant_id, user_id, full_name, display_name, bio, city, province
    )
    VALUES (
        '11111111-0000-0000-0000-000000000001',
        v_tenant_id,
        v_user_id,
        'Tim Racik Media',
        'Racik Media',
        'Profil contoh untuk pengujian artikel, produk, dan layanan.',
        'Bandung',
        'Jawa Barat'
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO content_items (
        id, tenant_id, author_id, content_type, title, body, status, created_at
    )
    VALUES
    (
        'b0000001-0000-0000-0000-000000000011',
        v_tenant_id,
        v_user_id,
        'article',
        'Panduan Memulai Kebun Cabai di Pekarangan',
        'Memulai kebun cabai dapat dilakukan di lahan terbatas menggunakan pot atau polybag. Pilih lokasi yang mendapat sinar matahari cukup, gunakan media tanam yang gembur dan memiliki drainase baik, lalu siram secara teratur tanpa membuat akar tergenang. Pindahkan bibit yang sehat setelah memiliki beberapa helai daun sejati dan amati tanaman secara berkala.',
        'published',
        now() - interval '3 days'
    ),
    (
        'b0000001-0000-0000-0000-000000000012',
        v_tenant_id,
        v_user_id,
        'article',
        'Mengenal Kompos dan Cara Menggunakannya',
        'Kompos membantu memperbaiki struktur tanah dan menambah bahan organik. Gunakan kompos yang sudah matang, berwarna gelap, dan berbau seperti tanah. Campurkan ke media tanam sebelum penanaman atau taburkan tipis di sekitar tanaman, kemudian siram secukupnya.',
        'published',
        now() - interval '2 days'
    ),
    (
        'b0000001-0000-0000-0000-000000000013',
        v_tenant_id,
        v_user_id,
        'article',
        'Penyiraman Efisien untuk Tanaman Sayuran',
        'Kebutuhan air sayuran dipengaruhi cuaca, jenis tanah, dan tahap pertumbuhan. Periksa kelembapan tanah sebelum menyiram. Penyiraman pada pagi hari membantu tanaman menyerap air sebelum suhu meningkat. Pastikan pot dan bedengan memiliki saluran pembuangan agar air tidak menggenang.',
        'published',
        now() - interval '1 day'
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        body = EXCLUDED.body,
        status = EXCLUDED.status,
        updated_at = now();

    INSERT INTO catalog_items (
        id, tenant_id, vendor_id, item_type, category, title, description,
        price_fixed, stock_quantity, images, status, created_at
    )
    VALUES
    (
        'a0000001-0000-0000-0000-000000000011',
        v_tenant_id,
        v_user_id,
        'retail',
        'bibit',
        'Benih Cabai Rawit Lokal (10 Gram)',
        'Benih cabai untuk kebun rumah dan budidaya skala kecil. Kemasan 10 gram, simpan di tempat kering dan sejuk.',
        25000,
        80,
        '{}',
        'active',
        now() - interval '3 days'
    ),
    (
        'a0000001-0000-0000-0000-000000000012',
        v_tenant_id,
        v_user_id,
        'retail',
        'pupuk',
        'Kompos Organik Matang (5 Kg)',
        'Kompos siap pakai untuk membantu memperbaiki struktur media tanam dan menambah bahan organik.',
        45000,
        35,
        '{}',
        'active',
        now() - interval '2 days'
    ),
    (
        'a0000001-0000-0000-0000-000000000013',
        v_tenant_id,
        v_user_id,
        'retail',
        'alat',
        'Sprayer Tangan Praktis 2 Liter',
        'Penyemprot manual untuk penyiraman dan perawatan tanaman di rumah. Dilengkapi nozzle yang dapat diatur.',
        68000,
        24,
        '{}',
        'active',
        now() - interval '1 day'
    )
    ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        price_fixed = EXCLUDED.price_fixed,
        stock_quantity = EXCLUDED.stock_quantity,
        images = EXCLUDED.images,
        status = EXCLUDED.status,
        updated_at = now();

    INSERT INTO service_listings (
        id, tenant_id, provider_id, title, description, delivery_method,
        base_price, category, location_area, price_unit, has_milestones,
        duration_estimate, status, created_at
    )
    VALUES
    (
        'c0000001-0000-0000-0000-000000000011',
        v_tenant_id,
        v_user_id,
        'Konsultasi Dasar Perawatan Tanaman',
        'Sesi konsultasi daring untuk membahas kondisi tanaman, jadwal penyiraman, media tanam, dan langkah perawatan berikutnya.',
        'remote',
        75000,
        'konsultasi',
        'Seluruh Indonesia (Online)',
        'sesi',
        true,
        '1 sesi, sekitar 60 menit',
        'active',
        now() - interval '3 days'
    ),
    (
        'c0000001-0000-0000-0000-000000000012',
        v_tenant_id,
        v_user_id,
        'Pemeriksaan Tanah dan Rekomendasi Pemupukan',
        'Pendampingan pemeriksaan kondisi tanah dan penyusunan rekomendasi pemupukan dasar untuk kebun sayur.',
        'remote',
        180000,
        'uji_lab',
        'Jawa Barat dan konsultasi online',
        'proyek',
        true,
        '3-5 hari kerja',
        'active',
        now() - interval '2 days'
    ),
    (
        'c0000001-0000-0000-0000-000000000013',
        v_tenant_id,
        v_user_id,
        'Pendampingan Kebun dan Pengendalian Hama Terpadu',
        'Kunjungan lapangan untuk mengidentifikasi kondisi tanaman dan memberikan panduan pengendalian hama terpadu.',
        'geolocated',
        300000,
        'pelatihan',
        'Bandung dan sekitarnya',
        'kunjungan',
        true,
        '1 kunjungan lapangan',
        'active',
        now() - interval '1 day'
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        base_price = EXCLUDED.base_price,
        category = EXCLUDED.category,
        location_area = EXCLUDED.location_area,
        price_unit = EXCLUDED.price_unit,
        has_milestones = EXCLUDED.has_milestones,
        duration_estimate = EXCLUDED.duration_estimate,
        status = EXCLUDED.status,
        updated_at = now();
END $$;
