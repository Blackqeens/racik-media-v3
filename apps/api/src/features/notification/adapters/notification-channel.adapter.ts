/**
 * notification-channel.adapter.ts — Interface kontrak adapter channel
 *
 * Setiap adapter (WhatsApp, Email, Push) WAJIB mengimplementasikan interface ini.
 * NotificationService memanggil adapter via interface — tidak tahu implementasi detail.
 *
 * Pola: Strategy Pattern
 * Ref: notification-architecture.md §B, coding-standards.md §D
 */
import { SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationDeliveryResultDto } from '../dto/notification-delivery-result.dto';

export interface NotificationChannelAdapter {
  /**
   * Kirim notifikasi ke provider eksternal.
   *
   * @param notificationId - ID record di notification_delivery_logs (untuk idempoten)
   * @param dto - Data pengiriman: penerima, template, variabel
   * @returns Hasil pengiriman (status sent/failed, failure_code jika gagal)
   */
  send(
    notificationId: string,
    dto: SendNotificationDto,
  ): Promise<NotificationDeliveryResultDto>;
}
