import { OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { AuditWriterService } from '../services/audit-writer.service';
export declare class IdentityAuditConsumer implements OnModuleInit {
    private readonly eventBus;
    private readonly auditWriter;
    constructor(eventBus: EventBusService, auditWriter: AuditWriterService);
    onModuleInit(): Promise<void>;
}
