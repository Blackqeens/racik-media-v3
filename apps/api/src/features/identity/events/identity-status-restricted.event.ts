/**
 * identity-status-restricted.event.ts — Payload type for identity.status_restricted
 * Ref: event-map.md
 */
export interface IdentityStatusRestrictedPayload {
  userId: string;
  status: string;
  reasonCode: string;
}
