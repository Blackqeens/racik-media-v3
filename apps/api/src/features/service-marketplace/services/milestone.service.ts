/**
 * milestone.service.ts — Service Milestone Management
 * Max 3 revisions per milestone. Ref: service-lifecycle.md
 */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class MilestoneService {
  constructor(private readonly supabase: SupabaseClientService) {}

  async createMilestone(orderId: string, serviceListingId: string, title: string, description: string, milestoneOrder: number, tenantId: string) {
    const { data, error } = await this.supabase.admin
      .from('service_milestones')
      .insert({ order_id: orderId, service_listing_id: serviceListingId, title, description, milestone_order: milestoneOrder, tenant_id: tenantId, status: 'pending', revision_count: 0 })
      .select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async requestRevision(milestoneId: string): Promise<void> {
    const { data } = await this.supabase.admin.from('service_milestones').select('revision_count, status').eq('id', milestoneId).single();
    if (!data) throw new NotFoundException('Milestone not found');
    if (data.revision_count >= 3) throw new BadRequestException('Maximum revision count (3) reached');
    await this.supabase.admin.from('service_milestones').update({ revision_count: data.revision_count + 1, status: 'amendment_requested', updated_at: new Date().toISOString() }).eq('id', milestoneId);
  }
}
