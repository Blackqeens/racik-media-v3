/**
 * reputation.module.ts — Reputation Domain Module
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { ReputationService } from './services/reputation.service';
import { ContentPublishedConsumer } from './consumers/content-published.consumer';
import { EscrowReleasedConsumer } from './consumers/escrow-released.consumer';

@Module({
  imports: [DatabaseModule, EventBusModule],
  providers: [ReputationService, ContentPublishedConsumer, EscrowReleasedConsumer],
  exports: [ReputationService],
})
export class ReputationModule {}
