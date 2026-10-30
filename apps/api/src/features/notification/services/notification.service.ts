/**
 * notification.service.ts — Core Notification Service
 *
 * Tanggung jawab:
 *   1. Menerima perintah kirim dari consumer event domain
 *   2. Menentukan channel & template berdasarkan event type
 *   3. Menulis record ke notification_delivery_logs (idempoten via source_event_id)
 *   4. Mendelegasikan pengiriman ke adapter channel yang sesuai
 *   5. Menerapkan exponential backoff retry maksimal 3x jika provider gagal
 *   6. Mempublish event notification.delivery_failed ke event bus jika semua retry habis
 *
 * Queue:
 *   - high-priority-queue → OTP, keamanan akun, konfirmasi pembayaran
 *   - low-priority-queue  → katalog disetujui, reputasi naik, info umum
 *
 * Ref: notification-architecture.md §A, §C | event-map.md
 */
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { NotificationChannelAdapter } from '../adapters/notification-channel.adapter';
import { WhatsappAdapter } from '../adapters/whatsapp.adapter';
import { EmailAdapter } from '../adapters/email.adapter';
import { PushAdapter } from '../adapters/push.adapter';
import {
  SendNotificationDto,
  NotificationChannel,
  NotificationPriority,
} from '../dto/send-notification.dto';

/** Konfigurasi template per event type dari event-map.md */
const TEMPLATE_MAP: Record<
  string,
  { channel: NotificationChannel; template_key: string; priority: NotificationPriority }[]
> = {
  // Identity
  'identity.role_activated': [
    { channel: 'push', template_key: 'role_activated', priority: 'low' },
  ],
  'identity.password_changed': [
    { channel: 'whatsapp', template_key: 'password_changed_alert', priority: 'high' },
    { channel: 'email', template_key: 'password_changed_alert', priority: 'high' },
  ],
  'identity.verification_decision_recorded': [
    { channel: 'push', template_key: 'verification_decision', priority: 'high' },
    { channel: 'email', template_key: 'verification_decision', priority: 'high' },
  ],
  // Membership
  'membership.plan_changed': [
    { channel: 'email', template_key: 'membership_plan_changed', priority: 'low' },
  ],
  // Content
  'content.published': [
    { channel: 'push', template_key: 'content_published', priority: 'low' },
  ],
  // Marketplace
  'catalog.approved': [
    { channel: 'push', template_key: 'catalog_approved', priority: 'low' },
    { channel: 'whatsapp', template_key: 'catalog_approved', priority: 'low' },
  ],
  'catalog.anomaly_detected': [
    { channel: 'whatsapp', template_key: 'catalog_anomaly_alert', priority: 'high' },
  ],
  // Service
  'service.approved': [
    { channel: 'push', template_key: 'service_approved', priority: 'low' },
  ],
  // Order & Commerce
  'order.created': [
    { channel: 'whatsapp', template_key: 'order_created_buyer', priority: 'high' },
    { channel: 'push', template_key: 'order_created_buyer', priority: 'high' },
  ],
  'order.cancelled': [
    { channel: 'push', template_key: 'order_cancelled', priority: 'high' },
    { channel: 'email', template_key: 'order_cancelled', priority: 'high' },
  ],
  'order.completed': [
    { channel: 'push', template_key: 'order_completed', priority: 'low' },
  ],
  'payment.succeeded': [
    { channel: 'whatsapp', template_key: 'payment_succeeded', priority: 'high' },
    { channel: 'email', template_key: 'payment_receipt', priority: 'high' },
  ],
  'order.escrow_locked': [
    { channel: 'push', template_key: 'escrow_locked', priority: 'high' },
    { channel: 'whatsapp', template_key: 'escrow_locked', priority: 'high' },
  ],
  'escrow.disputed': [
    { channel: 'email', template_key: 'escrow_disputed', priority: 'high' },
    { channel: 'push', template_key: 'escrow_disputed', priority: 'high' },
  ],
  // Logistics
  'logistics.manifested': [
    { channel: 'push', template_key: 'logistics_manifested', priority: 'low' },
  ],
  'logistics.in_transit': [
    { channel: 'push', template_key: 'logistics_in_transit', priority: 'low' },
  ],
  'logistics.delivered': [
    { channel: 'push', template_key: 'logistics_delivered', priority: 'high' },
    { channel: 'whatsapp', template_key: 'logistics_delivered', priority: 'high' },
  ],
  // Security
  'security.incident_critical': [
    { channel: 'whatsapp', template_key: 'security_incident_alert', priority: 'high' },
    { channel: 'email', template_key: 'security_incident_alert', priority: 'high' },
  ],
};

/** Maksimal retry sesuai notification-architecture.md §C */
const MAX_RETRY_ATTEMPTS = 3;

/** Base delay untuk exponential backoff (ms) */
const RETRY_BASE_DELAY_MS = 1_000;

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly supabase: SupabaseClient;

  /** Map channel → adapter instance, diisi saat module init */
  private readonly adapters: Map<NotificationChannel, NotificationChannelAdapter>;

  constructor(
    private readonly db: SupabaseClientService,
    private readonly eventBus: EventBusService,
    whatsappAdapter: WhatsappAdapter,
    emailAdapter: EmailAdapter,
    pushAdapter: PushAdapter,
  ) {
    this.supabase = this.db.admin;
    this.adapters = new Map<NotificationChannel, NotificationChannelAdapter>([
      ['whatsapp', whatsappAdapter],
      ['email', emailAdapter],
      ['push', pushAdapter],
    ]);
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Proses event domain dan kirim notifikasi ke semua channel yang terdaftar
   * untuk event type tersebut di TEMPLATE_MAP.
   *
   * Idempoten: cek source_event_id di notification_delivery_logs sebelum kirim.
   *
   * @param eventType - Nama kanonik event (contoh: 'order.created')
   * @param recipientUserId - UUID pengguna penerima
   * @param templateVars - Variabel untuk diinjeksikan ke template
   * @param sourceEventId - eventId dari DomainEvent envelope (idempoten key)
   */
  async dispatchFromEvent(
    eventType: string,
    recipientUserId: string,
    templateVars: Record<string, string>,
    sourceEventId: string,
  ): Promise<void> {
    const templates = TEMPLATE_MAP[eventType];

    if (!templates || templates.length === 0) {
      this.logger.debug(`No notification template for event: ${eventType}`);
      return;
    }

    for (const tpl of templates) {
      const dto: SendNotificationDto = {
        recipient_user_id: recipientUserId,
        channel: tpl.channel,
        template_key: tpl.template_key,
        template_vars: templateVars,
        priority: tpl.priority,
        source_event_id: sourceEventId,
        source_event_type: eventType,
      };

      await this.sendWithRetry(dto);
    }
  }

  // ─── Internal Logic ───────────────────────────────────────────────────────

  /**
   * Cek idempoten: apakah source_event_id + channel sudah pernah berhasil dikirim?
   * Mencegah duplicate notif jika consumer memproses ulang event yang sama.
   */
  private async isAlreadyDelivered(
    sourceEventId: string,
    channel: string,
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('notification_delivery_logs')
      .select('id')
      .eq('source_event_id', sourceEventId)
      .eq('channel', channel)
      .eq('status', 'sent')
      .maybeSingle();

    return data !== null;
  }

  /**
   * Kirim dengan exponential backoff retry.
   * Retry maksimal MAX_RETRY_ATTEMPTS kali, delay: 1s, 2s, 4s.
   * Setelah semua retry habis dan gagal → publish notification.delivery_failed.
   */
  private async sendWithRetry(dto: SendNotificationDto): Promise<void> {
    // Idempoten check: sudah pernah berhasil?
    const alreadySent = await this.isAlreadyDelivered(dto.source_event_id, dto.channel);
    if (alreadySent) {
      this.logger.debug(
        `Skipped duplicate: source_event_id=${dto.source_event_id} channel=${dto.channel}`,
      );
      return;
    }

    const adapter = this.adapters.get(dto.channel);
    if (!adapter) {
      this.logger.error(`No adapter registered for channel: ${dto.channel}`);
      return;
    }

    const notificationId = randomUUID();
    let lastFailureCode: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      const result = await adapter.send(notificationId, dto);

      await this.writeDeliveryLog({
        notificationId,
        dto,
        status: result.status,
        failureCode: result.failure_code,
        attempt,
        deliveredAt: result.delivered_at,
      });

      if (result.status === 'sent') {
        return;
      }

      lastFailureCode = result.failure_code;
      this.logger.warn(
        `Retry ${attempt}/${MAX_RETRY_ATTEMPTS} failed [${notificationId}]: ${lastFailureCode}`,
      );

      if (attempt < MAX_RETRY_ATTEMPTS) {
        await this.sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1));
      }
    }

    // Semua retry habis — publish event gagal ke event bus
    await this.publishDeliveryFailed(notificationId, dto, lastFailureCode);
  }

  /** Tulis log pengiriman ke tabel notification_delivery_logs */
  private async writeDeliveryLog(params: {
    notificationId: string;
    dto: SendNotificationDto;
    status: string;
    failureCode: string | null;
    attempt: number;
    deliveredAt: string;
  }): Promise<void> {
    const { error } = await this.supabase.from('notification_delivery_logs').insert({
      id: params.notificationId,
      recipient_user_id: params.dto.recipient_user_id,
      channel: params.dto.channel,
      template_key: params.dto.template_key,
      source_event_id: params.dto.source_event_id,
      source_event_type: params.dto.source_event_type,
      priority: params.dto.priority,
      status: params.status,
      failure_code: params.failureCode,
      attempt: params.attempt,
      delivered_at: params.deliveredAt,
    });

    if (error) {
      // Log error tapi jangan throw — jangan block retry karena masalah DB log
      this.logger.error(`Failed to write delivery log [${params.notificationId}]: ${error.message}`);
    }
  }

  /**
   * Publish event notification.delivery_failed ke event bus.
   * Consumer: Audit domain (untuk immutable log).
   * Sesuai event-map.md §B.
   */
  private async publishDeliveryFailed(
    notificationId: string,
    dto: SendNotificationDto,
    failureCode: string | null,
  ): Promise<void> {
    try {
      await this.eventBus.publish({
        event_name: 'notification.delivery_failed',
        tenant_id: 'platform', // Notification adalah platform-level service
        schema_version: 1,
        payload: {
          notificationId,
          channel: dto.channel,
          failureCode: failureCode ?? 'UNKNOWN',
          attempt: MAX_RETRY_ATTEMPTS,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to publish notification.delivery_failed: ${err}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
