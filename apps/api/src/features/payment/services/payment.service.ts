/**
 * payment.service.ts — Payment Gateway Integration Service
 *
 * Memproses webhook dari gateway (Midtrans/Xendit), verifikasi signature,
 * lalu publish event payment.succeeded ke event bus.
 *
 * Signature verification:
 *   Midtrans: SHA-512( order_id + status_code + gross_amount + server_key )
 *   Xendit  : Compare header X-CALLBACK-TOKEN terhadap XENDIT_WEBHOOK_TOKEN
 *
 * Ref: integration-map.md, event-map.md, security-architecture.md §webhook
 */
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClientService } from '../../../core/database/supabase.client';
import { EventBusService } from '../../../core/events/event-bus.service';
import { createHash, randomUUID } from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly config: ConfigService,
    private readonly supabase: SupabaseClientService,
  ) {}

  async processWebhook(payload: Record<string, unknown>, signature: string): Promise<void> {
    const gateway = this.config.get<string>('PAYMENT_GATEWAY', 'midtrans');

    if (!this.verifySignature(gateway, payload, signature)) {
      this.logger.warn(`Payment webhook signature mismatch [gateway=${gateway}]`);
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const orderId = payload['order_id'] as string;
    const transactionRef = payload['transaction_id'] as string;
    const amount = Number(payload['gross_amount'] ?? 0);
    const status = payload['transaction_status'] as string;

    if (!['settlement', 'capture'].includes(status)) {
      this.logger.debug(`Skipping webhook status: ${status}`);
      return;
    }

    // Fetch buyerId so notification consumer can dispatch to the right user
    const { data: order } = await this.supabase.admin
      .from('orders')
      .select('buyer_id, tenant_id')
      .eq('id', orderId)
      .maybeSingle();
    const buyerId: string = order?.buyer_id ?? '';
    const tenantId: string = order?.tenant_id ?? 'platform';

    // Update status order menjadi escrow_held (dana masuk proteksi escrow)
    await this.supabase.admin
      .from('orders')
      .update({ status: 'escrow_held', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    await this.eventBus.publish({
      event_name: 'payment.succeeded',
      tenant_id: tenantId,
      schema_version: 1,
      payload: { paymentId: randomUUID(), orderId, buyerId, transactionRef, amount },
    });
    this.logger.log(`payment.succeeded processed & order ${orderId} updated to escrow_held`);
  }

  // ─── Private: Signature Verification ─────────────────────────────────────

  private verifySignature(
    gateway: string,
    payload: Record<string, unknown>,
    signature: string,
  ): boolean {
    if (gateway === 'midtrans') {
      return this.verifyMidtrans(payload, signature);
    }
    if (gateway === 'xendit') {
      return this.verifyXendit(signature);
    }
    // Unknown gateway — reject by default (fail-safe)
    this.logger.warn(`Unknown PAYMENT_GATEWAY value: "${gateway}" — rejecting webhook`);
    return false;
  }

  /**
   * Midtrans: SHA-512 hash dari:
   *   order_id + status_code + gross_amount + server_key
   * Ref: https://docs.midtrans.com/en/after-payment/http-notification
   */
  private verifyMidtrans(payload: Record<string, unknown>, signature: string): boolean {
    const serverKey = this.config.get<string>('MIDTRANS_SERVER_KEY', '');
    if (!serverKey) {
      this.logger.warn('MIDTRANS_SERVER_KEY not set — skipping signature check');
      return false;
    }
    const raw =
      String(payload['order_id'] ?? '') +
      String(payload['status_code'] ?? '') +
      String(payload['gross_amount'] ?? '') +
      serverKey;
    const expected = createHash('sha512').update(raw).digest('hex');
    return expected === signature;
  }

  /**
   * Xendit: Bandingkan header X-CALLBACK-TOKEN dengan env XENDIT_WEBHOOK_TOKEN
   * Ref: https://developers.xendit.co/api-reference/#callback-verification
   */
  private verifyXendit(signature: string): boolean {
    const token = this.config.get<string>('XENDIT_WEBHOOK_TOKEN', '');
    if (!token) {
      this.logger.warn('XENDIT_WEBHOOK_TOKEN not set — skipping signature check');
      return false;
    }
    return token === signature;
  }
}
