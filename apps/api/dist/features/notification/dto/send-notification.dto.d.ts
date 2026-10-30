export type NotificationChannel = 'whatsapp' | 'email' | 'push';
export type NotificationPriority = 'high' | 'low';
export declare class SendNotificationDto {
    recipient_user_id: string;
    channel: NotificationChannel;
    template_key: string;
    template_vars: Record<string, string>;
    priority: NotificationPriority;
    source_event_id: string;
    source_event_type: string;
}
