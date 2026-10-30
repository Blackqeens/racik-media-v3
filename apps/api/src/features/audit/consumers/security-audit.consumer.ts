/**
 * security-audit.consumer.ts — Writes audit log for security events
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { AuditWriterService } from '../services/audit-writer.service';
import { randomUUID } from 'crypto';

@Injectable()
export class SecurityAuditConsumer implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService, private readonly auditWriter: AuditWriterService) {}

  async onModuleInit() {
    await this.eventBus.subscribe<Record<string, unknown>>(
      'audit.queue.security-incident-critical', 'security.incident_critical',
      async (event: DomainEvent<Record<string, unknown>>) => {
        await this.auditWriter.writeSecurityLog(event.tenant_id, randomUUID(), event.payload['incidentId'] as string, (event.payload['userId'] ?? null) as string | null, 'incident_detected', event.payload);
      },
    );
  }
}
