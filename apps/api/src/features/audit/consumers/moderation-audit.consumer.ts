/**
 * moderation-audit.consumer.ts — Writes audit log for moderation events
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { AuditWriterService } from '../services/audit-writer.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ModerationAuditConsumer implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService, private readonly auditWriter: AuditWriterService) {}

  async onModuleInit() {
    await this.eventBus.subscribe<Record<string, unknown>>(
      'audit.queue.moderation-decision-made', 'moderation.decision_made',
      async (event: DomainEvent<Record<string, unknown>>) => {
        await this.auditWriter.writeModerationLog(event.tenant_id, randomUUID(), event.payload['ticketId'] as string, event.payload['entityType'] as string, event.payload['entityId'] as string, null, event.payload['decision'] as string, event.payload['reasonCode'] as string);
      },
    );
  }
}
