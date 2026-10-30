export interface PaymentGatewayAdapter {
    createCharge(orderId: string, amount: number, currency: string): Promise<{
        redirect_url: string;
        transaction_ref: string;
    }>;
    verifySignature(payload: Record<string, unknown>, signature: string): boolean;
}
