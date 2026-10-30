/**
 * verification.service.ts — KYC/KYB Verification Service
 * Creates verification requests and publishes decision events.
 * Ref: user-lifecycle.md, event-map.md
 */
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { SubmitVerificationDto } from '../dto/submit-verification.dto';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly eventBus: EventBusService,
  ) {}

  async submitVerification(userId: string, dto: SubmitVerificationDto) {
    const { data, error } = await this.supabase.admin
      .from('verifications')
      .insert({
        user_id: userId,
        tenant_id: dto.tenant_id,
        verification_type: dto.verification_type,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getLatestVerification(userId: string) {
    const { data } = await this.supabase.admin
      .from('verifications')
      .select('id, verification_type, status, submitted_at, reviewed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  }

  async recordDecision(verificationId: string, userId: string, verificationType: string, decision: string, tenantId: string): Promise<void> {
    await this.supabase.admin
      .from('verifications')
      .update({ status: decision === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', verificationId);

    await this.eventBus.publish({
      event_name: 'identity.verification_decision_recorded',
      tenant_id: tenantId,
      schema_version: 1,
      payload: { userId, verificationId, verificationType, decision },
    });
    this.logger.log(`Verification ${verificationId} decision: ${decision}`);
  }
}
