/**
 * send-notification.dto.ts — DTO internal untuk mengirim notifikasi
 *
 * Dipakai oleh NotificationService saat memproses event dari consumer.
 * Bukan endpoint publik — tidak expose ke controller.
 *
 * Ref: notification-architecture.md §B, event-map.md
 */

/** Channel pengiriman yang didukung */
export type NotificationChannel = 'whatsapp' | 'email' | 'push';

/** Priority queue untuk pengiriman */
export type NotificationPriority = 'high' | 'low';

/**
 * Perintah pengiriman notifikasi ke satu penerima.
 * NotificationService membuat instance ini dari payload event domain.
 */
export class SendNotificationDto {
  /** UUID pengguna penerima */
  recipient_user_id: string;

  /** Channel tujuan pengiriman */
  channel: NotificationChannel;

  /** Kode template pesan — maps ke template di notification_templates */
  template_key: string;

  /**
   * Variabel yang diinjeksikan ke dalam template.
   * Contoh: { order_id: 'ORD-123', amount: '150000' }
   */
  template_vars: Record<string, string>;

  /** Priority queue — 'high' untuk OTP & keamanan, 'low' untuk promosi */
  priority: NotificationPriority;

  /**
   * ID event domain yang memicu notifikasi ini.
   * Digunakan untuk idempoten check — satu event hanya menghasilkan satu notif.
   */
  source_event_id: string;

  /** Nama kanonik event sumber (dari event-map.md) */
  source_event_type: string;
}
