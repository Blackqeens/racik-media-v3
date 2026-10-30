/**
 * governance.service.ts — Governance Decision Recording
 * Ref: governance-sanction-rules.md, event-map.md
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class GovernanceService {
  constructor(private readonly supabase: SupabaseClientService, private readonly eventBus: EventBusService) {}

  async recordDecision(actorId: string, decisionType: string, referenceId: string | null, previousValue: unknown, newValue: unknown, rationale: string, tenantId: string) {
    const { data, error } = await this.supabase.admin
      .from('governance_decisions')
      .insert({ actor_id: actorId, tenant_id: tenantId, decision_type: decisionType, reference_id: referenceId, previous_value: previousValue, new_value: newValue, rationale_statement: rationale })
      .select().single();
    if (error) throw new Error(error.message);

    if (decisionType === 'amend_parameter') {
      await this.eventBus.publish({ event_name: 'governance.parameter_amended', tenant_id: tenantId, schema_version: 1, payload: { decisionId: data.id, parameterKey: String(newValue), effectiveAt: new Date().toISOString() } });
    }
    return data;
  }
}
