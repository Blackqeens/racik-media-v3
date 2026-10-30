/**
 * provenance.module.ts — Provenance Domain Module
 * Ref: domain-map.md §Marketplace (Provenance), data-ownership.md
 */
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { EventBusModule } from '../../core/events/event-bus.module';
import { ProvenanceService } from './services/provenance.service';
import { ProvenanceRepository } from './repositories/provenance.repository';

@Module({
  imports: [DatabaseModule, EventBusModule],
  providers: [ProvenanceService, ProvenanceRepository],
  exports: [ProvenanceService],
})
export class ProvenanceModule {}
