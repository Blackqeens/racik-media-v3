/**
 * email.adapter.ts — Email Service Adapter
 *
 * Digunakan untuk dokumen berukuran besar:
 * Invoice PDF, kontrak kerja, berita acara penyelesaian sengketa.
 *
 * Implementasi mengirim via SMTP atau transactional email provider (SendGrid/Resend).
 * Konfigurasi via ENV: EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, EMAIL_API_KEY.
 *
 * Ref: notification-architecture.md §B (Channel Priority #2)
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannelAdapter } from './notification-channel.adapter';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationDeliveryResultDto } from '../dto/notification-delivery-result.dto';

@Injectable()
export class EmailAdapter implements NotificationChannelAdapter {
  private readonly logger = new Logger(EmailAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async send(
    notificationId: string,
    dto: SendNotificationDto,
  ): Promise<NotificationDeliveryResultDto> {
    const apiUrl = this.config.getOrThrow<string>('EMAIL_API_URL');
    const apiKey = this.config.getOrThrow<string>('EMAIL_API_KEY');
    const fromAddress = this.config.getOrThrow<string>('EMAIL_FROM_ADDRESS');

    const base: Omit<NotificationDeliveryResultDto, 'status' | 'failure_code'> = {
      notification_id: notificationId,
      channel: 'email',
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
          from: fromAddress,
          to_user_id: dto.recipient_user_id,
          template: dto.template_key,
          variables: dto.template_vars,
          idempotency_key: notificationId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(
          `Email delivery failed [${notificationId}]: ${response.status} ${errorBody}`,
        );
        return { ...base, status: 'failed', failure_code: `HTTP_${response.status}` };
      }

      this.logger.debug(`Email sent [${notificationId}] to user ${dto.recipient_user_id}`);
      return { ...base, status: 'sent', failure_code: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
      this.logger.error(`Email adapter error [${notificationId}]: ${message}`);
      return { ...base, status: 'failed', failure_code: 'ADAPTER_ERROR' };
    }
  }
}
