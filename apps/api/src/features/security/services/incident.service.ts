/**
 * incident.service.ts — Security Incident Detection & Recording
 * Ref: security-architecture.md, event-map.md
 */
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class IncidentService {
  private readonly logger = new Logger(IncidentService.name);

  constructor(private readonly supabase: SupabaseClientService, private readonly eventBus: EventBusService) {}

  async recordIncident(userId: string | null, incidentType: string, severityLevel: string, sourceIp: string | null, metadata: Record<string, unknown>, tenantId: string): Promise<void> {
    const { data, error } = await this.supabase.admin
      .from('security_incidents')
      .insert({ user_id: userId, tenant_id: tenantId, incident_type: incidentType, severity_level: severityLevel, incident_status: 'open', source_ip: sourceIp, metadata })
      .select().single();
    if (error) { this.logger.error('Failed to record incident', error); return; }

    if (severityLevel === 'critical') {
      await this.eventBus.publish({ event_name: 'security.incident_critical', tenant_id: tenantId, schema_version: 1, payload: { incidentId: data.id, userId: userId ?? '', reasonCode: incidentType } });
    }
  }

  async mitigateIncident(incidentId: string): Promise<void> {
    await this.supabase.admin.from('security_incidents').update({ incident_status: 'mitigated', updated_at: new Date().toISOString() }).eq('id', incidentId);
  }
}
