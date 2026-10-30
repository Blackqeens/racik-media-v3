/** Payload for order.cancelled — Ref: event-map.md */
export interface OrderCancelledPayload { orderId: string; buyerId: string; reasonCode: string; }
