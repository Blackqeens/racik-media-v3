/**
 * escrow-released.consumer.ts — Awards reputation on escrow.milestone_released
 * Ref: event-map.md, reputation-engine.md
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { ReputationService } from '../services/reputation.service';

@Injectable()
export class EscrowReleasedConsumer implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService, private readonly reputationService: ReputationService) {}

  async onModuleInit() {
    await this.eventBus.subscribe<{ vendorId: string }>(
      'reputation.queue.escrow-released', 'escrow.milestone_released',
      async (event: DomainEvent<{ vendorId: string }>) => {
        await this.reputationService.applyScoreDelta(event.payload.vendorId, 'order_fulfilled', event.event_id, 'escrow', event.tenant_id);
      },
    );
  }
}
