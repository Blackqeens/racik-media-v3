/**
 * membership.service.ts — Membership Plan Management
 * Ref: membership-architecture.md, event-map.md
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class MembershipService {
  constructor(private readonly supabase: SupabaseClientService, private readonly eventBus: EventBusService) {}

  async changePlan(userId: string, planId: string, tenantId: string): Promise<void> {
    await this.eventBus.publish({ event_name: 'membership.plan_changed', tenant_id: tenantId, schema_version: 1, payload: { userId, planId, occurredAt: new Date().toISOString() } });
  }

  async getMembershipByUser(userId: string) {
    const { data } = await this.supabase.admin.from('user_roles').select('role_type, status, granted_at').eq('user_id', userId).eq('role_type', 'member').maybeSingle();
    return data;
  }
}
