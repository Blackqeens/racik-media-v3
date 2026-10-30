/** Payload for order.created — Ref: event-map.md */
export interface OrderCreatedPayload { orderId: string; buyerId: string; sellerId: string; orderType: string; }
