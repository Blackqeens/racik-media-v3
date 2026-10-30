import { SendNotificationDto } from '../dto/send-notification.dto';
import { NotificationDeliveryResultDto } from '../dto/notification-delivery-result.dto';
export interface NotificationChannelAdapter {
    send(notificationId: string, dto: SendNotificationDto): Promise<NotificationDeliveryResultDto>;
}
