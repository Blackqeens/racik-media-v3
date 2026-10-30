/**
 * domain-event.interface.ts — Kontrak Event Domain
 *
 * Setiap event yang dikirim lewat RabbitMQ WAJIB mengikuti interface ini.
 * event_name mengikuti katalog resmi di event-map.md (format: domain.action)
 *
 * Contoh:
 *   identity.user_registered
 *   escrow.funds_locked
 *   moderation.decision_made
 *
 * Ref: event-map.md, ADR-001 D3 (EDA), ADR-001 D6 (idempoten)
 */
export interface DomainEvent<T = Record<string, unknown>> {
  /** ID unik event — UUID v4. Digunakan untuk idempoten check. */
  event_id: string;

  /**
   * Nama event dalam format domain.action
   * Harus sesuai katalog di event-map.md
   * Contoh: 'identity.user_registered', 'escrow.funds_locked'
   */
  event_name: string;

  /** tenant_id yang memiliki data ini — wajib di semua event */
  tenant_id: string;

  /** Timestamp event dibuat — ISO 8601 */
  occurred_at: string;

  /**
   * Versi schema payload. Gunakan integer (1, 2, 3...).
   * Jika kamu mengubah struktur payload, naikkan versi ini.
   */
  schema_version: number;

  /** Payload data spesifik per event */
  payload: T;
}

/**
 * Tipe helper untuk event publisher.
 * Payload tanpa field metadata (diisi otomatis oleh EventBusService).
 */
export type CreateEventPayload<T = Record<string, unknown>> = Omit<
  DomainEvent<T>,
  'event_id' | 'occurred_at'
>;
