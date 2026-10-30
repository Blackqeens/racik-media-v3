# Racik Media V3

Platform hibrida enterprise-grade: **Knowledge + Community + Commerce + Services**

Stack: **NestJS** (backend) · **Next.js** (frontend) · **Supabase PostgreSQL** · **Redis** · **RabbitMQ** · **Meilisearch**

---

## Prasyarat

Pastikan sudah terinstall di komputer kamu:

| Tool | Versi minimal | Cek |
|------|--------------|-----|
| Node.js | 20 LTS | `node -v` |
| pnpm | 9+ | `pnpm -v` |
| Docker Desktop | 4+ | `docker -v` |
| Git | 2.40+ | `git -v` |

---

## Cara Menjalankan (Local Dev)

### 1. Clone dan install dependencies

```bash
git clone https://github.com/racik-media/v3.git
cd v3

# Install semua dependencies (api + web sekaligus)
pnpm install
```

### 2. Setup environment variables

```bash
# Copy template ke file .env aktif
cp .env.example .env
```

Buka file `.env` dan isi semua nilai yang bertanda `[WAJIB DIISI]`:
- `POSTGRES_PASSWORD` — password database lokal
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — dari [Supabase Dashboard](https://app.supabase.com)
- `SUPABASE_JWT_SECRET` — dari Supabase Dashboard → Settings → API → JWT Secret
- `JWT_SECRET` — string random minimal 64 karakter
- `REDIS_PASSWORD` — password Redis lokal
- `RABBITMQ_PASSWORD` — password RabbitMQ lokal

### 3. Jalankan layanan infrastruktur (Docker)

```bash
# Jalankan PostgreSQL, Redis, RabbitMQ, Meilisearch
docker compose up -d

# Cek semua container berjalan
docker compose ps
```

Layanan yang berjalan setelah ini:
| Layanan | URL | Keterangan |
|---------|-----|-----------|
| PostgreSQL | `localhost:5432` | Database utama |
| Redis | `localhost:6379` | Cache + session |
| RabbitMQ | `localhost:5672` | Event bus |
| RabbitMQ UI | `http://localhost:15672` | Monitor antrian event |
| Meilisearch | `http://localhost:7700` | Search engine |

### 4. Jalankan migrasi database

> Jalankan migrations **secara berurutan**. Phase 1 dulu, baru Phase 2.

```bash
# Phase 1 — Wajib dijalankan pertama (urutan penting!)
psql $DATABASE_URL -f migrations/001_identity_schema.sql
psql $DATABASE_URL -f migrations/002_content_schema.sql
psql $DATABASE_URL -f migrations/003_marketplace_schema.sql
psql $DATABASE_URL -f migrations/004_service_schema.sql
psql $DATABASE_URL -f migrations/006_moderation_schema.sql
psql $DATABASE_URL -f migrations/007_security_governance_schema.sql
psql $DATABASE_URL -f migrations/008_reputation_schema.sql
psql $DATABASE_URL -f migrations/010_audit_schema.sql

# Phase 2 — Jalankan SETELAH Phase 1 selesai
psql $DATABASE_URL -f migrations/005_order_escrow_schema.sql
psql $DATABASE_URL -f migrations/009_logistics_schema.sql
```

> **Kenapa ada jeda?** `005_order_escrow` butuh tabel dari `001` (users) dan `003` (catalog).
> `009_logistics` butuh tabel orders dari `005`.

### 5. Jalankan Backend (NestJS API)

```bash
cd apps/api
pnpm install
pnpm start:dev
```

API berjalan di: `http://localhost:3001/api/v1`

### 6. Jalankan Frontend (Next.js)

```bash
# Di terminal baru
cd apps/web
pnpm install
pnpm dev
```

Frontend berjalan di: `http://localhost:3000`

---

## Struktur Project

```
racik-media-v3/
├── apps/
│   ├── api/            ← NestJS Backend
│   │   └── src/
│   │       ├── core/   ← Infrastruktur bersama (auth, db, events, shared)
│   │       └── features/ ← 15 domain bisnis
│   └── web/            ← Next.js Frontend
├── migrations/         ← 10 file SQL (urutan eksekusi: lihat §4)
├── revisi-dokumen/     ← 50 file dokumentasi arsitektur
├── docker-compose.yml  ← Local dev stack
├── .env.example        ← Template environment variables
└── README.md           ← File ini
```

Baca [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) untuk detail lengkap folder dan konvensi penamaan file.

---

## Arsitektur Singkat

| Keputusan | Pilihan | Alasan |
|-----------|---------|--------|
| HTTP Framework | NestJS + Fastify | Performa tinggi, modular, TypeScript native |
| Frontend | Next.js 14 (App Router) | SSR/SSG, SEO, React ekosistem |
| Database | Supabase PostgreSQL | RLS built-in, Auth, Storage terintegrasi |
| Event Bus | RabbitMQ | Reliable async messaging, dead letter queue |
| Cache | Redis | Session, rate limit, queue buffer |
| Search | Meilisearch | Full-text search bahasa Indonesia |
| Auth | Supabase Auth + JWT | Zero-trust, MFA ready |

Arsitektur lengkap ada di [`revisi-dokumen/ADR-001-keputusan-arsitektur.md`](revisi-dokumen/ADR-001-keputusan-arsitektur.md).

---

## Domain Bisnis (23 Domain Granular)

Sesuai [`revisi-dokumen/data-ownership.md`](revisi-dokumen/data-ownership.md):

| No | Domain | Tabel Utama |
|----|--------|------------|
| 1 | Identity | `users`, `user_roles`, `profiles`, `verifications` |
| 2 | Membership | `membership_tiers`, `member_subscriptions` |
| 3 | Vendor | `vendor_profiles`, `vendor_verifications` |
| 4 | Content | `content_items`, `content_citations` |
| 5 | Marketplace | `catalog_items`, `price_anomaly_registry` |
| 6 | Provenance | `catalog_provenances`, `catalog_change_logs` |
| 7 | Service-Marketplace | `service_listings`, `service_milestones` |
| 8 | Order | `orders`, `order_items` |
| 9 | Payment | (via Supabase + payment gateway) |
| 10 | Escrow | `escrow_contracts`, `escrow_milestone_tranches` |
| 11 | Logistics | `logistics_change_logs` |
| 12 | Moderation | `moderation_tickets`, `moderation_panel_reviews` |
| 13 | Reputation | `core_reputations`, `reputation_events` |
| 14 | Security | `security_incidents` |
| 15 | Governance | `governance_decisions` |
| 16 | Audit | `identity_audit_logs`, `financial_audit_logs` |
| 17–23 | Community, Loyalty, Notification, Analytics, Search, AI, Tenant | (Phase 2+) |

---

## Event Bus

Semua event mengikuti format di [`revisi-dokumen/event-map.md`](revisi-dokumen/event-map.md).

Contoh publish event dari service:

```typescript
// Di dalam service NestJS
await this.eventBus.publish({
  event_name: 'identity.user_registered',  // dari event-map.md
  tenant_id: user.tenant_id,
  schema_version: 1,
  payload: {
    user_id: user.id,
    email: user.email,
  },
});
```

---

## Konvensi Wajib

1. **Status kolom** pakai `lowercase_snake_case`: `active`, `under_review`, `suspended`
2. **Nama tabel** plural: `users`, `orders`, `content_items`
3. **`tenant_id`** wajib di semua tabel
4. **Tabel append-only** (audit, event logs) diblokir trigger UPDATE/DELETE
5. **Antar domain** DILARANG saling import — gunakan event bus
6. **Consumer event** WAJIB idempoten — cek `event_id` sebelum proses

Detail lengkap: [`revisi-dokumen/database-conventions.md`](revisi-dokumen/database-conventions.md) dan [`revisi-dokumen/coding-standards.md`](revisi-dokumen/coding-standards.md).

---

## Troubleshooting

**Docker container tidak mau start?**
```bash
docker compose down -v   # hapus volume lama
docker compose up -d     # mulai ulang
```

**Migration error "relation already exists"?**
```bash
# Drop database dan mulai dari awal (lokal dev saja!)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# Jalankan ulang migrations dari awal
```

**API error "Environment variables tidak valid"?**
- Buka file `.env` dan pastikan semua variabel bertanda `[WAJIB DIISI]` sudah diisi
- Pastikan tidak ada spasi di sekitar tanda `=`

**RabbitMQ UI tidak bisa diakses?**
- Buka `http://localhost:15672`
- Login: `racik_events` / password dari `.env` (`RABBITMQ_PASSWORD`)

---

## Dokumentasi

| Dokumen | Isi |
|---------|-----|
| [`revisi-dokumen/index.md`](revisi-dokumen/index.md) | Navigator semua 50 dokumen |
| [`revisi-dokumen/ADR-001-keputusan-arsitektur.md`](revisi-dokumen/ADR-001-keputusan-arsitektur.md) | Keputusan arsitektur D1–D9 |
| [`revisi-dokumen/data-ownership.md`](revisi-dokumen/data-ownership.md) | 23 domain + kepemilikan tabel |
| [`revisi-dokumen/data-models.md`](revisi-dokumen/data-models.md) | DDL lengkap 34 tabel |
| [`revisi-dokumen/event-map.md`](revisi-dokumen/event-map.md) | Katalog 44 event resmi |
| [`revisi-dokumen/escrow-lifecycle.md`](revisi-dokumen/escrow-lifecycle.md) | State machine escrow |
| [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) | Folder struktur lengkap |

---

*Racik Media V3 — dibangun dengan ❤️ untuk ekosistem UMKM Indonesia*
