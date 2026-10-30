/**
 * notification.module.ts — Notification Domain Module
 *
 * Mendaftarkan:
 *   - NotificationService: core dispatch logic + retry
 *   - Channel adapters: WhatsappAdapter, EmailAdapter, PushAdapter
 *   - Consumers: listener event dari Identity, Commerce, Catalog/Service/Security
 *
 * Module ini tidak mengekspos controller publik — notifikasi sepenuhnya
 * digerakkan oleh event asinkronus dari domain lain via RabbitMQ.
 *
 * Ref: notification-architecture.md, module-dependency.md
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';

import { NotificationService } from './services/notification.service';
import { WhatsappAdapter } from './adapters/whatsapp.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { PushAdapter } from './adapters/push.adapter';
import { IdentityNotificationConsumer } from './consumers/identity-notification.consumer';
import { CommerceNotificationConsumer } from './consumers/commerce-notification.consumer';
import { CatalogServiceNotificationConsumer } from './consumers/catalog-service-notification.consumer';

@Module({
  imports: [
    DatabaseModule,   // Supabase client untuk tulis notification_delivery_logs
    EventBusModule,   // RabbitMQ publisher & subscriber
  ],
  providers: [
    // ─── Core Service ─────────────────────────────────────────────────────
    NotificationService,

    // ─── Channel Adapters ─────────────────────────────────────────────────
    WhatsappAdapter,
    EmailAdapter,
    PushAdapter,

    // ─── Event Consumers ──────────────────────────────────────────────────
    IdentityNotificationConsumer,
    CommerceNotificationConsumer,
    CatalogServiceNotificationConsumer,
  ],
  exports: [
    // Ekspor NotificationService agar domain lain bisa inject jika perlu
    // memanggil dispatch langsung (non-event path, mis. OTP via controller Identity)
    NotificationService,
  ],
})
export class NotificationModule {}
