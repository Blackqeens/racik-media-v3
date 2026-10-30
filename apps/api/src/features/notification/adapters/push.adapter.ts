/**
 * push.adapter.ts — In-App & Push Notification Adapter
 *
 * Digunakan untuk notifikasi real-time di dalam aplikasi:
 * komentar artikel baru, balasan forum, indikator chat baru.
 *
 * Implementasi mengirim via Firebase Cloud Messaging (FCM) atau provider push lain.
 * Konfigurasi via ENV: PUSH_API_URL, PUSH_API_KEY.
 *
 * Ref: notification-architecture.md §B (Channel Priority #3)
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannelAdapter } from './notification-channel.adapter';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationDeliveryResultDto } from '../dto/notification-delivery-result.dto';

@Injectable()
export class PushAdapter implements NotificationChannelAdapter {
  private readonly logger = new Logger(PushAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async send(
    notificationId: string,
    dto: SendNotificationDto,
  ): Promise<NotificationDeliveryResultDto> {
    const apiUrl = this.config.getOrThrow<string>('PUSH_API_URL');
    const apiKey = this.config.getOrThrow<string>('PUSH_API_KEY');

    const base: Omit<NotificationDeliveryResultDto, 'status' | 'failure_code'> = {
      notification_id: notificationId,
      channel: 'push',
      attempt: 1,
      delivered_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${apiUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          target_user_id: dto.recipient_user_id,
          template: dto.template_key,
          data: dto.template_vars,
          idempotency_key: notificationId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(
          `Push delivery failed [${notificationId}]: ${response.status} ${errorBody}`,
        );
        return { ...base, status: 'failed', failure_code: `HTTP_${response.status}` };
      }

      this.logger.debug(`Push sent [${notificationId}] to user ${dto.recipient_user_id}`);
      return { ...base, status: 'sent', failure_code: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
      this.logger.error(`Push adapter error [${notificationId}]: ${message}`);
      return { ...base, status: 'failed', failure_code: 'ADAPTER_ERROR' };
    }
  }
}
