/**
 * escrow.module.ts — Escrow Domain Module
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { EscrowService } from './services/escrow.service';
import { SettlementService } from './services/settlement.service';
import { EscrowRepository } from './repositories/escrow.repository';

@Module({
  imports: [DatabaseModule, EventBusModule],
  providers: [EscrowService, SettlementService, EscrowRepository],
  exports: [EscrowService, SettlementService],
})
export class EscrowModule {}
