import { OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { ReputationService } from '../services/reputation.service';
export declare class EscrowReleasedConsumer implements OnModuleInit {
    private readonly eventBus;
    private readonly reputationService;
    constructor(eventBus: EventBusService, reputationService: ReputationService);
    onModuleInit(): Promise<void>;
}
