/**
 * identity-audit.consumer.ts — Writes audit log for identity events
 * Ref: audit-strategy.md, event-map.md
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { AuditWriterService } from '../services/audit-writer.service';
import { randomUUID } from 'crypto';

@Injectable()
export class IdentityAuditConsumer implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService, private readonly auditWriter: AuditWriterService) {}

  async onModuleInit() {
    await this.eventBus.subscribe<Record<string, unknown>>(
      'audit.queue.identity-role-activated', 'identity.role_activated',
      async (event: DomainEvent<Record<string, unknown>>) => {
        await this.auditWriter.writeIdentityLog(event.tenant_id, randomUUID(), event.payload['userId'] as string, null, 'role_activated', null, event.payload, 'ROLE_GRANT');
      },
    );
    await this.eventBus.subscribe<Record<string, unknown>>(
      'audit.queue.identity-status-restricted', 'identity.status_restricted',
      async (event: DomainEvent<Record<string, unknown>>) => {
        await this.auditWriter.writeIdentityLog(event.tenant_id, randomUUID(), event.payload['userId'] as string, null, 'status_restricted', null, event.payload, event.payload['reasonCode'] as string);
      },
    );
  }
}
