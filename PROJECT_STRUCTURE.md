# RACIK MEDIA V3 — STRUKTUR PROJECT

Ref docs: `coding-standards.md`, `module-dependency.md`, `domain-map.md`

## Aturan Dasar
- Folder domain: `kebab-case` → `src/features/service-marketplace/`
- File: `{resource}.{type}.ts` → `user.service.ts`, `order.repository.ts`
- Antar domain: DILARANG import internal. Gunakan event bus atau API barrel export (`index.ts`)
- Business logic: wajib di Service, bukan di Controller

---

## Struktur Lengkap

```
racik-media-v3/
│
├── apps/
│   ├── api/                          ← NestJS Backend
│   │   ├── src/
│   │   │   │
│   │   │   ├── core/                 ← Shared infrastructure (bukan domain bisnis)
│   │   │   │   ├── events/           ← Event bus & domain event contracts
│   │   │   │   │   ├── domain-event.interface.ts
│   │   │   │   │   ├── event-bus.service.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── database/         ← Supabase client, migrations helper
│   │   │   │   │   ├── supabase.client.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── auth/             ← JWT guard, MFA check, RLS helper
│   │   │   │   │   ├── jwt.guard.ts
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── config/           ← Env config (zod schema)
│   │   │   │   │   └── app.config.ts
│   │   │   │   └── shared/           ← DTO bersama, response wrapper, pagination
│   │   │   │       ├── dto/
│   │   │   │       │   ├── pagination.dto.ts
│   │   │   │       │   └── api-response.dto.ts
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── features/             ← Domain bisnis (sesuai data-ownership.md)
│   │   │   │   │
│   │   │   │   ├── identity/         ← Domain: Identity
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   ├── user.controller.ts
│   │   │   │   │   │   └── verification.controller.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── user.service.ts
│   │   │   │   │   │   ├── role.service.ts
│   │   │   │   │   │   └── verification.service.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   ├── user.repository.ts
│   │   │   │   │   │   └── verification.repository.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── create-user.dto.ts
│   │   │   │   │   │   └── update-profile.dto.ts
│   │   │   │   │   ├── events/
│   │   │   │   │   │   ├── identity-role-activated.event.ts
│   │   │   │   │   │   └── identity-status-restricted.event.ts
│   │   │   │   │   ├── identity.module.ts
│   │   │   │   │   └── index.ts      ← Barrel export ONLY (public API)
│   │   │   │   │
│   │   │   │   ├── membership/       ← Domain: Membership
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── membership.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── vendor/           ← Domain: Vendor
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── vendor.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── content/          ← Domain: Content
│   │   │   │   │   ├── controllers/
│   │   │   │   │   │   └── content.controller.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── content.service.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── content.repository.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── events/
│   │   │   │   │   │   ├── content-submitted.event.ts
│   │   │   │   │   │   └── content-published.event.ts
│   │   │   │   │   ├── content.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── marketplace/      ← Domain: Marketplace
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── catalog.service.ts
│   │   │   │   │   │   └── price-anomaly.service.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── events/
│   │   │   │   │   ├── marketplace.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── provenance/       ← Domain: Provenance
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── provenance.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── service-marketplace/ ← Domain: Service-Marketplace
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── service-listing.service.ts
│   │   │   │   │   │   └── milestone.service.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── events/
│   │   │   │   │   ├── service-marketplace.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── order/            ← Domain: Order
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── order.service.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── events/
│   │   │   │   │   │   ├── order-created.event.ts
│   │   │   │   │   │   └── order-completed.event.ts
│   │   │   │   │   ├── order.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── payment/          ← Domain: Payment
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── adapters/     ← Payment gateway adapter (Midtrans/Xendit)
│   │   │   │   │   │   └── payment-gateway.adapter.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── payment.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── escrow/           ← Domain: Escrow
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── escrow.service.ts
│   │   │   │   │   │   └── settlement.service.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── events/
│   │   │   │   │   │   ├── escrow-locked.event.ts
│   │   │   │   │   │   └── escrow-milestone-released.event.ts
│   │   │   │   │   ├── escrow.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── logistics/        ← Domain: Logistics
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── adapters/     ← Logistics provider adapter (Biteship/RajaOngkir)
│   │   │   │   │   │   └── logistics-provider.adapter.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── logistics.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── moderation/       ← Domain: Moderation
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── ticket.service.ts
│   │   │   │   │   │   └── panel.service.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── events/
│   │   │   │   │   │   └── moderation-decision-made.event.ts
│   │   │   │   │   ├── moderation.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── reputation/       ← Domain: Reputation
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── reputation.service.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── consumers/    ← Event consumers (idempoten via source_event_id)
│   │   │   │   │   │   ├── content-published.consumer.ts
│   │   │   │   │   │   └── escrow-released.consumer.ts
│   │   │   │   │   ├── reputation.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── security/         ← Domain: Security
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── incident.service.ts
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── security.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── governance/       ← Domain: Governance
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── governance.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── audit/            ← Domain: Audit
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── audit-writer.service.ts
│   │   │   │   │   ├── consumers/    ← Mengonsumsi semua event dan menulis audit log
│   │   │   │   │   │   ├── identity-audit.consumer.ts
│   │   │   │   │   │   ├── financial-audit.consumer.ts
│   │   │   │   │   │   ├── moderation-audit.consumer.ts
│   │   │   │   │   │   └── security-audit.consumer.ts
│   │   │   │   │   ├── audit.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── notification/     ← Domain: Notification
│   │   │   │   │   ├── services/
│   │   │   │   │   ├── adapters/     ← WhatsApp / Email / Push adapters
│   │   │   │   │   ├── notification.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── search/           ← Domain: Search (read model)
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── search.service.ts
│   │   │   │   │   ├── consumers/    ← Mengonsumsi event dan update Meilisearch index
│   │   │   │   │   ├── search.module.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── review/           ← Domain: Review (Phase 3)
│   │   │   │       ├── services/
│   │   │   │       ├── repositories/
│   │   │   │       ├── review.module.ts
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── app.module.ts         ← Root module, import semua feature modules
│   │   │   └── main.ts               ← Bootstrap NestJS app
│   │   │
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          ← Next.js Frontend
│       ├── src/
│       │   ├── app/                  ← Next.js App Router
│       │   │   ├── (auth)/           ← Route group: login, register
│       │   │   ├── (dashboard)/      ← Route group: user dashboard
│       │   │   ├── marketplace/      ← Halaman catalog
│       │   │   ├── services/         ← Halaman service listings
│       │   │   └── layout.tsx
│       │   ├── components/           ← UI components
│       │   ├── hooks/                ← Custom React hooks
│       │   ├── lib/                  ← API client, utils
│       │   └── types/                ← TypeScript types shared di frontend
│       ├── package.json
│       └── tsconfig.json
│
├── migrations/                       ← SQL migration files (sudah dibuat)
│   ├── 001_identity_schema.sql
│   ├── 002_content_schema.sql
│   ├── 003_marketplace_schema.sql
│   ├── 004_service_schema.sql
│   ├── 005_order_escrow_schema.sql
│   ├── 006_moderation_schema.sql
│   ├── 007_security_governance_schema.sql
│   ├── 008_reputation_schema.sql
│   ├── 009_logistics_schema.sql
│   └── 010_audit_schema.sql
│
├── docs/                             ← Arsitektur & dokumentasi
│   └── revisi-dokumen/               ← Semua file .md arsitektur (sudah ada)
│
├── .env.example                      ← Template env variables
├── docker-compose.yml                ← Local dev: PostgreSQL, Redis, RabbitMQ, Meilisearch
└── README.md
```
