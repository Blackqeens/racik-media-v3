/**
 * logistics-webhook.controller.ts — Logistics Courier Webhook Receiver
 *
 * Public endpoint — receives status updates from courier 3PL (Biteship/RajaOngkir).
 * Verifikasi signature menggunakan HMAC-SHA256 dengan BITESHIP_WEBHOOK_SECRET.
 *
 * Biteship signature: X-Webhook-Signature = HMAC-SHA256(body_raw, secret)
 * Ref: https://biteship.com/id/docs/api/webhooks, logistics-provenance.md
 */
import {
  Controller, Post, Body, Headers, HttpCode, HttpStatus,
  Logger, UnauthorizedException, RawBodyRequest, Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../../core/auth/public.decorator';
import { LogisticsService } from '../services/logistics.service';
import { createHmac } from 'crypto';
import { FastifyRequest } from 'fastify';

@Controller('logistics')
export class LogisticsWebhookController {
  private readonly logger = new Logger(LogisticsWebhookController.name);

  constructor(
    private readonly logisticsService: LogisticsService,
    private readonly config: ConfigService,
  ) {}

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(
    @Req() req: RawBodyRequest<FastifyRequest>,
    @Body() payload: Record<string, unknown>,
    @Headers('x-webhook-signature') signature: string,
  ) {
    this.logger.log('Logistics webhook received');

    if (!this.verifySignature(req, signature)) {
      this.logger.warn('Logistics webhook signature mismatch');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const orderId = payload['order_id'] as string;
    const trackingId = payload['tracking_id'] as string;
    const status = payload['status'] as string;
    const carrier = (payload['carrier'] ?? '') as string;

    await this.logisticsService.recordTrackingEvent(orderId, trackingId, status, carrier, 'platform');
    return { ok: true };
  }

  // ─── Signature Verification ───────────────────────────────────────────────

  /**
   * Biteship: HMAC-SHA256(raw_body, BITESHIP_WEBHOOK_SECRET)
   * dibandingkan dengan header X-Webhook-Signature
   */
  private verifySignature(req: RawBodyRequest<FastifyRequest>, signature: string): boolean {
    const secret = this.config.get<string>('BITESHIP_WEBHOOK_SECRET', '');
    if (!secret) {
      this.logger.warn('BITESHIP_WEBHOOK_SECRET not set — skipping signature check');
      return false;
    }
    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.warn('rawBody not available — cannot verify signature');
      return false;
    }
    const expected = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return expected === signature;
  }
}
