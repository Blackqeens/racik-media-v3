/**
 * financial-audit.consumer.ts — Writes audit log for financial events
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { DomainEvent } from '../../../core/events/domain-event.interface';
import { AuditWriterService } from '../services/audit-writer.service';
import { randomUUID } from 'crypto';

@Injectable()
export class FinancialAuditConsumer implements OnModuleInit {
  constructor(private readonly eventBus: EventBusService, private readonly auditWriter: AuditWriterService) {}

  async onModuleInit() {
    await this.eventBus.subscribe<Record<string, unknown>>(
      'audit.queue.escrow-milestone-released', 'escrow.milestone_released',
      async (event: DomainEvent<Record<string, unknown>>) => {
        await this.auditWriter.writeFinancialLog(event.tenant_id, randomUUID(), event.payload['escrowContractId'] as string, event.payload['orderId'] as string, null, null, 'released', (event.payload['vendorId'] ?? null) as string | null, 'milestone_released');
      },
    );
    await this.eventBus.subscribe<Record<string, unknown>>(
      'audit.queue.payment-succeeded', 'payment.succeeded',
      async (event: DomainEvent<Record<string, unknown>>) => {
        // escrowContractId tidak tersedia di payment.succeeded — pakai paymentId sebagai referensi audit
        const paymentId = (event.payload['paymentId'] ?? '') as string;
        await this.auditWriter.writeFinancialLog(event.tenant_id, randomUUID(), paymentId, event.payload['orderId'] as string, Number(event.payload['amount']), null, null, (event.payload['buyerId'] ?? null) as string | null, 'payment_received');
      },
    );
  }
}
