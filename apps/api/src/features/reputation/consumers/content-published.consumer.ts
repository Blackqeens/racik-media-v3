/**
 * content-published.consumer.ts — Awards reputation on content.published
 * Ref: event-map.md, reputation-engine.md
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { ReputationService } from '../services/reputation.service';

@Injectable()
export class ContentPublishedConsumer implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService, private readonly reputationService: ReputationService) {}

  async onModuleInit() {
    await this.eventBus.subscribe<{ contentId: string; authorId: string }>(
      'reputation.queue.content-published', 'content.published',
      async (event: DomainEvent<{ contentId: string; authorId: string }>) => {
        await this.reputationService.applyScoreDelta(event.payload.authorId, 'knowledge_approved', event.event_id, 'content', event.tenant_id);
      },
    );
  }
}
