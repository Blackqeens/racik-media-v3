/**
 * payment.module.ts — Payment Domain Module
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { PaymentWebhookController } from './controllers/payment-webhook.controller';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [DatabaseModule, EventBusModule],
  controllers: [PaymentWebhookController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
