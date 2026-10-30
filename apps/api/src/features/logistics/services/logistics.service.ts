/**
 * logistics.service.ts — Logistics Tracking Service
 * Processes courier webhook events, publishes logistics domain events.
 * Ref: logistics-provenance.md, event-map.md
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class LogisticsService {
  private readonly logger = new Logger(LogisticsService.name);

  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly eventBus: EventBusService,
  ) {}

  async recordTrackingEvent(orderId: string, trackingRecordId: string, status: string, carrier: string, tenantId: string): Promise<void> {
    const correlationId = randomUUID();
    await this.supabase.admin.from('logistics_change_logs').insert({
      order_id: orderId, tracking_record_id: trackingRecordId, current_status: status,
      correlation_id: correlationId, tenant_id: tenantId,
    });

    const eventNameMap: Record<string, string> = {
      manifested: 'logistics.manifested',
      in_transit: 'logistics.in_transit',
      delivered: 'logistics.delivered',
      tracking_invalid: 'logistics.tracking_invalid',
    };
    const eventName = eventNameMap[status];
    if (!eventName) { this.logger.warn(`Unknown logistics status: ${status}`); return; }

    const payloadMap: Record<string, Record<string, unknown>> = {
      'logistics.manifested': { orderId, trackingRecordId, carrier },
      'logistics.in_transit': { orderId, trackingRecordId, occurredAt: new Date().toISOString() },
      'logistics.delivered': { orderId, trackingRecordId, deliveredAt: new Date().toISOString() },
      'logistics.tracking_invalid': { orderId, trackingRecordId, vendorId: '', reasonCode: 'INVALID_TRACKING' },
    };

    await this.eventBus.publish({ event_name: eventName, tenant_id: tenantId, schema_version: 1, payload: payloadMap[eventName] });
    this.logger.log(`${eventName} published for order ${orderId}`);
  }
}
