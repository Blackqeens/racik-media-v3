/**
 * logistics.module.ts — Logistics Domain Module
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { LogisticsWebhookController } from './controllers/logistics-webhook.controller';
import { LogisticsService } from './services/logistics.service';

@Module({
  imports: [DatabaseModule, EventBusModule],
  controllers: [LogisticsWebhookController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
