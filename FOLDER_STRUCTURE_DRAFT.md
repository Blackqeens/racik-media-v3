# RACIK MEDIA V3 — DRAFT STRUKTUR FOLDER LENGKAP

> **Status**: Draft v1.0 | Dihasilkan dari: `PROJECT_STRUCTURE.md`, `domain-map.md`, `data-ownership.md`, `system-overview.md`
> **Legenda**: ✅ Sudah ada | 🔲 Belum dibuat (perlu dibuat)

---

## ROOT PROJECT

```
racik-media-v3/                              ✅ root workspace
│
├── apps/                                    ✅ Monorepo apps
├── migrations/                              ✅ SQL migration files
├── docs/                                    🔲 Belum dibuat (folder wrapper)
│   └── revisi-dokumen/                      ✅ Ada di root (perlu dipindah ke docs/)
├── .env.example                             ✅ Template env variables
├── docker-compose.yml                       ✅ Local dev stack
├── package.json                             ✅ Root package (monorepo config)
├── PROJECT_STRUCTURE.md                     ✅ Struktur panduan
├── ADR-001-keputusan-arsitektur.md          ✅ ADR root copy
└── README.md                                ✅
```

---

## APPS/API — NestJS Backend

```
apps/api/                                    ✅
├── src/
│   │
│   ├── core/                                ✅ Shared infrastructure
│   │   ├── auth/                            ✅
│   │   │   ├── auth.module.ts               ✅
│   │   │   ├── jwt.guard.ts                 ✅
│   │   │   ├── jwt.strategy.ts              ✅
│   │   │   ├── public.decorator.ts          ✅
│   │   │   ├── roles.decorator.ts           ✅
│   │   │   ├── roles.guard.ts               ✅
│   │   │   └── index.ts                     ✅
│   │   │
│   │   ├── database/                        ✅
│   │   │   ├── database.module.ts           ✅
│   │   │   ├── supabase.client.ts           ✅
│   │   │   └── index.ts                     ✅
│   │   │
│   │   ├── events/                          ✅
│   │   │   ├── domain-event.interface.ts    ✅
│   │   │   ├── event-bus.module.ts          ✅
│   │   │   ├── event-bus.service.ts         ✅
│   │   │   └── index.ts                     ✅
│   │   │
│   │   ├── config/                          ✅
│   │   │   ├── app.config.ts                ✅
│   │   │   └── index.ts                     ✅
│   │   │
│   │   └── shared/                          ✅
│   │       ├── dto/
│   │       │   ├── api-response.dto.ts      ✅
│   │       │   └── pagination.dto.ts        ✅
│   │       └── index.ts                     ✅
│   │
│   ├── features/                            ✅ Domain bisnis
│   │   │
│   │   ├── identity/                        ✅ (partial)
│   │   │   ├── controllers/                 🔲
│   │   │   │   ├── user.controller.ts       🔲
│   │   │   │   └── verification.controller.ts 🔲
│   │   │   ├── services/                    🔲
│   │   │   │   ├── user.service.ts          🔲
│   │   │   │   ├── role.service.ts          🔲
│   │   │   │   └── verification.service.ts  🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   ├── user.repository.ts       🔲
│   │   │   │   └── verification.repository.ts 🔲
│   │   │   ├── dto/                         🔲
│   │   │   │   ├── create-user.dto.ts       🔲
│   │   │   │   └── update-profile.dto.ts    🔲
│   │   │   ├── events/                      🔲
│   │   │   │   ├── identity-role-activated.event.ts      🔲
│   │   │   │   └── identity-status-restricted.event.ts   🔲
│   │   │   ├── identity.module.ts           ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── membership/                      ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   ├── services/                    🔲
│   │   │   │   └── membership.service.ts    🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── membership.repository.ts 🔲
│   │   │   ├── dto/                         🔲
│   │   │   │   └── create-membership.dto.ts 🔲
│   │   │   ├── membership.module.ts         ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── vendor/                          ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   │   └── vendor.controller.ts     🔲
│   │   │   ├── services/                    🔲
│   │   │   │   └── vendor.service.ts        🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── vendor.repository.ts     🔲
│   │   │   ├── dto/                         🔲
│   │   │   ├── vendor.module.ts             ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── content/                         ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   │   └── content.controller.ts    🔲
│   │   │   ├── services/                    🔲
│   │   │   │   └── content.service.ts       🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── content.repository.ts    🔲
│   │   │   ├── dto/                         🔲
│   │   │   │   ├── create-article.dto.ts    🔲
│   │   │   │   └── create-paper.dto.ts      🔲
│   │   │   ├── events/                      🔲
│   │   │   │   ├── content-submitted.event.ts   🔲
│   │   │   │   └── content-published.event.ts   🔲
│   │   │   ├── content.module.ts            ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── marketplace/                     ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   │   └── marketplace.controller.ts 🔲
│   │   │   ├── services/                    🔲
│   │   │   │   ├── catalog.service.ts       🔲
│   │   │   │   └── price-anomaly.service.ts 🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── catalog.repository.ts    🔲
│   │   │   ├── dto/                         🔲
│   │   │   ├── events/                      🔲
│   │   │   │   └── product-approved.event.ts 🔲
│   │   │   ├── marketplace.module.ts        ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── provenance/                      ✅ (stub only)
│   │   │   ├── services/                    🔲
│   │   │   │   └── provenance.service.ts    🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── provenance.repository.ts 🔲
│   │   │   ├── dto/                         🔲
│   │   │   ├── provenance.module.ts         ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── service-marketplace/             ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   │   └── service-marketplace.controller.ts 🔲
│   │   │   ├── services/                    🔲
│   │   │   │   ├── service-listing.service.ts   🔲
│   │   │   │   └── milestone.service.ts     🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── service-listing.repository.ts 🔲
│   │   │   ├── dto/                         🔲
│   │   │   ├── events/                      🔲
│   │   │   │   └── service-approved.event.ts 🔲
│   │   │   ├── service-marketplace.module.ts ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── order/                           ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   │   └── order.controller.ts      🔲
│   │   │   ├── services/                    🔲
│   │   │   │   └── order.service.ts         🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── order.repository.ts      🔲
│   │   │   ├── dto/                         🔲
│   │   │   │   ├── create-order.dto.ts      🔲
│   │   │   │   └── update-order-status.dto.ts 🔲
│   │   │   ├── events/                      🔲
│   │   │   │   ├── order-created.event.ts   🔲
│   │   │   │   └── order-completed.event.ts 🔲
│   │   │   ├── order.module.ts              ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── payment/                         ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   │   └── payment-webhook.controller.ts 🔲
│   │   │   ├── services/                    🔲
│   │   │   │   └── payment.service.ts       🔲
│   │   │   ├── adapters/                    🔲
│   │   │   │   └── payment-gateway.adapter.ts 🔲
│   │   │   ├── dto/                         🔲
│   │   │   ├── payment.module.ts            ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── escrow/                          ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   ├── services/                    🔲
│   │   │   │   ├── escrow.service.ts        🔲
│   │   │   │   └── settlement.service.ts    🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── escrow.repository.ts     🔲
│   │   │   ├── dto/                         🔲
│   │   │   ├── events/                      🔲
│   │   │   │   ├── escrow-locked.event.ts   🔲
│   │   │   │   └── escrow-milestone-released.event.ts 🔲
│   │   │   ├── escrow.module.ts             ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── logistics/                       ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   ├── services/                    🔲
│   │   │   │   └── logistics.service.ts     🔲
│   │   │   ├── adapters/                    🔲
│   │   │   │   └── logistics-provider.adapter.ts 🔲
│   │   │   ├── dto/                         🔲
│   │   │   ├── logistics.module.ts          ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── moderation/                      ✅ (stub only)
│   │   │   ├── controllers/                 🔲
│   │   │   │   └── moderation.controller.ts 🔲
│   │   │   ├── services/                    🔲
│   │   │   │   ├── ticket.service.ts        🔲
│   │   │   │   └── panel.service.ts         🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── moderation.repository.ts 🔲
│   │   │   ├── dto/                         🔲
│   │   │   ├── events/                      🔲
│   │   │   │   └── moderation-decision-made.event.ts 🔲
│   │   │   ├── moderation.module.ts         ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── reputation/                      ✅ (stub only)
│   │   │   ├── services/                    🔲
│   │   │   │   └── reputation.service.ts    🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── reputation.repository.ts 🔲
│   │   │   ├── consumers/                   🔲
│   │   │   │   ├── content-published.consumer.ts    🔲
│   │   │   │   └── escrow-released.consumer.ts      🔲
│   │   │   ├── reputation.module.ts         ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── security/                        ✅ (stub only)
│   │   │   ├── services/                    🔲
│   │   │   │   └── incident.service.ts      🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── security.repository.ts   🔲
│   │   │   ├── security.module.ts           ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── governance/                      ✅ (stub only)
│   │   │   ├── services/                    🔲
│   │   │   │   └── governance.service.ts    🔲
│   │   │   ├── repositories/                🔲
│   │   │   │   └── governance.repository.ts 🔲
│   │   │   ├── governance.module.ts         ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── audit/                           ✅ (stub only)
│   │   │   ├── services/                    🔲
│   │   │   │   └── audit-writer.service.ts  🔲
│   │   │   ├── consumers/                   🔲
│   │   │   │   ├── identity-audit.consumer.ts     🔲
│   │   │   │   ├── financial-audit.consumer.ts    🔲
│   │   │   │   ├── moderation-audit.consumer.ts   🔲
│   │   │   │   └── security-audit.consumer.ts     🔲
│   │   │   ├── audit.module.ts              ✅
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── notification/                    🔲 (belum ada sama sekali)
│   │   │   ├── services/                    🔲
│   │   │   │   └── notification.service.ts  🔲
│   │   │   ├── adapters/                    🔲
│   │   │   │   ├── whatsapp.adapter.ts      🔲
│   │   │   │   ├── email.adapter.ts         🔲
│   │   │   │   └── push.adapter.ts          🔲
│   │   │   ├── dto/                         🔲
│   │   │   ├── notification.module.ts       🔲
│   │   │   └── index.ts                     🔲
│   │   │
│   │   ├── search/                          🔲 (belum ada sama sekali)
│   │   │   ├── services/                    🔲
│   │   │   │   └── search.service.ts        🔲
│   │   │   ├── consumers/                   🔲
│   │   │   │   ├── content-index.consumer.ts    🔲
│   │   │   │   └── catalog-index.consumer.ts    🔲
│   │   │   ├── search.module.ts             🔲
│   │   │   └── index.ts                     🔲
│   │   │
│   │   └── review/                          🔲 (Phase 3 - belum ada)
│   │       ├── services/                    🔲
│   │       │   └── review.service.ts        🔲
│   │       ├── repositories/                🔲
│   │       │   └── review.repository.ts     🔲
│   │       ├── review.module.ts             🔲
│   │       └── index.ts                     🔲
│   │
│   ├── app.module.ts                        ✅
│   └── main.ts                              ✅
│
├── test/                                    🔲
│   ├── identity/                            🔲
│   │   └── identity.e2e-spec.ts             🔲
│   ├── marketplace/                         🔲
│   │   └── marketplace.e2e-spec.ts          🔲
│   └── jest-e2e.json                        🔲
│
├── nest-cli.json                            ✅
├── package.json                             ✅
└── tsconfig.json                            ✅
```

---

## APPS/WEB — Next.js Frontend

```
apps/web/                                    ✅ Lengkap
├── src/
│   ├── app/                                 ✅ Next.js App Router
│   │   ├── (auth)/                          ✅ Route group: Auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx                 ✅
│   │   │   ├── register/
│   │   │   │   └── page.tsx                 ✅
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx                 ✅
│   │   │   └── layout.tsx                   ✅
│   │   │
│   │   ├── (dashboard)/                     ✅ Route group: Dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx                 ✅
│   │   │   ├── profile/
│   │   │   │   └── page.tsx                 ✅
│   │   │   ├── bookmarks/
│   │   │   │   └── page.tsx                 ✅
│   │   │   └── layout.tsx                   ✅
│   │   │
│   │   ├── (seller)/                        ✅ Route group: Seller
│   │   │   ├── seller/
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx             ✅
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx             ✅
│   │   │   │   └── products/
│   │   │   │       └── page.tsx             ✅
│   │   │   └── layout.tsx                   ✅
│   │   │
│   │   ├── (admin)/                         ✅ Route group: Admin
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx             ✅
│   │   │   │   ├── moderation/
│   │   │   │   │   └── page.tsx             ✅
│   │   │   │   ├── seller-verification/
│   │   │   │   │   └── page.tsx             ✅
│   │   │   │   └── financial-report/
│   │   │   │       └── page.tsx             ✅
│   │   │   └── layout.tsx                   ✅
│   │   │
│   │   ├── articles/                        ✅ Halaman publik artikel
│   │   │   ├── page.tsx                     ✅
│   │   │   └── [slug]/
│   │   │       └── page.tsx                 ✅
│   │   │
│   │   ├── marketplace/                     ✅ Halaman catalog produk
│   │   │   ├── page.tsx                     ✅
│   │   │   └── [id]/
│   │   │       └── page.tsx                 ✅
│   │   │
│   │   ├── services/                        ✅ Halaman service listings
│   │   │   ├── page.tsx                     ✅
│   │   │   └── [id]/
│   │   │       └── page.tsx                 ✅
│   │   │
│   │   ├── events/                          ✅ Halaman events/kegiatan
│   │   │   └── page.tsx                     ✅
│   │   │
│   │   ├── cart/                            ✅
│   │   │   └── page.tsx                     ✅
│   │   │
│   │   ├── checkout/                        ✅
│   │   │   └── page.tsx                     ✅
│   │   │
│   │   ├── cerita-kami/                     ✅ Halaman About
│   │   │   └── page.tsx                     ✅
│   │   │
│   │   └── layout.tsx                       ✅ Root layout
│   │
│   ├── components/                          ✅ UI components
│   │   ├── ui/                              ✅ Primitives (button, input, modal)
│   │   │   ├── Button.tsx                   ✅
│   │   │   ├── Input.tsx                    ✅
│   │   │   └── Modal.tsx                    ✅
│   │   ├── layout/                          ✅ Layout components
│   │   │   ├── Navbar.tsx                   ✅
│   │   │   ├── Footer.tsx                   ✅
│   │   │   └── Sidebar.tsx                  ✅
│   │   ├── marketplace/                     ✅ Domain-specific components
│   │   │   └── ProductCard.tsx              ✅
│   │   └── articles/
│   │       └── ArticleCard.tsx              ✅
│   │
│   ├── hooks/                               ✅ Custom React hooks
│   │   ├── useAuth.ts                       ✅
│   │   ├── useCart.ts                       ✅
│   │   └── useSearch.ts                     ✅
│   │
│   ├── lib/                                 ✅ Utilities & API client
│   │   ├── api-client.ts                    ✅
│   │   ├── supabase.ts                      ✅
│   │   └── utils.ts                         ✅
│   │
│   └── types/                               ✅ TypeScript types shared frontend
│       ├── user.types.ts                    ✅
│       ├── product.types.ts                 ✅
│       └── api.types.ts                     ✅
│
├── public/                                  🔲 Static assets (logo/favicon — manual upload)
│   ├── logo.png                             🔲
│   └── favicon.ico                          🔲
│
├── next.config.ts                           ✅
├── tailwind.config.ts                       ✅
├── postcss.config.js                        ✅
├── package.json                             ✅
└── tsconfig.json                            ✅
```

---

## MIGRATIONS — SQL Schema

```
migrations/                                  ✅ Semua sudah ada
├── 001_identity_schema.sql                  ✅
├── 002_content_schema.sql                   ✅
├── 003_marketplace_schema.sql               ✅
├── 004_service_schema.sql                   ✅
├── 005_order_escrow_schema.sql              ✅
├── 006_moderation_schema.sql                ✅
├── 007_security_governance_schema.sql       ✅
├── 008_reputation_schema.sql                ✅
├── 009_logistics_schema.sql                 ✅
└── 010_audit_schema.sql                     ✅
```

---

## DOCS / REVISI-DOKUMEN — Dokumentasi Arsitektur

```
revisi-dokumen/                              ✅ Semua sudah ada
├── 00-keputusan-usulan.md                   ✅
├── ADR-001-keputusan-arsitektur.md          ✅
├── ai-governance.md                         ✅
├── ai-integration-contracts.md              ✅
├── api-standards.md                         ✅
├── audit-strategy.md                        ✅
├── chat-architecture.md                     ✅
├── coding-standards.md                      ✅
├── content-lifecycle.md                     ✅
├── data-models.md                           ✅
├── data-ownership.md                        ✅
├── database-conventions.md                  ✅
├── decision-record-architecture.md          ✅
├── deployment-architecture.md               ✅
├── disaster-recovery-strategy.md            ✅
├── domain-map.md                            ✅
├── escrow-lifecycle.md                      ✅
├── event-contracts.md                       ✅
├── event-map.md                             ✅
├── feature-roadmap.md                       ✅
├── future-considerations.md                 ✅
├── glossary.md                              ✅
├── governance-sanction-rules.md             ✅
├── index.md                                 ✅
├── infrastructure-architecture.md           ✅
├── integration-map.md                       ✅
├── logistics-provenance-rules.md            ✅
├── logistics-provenance.md                  ✅
├── marketplace-lifecycle.md                 ✅
├── master-erd.md                            ✅
├── membership-architecture.md               ✅
├── moderation-lifecycle.md                  ✅
├── module-dependency.md                     ✅
├── notification-architecture.md             ✅
├── observability-architecture.md            ✅
├── permission-matrix.md                     ✅
├── pricing-sustainability.md                ✅
├── release-versioning.md                    ✅
├── reputation-engine.md                     ✅
├── search-architecture.md                   ✅
├── security-architecture.md                 ✅
├── service-lifecycle.md                     ✅
├── storage-architecture.md                  ✅
├── system-context.md                        ✅
├── system-overview.md                       ✅
├── tenancy-model.md                         ✅
├── user-lifecycle.md                        ✅
├── vendor-architecture.md                   ✅
└── workflow-diagrams.md                     ✅
```

---

## INFRASTRUKTUR LOKAL (docker-compose)

| Service | Image | Port | Status |
|---|---|---|---|
| PostgreSQL | postgres:16-alpine | 5432 | ✅ Siap |
| Redis | redis:7-alpine | 6379 | ✅ Siap |
| RabbitMQ | rabbitmq:3.13-management | 5672 / 15672 | ✅ Siap |
| Meilisearch | meilisearch:v1.9 | 7700 | ✅ Siap |
| NestJS API | (Dockerfile belum ada) | 3001 | 🔲 Perlu Dockerfile |
| Next.js Web | (Dockerfile belum ada) | 3000 | 🔲 Perlu Dockerfile |

---

## PRIORITAS PEMBUATAN (Urutan Pengerjaan)

### Phase 1 — Foundation (V3.0 Core)
1. 🔲 `apps/api/src/features/identity/` → controllers, services, repositories, dto, events
2. 🔲 `apps/api/src/features/membership/` → services, repositories, dto
3. 🔲 `apps/api/src/features/content/` → controllers, services, repositories, events
4. 🔲 `apps/api/src/features/moderation/` → services, consumers, events
5. 🔲 `apps/api/src/features/audit/` → consumers (semua domain)
6. 🔲 `apps/web/` → setup Next.js App Router + auth pages

### Phase 2 — Commerce (V3.0)
7. 🔲 `apps/api/src/features/marketplace/` + `provenance/`
8. 🔲 `apps/api/src/features/vendor/`
9. 🔲 `apps/api/src/features/order/` + `payment/` + `escrow/`
10. 🔲 `apps/api/src/features/logistics/`
11. 🔲 `apps/api/src/features/reputation/` + consumers
12. 🔲 `apps/api/src/features/search/` (Meilisearch consumers)
13. 🔲 `apps/api/src/features/notification/`

### Phase 3 — Service & Community (V3.1)
14. 🔲 `apps/api/src/features/service-marketplace/`
15. 🔲 `apps/api/src/features/review/`
16. 🔲 `apps/api/src/features/security/` + `governance/`
17. 🔲 Social ecosystem (Forum, Chat, Feed)

---

## FILE KONFIGURASI ROOT YANG PERLU DIBUAT

```
racik-media-v3/
├── Dockerfile                               🔲 (untuk apps/api)
├── apps/web/Dockerfile                      🔲 (untuk apps/web)
├── apps/api/Dockerfile                      🔲
├── .dockerignore                            🔲
├── .gitignore                               🔲
└── turbo.json / nx.json                     🔲 (jika pakai monorepo tooling)
```

---

> **Catatan**: File-file di `apps/api/src/features/identity/` yang berupa HTML, gambar (.jpe, .png), dan JS UI saat ini berada di lokasi yang **salah** (tercampur dengan backend NestJS). File-file UI tersebut seharusnya dipindahkan ke `apps/web/` sebagai referensi konversi ke Next.js/React.
