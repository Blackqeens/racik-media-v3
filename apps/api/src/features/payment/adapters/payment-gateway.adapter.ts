/**
 * payment-gateway.adapter.ts — Payment Gateway Adapter Interface
 * Strategy pattern: swap Midtrans/Xendit without changing service logic.
 * Ref: integration-map.md
 */
export interface PaymentGatewayAdapter {
  /** Create payment charge and return redirect/snap URL */
  createCharge(orderId: string, amount: number, currency: string): Promise<{ redirect_url: string; transaction_ref: string }>;
  /** Verify webhook signature */
  verifySignature(payload: Record<string, unknown>, signature: string): boolean;
}
