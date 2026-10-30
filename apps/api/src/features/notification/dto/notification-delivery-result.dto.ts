/**
 * notification-delivery.dto.ts — DTO hasil pengiriman notifikasi
 *
 * Digunakan oleh adapter untuk melaporkan hasil ke NotificationService,
 * dan oleh NotificationService untuk menulis notification_delivery_logs.
 *
 * Ref: notification-architecture.md §C (Retry Policy)
 */

export type DeliveryStatus = 'sent' | 'failed';

/** Hasil pengiriman dari channel adapter */
export class NotificationDeliveryResultDto {
  /** ID record notifikasi di notification_delivery_logs */
  notification_id: string;

  /** Channel yang digunakan */
  channel: string;

  /** Status pengiriman */
  status: DeliveryStatus;

  /**
   * Kode error dari provider eksternal jika gagal.
   * Diisi oleh adapter, null jika sukses.
   */
  failure_code: string | null;

  /** Jumlah percobaan termasuk ini (1-based) */
  attempt: number;

  /** Timestamp pengiriman — ISO 8601 */
  delivered_at: string;
}
