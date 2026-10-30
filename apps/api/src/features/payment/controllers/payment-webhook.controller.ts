/**
 * payment-webhook.controller.ts — Payment Gateway Webhook Receiver
 * Receives callbacks from Midtrans/Xendit. Public endpoint (no JWT).
 * Ref: integration-map.md, event-map.md
 */
import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { Public } from '../../../core/auth/public.decorator';
import { PaymentService } from '../services/payment.service';

@Controller('payment')
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(private readonly paymentService: PaymentService) { }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  async receiveWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    this.logger.log(`Payment webhook received`);

    // Otomatis deteksi: Midtrans ada di body (signature_key), Xendit ada di header (x-callback-token)
    const signature =
      (payload['signature_key'] as string) ||
      headers['x-callback-token'] ||
      headers['x-signature'] ||
      '';

    await this.paymentService.processWebhook(payload, signature);
    return { ok: true };
  }
}
