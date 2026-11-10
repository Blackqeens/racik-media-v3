/**
 * ticket.service.ts — Moderation Ticket Service
 * Queue management, decision recording, SLA enforcement.
 * Ref: moderation-lifecycle.md, event-map.md
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { PaginationDto } from '../../../core/shared/dto/pagination.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TicketService {
  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly eventBus: EventBusService,
  ) {}

  async createTicket(entityType: string, entityId: string, queueType: string, severity: string, tenantId: string) {
    const slaHours: Record<string, number> = { knowledge_queue: 48, catalog_queue: 24, service_queue: 24, identity_queue: 72, default: 48 };
    const slaMs = (slaHours[queueType] ?? slaHours['default']) * 3600 * 1000;
    const { data, error } = await this.supabase.admin
      .from('moderation_tickets')
      .insert({ entity_type: entityType, entity_id: entityId, queue_type: queueType, severity, tenant_id: tenantId, sla_deadline: new Date(Date.now() + slaMs).toISOString() })
      .select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async listTickets(pagination: PaginationDto, queueType?: string) {
    let query = this.supabase.admin.from('moderation_tickets').select('id, entity_type, entity_id, queue_type, severity, status, sla_deadline, created_at', { count: 'exact' }).in('status', ['pending', 'assigned']);
    if (queueType) query = query.eq('queue_type', queueType);
    const { data, count, error } = await query.order('created_at', { ascending: true }).range(pagination.offset, pagination.offset + pagination.limit - 1);
    if (error) throw new Error(error.message);
    return { data: data ?? [], total: count ?? 0 };
  }

  async getTicketById(id: string) {
    const { data, error } = await this.supabase.admin.from('moderation_tickets').select('*').eq('id', id).maybeSingle();
    if (error || !data) throw new NotFoundException('Ticket not found');
    return data;
  }

  async recordDecision(ticketId: string, moderatorId: string, decision: string, reasonCode: string, tenantId: string): Promise<void> {
    const ticket = await this.getTicketById(ticketId);
    const normalizedDecision = decision.toLowerCase();
    const newStatus =
      normalizedDecision === 'approve' || normalizedDecision === 'approved'
        ? 'approved'
        : normalizedDecision === 'revision_requested' || normalizedDecision === 'revision'
          ? 'revision_requested'
          : 'rejected';
    const now = new Date().toISOString();
    const { error: ticketError } = await this.supabase.admin
      .from('moderation_tickets')
      .update({ status: newStatus, updated_at: now })
      .eq('id', ticketId);
    if (ticketError) throw new Error(`Failed to update moderation ticket: ${ticketError.message}`);

    if (ticket.entity_type === 'content_item') {
      const contentStatus =
        newStatus === 'approved'
          ? 'published'
          : newStatus === 'revision_requested'
            ? 'revision_requested'
            : 'rejected';
      const { data: publishedContent, error: contentError } = await this.supabase.admin
        .from('content_items')
        .update({
          status: contentStatus,
          updated_at: now,
        })
        .eq('id', ticket.entity_id)
        .select('author_id')
        .single();
      if (contentError || !publishedContent) {
        throw new Error(`Failed to update moderated content: ${contentError?.message ?? 'Content not found'}`);
      }

      const { error: lifecycleError } = await this.supabase.admin.from('content_lifecycle_logs').insert({
        tenant_id: tenantId,
        content_id: ticket.entity_id,
        actor_id: moderatorId,
        old_state: 'under_review',
        new_state: contentStatus,
        rationale_notes: reasonCode,
      });
      if (lifecycleError) throw new Error(`Failed to log content decision: ${lifecycleError.message}`);

      if (contentStatus === 'published') {
        await this.eventBus.publish({
          event_name: 'content.published',
          tenant_id: tenantId,
          schema_version: 1,
          payload: {
            contentId: ticket.entity_id,
            authorId: publishedContent.author_id,
            publishedAt: now,
          },
        });
      }
    }
    await this.eventBus.publish({
      event_name: 'moderation.decision_made', tenant_id: tenantId, schema_version: 1,
      payload: { ticketId, entityType: ticket.entity_type, entityId: ticket.entity_id, decision, reasonCode },
    });
  }

  async getDashboardStats() {
    const [
      { count: totalUsers },
      { count: pendingTickets },
      { count: pendingProducts },
      { count: pendingVerifications },
    ] = await Promise.all([
      this.supabase.admin.from('users').select('id', { count: 'exact', head: true }),
      this.supabase.admin.from('moderation_tickets').select('id', { count: 'exact', head: true }).in('status', ['pending', 'assigned']),
      this.supabase.admin.from('catalog_items').select('id', { count: 'exact', head: true }).in('status', ['under_review', 'pending_review']),
      this.supabase.admin.from('organization_profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
    ]);

    return {
      activeUsers: totalUsers ?? 0,
      pendingTickets: pendingTickets ?? 0,
      pendingProducts: pendingProducts ?? 0,
      pendingVerifications: pendingVerifications ?? 0,
    };
  }
}
