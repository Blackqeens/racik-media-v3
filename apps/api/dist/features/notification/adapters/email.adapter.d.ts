import { ConfigService } from '@nestjs/config';
import { NotificationChannelAdapter } from './notification-channel.adapter';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationDeliveryResultDto } from '../dto/notification-delivery-result.dto';
export declare class EmailAdapter implements NotificationChannelAdapter {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    send(notificationId: string, dto: SendNotificationDto): Promise<NotificationDeliveryResultDto>;
}
