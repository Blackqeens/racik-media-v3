/**
 * price-anomaly.service.ts — Anti-Price-War floor price detection engine
 * Ref: marketplace-lifecycle.md §3.2
 */
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';

/** Category floor prices — in production comes from governance_decisions table */
const CATEGORY_FLOOR_PRICES: Record<string, number> = {
  default: 10000,
};

@Injectable()
export class PriceAnomalyService {
  private readonly logger = new Logger(PriceAnomalyService.name);

  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly eventBus: EventBusService,
  ) {}

  async detectAnomaly(category: string, price: number): Promise<boolean> {
    const floor = CATEGORY_FLOOR_PRICES[category] ?? CATEGORY_FLOOR_PRICES['default'];
    return price < floor;
  }

  async recordAnomaly(catalogItemId: string, detectedPrice: number, category: string, tenantId: string, vendorId: string): Promise<void> {
    const floor = CATEGORY_FLOOR_PRICES[category] ?? CATEGORY_FLOOR_PRICES['default'];
    const deviation = ((floor - detectedPrice) / floor) * 100;

    const { data, error } = await this.supabase.admin
      .from('price_anomaly_registry')
      .insert({ catalog_item_id: catalogItemId, tenant_id: tenantId, detected_price: detectedPrice, category_floor_price: floor, deviation_percentage: deviation, anomaly_status: 'flagged' })
      .select().single();
    if (error) { this.logger.error('Failed to record anomaly', error); return; }

    await this.eventBus.publish({ event_name: 'catalog.anomaly_detected', tenant_id: tenantId, schema_version: 1, payload: { catalogItemId, vendorId, anomalyId: data.id, severity: deviation > 50 ? 'critical' : 'major' } });
  }
}
