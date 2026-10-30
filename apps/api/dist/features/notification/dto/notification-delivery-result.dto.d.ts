export type DeliveryStatus = 'sent' | 'failed';
export declare class NotificationDeliveryResultDto {
    notification_id: string;
    channel: string;
    status: DeliveryStatus;
    failure_code: string | null;
    attempt: number;
    delivered_at: string;
}
