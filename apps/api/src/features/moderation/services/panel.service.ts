/**
 * panel.service.ts — Panel Review Service (3-vote consensus for major/critical)
 * Ref: moderation-lifecycle.md §Panel Review
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';

@Injectable()
export class PanelService {
  constructor(private readonly supabase: SupabaseClientService) {}

  async createPanelReview(ticketId: string, tenantId: string) {
    const { data, error } = await this.supabase.admin.from('moderation_panel_reviews').insert({ ticket_id: ticketId, tenant_id: tenantId, required_votes: 3 }).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async castVote(panelReviewId: string, moderatorId: string, vote: string, rationale: string, tenantId: string): Promise<void> {
    await this.supabase.admin.from('moderation_panel_votes').insert({ panel_review_id: panelReviewId, moderator_id: moderatorId, vote, rationale_notes: rationale, tenant_id: tenantId });
    const { data } = await this.supabase.admin.from('moderation_panel_votes').select('vote').eq('panel_review_id', panelReviewId);
    const votes = data ?? [];
    const approved = votes.filter(v => v.vote === 'approve').length;
    const rejected = votes.filter(v => v.vote === 'reject').length;
    if (approved >= 3 || rejected >= 3) {
      const decision = approved >= 3 ? 'approved' : 'rejected';
      await this.supabase.admin.from('moderation_panel_reviews').update({ final_decision: decision, votes_approved: approved, votes_rejected: rejected, decided_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', panelReviewId);
    }
  }
}
