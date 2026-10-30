/**
 * role.service.ts — Identity Role Activation Service
 * Handles role grant logic and publishes identity.role_activated event.
 * Ref: user-lifecycle.md, event-map.md
 */
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly eventBus: EventBusService,
  ) {}

  async activateRole(userId: string, roleType: string, verificationId: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase.admin
      .from('user_roles')
      .upsert({ user_id: userId, role_type: roleType, status: 'active', tenant_id: tenantId }, { onConflict: 'user_id,role_type' });
    if (error) throw new Error(error.message);

    await this.eventBus.publish({
      event_name: 'identity.role_activated',
      tenant_id: tenantId,
      schema_version: 1,
      payload: { userId, role: roleType, verificationId },
    });
    this.logger.log(`Role ${roleType} activated for user ${userId}`);
  }
}
