import { OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { AuditWriterService } from '../services/audit-writer.service';
export declare class FinancialAuditConsumer implements OnModuleInit {
    private readonly eventBus;
    private readonly auditWriter;
    constructor(eventBus: EventBusService, auditWriter: AuditWriterService);
    onModuleInit(): Promise<void>;
}
