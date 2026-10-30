import { PaymentService } from '../services/payment.service';
export declare class PaymentWebhookController {
    private readonly paymentService;
    private readonly logger;
    constructor(paymentService: PaymentService);
    receiveWebhook(payload: Record<string, unknown>, headers: Record<string, string>): Promise<{
        ok: boolean;
    }>;
}
