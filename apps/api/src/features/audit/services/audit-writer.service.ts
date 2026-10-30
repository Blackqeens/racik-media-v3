/**
 * audit-writer.service.ts — Immutable Audit Log Writer
 * Append-only. Writes to identity/security/moderation/financial audit log tables.
 * Ref: audit-strategy.md, data-models.md §10
 */
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class AuditWriterService {
  private readonly logger = new Logger(AuditWriterService.name);

  constructor(private readonly supabase: SupabaseClientService) {}

  async writeIdentityLog(tenantId: string, correlationId: string, userId: string, actorId: string | null, actionType: string, oldValue: unknown, newValue: unknown, rationaleCode: string): Promise<void> {
    const { error } = await this.supabase.admin.from('identity_audit_logs').insert({ tenant_id: tenantId, correlation_id: correlationId, user_id: userId, actor_id: actorId, action_type: actionType, old_value: oldValue, new_value: newValue, rationale_code: rationaleCode });
    if (error) this.logger.error(`identity_audit_logs write failed: ${error.message}`);
  }

  async writeSecurityLog(tenantId: string, correlationId: string, incidentId: string | null, actorId: string | null, actionType: string, metadata: unknown): Promise<void> {
    const { error } = await this.supabase.admin.from('security_audit_logs').insert({ tenant_id: tenantId, correlation_id: correlationId, incident_id: incidentId, actor_id: actorId, action_type: actionType, metadata });
    if (error) this.logger.error(`security_audit_logs write failed: ${error.message}`);
  }

  async writeModerationLog(tenantId: string, correlationId: string, ticketId: string, entityType: string, entityId: string, actorId: string | null, actionType: string, rationaleNotes: string | null): Promise<void> {
    const { error } = await this.supabase.admin.from('moderation_audit_logs').insert({ tenant_id: tenantId, correlation_id: correlationId, moderation_ticket_id: ticketId, entity_type: entityType, entity_id: entityId, actor_id: actorId, action_type: actionType, rationale_notes: rationaleNotes });
    if (error) this.logger.error(`moderation_audit_logs write failed: ${error.message}`);
  }

  async writeFinancialLog(tenantId: string, correlationId: string, escrowContractId: string, orderId: string, amountLocked: number | null, feeDeducted: number | null, releaseState: string | null, actorId: string | null, actionType: string): Promise<void> {
    const { error } = await this.supabase.admin.from('financial_audit_logs').insert({ tenant_id: tenantId, correlation_id: correlationId, escrow_contract_id: escrowContractId, order_id: orderId, amount_locked: amountLocked, fee_deducted: feeDeducted, release_state: releaseState, actor_id: actorId, action_type: actionType });
    if (error) this.logger.error(`financial_audit_logs write failed: ${error.message}`);
  }
}
