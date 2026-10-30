/**
 * reputation.service.ts — Reputation Score Engine
 * Append-only score ledger. Trust Spillover Protocol.
 * Ref: reputation-engine.md, event-map.md
 */
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';

const SCORE_DELTAS: Record<string, number> = {
  knowledge_approved: 2,
  order_fulfilled: 5,
  provenance_verified: 3,
  tracking_number_invalid: -10,
  provenance_violation: -15,
  inactivity_decay: -5,
};

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly eventBus: EventBusService,
  ) {}

  async applyScoreDelta(userId: string, reasonCode: string, sourceEventId: string, sourceDomain: string, tenantId: string): Promise<void> {
    const delta = SCORE_DELTAS[reasonCode];
    if (delta === undefined) { this.logger.warn(`Unknown reason code: ${reasonCode}`); return; }

    // Idempoten: skip jika source_event_id sudah diproses
    const { data: existing } = await this.supabase.admin.from('reputation_events').select('id').eq('source_event_id', sourceEventId).maybeSingle();
    if (existing) { this.logger.debug(`Skip duplicate reputation event: ${sourceEventId}`); return; }

    await this.supabase.admin.from('reputation_events').insert({ user_id: userId, tenant_id: tenantId, reason_code: reasonCode, score_delta: delta, source_event_id: sourceEventId, source_domain: sourceDomain });

    // Rekalkulasi dan update master score
    const { data: events } = await this.supabase.admin.from('reputation_events').select('score_delta').eq('user_id', userId);
    const newScore = Math.min(1000, Math.max(0, (events ?? []).reduce((sum, e) => sum + Number(e.score_delta), 100)));

    await this.supabase.admin.from('core_reputations').upsert({ user_id: userId, tenant_id: tenantId, master_score: newScore, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    await this.eventBus.publish({ event_name: 'reputation.score_updated', tenant_id: tenantId, schema_version: 1, payload: { userId, score: newScore, reasonCode } });
    this.logger.debug(`Reputation updated for ${userId}: ${delta > 0 ? '+' : ''}${delta} (${reasonCode})`);
  }

  async getScore(userId: string) {
    const { data } = await this.supabase.admin.from('core_reputations').select('master_score, updated_at').eq('user_id', userId).maybeSingle();
    return data;
  }
}
