/**
 * logistics-provider.adapter.ts — Logistics Provider Adapter Interface
 * Strategy pattern: swap Biteship/RajaOngkir without changing service logic.
 * Ref: integration-map.md
 */
export interface LogisticsProviderAdapter {
  /** Get shipping cost estimate */
  getRates(origin: string, destination: string, weightGrams: number): Promise<{ carrier: string; service: string; cost: number }[]>;
  /** Create shipment booking */
  createShipment(orderId: string, origin: string, destination: string): Promise<{ tracking_number: string; carrier: string }>;
  /** Verify webhook signature from courier */
  verifySignature(payload: Record<string, unknown>, signature: string): boolean;
}
