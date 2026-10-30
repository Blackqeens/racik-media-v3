/**
 * app.module.ts — Root Module Racik Media V3
 *
 * Mendaftarkan semua modul domain (features/) dan infrastruktur (core/).
 * Aturan: modul domain TIDAK boleh saling import langsung — pakai event bus.
 * Ref: module-dependency.md, coding-standards.md
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// App Controller (Health Check Endpoint)
import { AppController } from './app.controller';

// Core infrastructure modules
import { DatabaseModule } from './core/database/database.module';
import { EventBusModule } from './core/events/event-bus.module';
import { AuthModule } from './core/auth/auth.module';

// Feature (domain) modules
// Setiap domain didaftarkan di sini, TAPI tidak saling import satu sama lain
import { IdentityModule } from './features/identity/identity.module';
import { MembershipModule } from './features/membership/membership.module';
import { ContentModule } from './features/content/content.module';
import { MarketplaceModule } from './features/marketplace/marketplace.module';
import { ProvenanceModule } from './features/provenance/provenance.module';
import { ServiceMarketplaceModule } from './features/service-marketplace/service-marketplace.module';
import { OrderModule } from './features/order/order.module';
import { PaymentModule } from './features/payment/payment.module';
import { EscrowModule } from './features/escrow/escrow.module';
import { LogisticsModule } from './features/logistics/logistics.module';
import { ModerationModule } from './features/moderation/moderation.module';
import { ReputationModule } from './features/reputation/reputation.module';
import { SecurityModule } from './features/security/security.module';
import { GovernanceModule } from './features/governance/governance.module';
import { AuditModule } from './features/audit/audit.module';
import { NotificationModule } from './features/notification/notification.module';
import { SearchModule } from './features/search/search.module';
import { VendorModule } from './features/vendor/vendor.module';

@Module({
  imports: [
    // ─── Konfigurasi ENV ───────────────────────────────────────────────
    // isGlobal: true → ConfigService tersedia di semua modul tanpa import ulang
    ConfigModule.forRoot({
      isGlobal: true,
      // .env ada di direktori yang sama dengan package.json (apps/api/)
      // NestJS cwd saat start = apps/api/   → cukup '.env'
      envFilePath: '.env',
    }),

    // ─── Rate Limiting ────────────────────────────────────────────────
    // Proteksi dari spam request — 100 request per 60 detik per IP
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,   // window 60 detik (ms)
        limit: 100,    // max request per window
      },
    ]),

    // ─── Core Infrastructure ──────────────────────────────────────────
    DatabaseModule,    // Supabase client (global)
    EventBusModule,    // RabbitMQ event bus (global)
    AuthModule,        // JWT guard, roles decorator

    // ─── Feature Domains ─────────────────────────────────────────────
    // Urutan tidak kritis — NestJS resolve dependency otomatis
    IdentityModule,
    MembershipModule,
    ContentModule,
    MarketplaceModule,
    ProvenanceModule,
    ServiceMarketplaceModule,
    OrderModule,
    PaymentModule,
    EscrowModule,
    LogisticsModule,
    ModerationModule,
    ReputationModule,
    SecurityModule,
    GovernanceModule,
    AuditModule,
    NotificationModule,
    SearchModule,
    VendorModule,
  ],
  controllers: [AppController], // 👈 Mendaftarkan endpoint /health
})
export class AppModule { }
