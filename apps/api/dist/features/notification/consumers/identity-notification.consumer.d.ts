import { OnModuleInit } from '@nestjs/common';
import { EventBusService } from '../../../core/events/event-bus.service';
import { NotificationService } from '../services/notification.service';
export declare class IdentityNotificationConsumer implements OnModuleInit {
    private readonly eventBus;
    private readonly notificationService;
    private readonly logger;
    constructor(eventBus: EventBusService, notificationService: NotificationService);
    onModuleInit(): Promise<void>;
    private subscribeRoleActivated;
    private subscribePasswordChanged;
    private subscribeVerificationDecision;
}
