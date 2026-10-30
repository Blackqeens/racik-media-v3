export interface LogisticsProviderAdapter {
    getRates(origin: string, destination: string, weightGrams: number): Promise<{
        carrier: string;
        service: string;
        cost: number;
    }[]>;
    createShipment(orderId: string, origin: string, destination: string): Promise<{
        tracking_number: string;
        carrier: string;
    }>;
    verifySignature(payload: Record<string, unknown>, signature: string): boolean;
}
