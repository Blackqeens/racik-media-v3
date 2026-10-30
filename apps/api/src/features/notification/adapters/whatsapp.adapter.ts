/**
 * whatsapp.adapter.ts — WhatsApp Gateway Adapter
 *
 * Jalur utama untuk notifikasi transaksional kritis:
 * OTP, tagihan pembayaran, pesanan masuk vendor.
 *
 * Implementasi mengirim via HTTP ke WhatsApp Business API / third-party gateway.
 * URL & token dikonfigurasi via ENV.
 *
 * Ref: notification-architecture.md §B (Channel Priority #1)
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannelAdapter } from './notification-channel.adapter';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationDeliveryResultDto } from '../dto/notification-delivery-result.dto';

@Injectable()
export class WhatsappAdapter implements NotificationChannelAdapter {
  private readonly logger = new Logger(WhatsappAdapter.name);

  constructor(private readonly config: ConfigService) {}

  async send(
    notificationId: string,
    dto: SendNotificationDto,
  ): Promise<NotificationDeliveryResultDto> {
    const gatewayUrl = this.config.getOrThrow<string>('WHATSAPP_GATEWAY_URL');
    const apiToken = this.config.getOrThrow<string>('WHATSAPP_API_TOKEN');

    const base: Omit<NotificationDeliveryResultDto, 'status' | 'failure_code'> = {
      notification_id: notificationId,
      channel: 'whatsapp',
      attempt: 1,
      delivered_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${gatewayUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          recipient_id: dto.recipient_user_id,
          template: dto.template_key,
          variables: dto.template_vars,
          // Sertakan notificationId sebagai idempoten key ke provider
          idempotency_key: notificationId,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.warn(
          `WhatsApp delivery failed [${notificationId}]: ${response.status} ${errorBody}`,
        );
        return { ...base, status: 'failed', failure_code: `HTTP_${response.status}` };
      }

      this.logger.debug(`WhatsApp sent [${notificationId}] to user ${dto.recipient_user_id}`);
      return { ...base, status: 'sent', failure_code: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
      this.logger.error(`WhatsApp adapter error [${notificationId}]: ${message}`);
      return { ...base, status: 'failed', failure_code: 'ADAPTER_ERROR' };
    }
  }
}
